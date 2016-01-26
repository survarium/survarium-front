require('../../styl/def-list.styl');

var Loader = require('../loader');
var Error  = require('../error');
var utils  = require('../utils');
var I18N   = require('../i18n');

module.exports = function (params) {
	var $ = params.$;
	var api = params.api;
	var counters = params.counters;

	var i18n = I18N.load(params.language);

	var Class = function () {
		var self = this;

		this.elem = $('<div>', {
			class: 'player__info'
		});

		this._loader = new (Loader(params))();
		this._loader.elem.appendTo(this.elem);

		this._error = new (Error(params))();
		this._error.elem.appendTo(this.elem);

		self._data = {};

		this.info = $('<div>', { class: 'player__details' })
			.appendTo(this.elem)
			.on('click', '.player__clan', function (e) {
				e.preventDefault();
				counters.goal('Clan', { action: 'from:player', value: self._data.nickname });
				self.Pane.emit({ pane: 'clan', event: 'load', value: $(e.target).data('abbr') });
				return false;
			})
	};

	Class.prototype.load = function (nick, opts) {
		if (this._current === nick || !nick) {
			return;
		}
		var self = this;
		opts = opts || {};

		self._loader.show();
		self._error.hide();

		return api
			.player(nick, { fullStats: true, byName: true })
			.then(function (player) {
				self._data = player;
				self._setCurrent(player.nickname, opts);
				self._render(player);
				self.playerMatches && (self.playerMatches.load(player));
			})
			.fail(self._error.show.bind(self._error))
			.always(self._loader.hide.bind(self._loader));
	};

	Class.prototype._setCurrent = function (nick, opts) {
		utils.setQuery({ player: nick }, { replace: true, title: nick, noStory: opts.noStory });
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
		var totals = `<h4 class="def-list__title">${i18n.progress}</h4>
					<div class="def-list__values">
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
					</div>

					<h4 class="def-list__title">${i18n.actions}</h4>
					<div class="def-list__values">
						<dl class="def-list">
						  <dt class="def-list__term">${i18n.kills}</dt>
						  <dd class="def-list__desc">${data.total.kills}</dd>

						</dl>

						<dl class="def-list">
						  <dt class="def-list__term">${i18n.dies}</dt>
						  <dd class="def-list__desc">${data.total.dies}</dd>

						</dl>

						<dl class="def-list">
						  <dt class="def-list__term">${i18n.kd}</dt>
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
						  <dt class="def-list__term">${i18n.avgScore}</dt>
						  <dd class="def-list__desc">${data.total.scoreAvg}</dd>
						</dl>
					</div>

					<h4 class="def-list__title">${i18n.details}</h4>
					<div class="def-list__values">
						<dl class="def-list">
						  <dt class="def-list__term">${i18n.headshots.full}</dt>
						  <dd class="def-list__desc">${data.total.headshots}</dd>
						</dl>

						<dl class="def-list">
						  <dt class="def-list__term">${i18n.boxesBringed.full}</dt>
						  <dd class="def-list__desc">${data.total.boxesBringed}</dd>
						</dl>

						<dl class="def-list">
						  <dt class="def-list__term">${i18n.pointCaptures.full}</dt>
						  <dd class="def-list__desc">${data.total.pointCaptures}</dd>
						</dl>

						<dl class="def-list">
						  <dt class="def-list__term">${i18n.grenadeKills.full}</dt>
						  <dd class="def-list__desc">${data.total.grenadeKills}</dd>
						</dl>

						<dl class="def-list">
						  <dt class="def-list__term">${i18n.meleeKills.full}</dt>
						  <dd class="def-list__desc">${data.total.meleeKills}</dd>
						</dl>

						<dl class="def-list">
						  <dt class="def-list__term">${i18n.artefactKills.full}</dt>
						  <dd class="def-list__desc">${data.total.artefactKills}</dd>
						</dl>

						<dl class="def-list">
						  <dt class="def-list__term">${i18n.artefactUses.full}</dt>
						  <dd class="def-list__desc">${data.total.artefactUses}</dd>
						</dl>
					</div>`;

		var html = `<h3 class="player__name title">${clan}<span class="player__nick">${data.nickname}</span></h3>
		<div class="player__totals">${totals}</div>`;
		return this.info.html(html);
	};

	return Class;
};
