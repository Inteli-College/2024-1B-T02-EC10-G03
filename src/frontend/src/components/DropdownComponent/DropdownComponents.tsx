import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

const DropdownComponent = () => {
	const [selectedEquipment, setSelectedEquipment] = useState(null);

	return (
		<View style={styles.container}>
			<RNPickerSelect
				onValueChange={(value) => setSelectedEquipment(value)}
				items={[
					{ label: 'Equipment A', value: 'equipment_a' },
					{ label: 'Equipment B', value: 'equipment_b' },
					{ label: 'Equipment C', value: 'equipment_c' },
				]}
				placeholder={{
					label: 'Selecione o Equipamento',
					value: null,
					color: '#888888',
				}}
				style={{
					inputIOS: styles.pickerInput,
					inputAndroid: styles.pickerInput,
					iconContainer: styles.iconContainer,
				}}
				useNativeAndroidPickerStyle={false}
				Icon={() => {
					return <Text style={styles.pickerIcon}>V</Text>;
				}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: '100%',
		padding: 16,
	},
	pickerInput: {
		backgroundColor: '#F2F2F2',
		borderRadius: 25,
		paddingHorizontal: 16,
		paddingVertical: 10,
		fontSize: 16,
		color: '#888888',
	},
	iconContainer: {
		right: 16,
	},
	pickerIcon: {
		color: '#888888',
		fontSize: 18,
	},
});

export default DropdownComponent;
