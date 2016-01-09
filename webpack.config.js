const path = require('path');
const webpack = require('webpack');
const poststylus = require('poststylus');

module.exports = {
	entry: {
		v0: "./src/v0/index.js",
		v1: "./src/v1/index.js",
		vendor: ['jquery', 'datatables.net', 'datatables.net-buttons']
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
			{ test: /\.styl$/, loader: 'style-loader!css-loader!stylus-loader' },
			{ test: /\.css$/,  loader: 'style-loader!css-loader' },
			{
				test: /\.js?$/,
				exclude: /(node_modules|bower_components|web_modules)/,
				loader: 'babel',
				query: {
					presets: ['es2015']
				}
			}
		]
	},
	stylus: {
		use: [
			poststylus([ 'autoprefixer', 'rucksack-css' ])
		]
	},
	devServer: {
		contentBase: path.join(__dirname, 'static'),
		progress: true,
		colors: true
	}
};
