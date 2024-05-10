import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const LOGO_IMAGE = require('@assets/img/logo_pv.png');
const LOGO_NAME_IMAGE = require('@assets/img/name_pv.png');

export default function HomePage({ navigation }: { navigation: any }) {
	const navigate = (screenName: string) => () => {
		navigation.navigate(screenName);
	};

	return (
		<LinearGradient colors={['rgba(114,2,161,1)', 'rgba(226,169,251,1)']} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} style={styles.container}>
			<Image source={LOGO_IMAGE} style={styles.logo} />
			<Image source={LOGO_NAME_IMAGE} style={styles.logoName} />
			<TouchableOpacity style={styles.button} onPress={navigate('Login')} accessibilityLabel="Login">
				<Text style={styles.buttonText}>Login</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.button} onPress={navigate('SignUp')} accessibilityLabel="Register">
				<Text style={styles.buttonText}>Cadastre-se</Text>
			</TouchableOpacity>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	logo: {
		width: 150,
		height: 150,
		marginBottom: 50,
	},
	logoName: {
		width: 220,
		height: 100,
		marginBottom: 50,
	},
	button: {
		backgroundColor: '#fff',
		padding: 15,
		borderRadius: 50,
		marginTop: 10,
		width: 250,
		alignItems: 'center',
	},
	buttonText: {
		color: '#000',
		fontSize: 18,
		fontFamily: 'Inter',
	},
});
