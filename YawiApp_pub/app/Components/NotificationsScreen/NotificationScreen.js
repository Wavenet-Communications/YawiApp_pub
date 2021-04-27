import React, { Component } from "react";
import { NativeEventEmitter, NativeModules } from 'react-native';
import {View, Text, Dimensions, StyleSheet} from 'react-native';
import MinewComponent from '../MinewComponent/MinewComponent'
import { FlatList } from "react-native-gesture-handler";
import TimeAgo from 'react-native-timeago';
import SosNotificationView from "../Utils/SosNotificationView";

const ITEM_HEIGHT = Dimensions.get('window').height;
const ITEM_WIDTH = Dimensions.get('window').width;

export default class NotificationScreen extends Component{
    constructor(props){
        super(props);
        this.state = {
            mNofifList: []
        };
    }

    componentDidMount(){
        this.getNotifications();

        const eventEmitter = new NativeEventEmitter(NativeModules.DevicesScreen)
        eventEmitter.addListener("onUpdateNotifications", (notifiData) =>{
            this.setNotificationList(notifiData);
        } );
    }

    setNotificationList(notifiData){
        let lNotifStr = notifiData.Notifications;
        let lNotificationList = JSON.parse(lNotifStr);
        
        this.mList=[];
        lNotificationList.forEach( (notif)=>{
            var {mDevId, mDevName, mType, mRead, mMessage, mTime} = notif;
            this.mList.push({key: mDevId, name: mDevName, read: mRead, message: mMessage, date: mTime});
        });

        this.setState({mNofifList:[... this.mList.slice().reverse()]});

    }

    async getNotifications(){
        let notifiData =  await MinewComponent.getNotifications();
        this.setNotificationList(notifiData);
    }
    
    onSOSPressHandler = () => {
        MinewComponent.cancelSos();
    }
  
    render(){
        return (
            <View style = {styles.container}>
                <FlatList
                    data = {this.state.mNofifList}
                    width = "100%"
                    numColumns = '1'
                    extraData = {this.state.mNofifList}
                    keyExtractor = {(item, index) => item.key}
                    ItemSeparatorComponent = {this.FlatlistItemSeparator}
                    renderItem ={({item, index}) => this.getItemView(item, index)}
                    ListEmptyComponent= {<Text style={styles.emptyText}>No Messages found</Text>}
                />
                <SosNotificationView
                    onPressSOSCancel={() => this.onSOSPressHandler()}/>
            </View>
        );
    }

    FlatlistItemSeparator = () =>{
        return (
            <View
                style = {styles.itemSeparator}
            />
        )
    }
    getItemView(item, index){
        return (

        <View style={styles.item}>
            <Text style={styles.itemMessage}>
                {item.message}
            </Text>
            <View style={styles.itemDateView}>
                <TimeAgo style={styles.itemDate} time={item.date} />
            </View>
        </View>
        );

    }
}


styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        backgroundColor:"#d7dade",
        minWidth:ITEM_WIDTH,
        paddingLeft: 2,
        paddingRight:2
    },
    item:{
        flex:1,
        flexDirection:'column',
        minHeight: 80,
        width: '100%',
        backgroundColor:'#fff'
    },

    itemMessage: {
        marginTop: 10,
        marginLeft: 10,
        fontSize: 15,
    },

    itemDateView: {
        flex:1,
        marginRight: 5,
        justifyContent:'flex-end',
        marginBottom: 5,
        width: "100%",
    },
    itemDate: {
        fontSize: 11,
        alignSelf:'flex-end'
    },
    itemSeparator : {
        height : 1,
        backgroundColor : "#607D8B"
    },
    emptyText: {
        fontSize: 14,
        textAlign:'center'        
    },

});


function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);
  
    var interval = Math.floor(seconds / 31536000);
  
    if (interval > 1) {
      return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
  }
  var aDay = 24*60*60*1000
  console.log(timeSince(new Date(Date.now()-aDay)));
  console.log(timeSince(new Date(Date.now()-aDay*2)));