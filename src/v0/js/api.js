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
		maxMatch: function () {
			return $.ajax(config.apiPath + '/getMaxMatchId')
				.then(function (result) {
					return result.max_match_id.api;
				});
		},
		matchInfo: function (id) {
			return $.ajax(config.apiPath + '/getMatchStatistic', {
					data: {
						id: id,
						lang: config.language
					}
				})
				.then(function (result) {
					return {
						id: result.match_id,
						stats: result.stats
					};
				});
		},
		getNickNames: function (ids) {
			return $.ajax(config.apiPath + '/getNicknamesByPublicIds', {
					data: {
						pids: ids
					}
				})
				.then(function (result) {
					return result.nicknames;
				});
		},
		getPublicIdByNickname: function (nickname) {
			return $.ajax(config.apiPath + '/getPublicIdByNickname', {
					data: {
						nickname: nickname
					}
				});
		},
		getUserData: function (pid, language) {
			return $.ajax(config.apiPath + '/getUserData', {
					data: {
						pid: pid,
						language: language
					}
				})
				.then(function (result) {
					return result.userdata;
				});
		},
		matchesCountByPublicId: function (pid) {
			return $.ajax(config.apiPath + '/matchesCountByPublicId', {
					data: {
						pid: pid
					}
				})
				.then(function (result) {
					return result.matches_count;
				});
		},
		getMatchesIdByPublicId: function (pid, limit, skip) {
			return $.ajax(config.apiPath + '/getMatchesIdByPublicId', {
					data: {
						pid: pid,
						limit: limit,
						offset: skip
					}
				})
				.then(function (result) {
					return result.matches_ids;
				});
		},
		getClanInfo: function (id) {
			return $.ajax(config.apiPath + '/getClanInfo', {
					data: {
						id: id
					}
				})
				.then(function (result) {
					return result.clan_info;
				});
		},
		/**
		 * Double underscore-prefixed methods are not native
		 */
		__getClanInfo: function (id) {
			if (id) {
				return this.getClanInfo(id);
			}
			var deferred = $.Deferred();
			deferred.resolve(null);
			return deferred.promise();
		},
		__getUserInfo: function (pid, language) {
			var defer = $.Deferred();
			var result = {
				pid: pid
			};

			var defers = [
				function () {
					return this
						.matchesCountByPublicId(pid)
						.then(success('matchCount'))
						.fail(defer.reject);
				},
				function () {
					return this
						.getUserData(pid, language)
						.then(function (result) {
							return this.__getClanInfo(result.clan_id)
								.then(function (clanInfo) {
									result.clan = clanInfo;
									return result;
								});
						}.bind(this))
						.then(success('userData'))
						.fail(defer.reject);
				}
			];
			var deferAmount = defers.length;

			function success(type) {
				return function (data) {
					result[type] = data;
					if (!--deferAmount) {
						return defer.resolve(result);
					}
				};
			}

			defers.forEach(function (deferred) {
				return deferred.call(this);
			}, this);

			return defer.promise();
		}
	};
};
