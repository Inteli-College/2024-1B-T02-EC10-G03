import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FooterMenu from '@components/FooterMenu/FooterMenu';
import ClientAPI from '@api/client';

interface Status {
	status: string;
	data: string;
}

interface Medication {
	nome: string;
	quantidade: number;
}

interface Solicitation {
	date: string;
	time: string;
	statusdict: Status[];
	medicacoes: Medication[];
	inconsistencias: string[];
	responsavel: string;
}

export default function SolicitationPage({ navigation }: { navigation: any }) {
	const [solicitation, setSolicitation] = useState<Solicitation | null>(null);
	const [medicinesList, setMedicinesList] = useState<any[]>([]);
	const [finalReport, setFinalReport] = useState<any>(null);
	const [user, setUser] = useState<any>(null);

	const handleGetReports = async () => {
		try {
			const userInfo = await ClientAPI.user.getInfo();
			setUser(userInfo);

			const reports = await ClientAPI.pyxis_report.getAll();
			const lastReport = reports.data[reports.data.length - 1];
			setFinalReport(lastReport);

			const medicines = await ClientAPI.medicine.getAll();
			setMedicinesList(medicines.data);

			const mockData = formatReportData(lastReport);
			setSolicitation(mockData);
		} catch (error) {
			console.error('Error fetching reports or medicines:', error);
		}
	};

	useEffect(() => {
		handleGetReports();
	}, []);

	const getMedicineNames = (medicineId: string) => {
		const medicine = medicinesList.find(m => m.id === medicineId);
		return medicine ? medicine.MedicineNames.map(mn => mn.name) : [];
	};

	const formatReportData = (report: any) => {
		const medicineNames = getMedicineNames(report.medicineId);
		const statusMapping = {
			"SENT": "Enviada",
			"RECEIVED": "Recebida",
			"PENDING": "Em andamento",
			"FINISHED": "Finalizada"
		};

		return {
			date: new Date().toLocaleDateString(), // Usar a data atual
			time: new Date().toLocaleTimeString(), // Usar a hora atual
			statusdict: [
				{ status: statusMapping["SENT"], data: '2024-05-02' },
				{ status: statusMapping["RECEIVED"], data: '2024-05-02' },
				{ status: statusMapping["PENDING"], data: '2024-05-02' },
				{ status: statusMapping["FINISHED"], data: '2024-05-02' }
			],
			medicacoes: medicineNames.map(name => ({ nome: name, quantidade: 1 })), // Assumindo quantidade = 1
			inconsistencias: [report.type.replace('_', ' ')],
			responsavel: user?.data.name || "Desconhecido"
		};
	};

	const getIconColor = (index: number) => {
		if (!finalReport) return 'gray';

		const statusOrder = ["SENT", "RECEIVED", "PENDING", "FINISHED"];
		const reportStatusIndex = statusOrder.indexOf(finalReport.status);

		return index <= reportStatusIndex ? '#006400' : '#DAA520';
	};

	const getIconName = (index: number) => {
		if (!finalReport) return 'checkmark-circle';

		const statusOrder = ["SENT", "RECEIVED", "PENDING", "FINISHED"];
		const reportStatusIndex = statusOrder.indexOf(finalReport.status);

		return index <= reportStatusIndex ? 'checkmark-circle' : 'close-circle';
	};

	const renderStatus = (status: Status, index: number) => (
		<View key={index} style={styles.statusItem}>
			<Text style={styles.statusText}>{status.status}</Text>
			<Text style={styles.datestatusText}>{status.data}</Text>
			<Ionicons name={getIconName(index)} size={24} color={getIconColor(index)} />
		</View>
	);

	const renderMedication = (med: Medication, index: number) => (
		<View key={index} style={styles.medicationItem}>
			<Text style={styles.informationData}>
				• {med.nome}: {med.quantidade}
			</Text>
		</View>
	);

	return (
		<>
			<View style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color="black" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Pixis 2</Text>
				</View>
				<ScrollView style={styles.informations}>
					{solicitation && (
						<>
							<Text style={styles.informationDay}>
								Solicitação do dia {solicitation.date} - {solicitation.time}
							</Text>

							<Text style={styles.content}>
								Progresso do Pedido:{'\n'}
								<View style={styles.statusContainer}>{solicitation.statusdict.map(renderStatus)}</View>
							</Text>

							<Text style={styles.content}>
								Medicações solicitadas:{'\n'}
								<View style={styles.medicationContainer}>{solicitation.medicacoes.map(renderMedication)}</View>
							</Text>

							<Text style={styles.content}>
								Inconsistências Reportadas:{'\n'}
								{solicitation.inconsistencias.map((inc, index) => (
									<Text key={index} style={styles.informationData}>
										{inc}
									</Text>
								))}
							</Text>

							<Text style={styles.content}>
								Responsável pelo Pedido: <Text style={styles.informationData}>{solicitation.responsavel}</Text>
							</Text>
						</>
					)}
				</ScrollView>
			</View>
			<FooterMenu />
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 15,
		top: 60,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerTitle: {
		fontSize: 30,
		fontWeight: 'bold',
	},
	backButton: {
		position: 'absolute',
		left: 10,
	},
	informations: {
		flex: 1,
		top: 30,
	},
	content: {
		marginBottom: 15,
		borderRadius: 13,
		padding: 10,
		backgroundColor: '#F6F6F6',
		fontSize: 14,
		color: 'gray',
	},
	statusContainer: {
		flexDirection: 'row',
	},
	medicationContainer: {
		flexDirection: 'column',
	},
	statusItem: {
		alignItems: 'center',
		padding: 8,
		paddingTop: 10,
		marginRight: 8,
		marginLeft: 8
	},
	medicationItem: {
		marginTop: 15,
		flexDirection: 'column',
		alignItems: 'flex-start',
	},
	statusText: {
		marginTop: 15,
		fontWeight: 'bold',
		fontSize: 11,
	},
	datestatusText: {
		fontSize: 9,
		color: '#666',
	},
	informationDay: {
		fontSize: 18,
		marginVertical: 7,
		borderRadius: 13,
		padding: 10,
		backgroundColor: '#F6F6F6',
	},
	informationData: {
		fontSize: 16,
		margin: 5,
		color: 'black',
	},
});
