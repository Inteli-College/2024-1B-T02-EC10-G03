import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CommonStyles } from '@styles/SignInSignUp/CommonStyles';
import InputField from '@components/SignInSignUp/InputField';

export default function SignUpScreen({ navigation }: { navigation: any }) {
	const handleLoginPress = () => {
		navigation.navigate('Login');
	};

	return (
		<View style={CommonStyles.container}>
			<View style={CommonStyles.header}>
				<Text style={CommonStyles.headerText}>Sign Up</Text>
			</View>
			<InputField placeholder="Nome" />
			<InputField placeholder="Email" />
			<InputField placeholder="Password" secureTextEntry={true} />
			<View style={CommonStyles.footer}>
				<Text style={CommonStyles.linkText}>Ao clicar em “Cadastre-se” você aceita nossos Termos e Condições e está “de Acordo” com as nossas Políticas de Privacidade.</Text>
				<TouchableOpacity style={CommonStyles.button}>
					<Text style={CommonStyles.buttonText}>Cadastre-se</Text>
				</TouchableOpacity>
				<Text style={CommonStyles.linkText}>Já está cadastrado?</Text>
				<TouchableOpacity onPress={handleLoginPress}>
					<Text style={CommonStyles.linkText}>Faça o Login</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}
