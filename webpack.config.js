const path = require('path');

module.exports = {
	entry: "./webpack.js",
	output: {
		path: path.join(__dirname, 'static'),
		filename: "bundle.js"
	},
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
