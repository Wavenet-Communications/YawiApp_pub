import React, { Component } from "react";
import {
    View,
    Text, 
    TouchableOpacity, 
    Image, 
    StyleSheet,
    Dimensions,
    BackHandler,
    NativeEventEmitter,
    NativeModules,
    Alert
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import MinewComponent from '../MinewComponent/MinewComponent';

// More info on all the options is below in the API Reference... just some common use cases shown here
const options = {
    title: 'Change photo'
  };
  

const ITEM_WIDTH = Dimensions.get('window').width;

export default class EditScreen extends Component{
    constructor(props){
        super(props);
        this.state = {
            mDevName:"",
            mDevId:"",
            mActivatedDate:'',
            mConnectState:false,
            mDevIcon:"",
            avatarSource: require('../../Images/keychain.jpg')
        };
        this.listenToDeviceUpdates();
    }

    componentDidMount(){
        this.props.navigation.setParams({goBack: ()=>this.goBack()});
        this.getDevId();

        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount(){
        this.backHandler.remove();
    }

    handleBackPress = () => {
        this.goBack(); // works best when the goBack is async
        return true;
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
        this.mSelectedDevId = DevID;

    }

    listenToDeviceUpdates() {
        const eventEmitter = new NativeEventEmitter(NativeModules.DevicesScreen)

        this.mDeviceUpdateListener = eventEmitter.addListener("BindDeviceUpdates", (bindedDevices) =>{
                console.log("Bind device updates ---" + bindedDevices);
                bindedDevices.forEach((device) =>{
                    var mac = device.DevID;
                    if (this.mSelectedDevId === mac){
                        this.getDeviceDetails(device);
                    }
                });
        } );


    }

    getDeviceDetails(device){
        var mac = device.DevID;
        var details = JSON.parse(device.DevDetails);
        console.log(details);
        var {distance, rssi, connectionState, battery, disappearTime, name, devImage} = details;
        this.setState({
            mConnectState: connectionState,
            mDevName: name,
            mDevId: mac,
            mDevIcon: devImage
        });
    }


    goBack(){
        this.props.navigation.goBack();
    }

    render(){
        var borderCol = this.state.mConnectState? '#03DAC5' : '#ff0000';

        return (
            <View style = {styles.container}>
                <View style = {styles.imagePart}>
                    <View style = {styles.deviceImageBorder} borderColor={borderCol}>
                        {this.getDevImage()}
                    </View>
                    <TouchableOpacity style= {styles.changePhotoButton} onPress={()=>this.changePhoto()}>
                        <Text style={styles.changePhotoTxt}>Change photo</Text>
                    </TouchableOpacity> 
                </View>
                <View style = {styles.nameView}>
                    <Text style={styles.nameText}>Name: </Text>
                    <Text style={styles.nameEdit}> {this.state.mDevName} </Text>
                </View>
                <View style = {styles.line}/>
                <View style = {styles.nameView} >
                    <Text style={styles.devDetText}>DeviceDetails: </Text>
                </View>
                <View style = {styles.thickLine}/>
                <View style = {styles.nameView}>
                    <Text style={styles.nameText}>Activated </Text>
                    <Text style={styles.nameEdit}> now </Text>
                </View>
                <View style = {styles.line}/>
                <View style = {styles.nameView}>
                    <Text style={styles.nameText}>Identifier </Text>
                    <Text style={styles.nameEdit}> {this.state.mDevId} </Text>
                </View>
                <View style = {styles.line}/>
                <View style= {styles.removeButton}>
                    <TouchableOpacity onPress={()=> this.onRemoveButtonClicked()}>
                        <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    onRemoveButtonClicked(){

        Alert.alert(
            'Remove YAWi',
            'Do you want to remove the YAWi device?',
            [

                {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'OK', onPress: () => {
                    console.log('OK Pressed');
                    MinewComponent.unbindDevice(this.mSelectedDevId);
                    this.props.navigation.navigate('Home');
                    }
                },
            ],
            { cancelable: false }
          )

    }

    getDevImage(){
       if (this.state.mDevIcon !== null && this.state.mDevIcon !== ""){
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

    changePhoto(){
        /**
         * The first arg is the options object for customization (it can also be null or omitted for default options),
         * The second arg is the callback which sends object: response (more info in the API Reference)
         */
        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);
        
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                const source = { uri: response.uri };
                this.setState({
                    mDevIcon: response.path
                });
                console.log(response.path);
                MinewComponent.updatDeviceIcon(this.state.mDevId, response.path)
            }
        });
    }
}

const styles = StyleSheet.create({
    container : {
        flex : 1,
        backgroundColor: '#fff',
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
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: '#d4d4d6',
        width: '100%',
        alignItems: 'center',
    },
    changePhotoButton: {
        marginTop: 10,
        height : 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    changePhotoTxt : {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    nameView:{
        flexDirection: 'row',
        alignItems:'center',
        justifyContent: 'space-between',
        paddingLeft: 20,
        paddingRight: 20,
        width: '100%',
        height: 60
    },
    line:{
        width : ITEM_WIDTH - 30,
        height: 1,
        backgroundColor: 'lightgrey'
    },
    thickLine: {
        width : ITEM_WIDTH - 30,
        height: 1,
        backgroundColor: 'black'
    },
    nameText: {
        fontSize: 16,
    },
    nameEdit : {
        fontSize: 14,
        color: 'grey'
    },
    devDetText:{
        fontSize: 18,
        fontWeight: 'bold'
    },
    removeButton: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        height: 60
    },
    removeText: {
        fontSize: 16,
        fontFamily: 'bold',
        color: 'red'
    }

})