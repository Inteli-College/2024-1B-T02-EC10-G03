    import React, { useState, useEffect } from "react";
    import { View, Text, StyleSheet, Button, Image, TouchableOpacity } from "react-native";
    import { Camera } from "expo-camera";
    import FooterMenu from "../../components/FooterMenu/FooterMenu";

    const QRScannerScreen = () => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        const getCameraPermissions = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
        };

        getCameraPermissions();
    }, []);

    const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
        setScanned(true);
        alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    };

    if (hasPermission === null) {
        return <Text>Solicitando permissão para acessar a câmera...</Text>;
    }
    if (hasPermission === false) {
        return <Text>Sem acesso à câmera</Text>;
    }

    return (
        <View style={styles.container}>
        <Camera
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
        />
        {scanned && (
            <Button
            title={"Escanear novamente"}
            onPress={() => setScanned(false)}
            />
        )}
        <FooterMenu />
        </View>
    );
    };

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    });

    export default QRScannerScreen;
