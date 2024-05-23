import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { CommonStyles } from '@styles/SignInSignUp/CommonStyles';
import InputField from '@components/SignInSignUp/InputField';

const SignUpScreen = ({ navigation }: { navigation: any }) => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [role, setRole] = useState('');
	const [roles, setRoles] = useState<string[]>([]);

	//  useEffect(() => {
	//    // Fetch roles from the backend
	//    axios.get('http://127.0.0.1:3000/user/roles')
	//      .then((response: { data: string[] }) => {
	//        setRoles(response.data);
	//      })
	//      .catch((error: any) => {
	//        console.error("There was an error fetching the roles!", error);
	//      });
	//  }, []);

	//  const handleSignUpPress = async () => {
	//    try {
	//      const response = await axios.post('http://127.0.0.1:3000/user/register/employee', {
	//        name: name,
	//        email: email,
	//        password: password,
	//        role: role,
	//      });

	//      if (response.status === 201) {
	//        Alert.alert('Success', 'Employee registered successfully');
	//        navigation.navigate('Login');
	//      }
	//    } catch (error: any) {
	//      Alert.alert('Error', error.response?.data?.message || 'An error occurred');
	//    }
	//  };

	const handleLoginPress = () => {
		navigation.navigate('Login');
	};

	return (
		<View style={CommonStyles.container}>
			<View style={CommonStyles.header}>
				<Text style={CommonStyles.headerText}>Sign Up</Text>
			</View>
			<InputField placeholder="Nome" value={name} onChangeText={setName} />
			<InputField placeholder="Email" value={email} onChangeText={setEmail} />
			<InputField placeholder="Password" secureTextEntry={true} value={password} onChangeText={setPassword} />
			<View style={{ marginVertical: 10 }}>
				<Text style={{ marginBottom: 5 }}>Role:</Text>
				<Picker selectedValue={role} onValueChange={(itemValue) => setRole(itemValue)}>
					{roles.map((role) => (
						<Picker.Item key={role} label={role} value={role} />
					))}
				</Picker>
			</View>
			<View style={CommonStyles.footer}>
				<Text style={CommonStyles.linkText}>Ao clicar em “Cadastre-se” você aceita nossos Termos e Condições e está “de Acordo” com as nossas Políticas de Privacidade.</Text>
				<TouchableOpacity style={CommonStyles.button} onPress={handleSignUpPress}>
					<Text style={CommonStyles.buttonText}>Cadastre-se</Text>
				</TouchableOpacity>
				<Text style={CommonStyles.linkText}>Já está cadastrado?</Text>
				<TouchableOpacity onPress={handleLoginPress}>
					<Text style={CommonStyles.linkText}>Faça o Login</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default SignUpScreen;
