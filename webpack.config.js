const path = require('path');

module.exports = {
	mode: 'none',
	target: 'node',
	entry: './src/extension.ts',
	output: {
		path: path.resolve(__dirname, 'out'),
		filename: 'extension.js',
		libraryTarget: 'commonjs2',
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	externals: {
		vscode: 'commonjs vscode', // VS Code 의존성 제외
	},
	devtool: 'source-map',
};
