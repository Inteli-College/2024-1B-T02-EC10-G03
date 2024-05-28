import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import FooterMenu from '@components/FooterMenu/FooterMenu';
import ClientAPI from '@api/client';
import { Pyxis } from 'types/api';

const useCameraAccess = () => {
	const [permission, requestPermission] = useCameraPermissions();
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);

	useEffect(() => {
		(async () => {
			if (!permission) {
				await requestPermission();
			} else {
				setHasPermission(permission.granted);
			}
		})();
	}, [permission]);

	return hasPermission;
};

export default function QRScannerPage({ navigation }: { navigation: any }) {
	const hasPermission = useCameraAccess();
	const [scanned, setScanned] = useState(false);

	const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
		setScanned(true);
		try {
			const pyxis: Pyxis = (await ClientAPI.pyxis.getSpecific(data)).data;
			navigation.navigate('Report', {
				pyxis_data: pyxis,
				pyxis_id: `${pyxis.floor}${pyxis.block}`,
			});
		} catch (error) {
			console.error(error);
			Alert.alert('Erro', 'Erro ao Obter o ID do Pyxis, tente novamente.');
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
			<CameraView onBarcodeScanned={scanned ? undefined : handleBarCodeScanned} style={styles.camera}>
				{scanned ?
				<Text style={styles.button}>QRCode escaneado</Text>
				: <Text style={styles.button}>Escaneie o QRCode</Text>}
			</CameraView>
			<FooterMenu />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-end',
	},
	camera: {
		flex: 1,
		...StyleSheet.absoluteFillObject,
	},
	button: {
		margin: 10,
	}
});
