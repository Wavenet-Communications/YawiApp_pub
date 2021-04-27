import { StyleSheet } from 'react-native';


export default StyleSheet.create({
    container : {
        flex : 1,
        alignItems: 'center'
    },
    splashMainImage : {
        marginTop : 30,
        width: '100%',
        resizeMode: 'center'
    },
    image : {
        marginTop : 10,
        width: 200,
        aspectRatio: 1
    },
    appNameImage : {
        marginTop : 5,
        resizeMode: 'center',
        height : 30,
    },
    title :{
        marginTop : 50,
        textAlign : 'center',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#3700B3'
        
    },
    buttonText : {
        fontSize : 20,
        color : '#03DAC5'
    },
    bottomContainer: {
        flex : 1,
        justifyContent : 'flex-end',
    },
    continueButton : {
        height : 36,
        marginBottom: 40
    }


})
