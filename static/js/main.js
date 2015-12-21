'use strict';

(function (config) {
	var language = config.storage.get(config.langStorageKey);
	config.language = config.languages.indexOf(language) > -1 ?
		language :
		config.languages[0];

	$(document).ready(function () {

		var main = $('#main');

		var api = (function ($, config) {
			$.ajaxSetup({
				dataType: 'json',
				timeout: 5 * 1000,
				error: function (err) {
					console.error(err.responseJSON || err);
				}
			});

			return {
				maxMatch: function () {
					return $.ajax(config.api + '/getMaxMatchId')
						.then(function (result) {
							return result.max_match_id.api;
						});
				},
				matchInfo: function (id) {
					return $.ajax(config.api + '/getMatchStatistic', {
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
					return $.ajax(config.api + '/getNicknamesByPublicIds', {
							data: {
								pids: ids
							}
						})
						.then(function (result) {
							return result.nicknames;
						});
				},
				getPublicIdByNickname: function (nickname) {
					return $.ajax(config.api + '/getPublicIdByNickname', {
							data: {
								nickname: nickname
							}
						})
						.then(function (result) {
							return result.pid;
						});
				},
				getUserData: function (pid, language) {
					return $.ajax(config.api + '/getUserData', {
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
					return $.ajax(config.api + '/matchesCountByPublicId', {
							data: {
								pid: pid
							}
						})
						.then(function (result) {
							return result.matches_count;
						});
				},
				getMatchesIdByPublicId: function (pid, limit, skip) {
					return $.ajax(config.api + '/getMatchesIdByPublicId', {
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
				/**
				 * Double underscore-prefixed methods are not native
				 */
				__getUserInfo: function (nickname, language) {
					return this
						.getPublicIdByNickname(nickname)
						.then(function (pid) {
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
						}.bind(this));
				}
			};
		})($, config);

		var kdRatio = function (kill, die) {
			return die ?
				kill ? (kill / die).toFixed(1) :
					-die:
				kill;
		};

		var MatchResults = (function (params) {
			var i18n = {
				russian: {
					title: 'Результаты',
					team: 'Команда',
					nickname: 'Имя',
					kills: 'Убийств',
					died: 'Смертей',
					kdRatio: 'K/D',
					score: 'Счет'
				},
				english: {
					title: 'Results',
					team: 'Team',
					nickname: 'Nickname',
					kills: 'Kills',
					died: 'Deaths',
					kdRatio: 'K/D',
					score: 'Score'
				}
			}[params.language];

			var tpl = function (data, nicknames) {
				var teams = data.stats.accounts;
				var result = ['0', '1'].map(function (teamNum) {
					var team = teams[teamNum];

					if (!team) {
						return;
					}

					var tbody = Object.keys(team).map(function (i, index) {
						var player = team[i];
						var kill   = Number(player.kill);
						var die    = Number(player.die);
						var score  = Number(player.score);

						return `<tr>
							<td>${index + 1}</td>
							<td>${nicknames[player.pid]}</td>
							<td>${kill}</td>
							<td>${die}</td>
							<td>${kdRatio(kill, die)}</td>
							<td>${score}</td>
						</tr>`;
					}).join('');

					return `<div>
							<h4>${i18n.team} ${+teamNum + 1}</h4>
							<table>
								<thead>
									<tr>
										<th>#</th>
										<th>${i18n.nickname}</th>
										<th>${i18n.kills}</th>
										<th>${i18n.died}</th>
										<th>${i18n.kdRatio}</th>
										<th>${i18n.score}</th>
									</tr>
								</thead>
								<tbody>${tbody}</tbody>
							</table>
						</div>`;
				});

				return `<table>
					<tr>
						<td>${result.join('</td><td>')}</td>
					</tr>
				</table>`;
			};

			var getIds = function (teams) {
				return ['0', '1'].reduce(function (ids, teamNum) {
					var team = teams[teamNum];

					if (!team) {
						return ids;
					}

					return ids.concat(Object.keys(team).map(function (i) {
						return team[i].pid;
					}));
				}, []);
			};

			return function () {
				var domElem = $('<div>', {
					html: '<h1>' + i18n.title + '</h1>' +
					'<div class="loading">Loading...</div>'
				});

				var loader = domElem.find('.loading');

				var body = $('<div>');
				body.appendTo(domElem);

				domElem.data('load', function (data) {
					var ids = getIds(data.stats.accounts);
					params.api
						.getNickNames(ids)
						.then(function (nicknames) {
							loader.detach();
							body.html(tpl(data, nicknames));
							domElem.trigger('loaded');
						});
				}.bind(domElem));

				return domElem;
			};
		})({ language: config.language, api: api });

		var Match = (function (params) {
			var i18n = {
				russian: {
					id: 'ID',
					replay: 'Скачать реплей',
					time_start: 'Время начала матча',
					duration: 'Продолжительность',
					durationMetric: 'сек.'
				},
				english: {
					id: 'ID',
					replay: 'Download replay',
					time_start: 'Time of match start',
					duration: 'Match duration',
					durationMetric: 'sec.'
				}
			}[params.language];

			var tpl = function (data) {
				var stats = data.stats;
				return `<h3>${i18n.id} ${data.id}</h3>
					<h4>${stats.name} (${stats.weather}) &mdash; ${stats.mode}</h4>
					<small>
						${i18n.time_start} ${stats.time_start},
						${i18n.duration} ${stats.game_duration}${i18n.durationMetric}
					</small>
					<div>
						<a href="http://${decodeURIComponent(stats.replay_path)}" target="_blank">${i18n.replay}</a>
					</div>`;
			};

			return function () {
				var domElem = $('<div>', {
					html: '<div class="loading">Loading...</div>'
				});

				var loader = domElem.find('.loading');

				var info = $('<div>');
				info.appendTo(domElem);

				var details = new MatchResults;
				details.appendTo(domElem);

				domElem.data('load', function (data) {
					loader.detach();
					info.html(tpl(data));
					details.data('load')(data);
					domElem.trigger('loaded');
				}.bind(domElem));

				return domElem;
			};
		})({ language: config.language });

		var MatchSearch = (function (params) {
			var i18n = {
				russian: {
					title: 'Поиск матча',
					matchId: 'ID матча',
					find: 'Найти'
				},
				english: {
					title: 'Match search',
					matchId: 'Match ID',
					find: 'Find'
				}
			}[params.language];

			return function (options) {
				options = options || {};

				var storageKey = 'match:search';

				var domElem = $('<form>', {
					html: `<h1>${i18n.title}</h1>
						<div class="loading">Loading...</div>
						<label>
							${i18n.matchId}:
							<input name="matchId" type="number" value="${params.storage.get(storageKey)}" />
						</label>
						<input type="submit" value="${i18n.find}" />`
				});

				var loader = domElem.find('.loading');
				loader.detach();

				var match;
				if (options.match) {
					match = options.match;
				} else {
					match = new Match;
					match.appendTo(domElem);
				}

				domElem.on('submit', function (e) {
					e.preventDefault();

					var matchId = Number(this.matchId.value);

					if (isNaN(matchId)) {
						return console.error('wrong type of matchId');
					}

					params.storage.set(storageKey, matchId);

					loader.appendTo(domElem);

					params.api
						.matchInfo(matchId)
						.then(function (data) {
							match.data('load')(data);
							loader.detach();
						});
				});

				return domElem;
			};
		})({ language: config.language, api: api, storage: config.storage });

		var LatestMatch = (function (params) {
			var i18n = {
				russian: {
					title: 'Последний матч'
				},
				english: {
					title: 'Latest match'
				}
			}[params.language];

			return function (options) {
				options = options || {};

				var domElem = $('<div>', {
					html: '<h1 class="latestMatch__title">' + i18n.title + '</h1>' +
					'<div class="loading">Loading...</div>'
				});

				var title  = domElem.find('.latestMatch__title');
				var loader = domElem.find('.loading');

				var match;
				if (options.match) {
					match = options.match;
				} else {
					match = new Match;
					match.appendTo(domElem);
				}

				var updateTitle = function (id) {
					title.html(`${i18n.title}: ${id}`);
					return id;
				};

				domElem.data('load', function (data) {
					loader.detach();
					updateTitle(data.id);
					match.data('load')(data);
					domElem.trigger('loaded');
				}.bind(domElem));

				params.api
					.maxMatch()
					.then(updateTitle)
					.then(api.matchInfo)
					.then(function (data) {
						domElem.data('load')(data);
					});

				return domElem;
			};
		})({ language: config.language, api: api });

		var LangSwitcher = (function (params) {
			var i18n = {
				russian: {
					russian: 'Русский',
					english: 'English'
				},
				english: {
					russian: 'Русский',
					english: 'English'
				}
			}[params.language];

			return function () {
				var domElem = $('<div>', {
					className: 'lang-switcher',
					html: params.languages.map(function (lang) {
						return `<a href="#!/${lang}" data-lang="${lang}" class="lang-switcher__elem">${i18n[lang]}</a>`;
					}).join('&nbsp;|&nbsp;')
				});

				domElem.on('click', '.lang-switcher__elem', function (e) {
					e.preventDefault();
					var $this = $(this);
					var lang  = $this.data('lang');
					if (lang !== params.language) {
						params.storage.set(params.langStorageKey, lang);
						window.location.reload();
					}
				});

				return domElem;
			};
		})({ language: config.language, languages: config.languages, storage: config.storage, langStorageKey: config.langStorageKey });

		var Pagination = (function () {
			return function () {
				var domElem = $('<div>', {
					className: 'pagination'
				});

				var total;
				var limit;
				var skip = 0;

				domElem.data('build', function ($total, $limit, $skip) {
					if (!$total || $total < 0 || !$limit || $limit < 0) {
						return domElem.empty();
					}

					total = $total;
					limit = $limit;

					if ($skip < 0) {
						$skip = 0;
					}

					skip = $skip;
				});

				return domElem;
			}
		})({ language: config.language });

		var PlayerMatches = (function (params) {
			var i18n = {
				russian: {
					title: 'Матчи'
				},
				english: {
					title: 'Matches'
				}
			}[params.language];

			var LIMIT = 25;

			var tpl = function (data) {
				return Object.keys(data).map(function (key) {
					return `<li class="player-matches__item" data-id="${data[key]}">${data[key]}</li>`;
				}).join('');
			};

			return function (options) {
				options = options || {};

				var domElem = $('<div>', {
					className: 'player-matches',
					html: `<h1>${i18n.title}</h1>
						<ol class="player-matches__info"></ol>`
				});

				var info = domElem.find('.player-matches__info');

				var match;
				if (options.match) {
					match = options.match;
				} else {
					match = new Match;
					match.appendTo(domElem);
				}

				var pagination = new Pagination;
				//pagination.appendTo(domElem);

				var total = 0;
				var pid;
				var skip = 0;

				domElem.data('load', function ($pid, $total) {
					total = Number($total);
					pid   = $pid;
					skip  = 0;
					params
						.api
						.getMatchesIdByPublicId(pid, LIMIT, skip)
						.then(function (data) {
							info.html(tpl(data));
							//pagination.data('build')(total, LIMIT, skip);
							domElem.trigger('loaded');
						});
				});

				domElem.on('click', '.player-matches__item', function (e) {
					e.preventDefault();
					var $this = $(this);
					var id = $this.data('id');
					params.api
						.matchInfo(id)
						.then(function (data) {
							match.data('load')(data);
						});
				});

				return domElem;
			};
		})({ language: config.language, api: api });

		var PlayerInfo = (function (params) {
			var i18n = {
				russian: {
					progress: 'Прогресс',
					level: 'Уровень',
					rating: 'Рейтинг',
					exp: 'Опыт',
					actions: 'Действия',
					kills: 'Убийств',
					deaths: 'Смертей',
					kdRatio: 'K/D',
					victories: 'Побед',
					looses: 'Поражений',
					totalMatches: 'Всего матчей',
					totalMatchesCount: 'Всего матчей, включая матчи без статистики',
					profile: 'Профиль',
					ammunition: 'Аммуниция',
					active: 'Активный'
				},
				english: {
					progress: 'Progress',
					level: 'Level',
					rating: 'Rating',
					exp: 'Experience',
					actions: 'Actions',
					kills: 'Kills',
					deaths: 'Deaths',
					kdRatio: 'K/D',
					victories: 'Victories',
					looses: 'Looses',
					totalMatches: 'Total matches',
					totalMatchesCount: 'Total matches count with no statistics included',
					profile: 'Profile',
					ammunition: 'Ammunition',
					active: 'Active'
				}
			}[params.language];

			var tplAmmunition = function (data) {
				return Object.keys(data).reduce(function (result, i) {
					var preset = data[i];
					var active = preset.active;
					delete preset.active;
					var itemKeys = Object.keys(preset);
					result[i18n.profile + ' ' + (Number(i) + 1) + (active ? ' (' + i18n.active.toLowerCase() + ')' : '')] = itemKeys.map(function (j) {
						var item = preset[j];
						return `${item.slot_name}: ${item.item_name}`;
					});
					return result;
				}, {});
			};

			var tpl = function (data) {
				var info = data.userData;
				var stats = info.matches_stats;
				var matchCount = Number(data.matchCount);

				var kill   = Number(stats.kills);
				var die    = Number(stats.dies);
				var wins   = Number(stats.victories);
				var total  = Number(stats.matches);

				var ammunition = tplAmmunition(info.ammunition);

				return `<h2>${info.nickname}</h2>
					<h4>${i18n.progress}</h4>
					<dl>
					  <dt>${i18n.level}</dt>
					  <dd>${info.progress.level}</dd>

					  <dt>${i18n.rating}</dt>
					  <dd>${info.progress.elo}</dd>

					  <dt>${i18n.exp}</dt>
					  <dd>${info.progress.experience}</dd>
					</dl>

					<h4>${i18n.actions}</h4>
					<dl>
					  <dt>${i18n.kills}</dt>
					  <dd>${kill}</dd>

					  <dt>${i18n.deaths}</dt>
					  <dd>${die}</dd>

					  <dt>${i18n.kdRatio}</dt>
					  <dd>${kdRatio(kill, die)}</dd>

					  <dt>${i18n.victories}</dt>
					  <dd>${wins}</dd>

					  <dt>${i18n.looses}</dt>
					  <dd>${total - wins}</dd>

					  <dt>${i18n.totalMatches}</dt>
					  <dd>${total} (<abbr title="${i18n.totalMatchesCount}">${matchCount}</abbr>)</dd>
					</dl>

					<h4>${i18n.ammunition}</h4>
					<pre>${JSON.stringify(ammunition, null, 4)}</pre>
				`;
			};

			return function (options) {
				options = options || {};

				var domElem = $('<div>', {
					className: 'player',
					html: '<div class="player__info"></div>'
				});

				var info = domElem.find('.player__info');

				var matches;
				if (options.matches) {
					matches = options.matches;
				} else {
					matches = new PlayerMatches({ match: options.match });
					matches.appendTo(domElem);
				}

				domElem.data('load', function (data) {
					info.html(tpl(data));
					matches.data('load')(data.pid, data.matchCount);
					domElem.trigger('loaded');
				});

				return domElem;
			};
		})({ language: config.language, api: api });

		var PlayerSearch = (function (params) {
			var i18n = {
				russian: {
					title: 'Поиск игроков',
					nickname: 'Ник игрока',
					find: 'Найти'
				},
				english: {
					title: 'Players search',
					nickname: 'Nickname',
					find: 'Find'
				}
			}[params.language];

			return function (options) {
				options = options || {};

				var storageKey = 'player:search';

				var domElem = $('<form>', {
					className: 'player-search',
					html: `<h1>${i18n.title}</h1>
						<div class="loading">Loading...</div>
						<label>
							${i18n.nickname}:
							<input name="nickname" value="${params.storage.get(storageKey) || ''}" />
						</label>
						<input type="submit" value="${i18n.find}" />`
				});

				var loader = domElem.find('.loading');
				loader.detach();

				var player;
				if (options.player) {
					player = options.player;
				} else {
					player = new PlayerInfo;
					player.appendTo(domElem);
				}

				domElem.on('submit', function (e) {
					e.preventDefault();

					var nickname = this.nickname.value;

					if ([undefined, null, ''].indexOf(nickname) > -1) {
						return console.error('wrong format of nickname');
					}

					params.storage.set(storageKey, nickname);

					loader.appendTo(domElem);

					params.api
						.__getUserInfo(nickname, params.language)
						.then(function (data) {
							player.data('load')(data);
							loader.detach();
						});
				});

				return domElem;
			};
		})({ language: config.language, api: api, storage: config.storage });

		var langSwitcher = new LangSwitcher;
		langSwitcher.prependTo(main);

		var match = new Match;

		var matchSearch = new MatchSearch({ match: match });

		var latestMatch = new LatestMatch({ match: match });

		var playerInfo = new PlayerInfo({ match: match });

		var playerSearch = new PlayerSearch({ player: playerInfo });

		latestMatch.appendTo(main);

		matchSearch.appendTo(main);

		match.appendTo(main);

		playerSearch.appendTo(main);

		playerInfo.appendTo(main);

		main.find('> .loading').remove();
	});
})({
	api: '//api.' + window.location.hostname + '/v0',
	languages: ['russian', 'english'],
	langStorageKey: 'language',
	storage: {
		get: localStorage.getItem.bind(localStorage),
		set: localStorage.setItem.bind(localStorage)
	}
});
