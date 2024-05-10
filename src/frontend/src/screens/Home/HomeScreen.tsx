import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }: { navigation: any }) => {
	const navigateToLogin = () => {
		navigation.navigate('Login');
	};

	const navigateToSignUp = () => {
		navigation.navigate('SignUp');
	};

	return (
		<View style={styles.container}>
			<Image source={require('../../../assets/img/logo_pv.png')} style={styles.logo} />
			<Image source={require('../../../assets/img/name_pv.png')} style={styles.logo_name} />
			<TouchableOpacity style={styles.button} onPress={navigateToLogin}>
				<Text style={styles.buttonText}>Login</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.button} onPress={navigateToSignUp}>
				<Text style={styles.buttonText}>Cadastre-se</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'linear-gradient(90deg, rgba(114,2,161,1) 0%, rgba(226,169,251,1) 100%)',
	},
	logo: {
		width: 150,
		height: 150,
		marginBottom: 50,
	},
	logo_name: {
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
		textAlign: 'center',
	},
	buttonText: {
		textAlign: 'center',
		fontFamily: 'Inter',
		color: '#000',
		fontSize: 18,
	},
});

export default HomeScreen;
