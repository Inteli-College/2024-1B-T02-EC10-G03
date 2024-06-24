import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Button } from 'react-native';
import DropdownComponent from '@components/SelectPyxisDropdownComponent/SelectPyxisDropdownComponent';
import FooterMenu from '@components/FooterMenu/FooterMenu';
import ClientAPI from '@api/client';
import { PyxisReport, PyxisReportType, EmployeeRole } from 'types/api';
import { useNavigation } from '@react-navigation/native';

const getResponse = async () => {
    const medicines = await ClientAPI.medicine.getAll();
    const pyxis_reports = await ClientAPI.pyxis_report.getAll();
    const pyxis = await ClientAPI.pyxis.getAll();

    pyxis_reports.data.forEach((report: PyxisReport) => {
        const medicine = medicines.data.find((m) => m.id === report.medicineId);
        if (!medicine) return;
        report.medicine = medicine;
    });

    pyxis_reports.data.forEach((report: PyxisReport) => {
        const pyxis_unique = pyxis.data.find((p) => p.uuid === report.pyxisUuid);
        if (!pyxis_unique) return;
        report.pyxis = pyxis_unique;
    });
    return pyxis_reports.data;
}

const useEmployeeReports = () => {
    const [reports, setReports] = React.useState<PyxisReport[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const medicinesResponse = await ClientAPI.medicine.getAll();
                const pyxisReportsResponse = await ClientAPI.pyxis_report.getAll();
                const pyxisResponse = await ClientAPI.pyxis.getAll();

                const medicines = medicinesResponse.data;
                const pyxisReports = pyxisReportsResponse.data;
                const pyxis = pyxisResponse.data;

                // Associar medicamentos aos relatórios
                pyxisReports.forEach((report: PyxisReport) => {
                    const medicine = medicines.find((m) => m.id === report.medicineId);
                    if (medicine) {
                        report.medicine = medicine;
                    }
                });

                // Associar Pyxis aos relatórios
                pyxisReports.forEach((report: PyxisReport) => {
                    const pyxisItem = pyxis.find((p) => p.uuid === report.pyxisUuid);
                    if (pyxisItem) {
                        report.pyxis = pyxisItem;
                    }
                });

                // Ordenar relatórios: colocar concluídos no final
                pyxisReports.sort((a: PyxisReport, b: PyxisReport) => {
                    // Mover relatórios com status FINISHED para o final
                    if (a.status === 'FINISHED' && b.status !== 'FINISHED') {
                        return 1;
                    } else if (b.status === 'FINISHED' && a.status !== 'FINISHED') {
                        return -1;
                    }
                    // Ordenação padrão pelo cuid (ou outra chave relevante)
                    return 0;
                });

                setReports(pyxisReports);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { reports, loading };
};


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

const report_type_to_string = (type: PyxisReportType) => {
    switch (type) {
        case "DATA_INCONSISTENCY":
            return 'Inconsistência';
        case "NEEDS_REFILL":
            return 'Necessita Refil';
        case "TECHNICAL_ISSUE":
            return 'Problema Técnico';
        case "OTHER":
            return 'Outro';
    }
}

const ReportItem = ({ report, role, onVerifyPress, isDeclined, onDeclinePress }: { report: PyxisReport, role: EmployeeRole, onVerifyPress: () => void, isDeclined: boolean, onDeclinePress: () => void }) => {
    const [showUpdateStatusButton, setShowUpdateStatusButton] = useState(false);

    const handleAccept = () => {
        setShowUpdateStatusButton(true);
        onVerifyPress(report.cuid);
    };

    return (
        <View style={styles.reportItem}>
            <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>{report.medicine.MedicineNames[0].name} - {report.medicine.id}</Text>
                <Text style={styles.reportSubtitle}>{report_type_to_string(report.type)}</Text>
            </View>
            <Text style={styles.reportDetails}>{report.observation}</Text>
            {role === 'PHARMACIST' && (
                report.status === "FINISHED" ? (
                    <Text style={styles.resolvedText}>Pedido Resolvido</Text>
                ) : (
                    isDeclined ? (
                        <Button
                            title="Pedido Recusado"
                            disabled
                        />
                    ) : (
                        showUpdateStatusButton ? (
                            <Button
                                title="Atualizar Status"
                                onPress={() => {
                                    // Implementar a lógica de atualização de status aqui
                                    // handleUpdateStatus(report.cuid);
                                }}
                            />
                        ) : (
                            <>
                                <Button
                                    title="Verificar Pedido"
                                    onPress={handleAccept}
                                />
                                <Button
                                    title="Recusar"
                                    onPress={onDeclinePress}
                                />
                            </>
                        )
                    )
                )
            )}
        </View>
    );
};

const HistoryPage = () => {
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const { reports, loading } = useEmployeeReports();
    const [role, setRole] = useState('');
    const [showCard, setShowCard] = useState(false);
    const [declinedReports, setDeclinedReports] = useState<string[]>([]);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const navigation = useNavigation();

    React.useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await ClientAPI.user.getInfo();
                if (response.status === 200) {
                    setRole(response.data.role);
                }
            } catch (error) {
                console.log('error', error);
            }
        };

        fetchUserInfo();
    }, []);

    const handleVerifyOrder = (reportId: string) => {
        setSelectedReportId(reportId);
        setShowCard(true);
    };

    const handleAccept = () => {
        setShowCard(false);
        setSelectedEquipment(null); // Resetar seleção
        if (selectedReportId) {
            if (role === "PHARMACIST") {
                navigation.navigate('Solicitation', { reportId: selectedReportId });
            } else {
                navigation.navigate('Solicitation');
            }
        }
    };

    const handleDecline = (reportId: string) => {
        setShowCard(false);
        setDeclinedReports([...declinedReports, reportId]);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9B59B6" />
            </View>
        );
    }

    return (
        <>
            <View style={styles.container}>
                <Text style={styles.header}>Meu Histórico</Text>
                <DropdownComponent
                    selectedEquipment={selectedEquipment}
                    setSelectedEquipment={setSelectedEquipment}
                />
                <Text style={styles.subHeader}>Reports Realizados</Text>
                <FlatList
                    data={reports.filter((report) => `${report.pyxis.floor}${report.pyxis.block}` === selectedEquipment)}
                    renderItem={({ item }) => (
                        <ReportItem
                            report={item}
                            role={role}
                            onVerifyPress={handleVerifyOrder}
                            isDeclined={declinedReports.includes(item.cuid)}
                            onDeclinePress={() => handleDecline(item.cuid)}
                        />
                    )}
                    keyExtractor={(item: PyxisReport) => item.cuid}
                    style={styles.reportList}
                />

                {showCard && (
                    <View style={styles.verificationCard}>
                        <Text style={styles.verificationText}>Deseja aceitar ou recusar este pedido?</Text>
                        <View style={styles.verificationButtons}>
                            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                                <Text style={styles.buttonText}>Aceitar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.declineButton} onPress={() => handleDecline(selectedReportId || '')}>
                                <Text style={styles.buttonText}>Recusar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
            <FooterMenu />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#2C3E50',
        paddingTop: 50,
    },
    subHeader: {
        fontSize: 20,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10,
        color: '#8E44AD',
    },
    card: {
        flex: 1,
        backgroundColor: '#F2F2F2',
        margin: 8,
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#34495E',
    },
    subtitle: {
        fontSize: 14,
        color: '#888888',
        textAlign: 'center',
    },
    columnWrapper: {
        height: 200,
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
        fontSize: 16,
        fontWeight: 'bold',
    },
    historyDetails: {
        fontSize: 14,
        color: '#888888',
    },
    reportItem: {
        padding: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reportTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    reportSubtitle: {
        fontSize: 14,
        color: '#888888',
    },
    reportDetails: {
        fontSize: 16,
        marginBottom: 8,
    },
    resolvedText: {
        color: '#2ECC71',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    verificationCard: {
        padding: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    verificationText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    verificationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    acceptButton: {
        backgroundColor: '#2ECC71',
        padding: 12,
        borderRadius: 8,
    },
    declineButton: {
        backgroundColor: '#E74C3C',
        padding: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reportList: {
        marginBottom: 20,
    },
});

export default HistoryPage;
