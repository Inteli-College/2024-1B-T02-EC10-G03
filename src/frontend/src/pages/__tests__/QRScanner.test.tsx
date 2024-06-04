import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import QRScannerPage from '../QRScanner'; // ajuste o caminho conforme necessário
import ClientAPI from '@api/client';
import { useCameraPermissions, Camera } from 'expo-camera';
import { Alert, View, Text } from 'react-native';

// Mock do módulo ClientAPI
jest.mock('@api/client');

// Mock do módulo expo-camera
jest.mock('expo-camera', () => {
  const actualCamera = jest.requireActual('expo-camera');
  return {
    ...actualCamera,
    useCameraPermissions: jest.fn(),
    Camera: ({ onBarCodeScanned }: { onBarCodeScanned: () => void }) => (
      <View testID="cameraView" onTouchEnd={onBarCodeScanned}>
        <Text>Camera View</Text>
      </View>
    ),
  };
});

describe('QRScannerPage Component', () => {
  const navigation = { navigate: jest.fn() };
  const setPermission = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, setPermission]);
  });

  it('renders permission request message when permission is null', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([null, setPermission]);

    const { getByText } = render(<QRScannerPage navigation={navigation} />);
    expect(getByText('Solicitando permissão para acessar a câmera...')).toBeTruthy();
  });

  it('renders no access message when permission is not granted', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: false }, setPermission]);

    const { getByText } = render(<QRScannerPage navigation={navigation} />);
    expect(getByText('Sem acesso à câmera')).toBeTruthy();
  });

  it('renders camera view when permission is granted', () => {
    const { getByTestId } = render(<QRScannerPage navigation={navigation} />);
    expect(getByTestId('cameraView')).toBeTruthy();
  });

  it('navigates to Report screen when QR code is scanned', async () => {
    (ClientAPI.pyxis.getSpecific as jest.Mock).mockResolvedValue({
      data: { floor: '1', block: 'A', uuid: '1234' },
    });

    const { getByTestId } = render(<QRScannerPage navigation={navigation} />);

    fireEvent(getByTestId('cameraView'), 'onTouchEnd', {
      type: 'QR_CODE',
      data: '1234',
    });

    await waitFor(() => {
      expect(navigation.navigate).toHaveBeenCalledWith('Report', {
        pyxis_data: { floor: '1', block: 'A', uuid: '1234' },
        pyxis_id: '1A',
      });
    });
  });

  it('displays error alert when API call fails', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (ClientAPI.pyxis.getSpecific as jest.Mock).mockRejectedValue(new Error('API Error'));

    const { getByTestId, getByText } = render(<QRScannerPage navigation={navigation} />);

    fireEvent(getByTestId('cameraView'), 'onTouchEnd', {
      type: 'QR_CODE',
      data: '1234',
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Erro ao Obter o ID do Pyxis, tente novamente.');
      expect(errorSpy).toHaveBeenCalledWith(new Error('API Error'));
    });

    errorSpy.mockRestore();
  });
});
