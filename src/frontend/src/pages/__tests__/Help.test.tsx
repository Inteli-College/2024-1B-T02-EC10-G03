import React from 'react';
import { render } from '@testing-library/react-native';
import Help from '../Help'; // ajuste o caminho conforme necessário
import FooterMenu from '@components/FooterMenu/FooterMenu';

// Mock do FooterMenu
jest.mock('@components/FooterMenu/FooterMenu', () => 'FooterMenu');

describe('Help Component', () => {
  it('renders the Help component correctly', () => {
    const { getByText } = render(<Help />);
    
    // Verifica se os textos são renderizados
    expect(getByText('Help')).toBeTruthy();
    expect(getByText('Se você está com dúvidas, entre em contato com o suporte técnico pelo email:')).toBeTruthy();
    
    // Verifica se o FooterMenu é renderizado
    expect(() => getByText('FooterMenu')).toBeTruthy();
  });

  it('renders email text in blue', () => {
    const { getByText } = render(<Help />);
    const emailText = getByText('');
    expect(emailText.props.style).toMatchObject({ color: 'blue' });
  });
});
