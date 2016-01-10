module.exports = function (config) {
	var $ = config.$;

	$.ajaxSetup({
		dataType: 'json',
		timeout : 5 * 1000,
		_error  : function (err) {
			console._error(err.responseJSON || err);
		}
	});

	return {
		latestMatch: function (level, slim) {
			return $.ajax(config.apiPath + '/matches/latest', {
					data: {
						level: level,
						slim: slim,
						lang: config.language
					}
				});
		},
		match: function (id, slim) {
			return $.ajax(config.apiPath + '/matches/' + id, {
					data: {
						slim: slim,
						lang: config.language
					}
				});
		},
		player: function (query, options) {
			options = options || {};
			return $.ajax(config.apiPath + '/players/' + query, {
				data: {
					byName: options.byName,
					fullStats: options.fullStats,
					lang: config.language
				}
			});
		},
		clan: function (abbr) {
			return $.ajax(config.apiPath + '/clans/' + abbr, {
				data: {
					lang: config.language
				}
			});
		}
	};
};
