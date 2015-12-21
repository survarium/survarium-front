var utils = require('./utils');
var Match = require('./match');
var Pagination = require('./pagination');

var Matches = function (params) {
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
			match = (new Match.Match(params))();
			match.appendTo(domElem);
		}

		var pagination = (new Pagination(params))();
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
};

var Info = function (params) {
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
					  <dd>${utils.kdRatio(kill, die)}</dd>

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
			matches = (new Matches(params))({ match: options.match });
			matches.appendTo(domElem);
		}

		domElem.data('load', function (data) {
			info.html(tpl(data));
			matches.data('load')(data.pid, data.matchCount);
			domElem.trigger('loaded');
		});

		return domElem;
	};
};

var Search = function (params) {
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
			player = (new Info(params))();
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
};

module.exports = {
	Matches: Matches,
	Info   : Info,
	Search : Search
};
