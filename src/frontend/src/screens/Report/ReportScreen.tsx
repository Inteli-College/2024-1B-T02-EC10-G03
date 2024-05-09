import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Certifique-se de que o pacote de ícones está instalado

interface FormData {
  equipment: string;
  medication: string;
  inconsistency: string;
  observations: string;
}

const MockSubmit = async (formData: FormData): Promise<{ status: string; message: string }> => {
console.log("Recebendo no serviço:", formData);
if (!formData) {
  throw new Error("FormData está indefinido");
}
return new Promise((resolve) => {
  setTimeout(() => resolve({ status: 'success', message: 'Dados enviados com sucesso!' }), 2000);
});
};


const ReportScreen = () => {
  const [equipment, setEquipment] = useState('');
  const [medication, setMedication] = useState('');
  const [inconsistency, setInconsistency] = useState('');
  const [observations, setObservations] = useState('');

  const HandleSubmit = async () => {
    const formData = {
      equipment,
      medication,
      inconsistency,
      observations
    };
    try {
      const response = await MockSubmit(formData);
      Alert.alert('Formulário Enviado', response.message);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar os dados');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity onPress={() => Alert.alert('Back pressed')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
        <Text style={styles.headerTitle}>Report</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>  Equipamento</Text>
        <TextInput
          placeholder="Digite o equipamento"
          value={equipment}
          onChangeText={setEquipment}
          style={styles.input}
        />
        <Text style={styles.label}>  Medicações</Text>
        <TextInput
          placeholder="Digite a medicação"
          value={medication}
          onChangeText={setMedication}
          style={styles.input}
        />
        <Text style={styles.label}>  Inconsistências</Text>
        <TextInput
          placeholder="Descreva a inconsistência"
          value={inconsistency}
          onChangeText={setInconsistency}
          style={styles.input}
        />
        <Text style={styles.label}>  Observações/Comentários</Text>
        <TextInput
          placeholder="Adicione quaisquer observações"
          value={observations}
          onChangeText={setObservations}
          multiline
          style={[styles.input, styles.multiline]}
        />
        <TouchableOpacity style={styles.button} onPress={HandleSubmit}>
          <Text style={styles.buttontext}>Enviar</Text>
        </TouchableOpacity>
      </View>
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
    top: 30
  },

  label: {
    marginBottom: 5,
    marginTop: 15,
    fontWeight: 'bold',
    fontSize: 13, 
    color: 'black' 
  },

  input: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 13,
    padding: 10,
    backgroundColor: '#F6F6F6'
  },

  multiline: {
    height: 100,
  },

  button: {
    backgroundColor: '#B26CCF',
    height: 60,
    top: 15,
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },

  buttontext: {
    color: 'white', // Escolha uma cor para o texto que combine com o botão
    fontSize: 16
  }

});

export default ReportScreen;
