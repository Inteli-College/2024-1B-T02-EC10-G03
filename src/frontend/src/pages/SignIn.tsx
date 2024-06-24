import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { CommonStyles } from '@styles/SignInSignUp/CommonStyles';
import InputField from '@components/SignInSignUp/InputField'; // Assumindo que InputField é um componente customizado
import ClientAPI from '@api/client';

export default function SignInPage({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSignUpPress = () => {
        navigation.navigate('SignUp');
    };

    const handleLoginPress = async () => {
        if (email === '' || password === '') {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        try {
            const loginResponse = await ClientAPI.user.login({
                email: email,
                password: password,
            });

            if (loginResponse.status === 200 || loginResponse.status === 201) {
                const userInfoResponse = await ClientAPI.user.getInfo();

                if (userInfoResponse.status === 200) {
                    const role = userInfoResponse.data.role;
                    if (role === 'NURSE') {
                        navigation.navigate('QRScanner');
						
                    } else if (role === 'PHARMACIST') {
                        navigation.navigate('History');
                    } else {
                        Alert.alert('Erro', 'Role desconhecida');
                    }
                } else {
                    Alert.alert('Erro', 'Não foi possível obter informações do usuário');
                }
            } else {
                Alert.alert('Login falhou', 'Email ou senha inválidos');
            }
        } catch (error) {
            Alert.alert('Login falhou', error.response?.data?.message || 'Erro desconhecido');
        }
    };

    return (
        <View style={CommonStyles.container}>
            <View style={CommonStyles.header}>
                <Text style={CommonStyles.headerText}>Log In</Text>
            </View>
            <View>
                <InputField
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail} // Corrigido: Apenas passe a função diretamente
                />
                <InputField
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword} // Corrigido: Apenas passe a função diretamente
                    onToggleShowPassword={() => setShowPassword(!showPassword)}
                    showPassword={showPassword}
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
