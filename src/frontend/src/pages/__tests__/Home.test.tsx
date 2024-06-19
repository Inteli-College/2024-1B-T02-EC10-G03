import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomePage from '../Home'; // ajuste o caminho conforme necessário
import { NavigationContainer } from '@react-navigation/native';

// Mock das imagens
jest.mock('@assets/img/logo_pv.png', () => require('path/to/mock/image.png'));
jest.mock('@assets/img/name_pv.png', () => require('path/to/mock/image.png'));

describe('HomePage Component', () => {
  const navigation = { navigate: jest.fn() };

  it('renders correctly', () => {
    const { getByText, getByLabelText } = render(
      <NavigationContainer>
        <HomePage navigation={navigation} />
      </NavigationContainer>
    );

    expect(getByLabelText('Login')).toBeTruthy();
    expect(getByLabelText('Register')).toBeTruthy();
  });

  it('navigates to Login screen when Login button is pressed', () => {
    const { getByLabelText } = render(
      <NavigationContainer>
        <HomePage navigation={navigation} />
      </NavigationContainer>
    );

    fireEvent.press(getByLabelText('Login'));
    expect(navigation.navigate).toHaveBeenCalledWith('Login');
  });

  it('navigates to SignUp screen when Register button is pressed', () => {
    const { getByLabelText } = render(
      <NavigationContainer>
        <HomePage navigation={navigation} />
      </NavigationContainer>
    );

    fireEvent.press(getByLabelText('Register'));
    expect(navigation.navigate).toHaveBeenCalledWith('SignUp');
  });
});
