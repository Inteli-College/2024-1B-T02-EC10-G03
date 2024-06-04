import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignInPage from '../SignIn';
import ClientAPI from '@api/client';
import { Alert } from 'react-native';

jest.mock('@api/client', () => ({
  user: {
    login: jest.fn(),
  },
}));

jest.mock('@components/SignInSignUp/InputField', () => (props: any) => {
  return (
    <TextInput
      placeholder={props.placeholder}
      value={props.value}
      onChangeText={props.onChangeText}
      secureTextEntry={props.secureTextEntry}
      testID={props.placeholder}
    />
  );
});

describe('SignInPage Component', () => {
  const navigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<SignInPage navigation={navigation} />);

    expect(getByText('Log In')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Ainda não está registrado?')).toBeTruthy();
    expect(getByText('Cadastre-se')).toBeTruthy();
    expect(getByText('Esqueceu a Senha?')).toBeTruthy();
  });

  it('shows an error if email or password is empty', () => {
    const { getByText, getByTestId } = render(<SignInPage navigation={navigation} />);

    fireEvent.press(getByText('Login'));

    waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Por favor, preencha todos os campos');
    });
  });

  it('navigates to SignUp page when "Cadastre-se" is pressed', () => {
    const { getByText } = render(<SignInPage navigation={navigation} />);

    fireEvent.press(getByText('Cadastre-se'));
    expect(navigation.navigate).toHaveBeenCalledWith('SignUp');
  });

  it('logs in successfully and navigates to QRScanner page', async () => {
    (ClientAPI.user.login as jest.Mock).mockResolvedValue({ status: 200 });

    const { getByText, getByPlaceholderText } = render(<SignInPage navigation={navigation} />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(ClientAPI.user.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
      expect(navigation.navigate).toHaveBeenCalledWith('QRScanner');
    });
  });

  it('shows an error alert if login fails', async () => {
    (ClientAPI.user.login as jest.Mock).mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });

    const { getByText, getByPlaceholderText } = render(<SignInPage navigation={navigation} />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Login falhou', 'Invalid credentials');
    });
  });
});
