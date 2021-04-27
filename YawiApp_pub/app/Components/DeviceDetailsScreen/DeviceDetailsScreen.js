import React, { Component } from "react";
import {View, Image, Text, StyleSheet, Dimensions} from 'react-native'
import { FlatList } from "react-native-gesture-handler";
import {TouchableOpacity} from "react-native";
import MinewComponent from '../MinewComponent/MinewComponent';
import { NativeEventEmitter, NativeModules, BackHandler } from 'react-native';
import { StackNavigator } from 'react-navigation'; 
import { throwStatement } from "@babel/types";

const ITEM_WIDTH = Dimensions.get('window').width;
export default class DeviceDetailsScreen extends Component{
    static navigationOptions = ({ navigation, navigationOptions }) => {    
        return getDeviceDetailsNavigationOptions(navigation, 'Details');
    };
    constructor(props){
        super(props);
        this.mDeviceList = [
            //{key : "Share", image: require('../../Images/person_share.png')},
            {key : "View on map", image: require('../../Images/view-on-map.png')},
            {key : "Edit", image: require('../../Images/edit.png')},
            {key : "Help", image: require('../../Images/help.png')},
        ];
        this.state = {
            listHolder:[],
            mSelectedDevId: '' ,
            mFindStatus:'',
            mDevIcon:"",
            mSosModeState: false,
            avatarSource: require('../../Images/keychain.jpg')
        };
        this.mSelectedDevName = '';
        this.mConnectionState = false;
        this.mDisappearTime = "";
        this.getDevId();
        const eventEmitter = new NativeEventEmitter(NativeModules.DevicesScreen)
        this.listenSearchDeviceEvents(eventEmitter);
        this.listenToDeviceUpdates(eventEmitter);
    }

    listenToDeviceUpdates(eventEmitter) {
        this.mDeviceUpdateListener = eventEmitter.addListener("BindDeviceUpdates", (bindedDevices) =>{
                console.log("Bind device updates ---" + bindedDevices);
                bindedDevices.forEach((device) =>{
                    var mac = device.DevID;
                    if (this.state.mSelectedDevId === mac){
                        this.getDeviceDetails(device);
                    }
                });
        } );


    }

    listenSearchDeviceEvents(eventEmitter){
        this.mSearchDeviceListener = eventEmitter.addListener("onDeviceSearch", (devDetails) =>{
            var {DevID, SearchStatus} = devDetails;
            console.log("listenSearchDeviceEvents*** "+ devDetails +"  SearchStatus "+ SearchStatus);
            this.setState({mFindStatus:SearchStatus});
        } );

    }
    async getDevId(){
        var {DevID} = await MinewComponent.getSelectedDevId();
        let devList = await MinewComponent.getBindDevices();

        devList.forEach((device) =>{
            var mac = device.DevID;
            if(mac === DevID){
                this.getDeviceDetails(device);
            }
        });

        this.state.mSelectedDevId = DevID;
    }

    getDeviceDetails(device){
        var details = JSON.parse(device.DevDetails);
        var {distance, rssi, connectionState, battery, disappearTime, name, devImage, sosModeState} = details;
        this.mSelectedDevName = name;
        this.mConnectionState = connectionState;
        this.mDisappearTime = disappearTime;
        this.setState({
            mDevIcon: devImage,
            mSosModeState: sosModeState
        })
        this.props.navigation.setParams({ title: name });
    }

    componentDidMount(){
        this.props.navigation.setParams({goBack: ()=>this.goBack()});
        this.setState({listHolder: [...this.mDeviceList]})
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
 
    }

    componentWillUnmount(){
        this.backHandler.remove();
        this.mDeviceUpdateListener.remove();
        this.mSearchDeviceListener.remove();
    }
    
    handleBackPress = () => {
        this.goBack(); // works best when the goBack is async
        return true;
    }

    goBack(){
        this.props.navigation.navigate('Home');
    }

    render(){
        var {connected, borderCol} = this.mConnectionState? {connected:'Connected', borderCol:'#03DAC5'} : {connected:'Disconnected', borderCol:'#ff0000'};
        return (
            <View style = {styles.container}>
                <View style = {styles.imagePart}>
                    <View style = {styles.deviceImageBorder}  borderColor={borderCol}>
                        {this.getDevImage()}
                    </View>
                    {this.renderFindDevice()}
                </View>
                <View style = {styles.listPart}>
                    <View style={styles.listPartUpperBorder}/>
                <FlatList
                    data = {this.state.listHolder}
                    width = "100%"
                    extraData = {this.state.listHolder}
                    keyExtractor = {(index) => index.toString()}
                    ItemSeparatorComponent = {this.FlatlistItemSeparator}
                    renderItem ={({item}) => this.getItemView(item)}
                />
                </View>
            </View>
        );
    }


