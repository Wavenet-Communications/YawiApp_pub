import React, {Component} from 'react';
import {AppRegistry, Text, View, Image, Alert, Button} from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack'
import SplashScreen from './app/Components/SplashScreen/SplashScreen';
import HomeScreen from './app/Components/HomeScreen/HomeScreen';
import MapScreen from './app/Components/MapScreen/MapScreen';
import DeviceDetailsScreen from './app/Components/DeviceDetailsScreen/DeviceDetailsScreen';
import NotificationScreen from './app/Components/NotificationsScreen/NotificationScreen';
import { TouchableOpacity, TouchableHighlight } from 'react-native';
import EditScreen from './app/Components/EditScreen/EditScreen';
import AddDeviceScreen from './app/Components/AddDeviceScreen/AddDeviceScreen';
import SettingsScreen from './app/Components/Settings/SettingsScreen';
import DevMapScreen from './app/Components/MapScreen/DevMapScreen';

function getHeaderNavigationOptions(navigation){
    return { 
        headerTitle: 'YAWi',
        headerTitleStyle: {
            textAlign: 'center',
            flexGrow:1,
            alignSelf:'center',
            fontSize: 28
        },
        headerLeft: (
            <TouchableOpacity onPress={() => navigation.navigate('Add')} style={{paddingLeft:10}}>
                <Image 
                    source={require('./app/Images/add_box.png')}
                    style={{width:40, height:40}}
                />
            </TouchableOpacity>
        ),
        headerRight:(
            <TouchableOpacity style={{paddingRight:10, height: 40, width:50}} onPress={() => {navigation.navigate('Settings')}}>
                <Image
                    source={require('./app/Images/settings.png')}
                    style={{width:40, height:40}}
                />
            </TouchableOpacity>
        ),
    };  

};

function getDeviceDetailsNavigationOptions(navigation, title){
    return { 
        title: title,
        headerTitleStyle: {
            textAlign: 'center',
            flexGrow:1,
            alignSelf:'center',
            fontSize: 28
        },
        headerLeft: (
            <TouchableOpacity onPress={() => navigation.state.params.goBack()} style={{paddingLeft:10}}>
                <Image 
                    source={require('./app/Images/baseline_navigate_back.png')}
                    style={{width:40, height:40}}
                />
            </TouchableOpacity>
        ),
        headerRight:(
            <View style={{paddingRight:10, height: 40, width:50}} onPress={() => {Alert.alert('This is a button!')}}>
            </View>
        ),
    };  

};

const SettingsScreenStack = createStackNavigator(
    {
        Settings: {
            screen: SettingsScreen,
            navigationOptions: ({ navigation }) => {
                return getDeviceDetailsNavigationOptions(navigation, 'Settings');
            },
        }
    }
);
const AddDeviceScreenStack = createStackNavigator(
    {
        Add: {
            screen: AddDeviceScreen,
            navigationOptions: ({ navigation }) => {
                return getDeviceDetailsNavigationOptions(navigation, 'Add a Device');
            },
        },
    }
);
const DetailsScreenStack = createStackNavigator(
    {
        Details: { 
            screen: DeviceDetailsScreen,    
        },
        DevMap: {
            screen: DevMapScreen,
            navigationOptions: ({ navigation }) => {
                return getDeviceDetailsNavigationOptions(navigation, 'Map');
            }
        },
        Edit: {
            screen: EditScreen,
            navigationOptions: ({ navigation }) => {
                return getDeviceDetailsNavigationOptions(navigation, 'Edit');
            }
        },
    }
);

const HomeScreenStack = createStackNavigator(
    {
      Home: HomeScreen,
    },
    {  
        defaultNavigationOptions: ({ navigation }) => {  
           return getHeaderNavigationOptions(navigation);
        }  
    }  
);

const MapScreenStack = createStackNavigator(
    {
      Map : MapScreen,
    },
    {
        initialRouteName: 'Map',
        defaultNavigationOptions: ({ navigation }) => {  
            return getHeaderNavigationOptions(navigation);
         }  
     }
);

const NotificationScreenStack = createStackNavigator(
    {
      Notifications: NotificationScreen
    },
    {
        initialRouteName: 'Notifications',
        defaultNavigationOptions: ({ navigation }) => {  
            return getHeaderNavigationOptions(navigation);
         }  
     }
);

const HomeScreenTabs = createBottomTabNavigator(
    {
        Home: HomeScreenStack,
        Map: MapScreenStack,
        Notifications : NotificationScreenStack
    },
    {
        initialRouteName: 'Home',
        defaultNavigationOptions: ({ navigation }) => ({
            tabBarLabel: ({focused}) =>
                getTabBarLabel(navigation, focused),

            tabBarIcon: ({ focused, tintColor }) =>
                getTabBarIcon(navigation, focused, tintColor),
            
        }),
        tabBarOptions: {
          activeTintColor: '#03DAC5',
          inactiveTintColor: '#263238',
          showIcon: true,
          
        },
        
    }
)
const getTabBarLabel = (navigation, focused) =>{
    const { routeName } = navigation.state;
    if (routeName === 'Home') {
        return <Text style={{textAlign:'center'}}>Home</Text>;
    } else if (routeName === 'Map') {
        return <Text style={{textAlign:'center'}}>Map</Text>;
    } else {
        return <Text style={{textAlign:'center'}}>Notifications</Text>;
    }
  };
const getTabBarIcon = (navigation, focused, tintColor) => {
    const { routeName } = navigation.state;
    let h = 30;
    let w = 30;
    if(focused){
        h = 35;
        w = 35;
    }
    if (routeName === 'Home') {
        return <Image style={{width:w, height: h, tintColor: tintColor}} source={require('./app/Images/round_list_black_48dp.png')}/>
    } else if (routeName === 'Map') {
        return <Image source={require('./app/Images/round_map_black_48dp.png')} style={{width:w, height: h, tintColor: tintColor}}/>
    } else {
        return <Image source={require('./app/Images/round_notification_important_black_48dp.png')} style={{width:w, height: h, tintColor: tintColor}}/>
    }
  };
  
const AppContainer =  createAppContainer(createSwitchNavigator(
    {
        Splash: SplashScreen,
        Home: HomeScreenTabs,
        Details: DetailsScreenStack,
        Add: AddDeviceScreenStack,
        Settings: SettingsScreenStack,

    },
    {
        initialRouteName: 'Splash'
    }

));

export default class FirstApp extends Component {
    render() {
        return <AppContainer />;
        
    }
  }

AppRegistry.registerComponent('FirstApp', ()=>FirstApp );