import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import ClientAPI from '@api/client';
import { PyxisReportType } from 'types/api';

interface InventoryData {
	medicine_id: string;
	quantity: number;
	medicine_names: string[];
}

const useInventoryData = (pyxis_id: string) => {
	const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
	const fetchInventoryData = useCallback(async () => {
		try {
			const inventoryList = (await ClientAPI.inventory.getAllMedicinesOfPyxis(pyxis_id)).data;
			const updatedInventory = [];

			for (let item of inventoryList) {
				const medicine = (await ClientAPI.medicine.getSpecific(item.medicineId)).data;
				updatedInventory.push({
					medicine_id: item.medicineId,
					quantity: item.quantity,
					medicine_names: medicine.MedicineNames.map((mn) => mn.name),
				});
			}

			setInventoryData(updatedInventory);
		} catch (error) {
			console.error('Failed to fetch inventory data:', error);
			Alert.alert('Error', 'Unable to fetch inventory data.');
		}
	}, [pyxis_id]);

	useEffect(() => {
		fetchInventoryData();
	}, [fetchInventoryData]);

	return inventoryData;
};

interface FormData {
	inconsistency: string | undefined;
	observations: string | undefined;
	selectedMedication: string | undefined;
	status: string | undefined;
}

export default function ReportPage({ route, navigation }: any) {
	const [medicineSelected, setMedicineSelected] = useState<string | undefined>();
	const [user, setUser] = useState<any>();
	const { pyxis_id } = route.params;
	const inventoryData = useInventoryData(pyxis_id);
	const [form, setForm] = useState<FormData>({
		inconsistency: undefined,
		observations: undefined,
		selectedMedication: undefined,
		status: undefined,
	});

	const handleInputChange = (name: string, value: string) => {
		setForm((prevForm) => ({ ...prevForm, [name]: value }));
	};

	const setUserActually = async () => {
		try {
			const response = await ClientAPI.user.getInfo();
			setUser(response.data);

		} catch (error: any) {
			console.error('Failed to fetch user data:', error);
			Alert.alert('Error', 'Unable to fetch user data.');
		}
	}

	const handleSubmit = async () => {
		setUserActually()
		const problem = form.inconsistency
		const obs = form.observations

		if (!problem || !obs || !medicineSelected) {
			Alert.alert('Erro ao Enviar o Report', 'Por favor, preencha todos os campos.');
			return;
		}

		console.log("pyxid_id: ", pyxis_id)
		console.log("employee_uuid: ", user.uuid)
		console.log("medicine_id: ", medicineSelected)
		console.log("type: ", problem)
		console.log("observations: ", obs)
		console.log("urgency: ", false)

		try {
			console.log("Entrou no try")
			const response = await ClientAPI.pyxis_report.create({
				pyxis_id: pyxis_id,
				employee_uuid: user.uuid,
				medicine_id: medicineSelected,
				type: problem as PyxisReportType,
				observation: obs,
				urgency: false,
				status: "SENT"
			});

			console.log(response)
			if (response.status === 200 || response.status === 201) {
				Alert.alert('Report Enviado com Sucesso');
				navigation.navigate('History');
			} else {
				Alert.alert('Erro ao Enviar o Report', 'Por favor, tente novamente mais tarde.');
			}
		} catch (error: any) {
			Alert.alert('Erro ao Enviar o Report', error.response?.data?.message || 'Por favor, tente novamente mais tarde.');
		}
	};

	return (
		<View style={styles.container}>
			<Header navigation={navigation} />
			<Form pyxisId={pyxis_id} inventoryData={inventoryData} form={form} handleInputChange={handleInputChange} handleSubmit={handleSubmit} setMedicineSelected={setMedicineSelected}/>
		</View>
	);
}

const Header = ({ navigation }: { navigation: any }) => (
	<View style={styles.header}>
		<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
			<Ionicons name="arrow-back" size={24} color="black" />
		</TouchableOpacity>
		<Text style={styles.headerTitle}>Report</Text>
	</View>
);

