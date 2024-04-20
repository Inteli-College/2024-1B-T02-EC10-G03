import { StyleSheet, Text, View } from 'react-native';
import { Toasts } from '@backpackapp-io/react-native-toast';
import TestButton from '@components/TestButton';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default function App() {
	return (
		<SafeAreaProvider>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<View style={styles.container}>
					<Text>This is a test app.</Text>
					<TestButton />
					<Toasts />
				</View>
			</GestureHandlerRootView>
		</SafeAreaProvider>
	);
}
