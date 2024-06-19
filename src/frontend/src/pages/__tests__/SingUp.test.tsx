import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUpScreen from '../SignUp';
import ClientAPI from '@api/client';
import axios from 'axios';
import { Alert } from 'react-native';

jest.mock('@api/client', () => ({
  user: {
    registerEmployee: jest.fn(),
  },
}));

jest.mock('axios');

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

describe('SignUpScreen Component', () => {
  const navigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen navigation={navigation} />);

    expect(getByText('Sign Up')).toBeTruthy();
    expect(getByPlaceholderText('Nome')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Selecione um Cargo:')).toBeTruthy();
    expect(getByText('Cadastre-se')).toBeTruthy();
    expect(getByText('Já está cadastrado?')).toBeTruthy();
    expect(getByText('Faça o Login')).toBeTruthy();
  });

  it('fetches roles on mount', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: ['Admin', 'User'] });

    const { getByText } = render(<SignUpScreen navigation={navigation} />);

    await waitFor(() => {
      expect(getByText('Admin')).toBeTruthy();
      expect(getByText('User')).toBeTruthy();
    });
  });

  it('shows an error alert if registration fails', async () => {
    (ClientAPI.user.registerEmployee as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Registration failed' } },
    });

    const { getByText, getByPlaceholderText } = render(<SignUpScreen navigation={navigation} />);

    fireEvent.changeText(getByPlaceholderText('Nome'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Cadastre-se'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Registration failed');
    });
  });

  it('registers employee and navigates to Login screen on success', async () => {
    (ClientAPI.user.registerEmployee as jest.Mock).mockResolvedValue({ status: 201 });

    const { getByText, getByPlaceholderText } = render(<SignUpScreen navigation={navigation} />);

    fireEvent.changeText(getByPlaceholderText('Nome'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Cadastre-se'));

    await waitFor(() => {
      expect(ClientAPI.user.registerEmployee).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: '',
      });
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Employee registered successfully');
      expect(navigation.navigate).toHaveBeenCalledWith('Login');
    });
  });

  it('navigates to Login screen when "Faça o Login" is pressed', () => {
    const { getByText } = render(<SignUpScreen navigation={navigation} />);

    fireEvent.press(getByText('Faça o Login'));
    expect(navigation.navigate).toHaveBeenCalledWith('Login');
  });
});
