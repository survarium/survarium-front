const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: {
		index: "./src/index.js",
		vendor: ['jquery']
	},
	output: {
		path: path.join(__dirname, 'static'),
		filename: "[name].entry.chunk.js"
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin("commons.bundle.js", ["index"]),
		new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js")
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
