import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

const SignUpScreen = ({ navigation }: { navigation: any }) => {
	const handleLoginPress = () => {
		navigation.navigate('Login');
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerText}>Sign Up</Text>
			</View>
			<View style={styles.inputContainer}>
				<TextInput style={styles.inputLabel} placeholder="Nome" />
			</View>
			<View style={styles.inputContainer}>
				<TextInput style={styles.inputLabel} placeholder="Email" />
			</View>
			<View style={styles.inputContainer}>
				<TextInput style={styles.inputLabel} placeholder="Password" />
				<Text style={styles.showText}>Show</Text>
			</View>
			<View style={styles.footer}>
				<Text style={styles.footerText}>Ao clicar em “Cadastre-se” você aceita nossos Termos e Condições e está “de Acordo” com as nossas Políticas de Privacidade.</Text>
				<TouchableOpacity style={styles.button}>
					<Text style={styles.buttonText}>Cadastre-se</Text>
				</TouchableOpacity>
				<Text style={styles.loginLink}>Já está cadastrado?</Text>
				<TouchableOpacity onPress={handleLoginPress}>
					<Text style={styles.loginLink}>Faça o Login</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center', // Centraliza verticalmente
		alignItems: 'center',
		backgroundColor: '#fff',
		maxWidth: 480,
		width: '100%',
	},
	image: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		paddingHorizontal: 20,
		paddingVertical: 10,
		marginTop: 5,
		maxWidth: '100%',
		width: 343,
	},
	headerText: {
		flex: 1,
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center',
		color: 'black',
	},
	inputContainer: {
		flexDirection: 'row', // Alinha os elementos na horizontal
		justifyContent: 'space-between', // Distribui os elementos igualmente
		alignItems: 'flex-start',
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
		color: '#B16ECE',
	},
	footer: {
		marginTop: 8,
		paddingHorizontal: 20,
		width: '100%',
		maxWidth: 343,
	},
	footerText: {
		fontSize: 14,
		textAlign: 'center',
		color: '#B16ECE',
	},
	button: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 15,
		marginTop: 20,
		backgroundColor: '#B16ECE',
		borderRadius: 100,
	},
	buttonText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: 'white',
	},
	loginLink: {
		textAlign: 'center',
		marginTop: 5,
		fontSize: 16,
		fontWeight: 'bold',
		color: '#B16ECE',
	},
});

export default SignUpScreen;