    getDevImage(){
        if (this.state.mSosModeState === true) {
            return (
                <Image style={styles.devieImage} source={require('../../Images/Sos_press.png')}/>
            )
        }
        else if (this.state.mDevIcon !== null && this.state.mDevIcon !== ""){
             let path = "file://"+this.state.mDevIcon;
             return (
                 <Image style = {styles.devieImage} source={{isStatic:true, uri: path}}/>
             )
         }else{
             return (
                 <Image style = {styles.devieImage} source={this.state.avatarSource}/>
             )
         }
 
     }
 
    renderFindDevice(){
        if(!this.mConnectionState )
            return (
                <View>
                    <Text style = {styles.disappearTimeText}>
                        Last seen on {this.mDisappearTime}
                    </Text>
                </View>
            );
        else{
            const { navigation } = this.props;
            var findStatusColor = 'green';
            if (this.state.mFindStatus == 'Device not found'){
                findStatusColor = 'red';
            }
    
            return (
            <View>
                <TouchableOpacity style= {styles.findButton} onPress = {() => this.onClickSearch()}>
                    <Text style={styles.findButtonTxt}>Find</Text>
                </TouchableOpacity>
                <Text style={[styles.findStatusTxt, {color:findStatusColor}]}>{this.state.mFindStatus}</Text>
            </View>
)
        }
    }
    FlatlistItemSeparator = () =>{
        return (
            <View
                style = {styles.itemSeparator}
            />
        )
    }

    getItemView(item){
        return (
            <TouchableOpacity onPress = {()=>this.onItemClick(item)}>
            <View style={styles.item} >
                <View style={{flex:1, flexDirection:'row'}}>
                <Image style = {styles.itemIcon} source={item.image}/>
                <Text style={styles.itemText}>{item.key}</Text></View>
                <Image style = {styles.itemNavig} source = { require('../../Images/list_right.png')}/>
            </View>
            </TouchableOpacity>
        );
    }

    onItemClick(item){
        if(item.key === 'Edit'){
            this.props.navigation.navigate('Edit');
        } else if (item.key === "View on map") {
            this.props.navigation.navigate('DevMap');
        }

    }

    onClickSearch(){
        console.log("onClickSearch ***"+ this.state.mSelectedDevId);
        MinewComponent.findDevice(this.state.mSelectedDevId);
    }

}

function getDeviceDetailsNavigationOptions(navigation, title){
    var {params} = navigation.state;
    var titleStr = (params && params.title)?  params.title: 'Details'; 
    return { 
        headerTitle: titleStr,
        headerTitleStyle: {
            textAlign: 'center',
            flexGrow:1,
            alignSelf:'center',
            fontSize: 28
        },
        headerLeft: (
            <TouchableOpacity onPress={() => navigation.state.params.goBack()} style={{paddingLeft:10}}>
                <Image 
                    source={require('../../Images/baseline_navigate_back.png')}
                    style={{width:40, height:40}}
                />
            </TouchableOpacity>
        ),
        headerRight:(
            <View style={{paddingRight:10, height: 40, width:50}} onPress={() => {Alert.alert('This is a button!')}}>
            </View>
        ),
    };  

};


const styles = StyleSheet.create({
    container : {
        flex : 1,
        backgroundColor: '#d4d4d6',
        alignItems: 'center',    
    },
    devieImage : {
        width: 100,
        height: 100,
        borderRadius: 100/2,
        borderColor: 'white',
        borderWidth: 1,
    },
    deviceImageBorder : {
        width : 110,
        height: 110,
        borderRadius: 110/2,
        borderColor: 'green',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imagePart : {
        zIndex: -4,
        paddingTop: 50,
        paddingBottom: 50,
        alignItems: 'center'
    },
    listPart : {
        flex: 1,
        width:"100%",
        borderRadius: 10,
        backgroundColor: '#fff',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    item: {
        flex:1,
        height: 60,
        width: '100%',
        alignItems: 'center',
        paddingLeft: 20,
        flexDirection: 'row'
    },
    itemText: {
        fontSize: 16,
        textAlign: 'left'
    },
    itemSeparator: {
        height: 1,
        backgroundColor: '#d4d4d6',
        marginLeft: 20,
        marginRight: 20
    },
    itemIcon: {
        width: 20,
        height: 20,
        marginRight: 10
    },
    itemNavig: {
        width: 20,
        height: 20,
        justifyContent:'flex-end',
        marginRight: 20
    },
    listPartUpperBorder: {
        marginTop: 1,
        height : 2,
        width: '100%',
        backgroundColor: '#d4d4d6'
    },
    disappearTimeText:{
        fontSize: 15,
        marginTop: 10,
        fontWeight:'bold'
    },
    findButton: {
        marginTop: 20,
        height : 40,
        backgroundColor: '#03DAC5',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        shadowRadius: 5,
        shadowColor: 'grey',
        zIndex: 2
    },
    findButtonTxt : {
        marginLeft:60,
        marginRight: 60,
        fontSize: 20,
        fontWeight: 'bold'
    },
    findStatusTxt : {
        marginTop: 10,
        justifyContent: 'center',
        fontSize: 16,
        textAlign: 'center'
    }

});
