import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ProgressCircle } from 'react-native-svg-charts';
import Svg, { Text as SvgText } from 'react-native-svg';

const App = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const renderMedications = () => {
    const medications = ['Pyxis 1', 'Pyxis 2', 'Pyxis 3', 'Pyxis 4', 'Pyxis 5', 'Pyxis 6'];
    return medications.map((medication, index) => (
      <View key={index} style={styles.medicationRow}>
        <View style={styles.bulletPoint} />
        <Text style={styles.medicationText}>{medication}</Text>
        <TouchableOpacity onPress={openModal}>
          <Text style={styles.localText}>LOCAL</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.detailsText}>Detalhes</Text>
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Insights</Text>
      <View style={styles.progressCircleContainer}>
        <ProgressCircle
          style={styles.progressCircle}
          progress={0.9}
          progressColor={'rgb(134, 65, 244)'}
        />
        <SvgText
          x="50%"
          y="50%"
          alignmentBaseline="middle"
          textAnchor="middle"
          fontSize="48"
          fill="rgb(134, 65, 244)"
        >
        </SvgText>
      </View>
      <Text style={styles.subHeader}>Avaliação de Medicações</Text>
      <ScrollView>
        {renderMedications()}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Localização do Equipamento</Text>
            <View style={styles.mapContainer}>
              {/* Replace with your map component or image */}
              <Text>Map Image</Text>
            </View>
            <Text style={styles.locationText}>ALA D - Corredor "Lorem"</Text>
            <TouchableOpacity style={styles.button} onPress={closeModal}>
              <Text style={styles.buttonText}>Ver Detalhes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressCircleContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    position: 'absolute',
  },
  svg: {
    position: 'absolute',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    textAlign: 'center',
  },
  medicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  bulletPoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgb(134, 65, 244)',
    marginRight: 10,
  },
  medicationText: {
    flex: 1,
    fontSize: 16,
  },
  localText: {
    color: 'rgb(134, 65, 244)',
    marginRight: 20,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  detailsText: {
    color: 'rgb(134, 65, 244)',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  mapContainer: {
    height: 150,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'rgb(134, 65, 244)',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
});

export default App;
