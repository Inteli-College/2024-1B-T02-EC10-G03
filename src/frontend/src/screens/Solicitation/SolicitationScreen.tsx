import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Certifique-se de que o pacote de ícones está instalado

interface Solicitation {

    date: string;
    time: string;
    // status: string[];
    // datestatus: string[];
    statusdict: { status: string; data: string }[];
    medicacoes: { nome: string; quantidade: number }[];
    inconsistencias: string[];
    responsavel: string;
}

const SolicitationScreen = ({ navigation }) => {

    const [solicitation, setSolicitation] = useState<Solicitation | null>(null);

    useEffect(() => {
        // Mock data simulating an API response
        const mockData: Solicitation = {
            date: '20/10/2014',
            time: '14:54',
            // status: ['Em andamento', 'Report Encerrado', 'Em andamento', 'Em andamento'],
            // datestatus: ['2024-05-01', '2024-05-02', '2024-05-02', '2024-05-02'], 
            statusdict:[
                { status: 'Em andamento', data: '2024-05-02' },
                { status: 'Em andamento', data: '2024-05-02' },
                { status: 'Em andamento', data: '2024-05-02' },
                { status: 'Em andamento', data: '2024-05-02' }
            ],
            medicacoes: [
                { nome: 'Ibuprofeno', quantidade: 2 },

                { nome: 'Ibuprofeno Pílula', quantidade: 2 }
            ],
            inconsistencias: ['Nenhuma'],
            responsavel: 'Rodrigo Faro'
        };

        setSolicitation(mockData);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => Alert.alert('Back pressed')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pixis 2</Text>
            </View>
            <ScrollView style={styles.informations}>
                {solicitation && (
                    <>
                        <Text style={styles.informationDay}>Solicitação do dia {solicitation.date} - {solicitation.time}</Text>

                        <Text style={styles.content}>Progresso do Pedido:{'\n'}
                        <View style={styles.statusContainer}>
                            {/* {solicitation.status.map((status, index) => (
                                <View key={index} style={styles.statusItem}>
                                    <Text style={styles.statusText}>{status}</Text>
                                    <Text style={styles.dateText}>{solicitation.datestatus[index]}</Text>
                                </View>
                            ))} */}
                            {solicitation.statusdict.map((status, index) => (
                                <View key={index} style={styles.statusItem}>
                                    <Text style={styles.statusText}>{status.status}</Text>
                                    <Text style={styles.datestatusText}>{status.data}</Text>
                                </View>
                            ))}
                        </View>
                        </Text>

                        <Text style={styles.content}>Medicações solicitadas:{'\n'}
                        <View style={styles.medicationContainer}>
                            {solicitation.medicacoes.map((med, index) => (
                            <View style={styles.medicationItem}>
                                    <Text key={index} style={styles.informationData}>
                                        • {med.nome}:        {med.quantidade}
                                    </Text>
                            </View>
                        ))}
                        </View>
                        </Text>

                        <Text style={styles.content}>Inconsistências Reportadas:{'\n'}
                        {solicitation.inconsistencias.map((inc, index) => (
                            <Text key={index} style={styles.informationData}>{inc}</Text>
                        ))}</Text>

                        <Text style={styles.content}>Responsável:   <Text style={styles.informationData}> {solicitation.responsavel} </Text></Text>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        top: 60
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
        top: 30
    },

    content: {
        marginBottom: 10,
        borderRadius: 13,
        padding: 10,
        backgroundColor: '#F6F6F6',
        fontSize: 14,
        color: 'gray'
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
        paddingTop:10 
   },

   medicationItem: {
        flexDirection: 'column',
        alignItems: 'flex-start',
   },

    statusText: {
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

export default SolicitationScreen;
