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
			return $.ajax(config.apiPath + '/matches/' + encodeURIComponent(id.trim ? id.trim() : id), {
					data: {
						slim: slim,
						lang: config.language
					}
				});
		},
		player: function (query, options) {
			options = options || {};
			return $.ajax(config.apiPath + '/players/' + encodeURIComponent(query.trim ? query.trim() : query), {
				data: {
					byName: options.byName,
					fullStats: options.fullStats,
					lang: config.language
				}
			});
		},
		players: function (query) {
			query = query || {};
			query.lang = query.lang || config.language;
			return $.ajax({
				url: config.apiPath + '/players/',
				data: query
			});
		},
		/**
		 * Получить информацию о клане
		 * @param   {String}  abbr                    аббревиатура клана
		 * @param   {Object}  [options]
		 * @param   {Boolean} [options.publicStats]   аггрегация итогов паблик-матчей вместо клановых
		 * @returns {Promise}
		 */
		clan: function (abbr, options) {
			options = options || {};
			return $.ajax(config.apiPath + '/clans/' + encodeURIComponent(abbr.trim ? abbr.trim() : abbr), {
				data: {
					lang: config.language,
					publicStats: options.publicStats
				}
			});
		},
		/**
		 * Получить статистику паблик-матчей клана
		 * @param   {Object}  query        запрос
		 * @param   {String}  query.abbr   аббревиатура клана
		 * @returns {Promise}
		 */
		clanPublicStats: function (query) {
			var abbr = query.abbr;
			query.abbr = undefined;
			return $.ajax(config.apiPath + '/clans/' + encodeURIComponent(abbr.trim ? abbr.trim() : abbr) + '/stats', {
				data: query
			});
		}
	};
};
