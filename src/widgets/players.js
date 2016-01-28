require('./players.styl');
require('../v1/styl/def-list.styl');

var config = require('../v1/js/config');
var utils  = require('../v1/js/utils');
var $      = config.$;
var api    = config.api;

var WIDGET = 'SurvariumPlayers';
var I18N   = {
	russian: {
		nickname     : 'Ник игрока',
		level        : 'Уровень',
		elo          : 'Рейтинг',
		matches      : 'Матчей',
		kills        : 'Убийств',
		dies         : 'Смертей',
		artefactKills: 'Убийств артефактами',
		artefactUses : 'Использовано артефактов',
		boxesBringed : 'Принесено ящиков',
		grenadeKills : 'Убийств гранатами',
		headshots    : 'Хедшоты',
		kd           : 'К/Д',
		meleeKills   : 'Убийств прикладом',
		pointCaptures: 'Точек захвачено',
		scoreAvg     : 'Ср.счет',
		victories    : 'Побед',
		winRate      : 'Винрейт',
		win          : 'Победа',
		loose        : 'Проигрыш',
		stats        : 'Статистика',
		lastMatch    : 'Последний матч',
		score        : 'Счет'
	},
	english: {
		nickname     : 'Nickname',
		level        : 'Level',
		elo          : 'Rating',
		matches      : 'Matches',
		kills        : 'Kills',
		dies         : 'Dies',
		artefactKills: 'Artifacts kills',
		artefactUses : 'Artifacts usage',
		boxesBringed : 'Brought boxes',
		grenadeKills : 'Grenade kills',
		headshots    : 'Headshots',
		kd           : 'KD',
		meleeKills   : 'Melee kills',
		pointCaptures: 'Captured points',
		scoreAvg     : 'Avg.Score',
		victories    : 'Victories',
		winRate      : 'Winrate',
		win          : 'Win',
		loose        : 'Loose',
		stats        : 'Stats',
		lastMatch    : 'Last match',
		score        : 'Score'
	}
};

/**
 * Widget constructor
 * @param {Object}   params
 * @param {String|*} params.target              Target DOM elem or its selector
 * @param {String}   [params.language=russian]  Language (russian, english)
 * @param {Function} [params.handleError]       Error handler
 * @param {Function} [params.handleData]        Data handler
 * @param {String}   [params.search]            Initial search string
 * @param {String}   [params.player]            Search player and hide search form (or list of pids)
 * @param {Boolean}  [params.byPID]             Player param is PID
 * @param {String}   [params.theme]             Add theme name to container class
 * @constructor
 */
function Widget(params) {
	if (!params) {
		return this.error('No params defined.');
	}

	var target = params.target;
	if (!target) {
		return this.error('No params.target defined.');
	}

	target = this.target = $(target);
	if (!target.length) {
		return this.error(`No element '${params.target} in document found.'`);
	}

	this.language    = ~['english'].indexOf(params.language) ? params.language : 'russian';
	this.i18n        = I18N[this.language];
	this.handleError = (typeof params.handleError === 'function') ? params.handleError : this.error.bind(this, null);
	this.handleData  = (typeof params.handleData  === 'function') ? params.handleData  : this._suggest.bind(this);
	this.theme       = params.theme;

	this.build();
	this.init(params);
}

Widget.prototype.build = function () {
	var elems = this.elems = {};

	var container = elems.elem = $('<div>', {
		class: `${WIDGET}`
	});

	if (this.theme) {
		container.addClass(`${WIDGET}_theme_${this.theme}`);
	}

	var search = elems.search = $('<input>', {
		minlength  : 2,
		name       : 'nickname',
		class      : `${WIDGET}__search`,
		value      : this.__search || '',
		placeholder: this.i18n.nickname
	});

	var suggest = elems.suggest = $('<div>', {
		class: `${WIDGET}__suggest ${WIDGET}__suggest_empty`
	});

	suggest
		.on('click', `.${WIDGET}__match, .${WIDGET}__clan, .${WIDGET}__nickname`, function (e) {
			e.stopPropagation();
		})
		.on('click', `.${WIDGET}__elem`, function (e) {
			e.preventDefault();
			var tab = window.open($(this).data('url'), '_blank');
			tab.focus();
		});

	this._initInput();

	this.target.empty().append(container.append([search, suggest]));
};

