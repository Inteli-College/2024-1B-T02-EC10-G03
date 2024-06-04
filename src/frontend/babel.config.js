module.exports = function (api) {
	api.cache(true);
  
	const presets = ['babel-preset-expo'];
	const plugins = [
	  'react-native-reanimated/plugin',
	  'module:react-native-dotenv',
	];
  
	if (process.env.NODE_ENV === 'test') {
	  presets.push('@babel/preset-env');
	}
  
	return {
	  presets,
	  plugins,
	};
  };
  