const Form = ({ pyxisId, inventoryData, form, handleInputChange, handleSubmit, setMedicineSelected }: { pyxisId: string; inventoryData: InventoryData[]; form: any; handleInputChange: any; handleSubmit: any, setMedicineSelected:any }) => {
	useEffect(() => {
		if (inventoryData.length > 0 && !form.selectedMedication) {
			handleInputChange('selectedMedication', inventoryData[0].medicine_id);
			setMedicineSelected(inventoryData[0].medicine_id)
		}
	}, [inventoryData, form.selectedMedication, handleInputChange]);

	return (
		<View style={styles.form}>
			<Text style={styles.label_title}>Pyxis selecionado: {pyxisId}</Text>

			<Text style={styles.label}>Medicamentos</Text>
			<Picker selectedValue={form.selectedMedication} onValueChange={(itemValue) => handleInputChange('selectedMedication', itemValue)} style={styles.picker}>
				{inventoryData.map((item: InventoryData, index: number) => (
					<Picker.Item key={index} label={item.medicine_names.join(', ')} value={item.medicine_id} />
				))}
			</Picker>

			<Text style={styles.label}>Tipo de inconsistência</Text>
			<Picker selectedValue={form.inconsistency} onValueChange={(itemValue) => handleInputChange('inconsistency', itemValue)} style={styles.picker}>
				<Picker.Item label="Em falta" value="NEEDS_REFILL" />
				<Picker.Item label="Incoerência" value="DATA_INCONSISTENCY" />
				<Picker.Item label="Falha Técnica" value="TECHNICAL_ISSUE" />
				<Picker.Item label="Outro" value="OTHER" />
			</Picker>

			{form.inconsistency === 'DATA_INCONSISTENCY' && (
				<>
					<Text style={styles.label}>Quantidade Atual</Text>
					<TextInput
						placeholder={`Era esperado ${inventoryData.find((item) => item.medicine_id === form.selectedMedication)?.quantity || 0} items`}
						onChangeText={(text) => handleInputChange('currentQuantity', text)}
						style={styles.input}
					/>
				</>
			)}


			<Text style={styles.label}>Observações/Comentários</Text>
			<TextInput
				placeholder="Adicione mais informações"
				value={form.observations}
				onChangeText={(text) => handleInputChange('observations', text)}
				multiline
				style={[styles.input, styles.multiline]}
			/>
			<TouchableOpacity style={styles.button} onPress={handleSubmit}>
				<Text style={styles.buttonText}>Enviar</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 15,
		top: 20,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	backButton: {
		position: 'absolute',
		left: 10,
	},
	headerTitle: {
		fontSize: 30,
		fontWeight: 'bold',
	},
	form: {
		flex: 1,
		top: 30,
	},
	label: {
		marginBottom: 2,
		marginTop: 10,
		fontWeight: 'bold',
		fontSize: 16,
		color: 'black',
	},
	input: {
		marginBottom: 5,
		borderWidth: 1,
		borderColor: 'white',
		borderRadius: 13,
		padding: 5,
		height: 40,
		backgroundColor: '#F6F6F6',
	},
	multiline: {
		height: 70,
	},
	button: {
		backgroundColor: '#B26CCF',
		height: 40,
		top: 15,
		padding: 10,
		borderRadius: 15,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonText: {
		color: 'white',
		fontSize: 16,
	},
	picker: {
		marginBottom: 5,
		height: 150,
		maxHeight: 150,
		borderWidth: 1,
		borderColor: 'white',
		overflow: 'hidden',
		borderRadius: 13,
		backgroundColor: '#F6F6F6',
	},
	label_title: {
		fontWeight: 'bold',
		fontSize: 18,
		color: 'black',
		textAlign: 'center',
	},
});
