import React, { Component } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { FlatList, StyleSheet, Text, View, Dimensions, TouchableOpacity, Alert, Image } from 'react-native';
import MinewComponent from '../MinewComponent/MinewComponent'
import {PermissionsAndroid} from 'react-native';
import SosNotificationView from '../Utils/SosNotificationView';

const ITEM_WIDTH = Dimensions.get('window').width;
const ITEM_HEIGHT = Dimensions.get('window').height;
const SOS_ENABLE = false;

export default class HomeScreen extends Component{
    constructor(props){
        super(props);
        this.mDeviceList = [
        ];
        this.mSosDevice = null;
        this.state = {
            listHolder:[],
            mSosButtonPressed: false,
            mSosTimerCount: "10",
            viewHeight: null,
            viewWidth: null,
            avatarSource: require('../../Images/keychain.jpg')
        };
        this.sosTimer = null;
        {
            const eventEmitter = new NativeEventEmitter(NativeModules.DevicesScreen)
            
            this.sosPressListener = eventEmitter.addListener("onSOSDevicePressed", (device) =>{
                this.setState(
                    {mSosButtonPressed: true}
                );
                this.setState({mSosTimerCount: "10"});

            } );
            this.sosPressCancelListener = eventEmitter.addListener("onSOSDevicePressCancel", (device) =>{
                this.setState(
                    {mSosButtonPressed: false}
                );
        
            } );
            this.sosTimerCountListener = eventEmitter.addListener("onSOSTimerCount", (cntInfo) => {
                if (!this.mSosButtonPressed) {
                    this.setState(
                        {mSosButtonPressed: true}
                    );
                }

                let {SOSCount} = cntInfo;
                this.setState({mSosTimerCount: SOSCount});
            });

            this.sosTimerFinished = eventEmitter.addListener("onSOSTimerFinished", (count) => {
                Alert.alert("SOS is succesfully sent!!!")
                this.state.mSosTimerCount = "10";
                this.setState(
                    {mSosButtonPressed: false}
                );
            });
        }

        this.requestLocationPermission()
            .then((success) => {
                this.MinewInit();
                console.log("HomeScreen componentDidMount ****");
                const eventEmitter = new NativeEventEmitter(NativeModules.DevicesScreen)
                eventEmitter.addListener("BindDeviceUpdates", (bindedDevices) =>{
                        this.mDeviceList = [];
                        console.log("Bind device updates ---" + bindedDevices);
                        bindedDevices.forEach((device) =>{
                            let det = this.getDeviceDetails(device);
                            if (det.sosMode) {
                                this.mDeviceList.unshift(det);
                            }else{
                                this.mDeviceList.push(det);
                            }
                        });
                        this.setState({listHolder:[...this.mDeviceList]});
        
                } );
        
            });
    }

