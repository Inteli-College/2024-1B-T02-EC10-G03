import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import DropdownComponent from '@components/DropdownComponent/DropdownComponents';
import FooterMenu from '@components/FooterMenu/FooterMenu';

const data = [
	{ title: 'Dipirona XXmg', subtitle: 'Medicamento mais Frequente', key: '1' },
	{ title: 'YY', subtitle: 'Qtd. de Reports Registrados', key: '2' },
	{ title: 'MM de 2024 HH:MM', subtitle: 'Último Report Registrado', key: '3' },
	{ title: '8,5 Bom', subtitle: 'NPS da Veracidade do Sistema', key: '4' },
];

const historyItems = [
	{ name: 'Item 1', details: 'Detalhes', key: '1' },
	{ name: 'Item 2', details: 'Detalhes', key: '2' },
];

const HistoryCard = ({ title, subtitle }: { title: string; subtitle: string }) => (
	<View style={styles.card}>
		<Text style={styles.title}>{title}</Text>
		<Text style={styles.subtitle}>{subtitle}</Text>
	</View>
);

const HistoryItem = ({ name, details }: { name: string; details: string }) => (
	<View style={styles.historyItem}>
		<Text style={styles.historyName}>{name}</Text>
		<Text style={styles.historyDetails}>{details}</Text>
	</View>
);

export default function HistoryPage() {
	return (
		<>
			<View style={styles.container}>
				<Text style={styles.header}>Meu Histórico</Text>
				<DropdownComponent />

				<FlatList
					data={data}
					renderItem={({ item }) => <HistoryCard title={item.title} subtitle={item.subtitle} />}
					keyExtractor={(item) => item.key}
					numColumns={2}
					columnWrapperStyle={styles.columnWrapper}
				/>

				<Text style={styles.subHeader}>Solicitações Feitas</Text>
				<FlatList data={historyItems} renderItem={({ item }) => <HistoryItem name={item.name} details={item.details} />} keyExtractor={(item) => item.key} style={styles.historyList} />

				<TouchableOpacity style={styles.reportButton} onPress={() => alert('Reportar clicked!')}>
					<Text style={styles.reportButtonText}>Reportar Inconsistências</Text>
				</TouchableOpacity>
			</View>
			<FooterMenu />
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
		backgroundColor: '#FFFFFF',
	},
	header: {
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 16,
	},
	subHeader: {
		fontSize: 18,
		textAlign: 'center',
		marginTop: 20,
		marginBottom: 10,
	},
	card: {
		flex: 1,
		backgroundColor: '#F2F2F2',
		margin: 8,
		padding: 16,
		borderRadius: 8,
		alignItems: 'center',
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 14,
		color: '#888888',
		textAlign: 'center',
	},
	columnWrapper: {
		justifyContent: 'space-between',
	},
	historyList: {
		marginTop: 10,
		backgroundColor: '#F2F2F2',
		borderRadius: 8,
		padding: 16,
	},
	historyItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 8,
	},
	historyName: {
		color: '#9B59B6',
	},
	historyDetails: {
		color: '#9B59B6',
	},
	reportButton: {
		marginTop: 16,
		marginBottom: 40,
		backgroundColor: '#9B59B6',
		paddingVertical: 16,
		borderRadius: 8,
		alignItems: 'center',
	},
	reportButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
});
