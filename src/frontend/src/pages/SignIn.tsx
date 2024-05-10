import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CommonStyles } from '@styles/SignInSignUp/CommonStyles';
import InputField from '@components/SignInSignUp/InputField';

export default function SignInPage({ navigation }: { navigation: any }) {
	const [showPassword, setShowPassword] = useState(false);

	const handleSignUpPress = () => {
		navigation.navigate('SignUp');
	};

	const handleLoginPress = () => {
		navigation.navigate('QRScanner');
	};

	return (
		<View style={CommonStyles.container}>
			<View style={CommonStyles.header}>
				<Text style={CommonStyles.headerText}>Log In</Text>
			</View>
			<InputField placeholder="Email" />
			<InputField placeholder="Password" secureTextEntry={true} onToggleShowPassword={() => setShowPassword(!showPassword)} showPassword={showPassword} />
			<View style={CommonStyles.footer}>
				<Text style={CommonStyles.linkText}>Ainda não está registrado? </Text>
				<TouchableOpacity onPress={handleSignUpPress}>
					<Text style={[CommonStyles.linkText, { textDecorationLine: 'underline' }]}>Cadastre-se</Text>
				</TouchableOpacity>
				<TouchableOpacity style={CommonStyles.button} onPress={handleLoginPress}>
					<Text style={CommonStyles.buttonText}>Login</Text>
				</TouchableOpacity>
				<Text style={CommonStyles.linkText}>Esqueceu a Senha?</Text>
			</View>
		</View>
	);
}
