import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Image, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions  } from "expo-camera";
import FooterMenu from "../../components/FooterMenu/FooterMenu";
import ClientAPI from "../../api/client";

const QRScannerScreen = ({ navigation }) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [result, setResult] = useState("");

    const [permission, requestPermission] = useCameraPermissions();

    useEffect(() => {
      if (!permission) {
        requestPermission();
      } else {
        setHasPermission(permission.granted);
      }
    }, [permission]);

    const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
      setScanned(true);
      console.log("Data: ", data);
      try {
        // const response = await fetch('http://0.tcp.sa.ngrok.io:12109/pyxis/'+data);
        const result = (await ClientAPI.pyxis.getSpecific(data)).data; // Aguarda a resposta da requisição ( equivalente a
        // const result = await response.text();
        setResult(result); // Armazena o resultado da requisição no estado
        navigation.navigate('Report', { result, data });
      } catch (error) {
        console.error(error);
        alert("Erro ao Obter o ID do Pyxis, tente novamente.");
      }
    };

    if (hasPermission === null) {
      return <Text>Solicitando permissão para acessar a câmera...</Text>;
    }
    if (!hasPermission) {
      return <Text>Sem acesso à câmera</Text>;
    }

    return (
      <View style={styles.container}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
        />
        {scanned && (
          <Button
            title={"Escanear novamente"}
            onPress={() => setScanned(false)}
          />
        )}
        <FooterMenu/>
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  camera: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  button:{
    marginBottom: 20
  }
});

export default QRScannerScreen;
