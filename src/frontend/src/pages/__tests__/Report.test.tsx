import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ReportPage from '../Report';
import ClientAPI from '@api/client';
import { Alert } from 'react-native';

jest.mock('@api/client', () => ({
  inventory: {
    getAllMedicinesOfPyxis: jest.fn(),
  },
  medicine: {
    getSpecific: jest.fn(),
  },
  pyxis_report: {
    create: jest.fn(),
  },
  user: {
    getInfo: jest.fn(),
  },
}));

describe('ReportPage Component', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  const route = { params: { pyxis_id: '123' } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    (ClientAPI.inventory.getAllMedicinesOfPyxis as jest.Mock).mockResolvedValue({
      data: [{ medicineId: '1', quantity: 10 }],
    });
    (ClientAPI.medicine.getSpecific as jest.Mock).mockResolvedValue({
      data: { MedicineNames: [{ name: 'Aspirin' }] },
    });

    const { getByText } = render(<ReportPage route={route} navigation={navigation} />);

    await waitFor(() => {
      expect(getByText('Report')).toBeTruthy();
      expect(getByText('Aspirin')).toBeTruthy();
    });
  });

  it('shows error alert if inventory fetch fails', async () => {
    (ClientAPI.inventory.getAllMedicinesOfPyxis as jest.Mock).mockRejectedValue(new Error('API Error'));

    const { getByText } = render(<ReportPage route={route} navigation={navigation} />);

    await waitFor(() => {
      expect(getByText('Unable to fetch inventory data.')).toBeTruthy();
    });
  });

  it('shows error alert if user fetch fails', async () => {
    (ClientAPI.user.getInfo as jest.Mock).mockRejectedValue(new Error('API Error'));

    const { getByText, getByRole } = render(<ReportPage route={route} navigation={navigation} />);

    fireEvent.press(getByRole('button', { name: /Enviar/i }));

    await waitFor(() => {
      expect(getByText('Unable to fetch user data.')).toBeTruthy();
    });
  });

  it('submits report correctly', async () => {
    (ClientAPI.inventory.getAllMedicinesOfPyxis as jest.Mock).mockResolvedValue({
      data: [{ medicineId: '1', quantity: 10 }],
    });
    (ClientAPI.medicine.getSpecific as jest.Mock).mockResolvedValue({
      data: { MedicineNames: [{ name: 'Aspirin' }] },
    });
    (ClientAPI.user.getInfo as jest.Mock).mockResolvedValue({
      data: { uuid: 'user-123' },
    });
    (ClientAPI.pyxis_report.create as jest.Mock).mockResolvedValue({
      status: 201,
    });

    const { getByText, getByPlaceholderText, getByRole } = render(<ReportPage route={route} navigation={navigation} />);

    await waitFor(() => {
      expect(getByText('Aspirin')).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText('Adicione mais informações'), 'Observação de teste');
    fireEvent.press(getByRole('button', { name: /Enviar/i }));

    await waitFor(() => {
      expect(ClientAPI.pyxis_report.create).toHaveBeenCalledWith({
        pyxis_id: '123',
        employee_uuid: 'user-123',
        medicine_id: '1',
        type: undefined,
        observation: 'Observação de teste',
        urgency: false,
      });
      expect(navigation.navigate).toHaveBeenCalledWith('History');
    });
  });
});
