import { StyleSheet } from 'react-native';

export const CommonStyles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
		maxWidth: 480,
		width: '100%',
	},
	header: {
		marginBottom: 6,
	},
	headerText: {
		fontSize: 30,
		fontWeight: 'bold',
		textAlign: 'center',
		color: 'black',
	},
	inputContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 20,
		marginTop: 8,
		width: 343,
		backgroundColor: '#f0f0f0',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#cccccc',
	},
	input: {
		fontSize: 16,
		color: '#999999',
		flex: 1,
	},
	button: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 15,
		marginTop: 36,
		backgroundColor: '#B16ECE',
		borderRadius: 100,
	},
	buttonText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: 'white',
	},
	linkText: {
		textAlign: 'center',
		marginTop: 5,
		fontSize: 16,
		fontWeight: 'bold',
		color: '#B16ECE',
	},
	footer: {
		marginTop: 8,
		paddingHorizontal: 20,
		width: '100%',
		maxWidth: 343,
	},
});
