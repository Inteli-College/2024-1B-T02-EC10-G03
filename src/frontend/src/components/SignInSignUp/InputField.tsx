import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CommonStyles } from '@styles/SignInSignUp/CommonStyles';

interface InputFieldProps {
	placeholder: string;
	secureTextEntry?: boolean;
	onChangeText?: (text: string) => void; // Adicionando a propriedade onChangeText
	onToggleShowPassword?: () => void;
	showPassword?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ placeholder, secureTextEntry = false, onChangeText, onToggleShowPassword, showPassword = false }) => (
	<View style={CommonStyles.inputContainer}>
		<TextInput
            style={CommonStyles.input}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry && !showPassword}
            onChangeText={onChangeText} // Adicionando onChangeText aqui
        />
		{secureTextEntry && onToggleShowPassword && (
			<TouchableOpacity onPress={onToggleShowPassword}>
				<Text>{showPassword ? 'Hide' : 'Show'}</Text>
			</TouchableOpacity>
		)}
	</View>
);

export default InputField;
