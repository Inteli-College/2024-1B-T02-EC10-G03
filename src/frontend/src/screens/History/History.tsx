import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import DropdownComponent from '../../components/DropdownComponent/DropdownComponents';
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

export default function History() {
const renderItem = ({ item }: { item: { title: string, subtitle: string } }) => (
	<View style={styles.card}>
		<Text style={styles.title}>{item.title}</Text>
		<Text style={styles.subtitle}>{item.subtitle}</Text>
	</View>
);

const renderHistoryItem = ({ item }: { item: { name: string, details: string } }) => (
	<View style={styles.historyItem}>
		<Text style={styles.historyName}>{item.name}</Text>
		<Text style={styles.historyDetails}>{item.details}</Text>
	</View>
);

  return (
    <>
    <View style={styles.container}>
      <Text style={styles.header}>Meu Histórico</Text>

	  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<DropdownComponent />
		</View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        horizontal={false}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
      />
      <View style={{justifyContent: 'center', alignItems: 'center' }}>
        <Text >Solicitações Feitas</Text>
      </View>
		

      <View style={styles.historyList}>
        <FlatList
          data={historyItems}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.key}
        />
      </View>

      <TouchableOpacity style={styles.reportButton}>
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
  card: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center', // Centers children along the cross axis (horizontally)
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center', // Align text in the center horizontally
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center', // Ensure the subtitle text is also centered
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
    color: '#9B59B6', // Purple
  },
  historyDetails: {
    color: '#9B59B6', // Purple
  },
  reportButton: {
    marginTop: 16,
    marginBottom:40,
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
