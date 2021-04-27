import React, { Component } from 'react';
import { NativeEventEmitter, NativeModules, BackHandler, Modal } from 'react-native';
import {  FlatList, StyleSheet, Text, TextInput, View, Image, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Progress from 'react-native-progress';
import MinewComponent from '../MinewComponent/MinewComponent';
import { throwStatement } from '@babel/types';
import { Switch } from 'react-native-gesture-handler';
import SosContactsScreen from '../SosContactsScreen/SosContactsScreen';
import SosNotificationView from '../Utils/SosNotificationView';

const ITEM_WIDTH = Dimensions.get('window').width;
const ITEM_HEIGHT = Dimensions.get('window').height;

const SOS_ENABLE = false;

export default class AddDeviceScreen extends Component {

    goBack(){
        this.props.navigation.navigate('Home');
    }

    constructor(props){
        super(props);
        this.mDeviceList = [
        ];
        this.state = {
            listHolder:[],
            showProgress: false,
            modalVisible: false,
            mNextEnable: false,
            mTextInputValue: 'Device1',
            showActivateSuccess: false,
            mSelectedItem:'',
            showSosNotification: false
        };
        this.handleBackPress = this.handleBackPress.bind(this);
        this.initSOSListeners();
    }

    initSOSListeners() {
        const eventEmitter = new NativeEventEmitter(NativeModules.DevicesScreen)
        
        this.sosPressListener = eventEmitter.addListener("onSOSDevicePressed", (device) =>{
            this.setState({showSosNotification: true})
        } );
        this.sosPressCancelListener = eventEmitter.addListener("onSOSDevicePressCancel", (device) =>{
            this.setState({showSosNotification: false})
        } );
        this.sosTimerCountListener = eventEmitter.addListener("onSOSTimerCount", (cntInfo) => {
        });

        this.sosTimerFinished = eventEmitter.addListener("onSOSTimerFinished", (count) => {
            this.setState({showSosNotification: false})
        });

    }

    deinitSOSListeners() {
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

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }
    showActivateSuccessModal(){
        this.setState({showActivateSuccess: true})
    }
    componentDidMount(){

        this.props.navigation.setParams({goBack: ()=>this.goBack()});
        this.setState({
            listHolder: [...this.mDeviceList],
            SosSwitchValue: false,
        })
        const eventEmitter = new NativeEventEmitter(NativeModules.DevicesScreen)
        eventEmitter.addListener("ScanResults", (bindedDevices) =>{

                this.mDeviceList = [];
                console.log("Scanresults --- " + bindedDevices)
                bindedDevices.forEach((device) =>{
                    console.log(device);
                    var mac = device.DevID;
                    var details = JSON.parse(device.Details);
                    var {distance, rssi, connectionState, battery} = details;
                    console.log(mac, distance);
                    this.mDeviceList.push({key: mac, distance : distance, RSSI : rssi, connected : connectionState, battery : battery});
                });
                this.setState({listHolder:[...this.mDeviceList]});

        } );
        eventEmitter.addListener("onDeviceActivation", (success) =>{
            var {success} = success;
            if(success){
                this.setState({mNextEnable: true})
            }
        } );

        MinewComponent.startScanning();
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        
    }
    componentWillUnmount(){
        MinewComponent.stopScanning();
        this.backHandler.remove();
        this.deinitSOSListeners();
    }

    handleBackPress = () => {
        if(this.state.modalVisible){
            this.onClickClose();
            return;
        }
        this.goBack(); // works best when the goBack is async
        return true;
    }

    FlatlistItemSeparator = () =>{
        return (
            <View
                style = {styles.itemSeparator}
            />
        )
    }
    
    
    render(){
        let progressView;
        if (this.state.showProgress){
           // progressView = <Progress.CircleSnail color={['red', 'green', 'blue']}/>
        }
        return (
            <View style={styles.container}>
                <FlatList
                    data = {this.state.listHolder}
                    width = "100%"
                    extraData = {this.state.listHolder}
                    keyExtractor = {(index) => index.toString()}
                    ItemSeparatorComponent = {this.FlatlistItemSeparator}
                    renderItem ={({item}) => this.getItemView(item)}
                    ListEmptyComponent = {<Text style={styles.emptyText}>No devices are seen</Text>
                        }
                />
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}>
                    {this.state.showActivateSuccess? this.getActivateDeviceCompleteView(): this.getActivateDeviceView()}
                    <SosNotificationView
                    onPressSOSCancel={() => this.onSOSPressHandler()}/>
                </Modal>
                
                {(this.state.modalVisible === false) ? <SosNotificationView
                    onPressSOSCancel={() => this.onSOSPressHandler()}/>
                    : null }
            </View>
        );
        //{progressView}
    }

    getActivateDeviceView(){
        var deviceIcon = <Image style={styles.deviceLogo} 
                            source ={require('../../Images/device_icon.png')}
                        />;
        if (this.state.SosSwitchValue) {
            deviceIcon = <Image style={styles.deviceLogo} 
                            source ={require('../../Images/sos_icon.png')}
                         />
        }
                    

        return(
            <View style={styles.addDeviceModal}>
            <View style={styles.modalTitleView}>
                <TouchableOpacity onPress={() => this.onClickClose()}>
                    <Image style={styles.closeButton} 
                        source ={require('../../Images/close.png')}
                    />
                </TouchableOpacity>
                <View style={styles.titleView}>
                    <Text style={styles.modalTitleText}>Activate device</Text>
                </View>
            </View>
            <View style={styles.deviceLogoView}>
                {deviceIcon}
            </View>
            <View style={styles.modelTextView}>
                <Text style={styles.modelTextInfo}>
                    Press the device button to begin activation -- it'll play a tune. Afterwards tap NEXT to continue.
                </Text>
            </View>
            {this.getSOSSwitchView()}
            <View style = {styles.modelNextButtonView}>
            <TouchableOpacity style={[styles.modalNextButton, {backgroundColor: this.state.mNextEnable? '#03DAC5': 'grey'}]} 
                onPress={()=>this.onNextClick()}>
                <Text style={styles.modalNextButtonText}>Next</Text>
            </TouchableOpacity>
            </View>
        </View>
        );

    }

    getSOSSwitchView(){
        if (!SOS_ENABLE) {
            return (<View></View>);
        }
        return (
            <View style={styles.modalEnableSOSView}>
                <Text style={styles.modalSOSText}>Activate in SOS mode   </Text>
                <Switch value={this.state.SosSwitchValue} onValueChange={(sosSwitchValue)=>this.onChangeSosSwitch(sosSwitchValue)}/>
            </View>
        );
    }

    getActivateDeviceCompleteView(){
        var title = this.state.SosSwitchValue? "Add SOS contacts":"";
        return(
            <KeyboardAwareScrollView
                        resetScrollToCoords={{ x: 0, y: 0 }}
                        contentContainerStyle={styles.addDeviceModal}
                        scrollEnabled={false}>
            <View style={styles.modalTitleView}>
                <TouchableOpacity onPress={() => this.onClickClose()}>
                    <Image style={styles.closeButton} 
                        source ={require('../../Images/close.png')}
                    />
                </TouchableOpacity>
                <View style={styles.titleView}>
                    <Text style={styles.modalTitleText}>{title}</Text>
                </View>
            </View>
            <View height={ITEM_HEIGHT-150}>
            { this.state.SosSwitchValue? this.getSosContactsView():this.getCompletionView()}
            </View>

            </KeyboardAwareScrollView>
        );

    }
    onSOSPressHandler = () => {
        MinewComponent.cancelSos();
      }
  
    onChangeSosSwitch(SosSwitchValue){
        if (SosSwitchValue) {
            Alert.alert("SOS active", "Your device will act as SOS device.")
        }
        this.setState({SosSwitchValue})
    }
    onClickSosContinue(){
        this.onClickContinue();
    }
    getSosContactsView(){
        return (<SosContactsScreen onClickSosContinue={this.onClickSosContinue.bind(this)}/>);
    }

    getCompletionView(){
        return (
            <View>
                <View style={styles.deviceLogoView}>
                <Image style={styles.deviceLogo} 
                        source ={require('../../Images/keychain.jpg')}
                />
                </View>
                <View style={styles.modelTextView}>
                    <Text style={styles.modelDeviceActivateTextInfo}>
                    Great! Device is now activated.
                    </Text>
                    <TextInput
                        style={styles.modalDeviceNameEdit}
                        onChangeText={text => this.onChangeText(text)}
                        placeholder="Device1"
                        value={this.state.mTextInputValue}
                    />
                </View>
                <View style = {styles.modelNextButtonView}>
                <TouchableOpacity style={[styles.modalNextButton, {backgroundColor: '#03DAC5'}]} 
                    onPress={()=>this.onClickContinue()}>
                    <Text style={styles.modalNextButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>

            </View>
        )
    }

    onNextClick(){
        if(this.state.mNextEnable)
            this.showActivateSuccessModal();
    }

    onChangeText(text){
        console.log(text);
        this.setState({mTextInputValue:text});
    }


    onClickClose(){
        MinewComponent.deactiveDevice(this.state.mSelectedItem);
        this.setModalVisible(false);
        this.setState({showActivateSuccess:false});
        this.setState({mNextEnable:false});
    }

    onClickContinue(){
        this.bindDevice(this.state.mSelectedItem);
        this.setModalVisible(false);
        this.setState({showActivateSuccess:false});
        MinewComponent.stopScanning();
        this.goBack();
    }

    onItemClick(item){
        this.setState({mSelectedItem: item.key});
        MinewComponent.activateDevice(item.key);
        this.setModalVisible(true);
    }

    onItemClick1(item){
        Alert.alert("", "Do you want to bind this device?", 
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Bind',
                    onPress: () => {
                        this.bindDevice(item);
                        MinewComponent.stopScanning();
                        this.goBack();
                     }
                }

            ]
        )
    }

    async bindDevice(item){
        this.setState({showProgress:true});
        console.log("bind device --" + item);
        await MinewComponent.bindDevice(item, this.state.mTextInputValue, this.state.SosSwitchValue, "");
        this.setState({showProgress:false});
    }

    getItemView(item){
        return (
            <TouchableOpacity onPress= {()=>this.onItemClick(item)}>
            <View style={styles.item}>
                <Image style={styles.listItemImage} 
                        source ={require('../../Images/device_icon.png')}
                />
                <View style={styles.itemInfo}>
                    <Text style= {styles.ItemInfoId}>{item.key}</Text>
                    <Text>Distance : {item.distance}m</Text>
                    <Text>Battery : {item.battery}</Text>
                </View>
                <Image style={styles.rightArrow} 
                    source ={require('../../Images/arrow_right_black.png')}
                />
            </View>
            </TouchableOpacity>
        );
    }
}
    
    
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop : 22,
        flexDirection : 'row',
        justifyContent: "center"
    },
    item : {
        fontSize : 18,
        height : 80,
        width: "100%",
        justifyContent: "center",
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    listItemImage:{
        margin:10,
        height: 48,
        width: 48
    },
    itemSeparator : {
        height : 1,
        backgroundColor : "#607D8B",
        width: ITEM_WIDTH - 20,
        marginLeft: 10,
        marginRight: 10
    },
    itemInfo : {
        flex : 1,
        flexDirection: 'column'
    },
    ItemInfoId: {
        fontSize: 15,
        fontWeight: 'bold'
    },
    rightArrow:{
        height: 30,
        width: 30,
        marginRight: 10
    },
    addDeviceModalView:{
        flex: 1,
        flexDirection:'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: 80,
        width: '100%',
        backgroundColor:'#d7dade'
    },
    modalTitleView:{
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10
    },
    closeButton:{
        margin: 10,
        height : 30,
        width: 40,
        
    },
    emptyText: {
        fontSize: 14,
        textAlign:'center'        
    },
    titleView:{
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitleText:{
        fontSize: 26,
        fontWeight: 'bold'
    },
    modelTextView:{
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center'
    },
    modelTextInfo:{
        fontSize: 14,
        textAlign:'center'        
    },
    deviceLogoView:{
        height: 120,
        width: "100%",
        marginTop: 20,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    deviceLogo: {
        height: 100,
        width: 100,
    },
    modelNextButtonView:{
        marginTop: 10,
        height : 40,
        width: ITEM_WIDTH,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems:'center'
    },
    modalNextButton:{
        height: 40,
        width: 120,
        justifyContent: 'center',
        alignItems:'center',
    
    },
    modalNextButtonText:{
        fontSize:16,
        fontWeight:'bold',
        color:'white',
        textAlign:'center'
    },
    modelDeviceActivateTextInfo:{
        fontSize: 16,
        fontWeight: 'bold',
        textAlign:'center'
    },
    modalDeviceNameEdit:{
        marginTop:20,
        height: 40, 
        width: ITEM_WIDTH-40,
        borderColor: 'gray',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3);',
    },
    modalEnableSOSView:{
        marginTop:20,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center'
    },
    modalSOSText:{
        fontSize:16,
        fontWeight:'bold'
    },




    
})