import React, { Component } from "react";
import { 
    View,
    Dimensions,
    StyleSheet,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    Platform,
 } from "react-native";
import { selectContactPhone } from 'react-native-select-contact';
import { TextInput } from "react-native-gesture-handler";
import MinewComponent from '../MinewComponent/MinewComponent';
import {PermissionsAndroid} from 'react-native';



const ITEM_WIDTH = Dimensions.get('window').width;
const ITEM_HEIGHT = Dimensions.get('window').height;
const ERROR_CONTACT_NAME = "^Please enter contact name";
const ERROR_CONTACT_NUMBER = "^Please enter contact number";
export default class SosContactsScreen extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            mContacts:[ {mName:"", mNumber :"", mNameError:"", mNumberError:""},
                        {mName: "", mNumber: "", mNameError:"", mNumberError:""} ],
        }

    }
    render(){
        return (
            <View style={styles.container}>
            <ScrollView paddingBottom={100}>
            <View>
                {this.getContactCardView("Contact details 1", 0)}
                <View height={20}/>
                {this.getContactCardView("Contact details 2", 1)}
           </View>

            </ScrollView>
           <View style = {styles.modelNextButtonView}>
           <TouchableOpacity style={[styles.modalNextButton, {backgroundColor: '#03DAC5'}]} 
               onPress={()=>this.onClickContinue()}>
               <Text style={styles.modalNextButtonText}>Continue</Text>
           </TouchableOpacity>
         </View>
       </View>
   );
    }
    onClickContactAdd(contactInd){
        this.requestContactReadPermission(contactInd);
    }
    onClickContinue(){
        if (this.state.mContacts[0].mName === "" || this.state.mContacts[0].mNumber === ''
           || this.state.mContacts[1].mName === "" || this.state.mContacts[1].mNumber === '') {
            
            var contacts = this.state.mContacts; 
            contacts[0].mNameError = contacts[1].mNameError = ERROR_CONTACT_NAME;
            contacts[0].mNumberError = contacts[0].mNumberError = ERROR_CONTACT_NUMBER;
            this.setState({mContacts:contacts});
            return;
        }
        if (Platform.Version > 23) {
            this.requestSMSPermission().then((success)=>{
                this.requestPhoneCallPermission().then((success) => {
                    MinewComponent.saveSosContacts(JSON.stringify(this.state.mContacts));
                    this.props.onClickSosContinue();
        
                });
            });
        } else {
            MinewComponent.saveSosContacts(JSON.stringify(this.state.mContacts));
            this.props.onClickSosContinue();
        }
    }
    onNameChange(text, contactInd){
        console.log(text);
        let contacts = this.state.mContacts.slice();
        contacts[contactInd].mName = text;
        if (contacts[contactInd].mName === "") {
            contacts[contactInd].mNameError = ERROR_CONTACT_NAME;
        } else {
            contacts[contactInd].mNameError = "";
        }
        this.setState({mContacts:contacts});
    }
    onNumberChange(number, contactInd){
        let contacts = this.state.mContacts.slice();
        contacts[contactInd].mNumber = number;
        if (contacts[contactInd].mNumber === "") {
            contacts[contactInd].mNumberError = ERROR_CONTACT_NUMBER;
        } else {
            contacts[contactInd].mNumberError = "";
        }

        this.setState({mContacts:contacts});
    }

    getContactCardView(title, contactInd){
        
        return (
            <View style={styles.cardView}>

                <View style={styles.cardViewHeaderView}>
                    <Text style={styles.cardViewHeaderTitle}>
                        {title}
                    </Text>
                    <TouchableOpacity onPress={()=> this.onClickContactAdd(contactInd)}>
                    <Image style={styles.cardViewPersonAddImg}
                        source={require("../../Images/baseline_person_add_black.png")}
                    />
                    </TouchableOpacity>
                </View>
                <View style={styles.cardViewContactNameView}>
                    
                    <Image style={styles.cardViewContactImg} source={require('../../Images/baseline_person_black.png')}/>
                    <TextInput style={styles.cardViewContactName} 
                        onChangeText={text => this.onNameChange(text, contactInd)}
                        placeholder="Name"
                        value={this.state.mContacts[contactInd].mName}
                    />                    
                </View>
                <View style={styles.cardViewLine}/>
                <Text style={styles.errorText}>
                    {this.state.mContacts[contactInd].mName === ""?
                        this.state.mContacts[contactInd].mNameError : ""}       
                </Text>
                <View style={styles.cardViewContactNameView}>
                    
                    <Image style={styles.cardViewContactImg} source={require('../../Images/baseline_dialpad_black.png')}/>
                    <TextInput style={styles.cardViewContactName}
                        keyboardType={"number-pad"}
                        onChangeText={number => this.onNumberChange(number, contactInd)}
                        placeholder="+91"
                        value={this.state.mContacts[contactInd].mNumber}
                    />
                 </View>
                <View style={styles.cardViewLine}/>
                <Text style={styles.errorText}>
                {this.state.mContacts[contactInd].mNumber === ""?
                        this.state.mContacts[contactInd].mNumberError : ""}       
                 </Text>

            </View>
        );
    }

    getPhoneNumber(contactInd) {
        return selectContactPhone()
            .then(selection => {
                if (!selection) {
                    return {"name": "", "phone": ""};
                }
                
                let { contact, selectedPhone } = selection;
                let contacts = this.state.mContacts.slice();
                contacts[contactInd].mName = contact.name;
                contacts[contactInd].mNumber = selectedPhone.number;
                this.setState({mContacts:contacts});        
        
                return {"name": contact.number, "phone":selectedPhone.number};
            });  
    }

    async requestSMSPermission() {
        try {
            var granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.SEND_SMS,
              {
                title: 'YAWi SOS Device',
                message:
                  'YAWi SOS device needs to SOS SMS messags',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              return false;
            }
            return true;
          } catch (err) {
            console.warn(err);
            return false;
          }
  
    }

    async requestPhoneCallPermission() {
        try {
            var granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.CALL_PHONE,
              {
                title: 'YAWi SOS Device',
                message:
                  'YAWi SOS device needs to make calls when SOS is pressed',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              return false;
            }
            return true;
          } catch (err) {
            console.warn(err);
            return false;
          }
  
    }


    async requestContactReadPermission(contactInd) {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            {
              title: 'Contacts read Permission',
              message:
                'Phone contacts read permission is required to select SOS contact',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            this.getPhoneNumber(contactInd);
            return true;
          } else {
            console.log('Contacts permission denied');
          }
        } catch (err) {
          console.warn(err);
        }
        return false;
    }

}

