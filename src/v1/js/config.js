require('./font');

var $ = require('jquery');

var config = {
	apiPath: `${apiHost}/api/v1`,
	languages: ['russian', 'english'],
	langStorageKey: 'language',
	storage: {
		get: localStorage.getItem.bind(localStorage),
		set: localStorage.setItem.bind(localStorage)
	},
	$: $
};

var language = config.storage.get(config.langStorageKey);
config.language = config.languages.indexOf(language) > -1 ?
	language :
	config.languages[0];

var api = require('./api')(config);
config.api = api;

module.exports = config;
