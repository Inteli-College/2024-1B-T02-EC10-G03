import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CommonStyles } from '@styles/SignInSignUp/CommonStyles';

interface InputFieldProps {
	placeholder: string;
	secureTextEntry?: boolean;
	onToggleShowPassword?: () => void;
	showPassword?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ placeholder, secureTextEntry = false, onToggleShowPassword, showPassword = false }) => (
	<View style={CommonStyles.inputContainer}>
		<TextInput style={CommonStyles.input} placeholder={placeholder} secureTextEntry={secureTextEntry && !showPassword} />
		{secureTextEntry && onToggleShowPassword && (
			<TouchableOpacity onPress={onToggleShowPassword}>
				<Text>{showPassword ? 'Hide' : 'Show'}</Text>
			</TouchableOpacity>
		)}
	</View>
);

export default InputField;
