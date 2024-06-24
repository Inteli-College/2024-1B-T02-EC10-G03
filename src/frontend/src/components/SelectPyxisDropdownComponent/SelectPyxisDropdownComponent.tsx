import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import ClientAPI from '@api/client';
import { Pyxis } from 'types/api';

const usePyxis = () => {
	const [pyxis, setPyxis] = React.useState([]);

	React.useEffect(() => {
		ClientAPI.pyxis.getAll().then((response) => {
			const pyxisData = response.data.map((pyxis: Pyxis) => {
				const id = `${pyxis.floor}${pyxis.block}`;
				return {
					label: id,
					value: id,
					key: id,
				};
			});
			setPyxis(pyxisData);
		});
	}, []);

	return { pyxis };
}

const DropdownComponent = ({ selectedEquipment, setSelectedEquipment }) => {
	const { pyxis } = usePyxis();

	return (
		<View style={styles.container}>
			<RNPickerSelect
				onValueChange={(value) => setSelectedEquipment(value)}
				items={pyxis}
				placeholder={{
					label: 'Selecione o Pyxis',
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
					return <Text style={styles.pickerIcon}>
						
					</Text>;
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
