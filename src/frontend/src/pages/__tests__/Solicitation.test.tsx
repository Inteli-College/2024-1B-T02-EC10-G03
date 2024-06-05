import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import SolicitationPage from '../Solicitation';
import ClientAPI from '@api/client';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';

jest.mock('@api/client', () => ({
  user: {
    getInfo: jest.fn(),
  },
  pyxis_report: {
    getAll: jest.fn(),
  },
  medicine: {
    getAll: jest.fn(),
  },
}));

jest.mock('@components/FooterMenu/FooterMenu', () => 'FooterMenu');

describe('SolicitationPage Component', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const mockUser = { data: { name: 'John Doe' } };
    const mockReports = { data: [{ medicineId: '1', status: 'SENT', type: 'NEEDS_REFILL' }] };
    const mockMedicines = { data: [{ id: '1', MedicineNames: [{ name: 'Aspirin' }] }] };

    (ClientAPI.user.getInfo as jest.Mock).mockResolvedValue(mockUser);
    (ClientAPI.pyxis_report.getAll as jest.Mock).mockResolvedValue(mockReports);
    (ClientAPI.medicine.getAll as jest.Mock).mockResolvedValue(mockMedicines);

    const { getByText, getAllByText } = render(<SolicitationPage navigation={navigation} />);

    await waitFor(() => {
      expect(getByText('Pixis 2')).toBeTruthy();
      expect(getByText('Solicitação do dia')).toBeTruthy();
      expect(getAllByText('Aspirin')).toBeTruthy();
      expect(getByText('Enviada')).toBeTruthy();
      expect(getByText('Recebida')).toBeTruthy();
      expect(getByText('Em andamento')).toBeTruthy();
      expect(getByText('Finalizada')).toBeTruthy();
    });
  });

  it('fetches reports and medicines on mount', async () => {
    const mockUser = { data: { name: 'John Doe' } };
    const mockReports = { data: [{ medicineId: '1', status: 'SENT', type: 'NEEDS_REFILL' }] };
    const mockMedicines = { data: [{ id: '1', MedicineNames: [{ name: 'Aspirin' }] }] };

    (ClientAPI.user.getInfo as jest.Mock).mockResolvedValue(mockUser);
    (ClientAPI.pyxis_report.getAll as jest.Mock).mockResolvedValue(mockReports);
    (ClientAPI.medicine.getAll as jest.Mock).mockResolvedValue(mockMedicines);

    render(<SolicitationPage navigation={navigation} />);

    await waitFor(() => {
      expect(ClientAPI.user.getInfo).toHaveBeenCalled();
      expect(ClientAPI.pyxis_report.getAll).toHaveBeenCalled();
      expect(ClientAPI.medicine.getAll).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', async () => {
    (ClientAPI.user.getInfo as jest.Mock).mockRejectedValue(new Error('API Error'));
    (ClientAPI.pyxis_report.getAll as jest.Mock).mockRejectedValue(new Error('API Error'));
    (ClientAPI.medicine.getAll as jest.Mock).mockRejectedValue(new Error('API Error'));

    const { getByText } = render(<SolicitationPage navigation={navigation} />);

    await waitFor(() => {
      expect(getByText('Pixis 2')).toBeTruthy();
      expect(getByText('Solicitação do dia')).toBeTruthy();
    });
  });

  it('navigates back when the back button is pressed', async () => {
    const mockUser = { data: { name: 'John Doe' } };
    const mockReports = { data: [{ medicineId: '1', status: 'SENT', type: 'NEEDS_REFILL' }] };
    const mockMedicines = { data: [{ id: '1', MedicineNames: [{ name: 'Aspirin' }] }] };

    (ClientAPI.user.getInfo as jest.Mock).mockResolvedValue(mockUser);
    (ClientAPI.pyxis_report.getAll as jest.Mock).mockResolvedValue(mockReports);
    (ClientAPI.medicine.getAll as jest.Mock).mockResolvedValue(mockMedicines);

    const { getByTestId } = render(<SolicitationPage navigation={navigation} />);

    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);

    await waitFor(() => {
      expect(navigation.goBack).toHaveBeenCalled();
    });
  });
});
