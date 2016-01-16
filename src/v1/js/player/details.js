require('../../styl/def-list.styl');

var Loader = require('../loader');
var Error  = require('../error');
var utils  = require('../utils');

module.exports = function (params) {
	var $ = params.$;
	var api = params.api;
	var counters = params.counters;

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
			profile: 'Профиль',
			ammunition: 'Аммуниция',
			active: 'Активный',
			details: 'Детали',
			headshots: 'Хэдшоты',
			grenadeKills: 'Убийства гранатами',
			meleeKills: 'Убийства врукопашку',
			artefactKills: 'Убийства артефактами',
			pointCaptures: 'Захватов точек',
			boxesBringed: 'Принесено ящиков',
			artefactUses: 'Использований артефактов',
			winrate: 'Винрейт',
			scoreAvg: 'Средний счет'
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
			profile: 'Profile',
			ammunition: 'Ammunition',
			active: 'Active',
			details: 'Details',
			headshots: 'Headshots',
			grenadeKills: 'Grenade kills',
			meleeKills: 'Melee kills',
			artefactKills: 'Artefacts kills',
			pointCaptures: 'Point captured',
			boxesBringed: 'Boxes bringed',
			artefactUses: 'Artefacts used',
			winrate: 'Winrate',
			scoreAvg: 'Average score'
		}
	}[params.language];

	var Class = function () {
		var self = this;

		this.elem = $('<div>', {
			class: 'player__info'
		});

		this._loader = new (Loader(params))();
		this._loader.elem.appendTo(this.elem);

		this._error = new (Error(params))();
		this._error.elem.appendTo(this.elem);

		this.info = $('<div>', { class: 'player__details' })
			.appendTo(this.elem)
			.on('click', '.player__clan', function (e) {
				e.preventDefault();
				counters.goal('clan:from:player');
				self.Pane.emit({ pane: 'clan', event: 'load', value: $(e.target).data('abbr') });
				return false;
			})
	};

	Class.prototype.load = function (nick, opts) {
		if (this._current === nick) {
			return;
		}
		var self = this;
		opts = opts || {};

		self._loader.show();
		self._error.hide();
		return api
			.player(nick, { fullStats: true, byName: true })
			.then(function (player) {
				self._setCurrent(nick, opts);
				self._render(player);
				self.playerMatches && (self.playerMatches.load(player.stats));
			})
			.fail(self._error.show.bind(self._error))
			.always(self._loader.hide.bind(self._loader));
	};

	Class.prototype._setCurrent = function (nick, opts) {
		if (!opts.noStory) {
			utils.setQuery({ player: nick }, { replace: true });
		}
		counters.track('player', nick);
		this._current = nick;
		clearTimeout(this._currentUnset);
		this._currentUnset = setTimeout(function () {
			this._current = null;
		}.bind(this), 5000);
	};

	Class.prototype.attachPlayerMatches = function (instance) {
		return this.playerMatches = instance;
	};

	Class.prototype._render = function (data) {
		var clan = data.clan ? `<a class="player__clan" href="#" title="${data.clan.name}" data-abbr="${data.clan.abbr}">[${data.clan.abbr}]</a> `: '';
		var totals = `<h4>${i18n.progress}</h4>
					<dl class="def-list">
					  <dt class="def-list__term">${i18n.level}</dt>
					  <dd class="def-list__desc">${data.progress.level}</dd>
					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.rating}</dt>
					  <dd class="def-list__desc">${data.progress.elo}</dd>
					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.exp}</dt>
					  <dd class="def-list__desc">${data.progress.experience}</dd>
					</dl>

					<h4>${i18n.actions}</h4>
					<dl class="def-list">
					  <dt class="def-list__term">${i18n.kills}</dt>
					  <dd class="def-list__desc">${data.total.kills}</dd>

					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.deaths}</dt>
					  <dd class="def-list__desc">${data.total.dies}</dd>

					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.kdRatio}</dt>
					  <dd class="def-list__desc">${data.total.kd}</dd>
					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.victories}</dt>
					  <dd class="def-list__desc">${data.total.victories}</dd>
					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.looses}</dt>
					  <dd class="def-list__desc">${data.total.matches - data.total.victories}</dd>
					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.totalMatches}</dt>
					  <dd class="def-list__desc">${data.total.matches}</dd>
					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.winrate}</dt>
					  <dd class="def-list__desc">${(data.total.winRate).toFixed(2)} %</dd>
					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.scoreAvg}</dt>
					  <dd class="def-list__desc">${data.total.scoreAvg}</dd>
					</dl>

					<h4>${i18n.details}</h4>
					<dl class="def-list">
					  <dt class="def-list__term">${i18n.headshots}</dt>
					  <dd class="def-list__desc">${data.total.headshots}</dd>

					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.grenadeKills}</dt>
					  <dd class="def-list__desc">${data.total.grenadeKills}</dd>

					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.meleeKills}</dt>
					  <dd class="def-list__desc">${data.total.meleeKills}</dd>
					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.artefactKills}</dt>
					  <dd class="def-list__desc">${data.total.artefactKills}</dd>
					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.pointCaptures}</dt>
					  <dd class="def-list__desc">${data.total.pointCaptures}</dd>
					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.boxesBringed}</dt>
					  <dd class="def-list__desc">${data.total.boxesBringed}</dd>
					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.artefactUses}</dt>
					  <dd class="def-list__desc">${data.total.artefactUses}</dd>
					</dl>`;

		var html = `<h3 class="player__name">${clan}<span class="player__nick">${data.nickname}</span></h3>
		<div class="player__totals">${totals}</div>`;
		return this.info.html(html);
	};

	return Class;
};
