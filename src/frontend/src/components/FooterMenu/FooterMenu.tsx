import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SolicitationScreen from 'screens/Solicitation/SolicitationScreen';

const FooterMenu = () => {

    const navigation = useNavigation(); // Use o hook useNavigation aqui
     
    const handleSolicitaitonPress = () => {
        navigation.navigate('Solicitation'); // Navega para a tela de SignUp
    };

    const handleHistoryPress = () => {
        navigation.navigate('History'); // Navega para a tela de SignUp
    };

    const handleScannerPress = () => {
        navigation.navigate('QRScanner'); // Navega para a tela de SignUp
    };


    return (
        <View style={styles.bottomMenu}>
            <TouchableOpacity style={styles.menuButton} onPress={handleSolicitaitonPress}>
                <View style={styles.circle}/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={handleHistoryPress}>
                <View style={styles.circle}/>
            </TouchableOpacity>
            <View style={styles.centerButtonContainer}>
                <TouchableOpacity style={styles.centerButton} onPress={handleScannerPress}>
                    <Image source={require('../../../assets/img/qrcode.png')} style={styles.qrCodeImage} />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.menuButton}>
                <View style={styles.circle} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton}>
                <View style={styles.circle} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomMenu: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    menuButton: {
        flex: 1,
        alignItems: 'center',
    },
    circle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E8E8E8',
    },
    centerButtonContainer: {
        position: 'relative',
        top: -60, // Ajuste para centralizar o botão maior
        alignSelf: 'center',
        zIndex: 1,
    },
    centerButton: {
        backgroundColor: '#B26CCF',
        borderRadius: 50,
        width: 70,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrCodeImage: {
        width: 50,
        height: 50,
    },
});

export default FooterMenu;
