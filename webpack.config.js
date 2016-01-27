const path = require('path');
const webpack = require('webpack');
const poststylus = require('poststylus');

module.exports = {
	entry: {
		//v0: './src/v0/index.js',
		v1: './src/v1/index.js',
		'widgets/players': './src/widgets/players.js',
		vendor: [
			'datatables.net',
			'datatables.net-buttons',
			'highcharts/highstock',
			'highcharts/themes/dark-unica',
			'highcharts/highcharts-more',
		    'highcharts/modules/solid-gauge'
		]
	},
	output: {
		path: path.join(__dirname, 'static'),
		filename: "[name].js"
	},
	plugins: [
		new webpack.DefinePlugin({
			apiHost: JSON.stringify(process.env.API_HOST || 'https://survarium.pro')
		}),
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
			'window.jQuery': 'jquery',
			Highcharts: 'highcharts/highstock'
		}),/*
		// commonized JQUERY for v1 and widgets,
		new webpack.optimize.CommonsChunkPlugin({ name: 'commons', filename: 'shared.js', chunks: ['v1', 'widgets/players'] }),
		new webpack.optimize.CommonsChunkPlugin({ name: 'vendor',  filename: 'vendor.js',  chunks: ['v1', 'widgets/players'] }),
		new webpack.optimize.CommonsChunkPlugin({ name: 'commons', filename: 'common.js',  chunks: ['vendor'] })*/

		new webpack.optimize.CommonsChunkPlugin({ name: 'commons', filename: 'common.js',  chunks: ['v1'] }),
		new webpack.optimize.CommonsChunkPlugin({ name: 'vendor',  filename: 'vendor.js',  chunks: ['v1'] })
	],
	module: {
		loaders: [
			{ test: /\.(jpe?g|png|gif|svg)$/i, loader: 'url?limit=10000!img?progressive=true' },
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
