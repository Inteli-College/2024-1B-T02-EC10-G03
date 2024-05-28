import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import DropdownComponent from '@components/SelectPyxisDropdownComponent/SelectPyxisDropdownComponent';
import FooterMenu from '@components/FooterMenu/FooterMenu';
import ClientAPI from '@api/client';
import { PyxisReport, PyxisReportType } from 'types/api';



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
        getResponse().then((data) => {
            setReports(data);
            setLoading(false);
        });
    }, []);

    return { reports, loading };
}

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


const ReportItem = ({ report }: { report: PyxisReport }) => (
    <View style={styles.reportItem}>
        <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>{report.medicine.MedicineNames[0].name} - {report.medicine.id}</Text>
            <Text style={styles.reportSubtitle}>{report_type_to_string(report.type)}</Text>
        </View>
        <Text style={styles.reportDetails}>{report.observation}</Text>
    </View>
);

export default function HistoryPage() {
    const [selectedEquipment, setSelectedEquipment] = React.useState(null);
    const { reports, loading } = useEmployeeReports();
	const [reader, setReader] = React.useState([
		{ title: 'Dipirona XXmg', subtitle: 'Medicamento mais Frequente', key: '1' },
		{ title: 'YY', subtitle: 'Qtd. de Reports Registrados', key: '2' },
	]);

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

                <FlatList
                    data={reader}
                    renderItem={({ item }) => <HistoryCard title={item.title} subtitle={item.subtitle} />}
                    keyExtractor={(item) => item.key}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                />

                <Text style={styles.subHeader}>Reports Realizados</Text>
                <FlatList
                    data={reports.filter((report) => `${report.pyxis.floor}${report.pyxis.block}` === selectedEquipment)}
                    renderItem={({ item }) => <ReportItem report={item} />}
                    keyExtractor={(item: PyxisReport) => item.cuid}
                    style={styles.reportList}
                />


                {/*
                <Text style={styles.subHeader}>Solicitações Feitas</Text>
                <FlatList
                    data={historyItems}
                    renderItem={({ item }) => <HistoryItem name={item.name} details={item.details} />}
                    keyExtractor={(item) => item.key}
                    style={styles.historyList}
                />*/}

            </View>
            <FooterMenu />
        </>
    );
}


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
        color: '#9B59B6',
        fontSize: 16,
    },
    historyDetails: {
        color: '#9B59B6',
        fontSize: 14,
    },
    reportList: {
        marginTop: 10,
        backgroundColor: '#F2F2F2',
        borderRadius: 8,
        padding: 16,
    },
    reportItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    reportSubtitle: {
        fontSize: 14,
        color: '#8E44AD',
    },
    reportDetails: {
        fontSize: 14,
        color: '#34495E',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
});
