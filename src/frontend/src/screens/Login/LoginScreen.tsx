import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';

const LoginScreen = ({ navigation }: { navigation: any }) => {
	const [showPassword, setShowPassword] = useState(false);

	const handleSignUpPress = () => {
		navigation.navigate('SignUp');
	};

	const handleLoginPress = () => {
		navigation.navigate('QRScanner');
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerText}>Log In</Text>
			</View>
			<View style={styles.inputContainer}>
				<TextInput placeholder="Email" autoFocus={true} />
			</View>
			<View style={styles.inputContainer}>
				<TextInput placeholder="Password" secureTextEntry={true} />
				<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
					<Text style={styles.showText}>{showPassword ? 'Hide' : 'Show'}</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.footer}>
				<Text style={styles.footerText}>Ainda não está registrado? </Text>
				<TouchableOpacity onPress={handleSignUpPress}>
					<Text style={styles.footerTextLink}>Cadastre-se</Text>
				</TouchableOpacity>
				<View style={styles.button}>
					<TouchableOpacity onPress={handleLoginPress}>
						<Text style={styles.buttonText}>Login</Text>
					</TouchableOpacity>
				</View>
				<Text style={styles.forgotPassword}>Esqueceu a Senha?</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center', // Centraliza verticalmente
		alignItems: 'center', // Centraliza horizontalmente
		backgroundColor: 'white',
		maxWidth: 480,
		width: '100%',
	},
	imageContainer: {
		width: '100%',
		aspectRatio: 8.33,
	},
	image: {
		flex: 1,
	},
	header: {
		marginBottom: 6,
	},
	headerText: {
		fontSize: 30,
		fontWeight: 'bold',
		textAlign: 'center',
		color: 'black',
	},
	inputContainer: {
		flexDirection: 'row', // Alinha os elementos na horizontal
		justifyContent: 'space-between', // Distribui os elementos igualmente
		alignItems: 'center', // Centraliza verticalmente
		paddingHorizontal: 20,
		paddingVertical: 20,
		marginTop: 8,
		maxWidth: '100%',
		width: 343,
		fontSize: 16,
		fontWeight: 'bold',
		backgroundColor: '#f0f0f0',
		color: '#999999',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#cccccc',
	},
	inputLabel: {
		fontSize: 16,
		color: '#999999',
	},
	showText: {
		textAlign: 'right',
		fontSize: 16,
		color: 'purple',
	},
	footer: {
		marginTop: 3.5,
		marginBottom: 5,
		paddingHorizontal: 20,
		width: '100%',
		maxWidth: 343,
	},
	footerText: {
		fontSize: 16,
		fontWeight: 'bold',
		textAlign: 'center',
		color: '#B16ECE',
	},
	footerTextLink: {
		fontSize: 16,
		fontWeight: 'bold',
		textAlign: 'center',
		color: '#B16ECE',
		textDecorationLine: 'underline',
	},
	button: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 15,
		marginTop: 36,
		backgroundColor: '#B16ECE',
		borderRadius: 100,
	},
	buttonText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: 'white',
	},
	forgotPassword: {
		marginTop: 5,
		fontSize: 16,
		fontWeight: 'bold',
		color: '#6B46C1',
		textAlign: 'center',
	},
});

export default LoginScreen;
