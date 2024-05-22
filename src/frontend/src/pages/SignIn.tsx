import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { CommonStyles } from '@styles/SignInSignUp/CommonStyles';
import InputField from '@components/SignInSignUp/InputField'; // Assumindo que InputField é um componente customizado

export default function SignInPage({ navigation }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const handleSignUpPress = () => {
		navigation.navigate('SignUp');
	};

	const handleLoginPress = async () => {
		if (!email || !password) {
			Alert.alert('Erro', 'Por favor, preencha todos os campos');
			return;
		}

		try {
			const response = await fetch('http://localhost:8000/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email,
					password,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Erro desconhecido');
			}

			const data = await response.json();
			if (data) {
				// Salve os dados do usuário no armazenamento local ou em uma biblioteca de gerenciamento de estado (por exemplo, Redux)
				navigation.navigate('QRScanner');
			} else {
				Alert.alert('Login falhou', 'Email ou senha inválidos');
			}
		} catch (error) {
			if (error instanceof Error) {
				Alert.alert('Login falhou', error.message);
			} else {
				Alert.alert('Login falhou', 'Erro desconhecido');
			}
		}
	};

	return (
		<View style={CommonStyles.container}>
			<View style={CommonStyles.header}>
				<Text style={CommonStyles.headerText}>Log In</Text>
			</View>
			{/* Mantém o InputField original e adiciona TextInput para capturar valores */}
			<View>
				<InputField placeholder="Email" />
				<TextInput
					placeholder="Email"
					value={email}
					onChangeText={setEmail}
					style={{ display: 'none' }}
				/>
				<InputField
					placeholder="Password"
					secureTextEntry={!showPassword}
					onToggleShowPassword={() => setShowPassword(!showPassword)}
					showPassword={showPassword}
				/>
				<TextInput
					placeholder="Password"
					value={password}
					onChangeText={setPassword}
					secureTextEntry={!showPassword}
					style={{ display: 'none' }}
				/>
			</View>
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