    async requestLocationPermission() {
        try {
          var granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'YAWi key finder application',
              message:
                'YAWi key finder needs to access bluetooth and location ' +
                'to keep of your keys.',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            this.showLocationRequiredAlert();
            return;
          }

          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            {
              title: 'YAWi key finder application',
              message:
                'YAWi key finder needs to access bluetooth and location ' +
                'to keep of your keys.',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            this.showLocationRequiredAlert();
          }
          return true;
        } catch (err) {
          console.warn(err);
          return false;
        }
    }

    componentDidMount(){
        this.setState({listHolder: [...this.mDeviceList]})

    }

    componentWillUnmount() {
        if (this.sosTimer) {
            clearInterval(this.sosTimer);
        }

        if (this.sosPressListener) {
            this.sosPressListener.remove();
            this.sosPressListener = null;
        }

        if (this.sosPressCancelListener) {
            this.sosPressCancelListener.remove()
            this.sosPressCancelListener = null;
        }

        if (this.sosTimerCountListener) {
            this.sosTimerCountListener.remove();
            this.sosTimerCountListener = null;
        }

        if (this.sosTimerFinished) {
            this.sosTimerFinished.remove();
            this.sosTimerFinished = null;
        }
        
    }
    showSosRequiredAlert(){
        Alert.alert(
            'YAWi SOS device',
            'SMS permission is required',
            [
                {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {text: 'OK', onPress: () => this.requestSMSPermission()},
            ],
            {cancelable: false},
        )

    }

    showLocationRequiredAlert(){
        Alert.alert(
            'YAWi key finder',
            'Location permission is required to run this application',
            [
                {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {text: 'OK', onPress: () => this.requestLocationPermission()},
            ],
            {cancelable: false},
        )

    }

    getPhoneAsSosDetails(){
        var mac = "PhoneImei";
        var devDet = {key: mac,
                            name: "My Phone",
                            distance : "0", 
                            RSSI : "0", 
                            connected : "connected", 
                            battery : "100", 
                            disappearTime: "",
                            sosMode: true,
                            devImage: ""
                        };
        return devDet;
    
    }


    getDeviceDetails(device){
        console.log(device);
        var mac = device.DevID;
        var details = JSON.parse(device.DevDetails);
        var {distance, rssi, connectionState, battery, disappearTime, name, sosModeState, devImage} = details;
        console.log(mac, distance);
        var devDet = {key: mac,
                         name: name,
                         distance : distance, 
                         RSSI : rssi, 
                         connected : connectionState, 
                         battery : battery, 
                         disappearTime: disappearTime,
                         sosMode: sosModeState,
                         devImage: devImage
                        };
        return devDet;
    }

    async MinewInit(){
        try{
            var {Check} = await MinewComponent.initalize();
            let devList = await MinewComponent.getBindDevices();
            this.mDeviceList = [];

            devList.forEach((device) =>{
                let det = this.getDeviceDetails(device);
                if (det.sosMode) {
                    this.mDeviceList.unshift(det);
                }else{
                    this.mDeviceList.push(det);
                }
            });
            
            /*let {enable} = await MinewComponent.isPhoneEnabledAsSosDevice();
            if (enable) {
                this.mDeviceList.unshift(this.getPhoneAsSosDetails());
            }*/
            this.setState({listHolder:[...this.mDeviceList]});

            console.log(Check);
        }
        catch(e){
            console.error(e);
        }
    }
    
    render(){
        return (
            <View style={styles.container} onLayout = {(event) => {this.onViewLayoutHandler(event)}}>
                <FlatList
                    data = {this.state.listHolder}
                    width = "100%"
                    numColumns = '2'
                    extraData = {this.state.listHolder}
                    keyExtractor = {(item, index) => item.key}
                    ListHeaderComponent = {this.ListHeaderComponent}
                    renderItem ={({item, index}) => this.getItemView(item, index)}
                />
                <SosNotificationView
                    onPressSOSCancel={() => this.onSOSPress(null)}/>
            </View>
        );
    }

    onViewLayoutHandler = (event) => {
        var {width, height} = event.nativeEvent.layout;
        if (this.state.viewWidth === null || this.state.viewHeight === null) {
            this.setState({viewWidth: width, viewHeight: height});
        }
    }

    onItemClick(item){
        MinewComponent.setSelectedDevId(item.key);
        this.props.navigation.navigate('Details',{
            devId: 'item.key'
          }
        );
    }

    onSOSDevicePressEvent(){
        var buttonPressed = !this.state.mSosButtonPressed;
        this.setState(
            {mSosButtonPressed: buttonPressed}
        );
    }

    onSOSPress(item){
        var buttonPressed = !this.state.mSosButtonPressed;
        if (buttonPressed && item !== null) {
            //this.sosTimer = setInterval(this.timerTick.bind(this), 1000)
            MinewComponent.handleSos(item.key);
        } else  {
            //clearInterval(this.sosTimer);
            //this.setState({mSosTimerCount:10});
            //this.sosTimer = null;
            MinewComponent.cancelSos();
        }

        this.setState(
            {mSosButtonPressed: buttonPressed}
        );
    }

    onMoreIconPressed(item) {
        this.onItemClick(item)
    }
    
    /*timerTick() {
        var count = this.state.mSosTimerCount - 1;
        if (count < 0 ) {
            clearInterval(this.sosTimer);
            this.setState({mSosTimerCount:10});
            this.state.sosTimer = null;
            return;
        }

        this.setState({mSosTimerCount:count});
    }*/

    ListHeaderComponent = () => {
        return this.getAddDeviceHeaderView();
    }

    getSosHeaderView(){
        return (
            <View style = {styles.listHeader}>
                <View style={styles.listHeaderView}>
                <TouchableOpacity style={styles.moreIcon} onPress={()=>this.onMoreIconPressed(this.mSosDevice)}>
                    <Image source={require("../../Images/menu-vertical.png")}/>
                </TouchableOpacity>

                    <Text style={styles.listHeaderAddText}>Press In Emergency</Text>
                        <TouchableOpacity style={styles.listHeaderSosButton} onPress={()=>this.onSOSPress(null)}>
                            <Image style={styles.listHeaderSosButton} source={require('../../Images/Sos_press.png')}/>
                        </TouchableOpacity>
                </View>
            </View>
        )

    }


    getAddDeviceHeaderView(){
        return (
            <View style = {styles.listHeader}>
                <View style={styles.listHeaderView}>
                    <Image style={styles.AddDeviceImage} 
                        source ={require('../../Images/add_device.png')}
                    />
                    <View style={styles.listHeaderViewDiv}/>
                    <Text style={styles.listHeaderAddText}>Add YAWi device</Text>
                        <TouchableOpacity style={styles.listHeaderAddButton} onPress={() => this.props.navigation.navigate('Add')}>
                            <Image style={styles.listHeaderAddBtnImag} source={require('../../Images/baseline_add_black_48dp.png')}/>
                        </TouchableOpacity>
                </View>
            </View>
        )
    }

    getItemView(item, index){
        let itemW = ITEM_WIDTH/2;
        let itemH = ITEM_WIDTH*2/3;

        if (item.sosMode) {
            return this.getSOSDeviceView(item, itemW, itemH);
        }
        return this.getDeviceView(item, itemW, itemH);
    }

    getSOSDeviceView(item, itemW, itemH) {
        var {connected, borderCol} = item.connected? {connected:'Connected', borderCol:'#03DAC5'} : {connected:'Disconnected', borderCol:'#ff0000'};
        var icon = require('../../Images/Sos_press.png');
        return (
            <View style={styles.item} width={itemW} height={itemH}>
            <View style={styles.itemTouchable} onPress= {()=>this.onItemClick(item)}>
                <TouchableOpacity style={styles.moreIcon} onPress={()=>this.onMoreIconPressed(item)}>
                    <Image source={require("../../Images/menu-vertical.png")}/>
                </TouchableOpacity>
                <View style={styles.itemInfo} >
                    <TouchableOpacity style={styles.itemImageBorderView}  onPress={()=>this.onSOSPress(item)}>
                        <Image style={styles.itemImage} 
                            source ={icon}
                        />
                    </TouchableOpacity>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text>{connected} </Text>
                </View>
                <View style={styles.itemBottomDetView}>
                    <Text style={styles.itemLastLoc}>
                        {item.connected?"Near by": item.disappearTime}
                    </Text>

                </View>
            </View>
            </View>
        );

    }


    getDeviceView(item, itemW, itemH) {
        var {connected, borderCol} = item.connected? {connected:'Connected', borderCol:'#03DAC5'} : {connected:'Disconnected', borderCol:'#ff0000'};
        return (
            <View style={styles.item} width={itemW} height={itemH}>
            <TouchableOpacity style={styles.itemTouchable} onPress= {()=>this.onItemClick(item)}>
                <View style={styles.itemInfo} >
                    <View style={styles.itemImageBorderView} borderColor={borderCol}>
                        {this.getDevImage(item.devImage)}
                    </View>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text>{connected} </Text>
                </View>
                <View style={styles.itemBottomDetView}>
                    <Text style={styles.itemLastLoc}>
                        {item.connected?"Near by": item.disappearTime}
                    </Text>

                </View>
            </TouchableOpacity>
            </View>
        );

    }

    getDevImage(devImage){
        if (devImage !== null && devImage !== ""){
             let path = "file://"+devImage;
             return (
                 <Image style = {styles.listItemImage} source={{isStatic:true, uri: path}}/>
             )
         }else{
             return (
                 <Image style = {styles.listItemImage} source={this.state.avatarSource}/>
             )
         }
 
     }
 
}


const styles = StyleSheet.create({
    container: {
        paddingTop : 22,
        flexDirection : 'row',
        justifyContent: "center",
        backgroundColor:"#d7dade",
        minHeight: ITEM_HEIGHT
    },
    // Item styles
    item : {
        flex: 1/2,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    itemTouchable : {
        height: "96%",
        width: "94%",
        backgroundColor: '#ebebf2',
        borderRadius: 2,    
        borderBottomWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
    },
    itemInfo: {
        flexDirection: 'column',
        alignItems: 'center'
    },
    itemName: {
        fontSize: 18,
        fontWeight:'bold',
        flexWrap: 'nowrap'
    },
    itemBottomDetView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    itemLastLoc: {
        justifyContent: 'center',
        marginBottom: 50
    },
    itemImage: {
        width: 70,
        height: 70,
        overflow: "hidden",
        borderRadius: 35,
    },
    itemImageBorderView: {
        width: 80,
        height: 80,
        overflow: "hidden",
        borderRadius: 40,
        borderColor: '#03DAC5',
        borderWidth: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent:'center',
        marginTop: 30
    },
    listItemImage:{
        width: 100,
        height: 100,
        overflow: "hidden",
    },
    AddDeviceImage:{
        width: 200,
        height: 100,
        resizeMode: 'center'
    },

    itemSeparator : {
        height : 1,
        backgroundColor : "#607D8B"
        
    },
    // list header styles
    listHeader:{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height:220,
        width:'100%',
    },
    listHeaderView: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        height:'100%',
        width: '96%',
        borderRadius: 2,
        borderWidth: 0.5,
        borderColor: 'black',
        borderBottomWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
        backgroundColor: '#ebebf2'
    },
    listHeaderViewDiv:{
        width: "80%",
        height: 4,
        backgroundColor: '#3700B3',
        marginTop:5,
        marginBottom: 5
    },
    listHeaderAddText:{
        fontSize : 16,
        paddingBottom: 5,

    },
    listHeaderAddButton:{
        height:60,
        width:60,
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 60/2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 12,
        backgroundColor: '#03DAC5'

    },
    listHeaderAddBtnImag: {
        height: 30,
        width: 30
    },
    listHeaderSosButton:{
        height:80,
        width:80,
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 80/2,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        //elevation: 12,
        backgroundColor: 'red'

    },
    listHeaderSOSText:{
        fontSize: 18,
        fontWeight:'bold',
        color: '#000'
        
    } ,
    listSosCancelTimerText:{
        fontSize : 20,
        paddingBottom: 10,

    },

    moreIcon:{ 
        position: 'absolute', 
        top: 10, 
        right: 10
    },


})


