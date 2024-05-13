const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const GlobEntries = require('webpack-glob-entries');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
	mode: 'production',
	entry: GlobEntries(path.resolve(__dirname, 'src/**/*.js')),
	output: {
		path: path.join(__dirname, 'dist'),
		libraryTarget: 'commonjs',
		filename: '[name].js',
	},
	resolve: {
		extensions: ['.js'],
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: 'babel-loader',
				exclude: /node_modules/,
			},
		],
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		libraryTarget: 'commonjs',
		filename: '[name].test.js',
	},
	target: 'web',
	externals: /^(k6|https?\:\/\/)(\/.*)?/,
	devtool: 'source-map',
	stats: {
		colors: true,
	},
	plugins: [
		new CleanWebpackPlugin(),
		new CopyPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, 'assets'),
					noErrorOnMissing: true,
				},
			],
		}),
	],
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin()],
	},
};
