import React, { Component } from 'react';
import { 
  Animated,
  Dimensions,
  View, 
  StyleSheet, 
  TouchableOpacity, 
  NativeEventEmitter, 
  NativeModules, 
  Image, 
  Text } from 'react-native';

  const ITEM_WIDTH = Dimensions.get('screen').width;
  const ITEM_HEIGHT = Dimensions.get('screen').height;
  const NOTIF_HEIGHT = 300;

export default class SosNotificationView extends Component {
  
    constructor(props) {
      super(props)
      this.state = {
          showNotifcation: false,
          count: 0
      }
      this.viewHeight =  NOTIF_HEIGHT;
      this.viewWidth = props.viewWidth ? props.viewWidth : ITEM_WIDTH;
      this.fadeAnimation = new Animated.Value(-NOTIF_HEIGHT);
      this.initSOSListeners();
    }

    initSOSListeners() {
        const eventEmitter = new NativeEventEmitter(NativeModules.DevicesScreen)
        
        this.sosPressListener = eventEmitter.addListener("onSOSDevicePressed", (device) =>{
            this.setState({showNotifcation: true})
            this.SlidingDown();
        } );
        this.sosPressCancelListener = eventEmitter.addListener("onSOSDevicePressCancel", (device) =>{
            this.SlidingUp();
        } );
        this.sosTimerCountListener = eventEmitter.addListener("onSOSTimerCount", (cntInfo) => {
          if (this.state.showNotifcation === false) {
            this.setState({showNotifcation: true, count: cntInfo.SOSCount})
            this.SlidingDown();
          } else {
            this.setState({count: cntInfo.SOSCount});
          }
        });


        this.sosTimerFinished = eventEmitter.addListener("onSOSTimerFinished", (count) => {
            this.SlidingUp();
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

  
    SlidingDown = () => {
      Animated.timing(this.fadeAnimation, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,      
      }).start(this.onSlideDownComplete.bind(this));
    }
  
    SlidingUp = () => {
      Animated.timing(this.fadeAnimation, {
        toValue: -NOTIF_HEIGHT,
        duration: 1000,
        useNativeDriver: true,      
      }).start(this.onSlideUpComplete.bind(this));
    }
  
    onSlideUpComplete() {
      this.setState({showNotifcation: false})
    }

    onSlideDownComplete() {
      /*setInterval(() => {
        this.SlidingUp();
      }, 1 * 1000)*/
    }
  
    componentDidMount() {
    }

    componentWillUnmount() {
      this.deinitSOSListeners();
    }
  
    render() {
      if (!this.state.showNotifcation) {
        return (<View/>);
      }
        return (
            <Animated.View style={[styles.container, {width: this.viewWidth, height: this.viewHeight}, { 
                transform: [{
                    translateY : this.fadeAnimation
                  }] 
              }]}>
                <View style = {styles.notificationView} >
                <Text style = {styles.text}>
                  SOS Alert!
                </Text>
                <Text style = {styles.timerCount}>
                  {this.state.count}
                </Text>
                <TouchableOpacity 
                    style = {styles.image}
                    onPress = {this.onCancelPress}
                    >
                  <Image 
                    source = {require('../../Images/Sos_cancel.png')}
                    style = {styles.image}
                  />
                </TouchableOpacity>
                {/*<TouchableOpacity 
                    style = {styles.cancelButton}
                    onPress = {this.onCancelPress}
                    >
                  <Text style = {styles.cancelText}>
                    Cancel
                  </Text>
                </TouchableOpacity>*/}
                </View>
            </Animated.View>
        );
    }

    onCancelPress = () => {
        if (this.props.onPressSOSCancel) {
          this.props.onPressSOSCancel();
          this.SlidingUp();
        }
    }

  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      top: 0,
      position:'absolute',
      flexDirection: 'column',
      backgroundColor: '#d7dade',
      opacity: 30, 
      width: '100%',
      justifyContent: 'center'
    },
    notificationView : {
      display: 'flex',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#d7dade',
      borderWidth: 1,
      borderColor: 'black',
    },
    text: {
      color: 'black',
      fontSize: 20,
      paddingBottom: 20
    },
    timerCount: {
      color: 'black',
      fontSize: 20,
      paddingBottom: 20
    },
    image: {
      padding: 5,
      height: 80,
      width: 80,
    },
    cancelButton : {
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 10,
      paddingBottom: 5,
      marginLeft: 20,
      marginRight: 20,
    },
    cancelText : {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'black',
    }
  });
  