import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from '@pages/Home';
import LoginPage from '@pages/SignIn';
import SignUpPage from '@pages/SignUp';
import QRScannerPage from '@pages/QRScanner';
import ReportPage from '@pages/Report';
import SolicitationPage from '@pages/Solicitation';
import HistoryPage from '@pages/History';
import Help from '@pages/Help';
import Settings from '@pages/Settings';
import { useFonts } from 'expo-font';

const Stack = createStackNavigator();

export default function App() {
	const [loaded] = useFonts({
		Inter: require('@assets/fonts/Inter-Regular.ttf'),
		'Inter-Bold': require('@assets/fonts/Inter-Bold.ttf'),
	});

	if (!loaded) {
		return null;
	}

	return (
		<NavigationContainer>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				<Stack.Screen name="Home" component={HomePage} />
				<Stack.Screen name="History" component={HistoryPage} />
				<Stack.Screen name="Login" component={LoginPage} />
				<Stack.Screen name="QRScanner" component={QRScannerPage} />
				<Stack.Screen name="Report" component={ReportPage} />
				<Stack.Screen name="Settings" component={Settings} />
				<Stack.Screen name="SignUp" component={SignUpPage} />
				<Stack.Screen name="Solicitation" component={SolicitationPage} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}
