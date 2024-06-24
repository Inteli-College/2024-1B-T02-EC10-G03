import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Button, Linking } from 'react-native';
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
    createdAt: string;
}

const statusMapping = {
    "SENT": "Enviada",
    "RECEIVED": "Recebida",
    "PENDING": "Em andamento",
    "FINISHED": "Finalizada"
};

const SolicitationPage = ({ route, navigation }: { route: any; navigation: any }) => {
    const { reportId } = route.params || {}; // Extrair reportId dos parâmetros de navegação

    const [solicitation, setSolicitation] = useState<Solicitation | null>(null);
    const [medicinesList, setMedicinesList] = useState<any[]>([]);
    const [finalReport, setFinalReport] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

	const handleGetReports = async () => {
		try {
			const userInfo = await ClientAPI.user.getInfo();
			setUser(userInfo);
	
			const reports = await ClientAPI.pyxis_report.getAll();
			let lastReport;
	
			if (reportId) {
				lastReport = reports.data.find((report: any) => report.cuid === reportId);
			}
	
			if (!lastReport) {
				lastReport = reports.data[reports.data.length - 1]; // Pega o último relatório na lista
			}
	
			if (!lastReport) {
				console.error('Report not found');
				return;
			}
	
			const medicines = await ClientAPI.medicine.getAll();
			setMedicinesList(medicines.data);
	
			const mockData = formatReportData(lastReport);
			setSolicitation(mockData);
	
			// Atualizar finalReport com lastReport aqui
			setFinalReport(lastReport);
		} catch (error) {
			console.error('Error fetching report or medicines:', error);
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
            responsavel: user?.data.name || "Desconhecido",
            createdAt: report.createdAt // Incluindo createdAt
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

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            await ClientAPI.pyxis_report.updateStatus(finalReport.cuid, newStatus);
            // Atualizar o estado local para refletir o novo status
            setFinalReport({ ...finalReport, status: newStatus });
            closeModal();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const sendEmailToTI = async () => {
        const subject = `Falha Técnica no Pyxis ${finalReport.pyxisUuid}`;
        console.log(finalReport)
        try {
            // Buscar todos os Pyxis disponíveis
            const pyxisAll = await ClientAPI.pyxis.getAll();
            
            // Encontrar o Pyxis correspondente ao UUID do finalReport
            const pyxis = pyxisAll.data.find(p => p.uuid === finalReport.pyxisUuid);
            
            // Verificar se encontrou o Pyxis
            if (!pyxis) {
                console.error(`Pyxis com UUID ${finalReport.pyxisUuid} não encontrado.`);
                return;
            }
            
            const floor = pyxis.floor || 'não especificado'; // Usar floor do Pyxis se disponível
            const block = pyxis.block || 'não especificado'; // Usar block do Pyxis se disponível
            
            // Montar o corpo do email
            const body = `Olá TI,\n\nGostaria de relatar uma falha técnica no Pyxis ${floor}${block}. Por favor, verifique o Pyxis localizado no ${floor}, bloco ${block}.\nO problema é: \n"${finalReport.observation}".\n\nAtenciosamente, ${user?.data.name}`;
            
            // Montar o URL do email e abrir no cliente de email padrão
            const email = `mailto:ti@siriolibanes.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            Linking.openURL(email);
        } catch (error) {
            console.error('Erro ao buscar Pyxis ou enviar email para TI:', error);
        }
    };

    return (
        <>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Pyxis</Text>
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
                            {user?.data.role === 'PHARMACIST' && (
                                <>
                                    <TouchableOpacity style={styles.updateButton} onPress={openModal}>
                                        <Text style={styles.updateButtonText}>Atualizar Status</Text>
                                    </TouchableOpacity>

                                    {finalReport?.type === 'TECHNICAL_ISSUE' && (
                                        <TouchableOpacity
                                            style={styles.reportButton}
                                            onPress={sendEmailToTI}
                                        >
                                            <Text style={styles.reportButtonText}>Reportar para TI</Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </ScrollView>
            </View>

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Atualizar Status</Text>
                        {Object.entries(statusMapping).map(([internalStatus, displayText], index) => (
                            <Button
                                key={index}
                                title={displayText}
                                onPress={() => handleUpdateStatus(internalStatus)}
                            />
                        ))}
                        <Button title="Cancelar" onPress={closeModal} />
                    </View>
                </View>
            </Modal>

            <FooterMenu />
        </>
    );
};

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
        marginLeft: 8,
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
    updateButton: {
        backgroundColor: '#B26CCF',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    reportButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    reportButtonText: {
        color: '#333333',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SolicitationPage;
