import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons'; // Certifique-se de que o pacote de ícones está instalado
import ClientAPI from "../../api/client";

interface FormData {
  equipment: string;
  medication: string;
  inconsistency: string;
  observations: string;
}

interface InventoryData {
  medicine_id: string;
  quantity: number;
  medicine_names: string[];
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

interface Props {
  route: {
    params: {
      result: string;
      data: string
    };
  };
  navigation: {
    goBack: () => void;
  };
}

const ReportScreen = ({ route, navigation }: Props) => {
  const { result } = route.params;
  const { data } = route.params;
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
  const [inconsistency, setInconsistency] = useState('');
  const [observations, setObservations] = useState('');
  const [selectedMedication, setSelectedMedication] = useState('');


  const setData = async ({ pyxis_id }: {  pyxis_id: string }) => {
    try {
      const inventory_list = (await ClientAPI.inventory.getMedicines(pyxis_id)).data;

      return inventory_list;

    } catch (error) {
      console.error(error);
      alert("Erro ao fazer requisição. Verifique se a URL está correta e se o servidor está respondendo.");
    }
  };

  const setMedicine = async ({pyxis_id} : {pyxis_id: string}) => {
  const inventory_list = await setData({pyxis_id});

  inventory_list.map(async (item: any) => {
    const medicine = (await ClientAPI.medicine.getSpecific(item.medicineId)).data;

    setInventoryData((inventoryData) => [...inventoryData, {
      medicine_id: item.medicineId,
      quantity: item.quantity,
      medicine_names: medicine.MedicineNames
     }]);
  });
}

useEffect(() => {
  if (inventoryData.length === 0) {
    setMedicine({
      pyxis_id: data
    });
  }
});

console.log(inventoryData)

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

  const handleMedicationChange = (itemValue: string) => {
    setSelectedMedication(itemValue);
  };

  return (
    <View style={styles.container}>
      {/* <Text>{JSON.stringify(inventoryData)}</Text> */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => Alert.alert('Back pressed')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
        <Text style={styles.headerTitle}>Report</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Equipamento</Text>
        <TextInput
          defaultValue={data}
          value={`MS${data}`}
          style={styles.input}
        />
        <Text style={styles.label}>Medicações/Itens/Equipamentos</Text>
        <Picker
        selectedValue={selectedMedication}
        onValueChange={handleMedicationChange}
        style={styles.picker}
      >
        {inventoryData.map((item, index) => (
          <Picker.Item key={index} label={item.medicine_names.map((item: any) => {return item.name}).join(', ')} value={item.medicine_id} />
        ))}
      </Picker>
        <Text style={styles.label}>Inconsistências</Text>
  
        <Picker
          selectedValue={inconsistency}
          onValueChange={setInconsistency}
          style={styles.picker}
        >
          <Picker.Item label="Em falta" value="Em falta" />
          <Picker.Item label="Incoerência" value="Incoerência" />
          <Picker.Item label="Falha Técnica" value="Fail" />
        </Picker>

        
        {
          inconsistency === 'Incoerência' && (
            <>
            <Text style={styles.label}>Quantidade Atual</Text>
            <TextInput
              placeholder={`Era esperado ${inventoryData.find((item) => item.medicine_id === selectedMedication)?.quantity} items`}
              style={styles.input}
            />
            </>
          )
        }

        <Text style={styles.label}>Observações/Comentários</Text>
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
    top: 20
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
    marginBottom: 2,
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 13,
    color: 'black'
  },

  input: {
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 13,
    padding: 5,
    backgroundColor: '#F6F6F6'
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
    justifyContent: 'center'
  },

  buttontext: {
    color: 'white', // Escolha uma cor para o texto que combine com o botão
    fontSize: 16
  },
  picker: {
    marginBottom: 5,
    height: 150,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 13,
    backgroundColor: '#F6F6F6',
  }

});

export default ReportScreen;
