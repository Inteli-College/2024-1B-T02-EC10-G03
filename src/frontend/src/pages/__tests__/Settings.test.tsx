import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Settings from '../Settings';
import FooterMenu from '@components/FooterMenu/FooterMenu';

jest.mock('@components/FooterMenu/FooterMenu', () => 'FooterMenu');

describe('Settings Component', () => {
  it('renders correctly', () => {
    const { getByText, getByDisplayValue } = render(<Settings />);

    // Verificar a renderização dos textos e valores iniciais
    expect(getByText('Configurações')).toBeTruthy();
    expect(getByText('Modo Escuro')).toBeTruthy();
    expect(getByText('Idioma')).toBeTruthy();
    expect(getByText('Notificações')).toBeTruthy();
    expect(getByDisplayValue('Português')).toBeTruthy();
    expect(getByText('Se você está com dúvidas, entre em contato com o suporte técnico pelo email:')).toBeTruthy();
    expect(getByText('suporte@exemplo.com')).toBeTruthy();
  });

  it('toggles dark mode switch', () => {
    const { getByText, getByTestId } = render(<Settings />);

    const darkModeSwitch = getByTestId('dark-mode-switch');
    expect(darkModeSwitch.props.value).toBe(false);

    fireEvent.press(darkModeSwitch);
    expect(darkModeSwitch.props.value).toBe(true);
  });

  it('changes language', () => {
    const { getByDisplayValue, getByTestId } = render(<Settings />);

    const languagePicker = getByTestId('language-picker');
    expect(getByDisplayValue('Português')).toBeTruthy();

    fireEvent.change(languagePicker, { target: { value: 'en' } });
    expect(getByDisplayValue('Inglês')).toBeTruthy();
  });

  it('renders FooterMenu component', () => {
    const { getByText } = render(<Settings />);
    expect(getByText('FooterMenu')).toBeTruthy();
  });
});
