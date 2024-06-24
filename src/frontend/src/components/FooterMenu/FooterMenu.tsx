import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

const FooterMenu = () => {
    const navigation = useNavigation();

    const handleNavigationPress = (screenName: string) => () => {
        navigation.navigate(screenName as never);
    };

    return (
        <View style={styles.bottomMenu}>
            <TouchableOpacity style={styles.menuButton} onPress={handleNavigationPress('History')} accessibilityLabel="Go to Solicitation">
			<Feather name="list" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={handleNavigationPress('Solicitation')} accessibilityLabel="Go to History">
			<MaterialIcons name="medical-information" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.centerButtonContainer}>
                <TouchableOpacity style={styles.centerButton} onPress={handleNavigationPress('QRScanner')} accessibilityLabel="Open QR Scanner">
                    <Image source={require('@assets/img/qrcode.png')} style={styles.qrCodeImage} />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.menuButton} onPress={handleNavigationPress('Settings')} accessibilityLabel="Settings">
                <Feather name="settings" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={handleNavigationPress('Help')} accessibilityLabel="Help and Support">
                <Feather name="help-circle" size={24} color="black" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
	bottomMenu: {
		flexDirection: 'row',
		justifyContent: 'space-around',
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
		top: -30,
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