const styles = StyleSheet.create({
    container: {
        flex:1,
        flexDirection : 'column',
        justifyContent:'center',
        alignContent:'center',
        width:ITEM_WIDTH,
        maxWidth:ITEM_WIDTH,
        paddingLeft:20,
        paddingRight: 20
    },
    cardView: {
        backgroundColor: "#d7dade",
        width: "100%",
        height: 220,
        padding:20,
    },
    cardViewHeaderView:{
        flexDirection:"row",
        justifyContent:'space-between'
    },
    cardViewHeaderTitle:{
        fontSize:20,
        fontWeight:'bold'
    },
    cardViewPersonAddImg:{
        height: 50,
        width: 50,
        tintColor:'#03DAC5'
    },
    cardViewContactNameView:{
        marginTop:10,
        flexDirection:'row',
        justifyContent:'flex-start',
        alignContent:'center',
        height: 40
    },
    cardViewContactImg:{
        width: 20,
        height: 20,
        marginTop:10,
        marginBottom:10,
        marginRight: 10,
        justifyContent:'center',
        alignContent:'center'
    },
    cardViewContactName:{
        height: 40, 
        width: ITEM_WIDTH-110,
        marginRight:20
    },
    cardViewNumberPrefix:{
        width: 30,
        height: 20,
        marginTop:10,
        marginBottom:10,
        justifyContent:'center',
        alignContent:'center'
    },
    cardViewLine:{
        height: 1,
        paddingLeft:10,
        paddingRight:10,
        backgroundColor:'#000'
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
    modelNextButtonView:{
        marginTop: 10,
        height : 40,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems:'center'
    },

    errorText : {
        fontSize: 10,
        color: 'red',
        paddingLeft: 30
    }

});


