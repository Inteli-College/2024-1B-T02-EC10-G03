import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HistoryPage from '../History'; // ajuste o caminho conforme necessário
import ClientAPI from '@api/client';
import FooterMenu from '@components/FooterMenu/FooterMenu';
import DropdownComponent from '@components/SelectPyxisDropdownComponent/SelectPyxisDropdownComponent';

// Mock das dependências
jest.mock('@api/client');
jest.mock('@components/FooterMenu/FooterMenu', () => 'FooterMenu');
jest.mock('@components/SelectPyxisDropdownComponent/SelectPyxisDropdownComponent', () => 'DropdownComponent');

// Dados de exemplo para os mocks
const mockMedicines = {
  data: [
    { id: '1', MedicineNames: [{ name: 'Medicine 1' }] },
    { id: '2', MedicineNames: [{ name: 'Medicine 2' }] }
  ]
};

const mockPyxisReports = {
  data: [
    {
      cuid: '123',
      medicineId: '1',
      pyxisUuid: 'abc',
      type: 'DATA_INCONSISTENCY',
      observation: 'Observation 1'
    }
  ]
};

const mockPyxis = {
  data: [
    { uuid: 'abc', floor: '1', block: 'A' }
  ]
};

// Mock da resposta da API
ClientAPI.medicine.getAll.mockResolvedValue(mockMedicines);
ClientAPI.pyxis_report.getAll.mockResolvedValue(mockPyxisReports);
ClientAPI.pyxis.getAll.mockResolvedValue(mockPyxis);

describe('HistoryPage Component', () => {
  it('renders correctly while loading', () => {
    const { getByTestId } = render(<HistoryPage />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders correctly after loading', async () => {
    const { getByText, getByTestId } = render(<HistoryPage />);
    await waitFor(() => {
      expect(getByText('Meu Histórico')).toBeTruthy();
      expect(getByText('Dipirona XXmg')).toBeTruthy();
      expect(getByText('Medicamento mais Frequente')).toBeTruthy();
      expect(getByText('Reports Realizados')).toBeTruthy();
    });
  });

  it('renders reports based on selected equipment', async () => {
    const { getByText, getByTestId } = render(<HistoryPage />);
    await waitFor(() => {
      fireEvent.press(getByTestId('dropdown-component'));
      fireEvent.press(getByText('1A'));
      expect(getByText('Medicine 1 - 1')).toBeTruthy();
      expect(getByText('Inconsistência')).toBeTruthy();
      expect(getByText('Observation 1')).toBeTruthy();
    });
  });
});
