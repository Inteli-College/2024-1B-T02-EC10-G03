const path = require('path');

module.exports = {
	mode: 'production',
	entry: {
		inventory: './src/inventory.test.js',
		medicines: './src/medicines.test.js',
		pyxis: './src/pyxis.test.js',
		users: './src/users.test.js',
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		libraryTarget: 'commonjs',
		filename: '[name].test.js',
	},
	module: {
		rules: [{ test: /\.js$/, use: 'babel-loader' }],
	},
	target: 'web',
	externals: /k6(\/.*)?/,
};
