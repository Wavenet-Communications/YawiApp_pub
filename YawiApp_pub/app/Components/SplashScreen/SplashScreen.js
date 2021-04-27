import React, { Component } from "react";
import {AppRegistry, TouchableOpacity, View, Text, Alert, Image} from 'react-native';
import styles from './SplashStyles'


export default class SplashScreen extends Component{

    constructor(props) {
        super(props);
        this.timer = null;
        
        this.images = [
            <Image style={styles.image} 
            source ={require("../../Images/splash_2.png")}
            />,

            <Image style={styles.image} 
            source ={require("../../Images/splash_3.png")}
            />,
            <Image style={styles.image} 
            source ={require("../../Images/splash_4.png")}
            />,
            <Image style={styles.image} 
            source ={require("../../Images/splash_5.png")}
            />,
            <Image style={styles.image} 
            source ={require("../../Images/splash_6.png")}
            />,
            <Image style={styles.image} 
            source ={require("../../Images/splash_7.png")}
            />
        ];

        this.state = {
            curInd: 0,
        };
    }
    componentDidMount() {
        this.timer = setInterval(this.timerTick.bind(this), 20);
    }
    timerTick() {
        let ind = this.state.curInd;
        ind = (++ind) % this.images.length;
        this.setState({curInd:ind});        
    }
    startTimer(){
        if (this.state.curInd == this.images.length - 1) {
            clearInterval (this.timer);
            this.timer = setInterval(this.timerTick.bind(this), 1000);
        }
    }
    componentWillUnmount() {
        clearInterval(this.timer);
        this.timer = null;
    }
    render(){
        this.startTimer();
        return (
            <View style={styles.container}>
                <Text style={styles.title}>
                    
                </Text>
                <Image style={styles.splashMainImage} 
                    source ={require("../../Images/splash_1.png")}
                />
                {this.images[this.state.curInd]}
                {this.getTitle()}
            <View style={styles.bottomContainer}>
                    <TouchableOpacity style={styles.continueButton} onPress = {() => this.props.navigation.navigate('Home')}>
                        <Text style={styles.buttonText}>
                            Continue
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    getTitle() {
        return (
            <View>
                <Image style={styles.appNameImage} 
                    source ={require("../../Images/app_name_icon.png")}
                />
            </View>
        );
    }
}

AppRegistry.registerComponent('SplashScreen', ()=> SplashScreen );
