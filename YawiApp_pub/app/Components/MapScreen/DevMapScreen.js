import React, { Component, useState } from "react";
import MapView, { Camera, PROVIDER_GOOGLE} from 'react-native-maps';
import {View, BackHandler, Text, StyleSheet, Alert} from 'react-native';
import image from './../../Images/flag-pink.png';
import MinewComponent from '../MinewComponent/MinewComponent'
import { NativeEventEmitter, NativeModules } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { TouchableOpacity } from "react-native-gesture-handler";
import SosNotificationView from "../Utils/SosNotificationView";

export default class DevMapScreen extends Component {

    constructor(props){
      super(props);
      this.mDeviceList = [
      ];
      this.movedToMarker = false;
      this.state = {
          listHolder:[],
          currentLocation:{
            longitude: 0,
            latitude: 0,
            latitudeDelta: 9.22,
            longitudeDelta: 4.21,
          },
          mapMargin: 1,
      };
      this.mSelectedDevId = '';
      //const [zoom, setZoom] = useState(15)

      this.MinewInit();
      this.getCurrentLocation();
      console.log("HomeScreen componentDidMount ****");
      const eventEmitter = new NativeEventEmitter(NativeModules.DevicesScreen)
      this.mDeviceUpdateListener = eventEmitter.addListener("BindDeviceUpdates", (bindedDevices) =>{
              this.mDeviceList = [];
              console.log("Bind device updates ---" + bindedDevices);
              bindedDevices.forEach((device) =>{
                var mac = device.DevID;
                if(this.mSelectedDevId === mac){
                  this.getDeviceDetails(device);    
                }            
              });
              this.setState({listHolder:[...this.mDeviceList]});

      } );
      this.getDevice();
    }

    async getDevice(){
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

    setMargin = () => {
      this.setState({ mapMargin: 0 });
    }
  
    getCurrentLocation(){

        Geolocation.getCurrentPosition(
          (position) => {
              console.log(position);
              this.setState({currentLocation : { 
                longitude: position.coords.longitude,
                latitude: position.coords.latitude,
                latitudeDelta: 9.22,
                longitudeDelta: 4.21,
                zoom: 12
              }
              })
            },
          (error) => {
              // See error code charts below.
              console.log(error.code, error.message);
              Alert.alert(error.message)
            },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );

    }
    getDeviceDetails(device){
      console.log(device);
      var mac = device.DevID;
      var details = JSON.parse(device.DevDetails);
      var {connectionState,name, disappearTime, disappearLong, disappearLat} = details;
      this.mDeviceList.push({key: mac,
        devName : name,
        connected : connectionState,
        disappearTime : disappearTime, 
        location: {
          longitude: disappearLong,
          latitude: disappearLat
        }
      });

    }

    componentDidMount(){
        this.props.navigation.setParams({goBack: ()=>this.goBack()});
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

        this.setState({listHolder: [...this.mDeviceList]})
    }

    componentWillUnmount(){
      this.backHandler.remove();
      this.mDeviceUpdateListener.remove();
    }

    goBack(){
      this.props.navigation.goBack();
    }

    handleBackPress = () => {
      this.goBack(); // works best when the goBack is async
      return true;
    }

    async MinewInit(){
        try{
            var {Check} = await MinewComponent.initalize();
            let devList = await MinewComponent.getBindDevices();
            this.mDeviceList = [];

            devList.forEach((device) =>{
              this.getDeviceDetails(device);
            });
            this.setState({listHolder:[...this.mDeviceList]});

            console.log(Check);
        }
        catch(e){
            console.error(e);
        }
    }

    onSOSPressHandler = () => {
      MinewComponent.cancelSos();
    }

    async animateCamera() {
      const camera = await this.map.getCamera();
      camera.zoom = 12;
      this.map.setCamera(camera);
    }

    moveMapToMarker(){
      if (this.mDeviceList.length > 0){
        let location = {latitude: this.mDeviceList[0].location.latitude,
                        longitude: this.mDeviceList[0].location.longitude};
        this.map.fitToCoordinates([location], {
          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          animated: false,
        });
        this.animateCamera();
        this.movedToMarker = true;
      }
    }
    componentDidUpdate() {
      if (this.movedToMarker === false){
        this.moveMapToMarker();
      }
    }
    render(){
        return (
            <MapView style={{...styles.map, marginBottom: this.state.mapMargin} }
                ref= { ref => {
                  this.map = ref;
                }}
                onMapReady= {() => {
                  this.setMargin();
                  this.moveMapToMarker();
                }}
                provider= { PROVIDER_GOOGLE }
                initalRegion={this.state.currentLocation}
                loadingEnabled={true}
                zoomEnabled={true}
                zoomControlEnabled={true}
                zoomTapEnabled={true}
                //
                onRegionChangeComplete={region => {
                }}
              >
                { this.mDeviceList.map((item) => 
                  <MapView.Marker key={item.key}
                                  coordinate={item.location}
                                  title = {item.devName}
                                  description = {item.name}
                                  onCalloutPress={()=> this.onPressMarkerCallout(item.key)}
                   >
                    <MapView.Callout>
                        <Text>{item.devName}</Text>
                    </MapView.Callout>
                  </MapView.Marker>
                )}
                <SosNotificationView
                    onPressSOSCancel={() => this.onSOSPressHandler()}/>
            </MapView>
        );
    }

     onPressMarkerCallout(key){
      MinewComponent.setSelectedDevId(key);
  }

}

const styles = StyleSheet.create({
    map: {
      ...StyleSheet.absoluteFillObject,
    },
  });
