const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: {
		app: "./webpack.js",
		vendor: ['jquery']
	},
	output: {
		path: path.join(__dirname, 'static'),
		filename: "bundle.js"
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js")
	],
	module: {
		loaders: [
			{ test: /\.css$/, loader: "style!css" }
		]
	},
	devServer: {
		contentBase: path.join(__dirname, 'static'),
		progress: true,
		colors: true
	}
};
