import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/Home/HomeScreen';
import LoginScreen from './screens/Login/LoginScreen';
import SignUpScreen from './screens/SignUp/SignUpScreen';
import QRScannerScreen from './screens/QRScannerScreen/QRScannerScreen';
import ReportScreen from 'screens/Report/ReportScreen';
import SolicitationScreen from 'screens/Solicitation/SolicitationScreen';
import { useFonts } from 'expo-font';

const Stack = createStackNavigator();

export default function App() {
	const [loaded] = useFonts({
		Inter: require('../assets/fonts/Inter-Regular.ttf'),
		'Inter-Bold': require('../assets/fonts/Inter-Regular.ttf'),
	  });	
	
	  if (!loaded) {
		return null;
	  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
        <Stack.Screen name='Report' component={ReportScreen} />
        <Stack.Screen name='Solicitation' component={SolicitationScreen} />        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