Widget.prototype.init = function (params) {
	if (params.player) {
		this.elems.search.detach();
		this.search(params.player, { pid: !!params.byPID });
	}
	params.search && this.elems.search.val(params.search) && this.search(params.search);
};

Widget.prototype._initInput = function () {
	var self   = this;
	var search = self.elems.search;
	var debouncer;
	search.on('keyup', function (e) {
		e.preventDefault();
		clearTimeout(debouncer);
		debouncer = setTimeout(function () {
			self.search(search.val());
		}, 500);
	});
};

Widget.prototype.clear = function () {
	this.elems.suggest.addClass(`${WIDGET}__suggest_empty`).empty();
};

Widget.prototype._suggest = function (results) {
	if (!results || !results.length) {
		return;
	}

	var self = this;
	var i18n = self.i18n;

	var statTpl = function (stats, data) {
		return stats.map(function (statName) {
			return `<span class="${WIDGET}__stat ${WIDGET}__stat_type_${statName} def-list">
				<span class="${WIDGET}__stat-name def-list__term">${i18n[statName]}</span>
				<span class="${WIDGET}__stat-value def-list__desc">${data[statName]}</span>
			</span>`
		}).join('');
	};

	this.clear();

	this.elems.suggest.append(results.map(function (elem) {
		elem.total.winRate = elem.total.winRate.toFixed(2) + '%';
		var stat           = elem.stats && elem.stats[0];

		return $('<div>', {
			class          : `${WIDGET}__elem`,
			'data-id'      : elem.id,
			'data-nickname': elem.nickname,
			'data-url'     : elem.url,
			html           : `<h2 class="${WIDGET}__player">` + (!elem.clan ? `` : `<a href="${elem.clan.url}" target="_blank" title="${elem.clan.name}" class="${WIDGET}__clan">${elem.clan.abbr}</a>`) + `<a href="${elem.url}" target="_blank" class="${WIDGET}__nickname">${elem.nickname}</a>
			</h2>
			<div class="${WIDGET}__stats">
				<div class="def-list__title">${i18n.stats}</div>
				<div class="def-list__values">
					<div class="${WIDGET}__stat ${WIDGET}__stat_type_progress">${statTpl(['level', 'elo'], elem.progress)}</div>
					<div class="${WIDGET}__stat ${WIDGET}__stat_type_total">${statTpl(['kills', 'dies', 'kd', 'matches', 'victories', 'winRate', 'scoreAvg', 'headshots', 'grenadeKills', 'meleeKills', 'artefactKills', 'artefactUses', 'boxesBringed', 'pointCaptures'], elem.total)}</div>
				</div>
			</div>
			` + (stat ? `<a class="${WIDGET}__match" data-id="${stat.match.id}" href="${stat.url}" target="_blank">
				<div class="def-list__title">${i18n.lastMatch}</div>
				<div class="def-list__values">
					<div class="${WIDGET}__match-date">${utils.timeParse(stat.date)}</div>
					<div class="${WIDGET}__match-name">${stat.map.lang[self.language].name} | ${stat.map.lang[self.language].mode} | ${stat.victory ? i18n.win : i18n.loose}</div>
					<div class="${WIDGET}__stat ${WIDGET}__stat_type_match">${statTpl(['kills', 'dies', 'kd', 'score', 'headshots', 'grenadeKills', 'meleeKills', 'artefactKills', 'artefactUses', 'boxesBringed', 'pointCaptures'], stat)}</div>
				</div>
			</a>` : `` )
		});
	})).removeClass(`${WIDGET}__suggest_empty`);

	return results;
};

Widget.prototype.search = function (search, options) {
	if (~[undefined, null, 0].indexOf(search)) {
		return;
	}
	search = search.trim();
	if (this.__search === search) {
		return;
	}

	if (search.length === 0) {
		return this.clear();
	}

	if (search.length < 2) {
		return;
	}

	options = options || {};

	this.__search = search;

	api
		.players({
			nickname : !options.pid ? this.__search : undefined,
			noexclude: true,
			lang     : this.language,
			pid      : options.pid ? this.__search : undefined
		})
		.then(this.handleData.bind(this))
		.fail(this.handleError);
};

Widget.prototype.error = function (msg, err) {
	throw err || new Error(`${WIDGET}: ${msg}`);
};

window[`${WIDGET}`] = Widget;
window[`${WIDGET}Ready`] && window[`${WIDGET}Ready`](Widget);
