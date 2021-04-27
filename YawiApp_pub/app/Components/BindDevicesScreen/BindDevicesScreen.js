import React, { Component } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { AppRegistry, FlatList, StyleSheet, Text, View, Dimensions, TouchableOpacity, Alert } from 'react-native';

export default class BindDevicesScreen extends Component{
    constructor(props){
        super(props);
        this.mDeviceList = [
            {key : "Device1"},
            {key : "Device21"}
        ];
        this.state = {
            listHolder:[]
        };
    }
    componentDidMount(){
        this.setState({listHolder: [...this.mDeviceList]})
        this.MinewInit();
        const eventEmitter = new NativeEventEmitter(NativeModules.DevicesScreen)
        eventEmitter.addListener("BindDeviceUpdates", (bindedDevices) =>{
                this.mDeviceList = [];

                bindedDevices.forEach((device) =>{
                    console.log(device);
                    var {Mac, Distance, Rssi, Connected, Battery} = device;
                    console.log(Mac);
                    this.mDeviceList.push({key: Mac, distance : Distance.toFixed(2), RSSI : Rssi, connected : Connected, battery : Battery});
                });
                this.setState({listHolder:[...this.mDeviceList]});

        } );
    }


    FlatlistItemSeparator = () =>{
        return (
            <View
                style = {styles.itemSeparator}
            />
        )
    }
    
    async MinewInit(){
        try{
            var {Check} = await MinewComponent.initalize();
            console.log(Check);
        }
        catch(e){
            console.error(e);
        }
    }
    
    render(){
        return (
            <View style={styles.container}>
                <FlatList
                    data = {this.state.listHolder}
                    width = "100%"
                    extraData = {this.state.listHolder}
                    keyExtractor = {(index) => index.toString()}
                    ItemSeparatorComponent = {this.FlatlistItemSeparator}
                    renderItem ={({item}) => this.getItemView(item)}
                />
            </View>
        );
    }
    onItemClick(item){
        Alert.alert("", "Do you want to bind this device?", 
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Bind',
                    onPress: () => console.log('Bind pressed')
                }

            ]
        )
    }
    getItemView(item){
        return (
            <TouchableOpacity onLongPress= {()=>this.onItemClick(item)}>
            <View style={styles.item} width={ITEM_WIDTH/2}>
                <Text>{item.key}</Text>
                <Text>Distance : {item.distance}m</Text>
                <Text>Rssi : {item.RSSI}</Text>
                <Text>Battery : {item.battery}</Text>
            </View>
            </TouchableOpacity>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        paddingTop : 22,
        flexDirection : 'row',
        justifyContent: "center"
    },
    item : {
        padding : 10,
        fontSize : 18,
        height : 112
    },
    itemSeparator : {
        height : 1,
        backgroundColor : "#607D8B"
    }
})

