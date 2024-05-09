import { StyleSheet, Button } from 'react-native';
import { toast } from '@backpackapp-io/react-native-toast';

export default function TestButton() {
	return (
		<Button
			title="Test toaster button"
			color="#841584"
			onPress={() => {
				toast.success('Hello, world!');
			}}
		/>
	);
}
