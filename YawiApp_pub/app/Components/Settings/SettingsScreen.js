import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet, 
    SectionList, 
    Alert, 
    Modal, 
    TouchableOpacity, 
    Image, 
    Dimensions,
    BackHandler } from "react-native";
import { Switch } from "react-native-gesture-handler";
import MinewComponent from '../MinewComponent/MinewComponent'
import SosContactsScreen from '../SosContactsScreen/SosContactsScreen'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const ITEM_WIDTH = Dimensions.get('window').width;
const ITEM_HEIGHT = Dimensions.get('window').height;
const SOS_ENABLE = false;


export default class SettingsScreen extends Component{
    goBack(){
        this.props.navigation.navigate('Home');
    }

    constructor(props){
        super(props);
        this.listHolder = [
            {"mobile phone": "Add this mobile as SOS device"}
        ]
        this.state = {
            SosSwitchValue: false,
            ModalVisible: false
        }
    }

    async getEnableSosProperty() {
        let {enable} = await MinewComponent.isPhoneEnabledAsSosDevice();
        this.setState({SosSwitchValue: enable})
    }

    componentDidMount(){
        this.props.navigation.setParams({goBack: ()=>this.goBack()});
        this.getEnableSosProperty();
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
 
    }

    componentWillUnmount(){
        this.backHandler.remove();
    }

    ListHeaderComponent = () => {
        return (
            <View>
                <Text>
                    Settings
                </Text>
            </View>
        );
    }

    getSectionView(section) {
        return (
        <View>
            <Text style={styles.sectionStyle}>
                {section.title}
            </Text>
        </View>
        );
    }
    getItemView(item, index){
        return (
            <View style={styles.itemStyle}>
                <Text style={styles.itemTextStyle}>
                    {item}
                </Text>
                <Switch 
                    value={this.state.SosSwitchValue} 
                    onValueChange={(sosSwitchValue)=>this.onChangeSosSwitch(sosSwitchValue)}/>
            </View>
        );
    }

    onChangeSosSwitch(SosSwitchValue){
        if (SosSwitchValue) {
            //Alert.alert("SOS active", "Your device will act as SOS device.");
        }
        MinewComponent.enablePhoneAsSosDevice(SosSwitchValue);
        this.setState({SosSwitchValue})
        this.setState({ModalVisible: SosSwitchValue});
    }


    render(){
        return (
            <View style={styles.container}>
                 <SectionList  
                    sections={this.getSectionList()}  
                    renderItem={({item}) => this.getItemView(item)}  
                    renderSectionHeader={({section}) => this.getSectionView(section)}  
                    keyExtractor={(item, index) => index}
                    ListEmptyComponent= {<Text style={styles.emptyText}>TBD</Text>}  
                />
                {this.getSosModalView()}  
            </View>
        );
    }

    getSectionList(){

        if (!SOS_ENABLE) {
            return [];
        }
        return (
            [  
                {title: 'Other', data: ['Add mobile as SOS device']} 
            ]
        );
    }

    getSosContactView(){
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
                <SosContactsScreen onClickSosContinue={this.onClickSosContinue.bind(this)}/>
            </View>

            </KeyboardAwareScrollView>
        );

    }

    getSosModalView(){
        return(
            <Modal
                animationType="slide"
                transparent={false}
                visible={this.state.ModalVisible}
                onRequestClose={() => {
                Alert.alert("Modal has been closed.");
                }}
            >
                {this.getSosContactView()}
            </Modal>);
    }

    onClickSosContinue(){
        this.setState({ModalVisible: false});

    }

    onClickClose(){
        this.setState({SosSwitchValue:false, ModalVisible: false});
    }

    handleBackPress = () => {
        this.goBack(); // works best when the goBack is async
        return true;
    }

}
const styles = StyleSheet.create({
    container : {
        flex: 1
    },
    sectionStyle : {
        backgroundColor: 'grey',
        fontSize: 18,
        paddingLeft: 10,
        paddingTop: 3,
        paddingBottom: 3,
        color: 'white'
    },
    itemStyle: {
        flexDirection: 'row'
    },
    itemTextStyle: {
        backgroundColor: 'white',
        color: 'black',
        fontSize: 16,
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 10,
        paddingRight: 15
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
    emptyText: {
        fontSize: 14,
        textAlign:'center'        
    },


});