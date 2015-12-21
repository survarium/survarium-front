var utils = require('./utils');

var Results = function (params) {
	var $ = params.$;

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

			var tbody = Object.keys(team).sort(function (a, b) {
				return Number(team[a].score) < Number(team[b].score);
			}).map(function (i, index) {
				var player = team[i];
				var kill   = Number(player.kill);
				var die    = Number(player.die);
				var score  = Number(player.score);

				return `<tr>
							<td>${index + 1}</td>
							<td><span class="match-results__nickname" data-pid="${player.pid}">${nicknames[player.pid]}</span></td>
							<td>${kill}</td>
							<td>${die}</td>
							<td>${utils.kdRatio(kill, die)}</td>
							<td>${score}</td>
						</tr>`;
			}).join('');

			return `<div>
							<h4>${i18n.team} ${+teamNum + 1} (${data.stats['team_' + (+teamNum + 1) + '_score']})</h4>
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
			className: 'match-results',
			html: '<h1>' + i18n.title + '</h1>' +
			'<div class="loading">Loading...</div>'
		});

		var loader = domElem.find('.loading');
		loader.detach();

		var body = $('<div>');
		body.appendTo(domElem);

		var player;

		domElem.data('setPlayer', function (component) {
			return player = component;
		});

		domElem.on('click', '.match-results__nickname', function (e) {
			e.preventDefault();
			var $this = $(this);
			player.data('load')($this.data('pid'));
		});

		domElem.data('load', function (data) {
			loader.appendTo(domElem);
			var ids = getIds(data.stats.accounts);
			params.api
				.getNickNames(ids)
				.then(function (nicknames) {
					body.html(tpl(data, nicknames));
					domElem.trigger('loaded');
					loader.detach();
				});
		}.bind(domElem));

		return domElem;
	};
};

var Match = function (params) {
	var $ = params.$;

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
		var replay = function (link) {
			return link ? `<a href="http://${decodeURIComponent(link)}" target="_blank">${i18n.replay}</a>` : '';
		};

		return `<h3>${i18n.id} ${data.id}</h3>
					<h4>${stats.name} (${stats.weather}) &mdash; ${stats.mode}</h4>
					<small>
						${i18n.time_start} ${stats.time_start},
						${i18n.duration} ${stats.game_duration}${i18n.durationMetric}
					</small>
					<div>
						${replay(stats.replay_path)}
					</div>`;
	};

	return function (options) {
		options = options || {};

		var domElem = $('<div>', {
			className: 'match-info',
			html: '<div class="loading">Loading...</div>'
		});

		var loader = domElem.find('.loading');
		loader.detach();

		var info = $('<div>');
		info.appendTo(domElem);

		var details = (new Results(params))(options);
		details.appendTo(domElem);

		var player;

		domElem.data('setPlayer', function (component) {
			details.data('setPlayer')(component);
			return player = component;
		});

		domElem.data('load', function (matchId) {
			loader.appendTo(domElem);
			params.api
				.matchInfo(matchId)
				.then(function (data) {
					info.html(tpl(data));
					details.data('load')(data);
					domElem.trigger('loaded');
					loader.detach();
				});
		}.bind(domElem));

		return domElem;
	};
};

var Search = function (params) {
	var $ = params.$;

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
			className: 'match-search',
			html: `<h1>${i18n.title}</h1>
						<label>
							${i18n.matchId}:
							<input name="matchId" type="number" value="${params.storage.get(storageKey)}" />
						</label>
						<input type="submit" value="${i18n.find}" />`
		});

		var match;
		if (options.match) {
			match = options.match;
		} else {
			match = (new Match(params))();
			match.appendTo(domElem);
		}

		domElem.on('submit', function (e) {
			e.preventDefault();

			var matchId = Number(this.matchId.value);

			if (isNaN(matchId)) {
				return console.error('wrong type of matchId');
			}

			params.storage.set(storageKey, matchId);

			match.data('load')(matchId);
		});

		return domElem;
	};
};

var Latest = function (params) {
	var $ = params.$;

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
			className: 'match-latest',
			html: '<h1 class="match-latest__title">' + i18n.title + '</h1>' +
			'<div class="loading">Loading...</div>'
		});

		var title  = domElem.find('.match-latest__title');
		var loader = domElem.find('.loading');

		var match;
		if (options.match) {
			match = options.match;
		} else {
			match = (new Match(params))();
			match.appendTo(domElem);
		}

		var updateTitle = function (id) {
			title.html(`${i18n.title}: <span class="match-latest__number" data-id="${id}">${id}</span>`);
			return id;
		};

		domElem.on('click', '.match-latest__number', function (e) {
			e.preventDefault();
			match.data('load')($(this).data('id'));
		});

		params.api
			.maxMatch()
			.then(updateTitle)
			.then(function () {
				loader.detach();
				domElem.trigger('loaded');
			});

		return domElem;
	};
};

module.exports = {
	Match  : Match,
	Results: Results,
	Search : Search,
	Latest : Latest
};
