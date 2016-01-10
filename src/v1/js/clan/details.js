require('../../styl/def-list.styl');

var Loader = require('../loader');
var Error  = require('../error');
var utils  = require('../utils');

require('datatables.net');

module.exports = function (params) {
	var $ = params.$;
	var api = params.api;
	var language = params.language;

	var i18n = {
		russian: {
			id: 'ID',
			date: 'Дата',
			clanLevel: 'Уровень клана',
			level  : 'Уровень',
			win    : 'Победа',
			wins   : 'Побед',
			map    : 'Карта',
			mode   : 'Режим',
			loose  : 'Проигрыш',
			score  : 'Счет',
			kills  : 'Убийств',
			dies   : 'Смертей',
			kd     : 'У/С',
			player : 'Имя',
			members: 'Участники',
			matches: 'Матчи',
			role   : 'Роль',
			dt     : {
				basic: 'Общее',
				actions: 'Действия',
				all: 'Показать все'
			},
			roles : {
				commander: 'Командир',
				warlord: 'Военачальник',
				assistant: 'Зам. командира',
				soldier: 'Рядовой'
			}
		},
		english: {
			id: 'ID',
			data: 'Date',
			clanLevel: 'Clan level',
			win    : 'Win',
			wins   : 'Wins',
			map    : 'Map',
			mode   : 'Mode',
			loose  : 'Loose',
			level  : 'Level',
			score  : 'Score',
			kills  : 'Kills',
			dies   : 'Dies',
			kd     : 'K/D',
			player : 'Name',
			members: 'Members',
			matches: 'Matches',
			role   : 'Role',
			dt     : {
				basic: 'Basic',
				actions: 'Actions',
				all: 'Show all'
			},
			roles: {

			}
		}
	}[language];

	var _actionsI18N = {
		headshots: { russian: 'Хедшоты', english: 'Headshots', abbr: 'HS' },
		grenadeKills: { russian: 'Убийств гранатами', english: 'Grenade kills', abbr: 'G' },
		meleeKills: { russian: 'Убийств прикладом', english: 'Melee kills', abbr: 'M' },
		artefactKills: { russian: 'Убийств артефактами', english: 'Artefacts kills', abbr: 'AK' },
		pointCaptures: { russian: 'Захватов точек', english: 'Point captures', abbr: 'CAP' },
		boxesBringed: { russian: 'Принесено ящиков', english: 'Boxes bringed', abbr: 'BB' },
		artefactUses: { russian: 'Использований артефактов', english: 'Artifacts usages', abbr: 'AU' }
	};

	Object.keys(_actionsI18N).reduce(function (i18n, action) {
		i18n[action] = { full: _actionsI18N[action][language], abbr: _actionsI18N[action].abbr };
		return i18n;
	}, i18n);

	var Class = function () {
		this.elem = $('<div>', {
			class: 'clan__info'
		});

		this._loader = new (Loader(params))();
		this._loader.elem.appendTo(this.elem);

		this._error = new (Error(params))();
		this._error.elem.appendTo(this.elem);

		this.info = $('<div>', { class: 'clan__details' })
			.appendTo(this.elem);
	};

	Class.prototype.load = function (abbr, opts) {
		if (this._current === abbr) {
			return;
		}
		var self = this;
		opts = opts || {};

		self._loader.show();
		self._error.hide();

		return api.clan(abbr)
			.then(function (clan) {
				self._setCurrent(abbr, opts);
				self._render(clan);
			})
			.fail(self._error.show.bind(self._error))
			.always(self._loader.hide.bind(self._loader));
	};

	Class.prototype._setCurrent = function (id, opts) {
		if (!opts.noStory) {
			utils.setQuery({ clan: id }, { replace: true });
		}
		this._current = id;
		clearTimeout(this._currentUnset);
		this._currentUnset = setTimeout(function () {
			this._current = null;
		}.bind(this), 5000);
	};

	Class.prototype._stats = function (stats) {
		var statsTable = this.statsTable;
		if (statsTable) {
			this.statsTableApi.clear().rows.add(stats).draw();
			return;
		}
		var wrap = $(`<div class="clan__players-wrap"><h3>${i18n.matches}</h3></div>`);
		statsTable = this.statsTable = $('<table>', {
			id: 'clan__stats'
		});
		statsTable.appendTo(wrap);
		wrap.appendTo(this.elem);
		statsTable.dataTable({
			scroller   : true,
			buttons    : [
				'colvis',
				{
					extend: 'colvisGroup',
					text: i18n.dt.basic,
					show: [ 0, 1, 2, 3, 4, 5, 6, 7 ],
					hide: [ 8, 9, 10, 11, 12, 13, 14, 15 ]
				},
				{
					extend: 'colvisGroup',
					text: i18n.dt.actions,
					show: [ 4, 8, 9, 10, 11, 12, 13, 14, 15 ],
					hide: [ 0, 1, 2, 3, 5, 6, 7 ]
				},
				{
					extend: 'colvisGroup',
					text: i18n.dt.all,
					show: ':hidden'
				}
			],
			data       : stats,
			columnDefs: [
				{ className: 'foo', targets: [2] },
				{ targets: [2, 3, 4], searchable: true },
				{ className: 'dataTable__cell_centered', targets: '_all', searchable: false },
				{ visible: false, targets: [ 8, 9, 10, 11, 12, 13, 14, 15 ] }
			],
			stateSave  : true,
			columns: [
				{
					title: i18n.date,
					data: 'date',
					render: function (data) {
						return utils.timeParse(data);
					}
				},
				{
					title: i18n.win,
					data: 'victory',
					render: function (data) {
						return data ? i18n.win : i18n.loose;
					}
				},
				{ title: i18n.map, data: `map.lang.${language}.name` },
				{ title: i18n.mode, data: `map.lang.${language}.mode` },
				{
					title: i18n.player,
					data: 'player.nickname'
				},
				{ title: i18n.score, data: 'score' },
				{ title: i18n.kills, data: 'kills' },
				{ title: i18n.dies, data: 'dies' },
				{ title: i18n.kd, data: 'kd' },
				{ title: i18n.headshots.full, data: 'headshots' },
				{ title: i18n.grenadeKills.full, data: 'grenadeKills' },
				{ title: i18n.meleeKills.full, data: 'meleeKills' },
				{ title: i18n.artefactKills.full, data: 'artefactKills' },
				{ title: i18n.artefactUses.full, data: 'artefactUses' },
				{ title: i18n.pointCaptures.full, data: 'pointCaptures' },
				{ title: i18n.boxesBringed.full, data: 'boxesBringed' }
			]
		});

		var api = this.statsTableApi = statsTable.api();
		var self = this;
		statsTable
			.on('click', 'tr', function () {
				var data = api.row(this).data();
				if (!data) {
					return;
				}
				self.Pane.emit({ pane: 'match', event: 'load', value: api.row(this).data().match.id });
			});
	};

	Class.prototype._players = function (stats) {
		var playersTable = this.playersTable;
		if (playersTable) {
			this.playersTableApi.clear().rows.add(stats).draw();
			return;
		}
		var wrap = $(`<div class="clan__players-wrap"><h3>${i18n.members}</h3></div>`);
		playersTable = this.playersTable = $('<table>', {
			id: 'clan__players'
		});
		playersTable.appendTo(wrap);
		wrap.appendTo(this.elem);
		playersTable.dataTable({
			scroller   : true,
			buttons    : [
				'colvis',
				{
					extend: 'colvisGroup',
					text: i18n.dt.basic,
					show: [ 0, 1, 2, 3, 4, 5, 6 ],
					hide: [ 7, 8, 9, 10, 11, 12, 13 ]
				},
				{
					extend: 'colvisGroup',
					text: i18n.dt.actions,
					show: [ 1, 7, 8, 9, 10, 11, 12, 13 ],
					hide: [ 0, 2, 3, 4, 5, 6 ]
				},
				{
					extend: 'colvisGroup',
					text: i18n.dt.all,
					show: ':hidden'
				}
			],
			data       : stats,
			columnDefs: [
				{ className: 'foo', targets: [0, 1] },
				{ targets: [0, 1], searchable: true },
				{ className: 'dataTable__cell_centered', targets: '_all', searchable: false },
				{ visible: false, targets: [ 8, 9, 10, 11, 12, 13 ] }
			],
			stateSave  : true,
			columns: [
				{
					title: i18n.role,
					data: `role`,
					render: function (data) {
						return i18n.roles[data] || data.capitalize();
					}
				},
				{
					title: i18n.player,
					data: 'player.nickname'
				},
				{ title: i18n.level, data: 'player.progress.level' },
				{ title: i18n.kills, data: 'player.total.kills' },
				{ title: i18n.dies, data: 'player.total.dies' },
				{ title: i18n.kd, data: 'player.total.kd' },
				{ title: i18n.wins, data: 'player.total.victories' },
				{ title: i18n.headshots.full, data: 'player.total.headshots' },
				{ title: i18n.grenadeKills.full, data: 'player.total.grenadeKills' },
				{ title: i18n.meleeKills.full, data: 'player.total.meleeKills' },
				{ title: i18n.artefactKills.full, data: 'player.total.artefactKills' },
				{ title: i18n.artefactUses.full, data: 'player.total.artefactUses' },
				{ title: i18n.pointCaptures.full, data: 'player.total.pointCaptures' },
				{ title: i18n.boxesBringed.full, data: 'player.total.boxesBringed' }
			]
		});

		var api = this.playersTableApi = playersTable.api();
		var self = this;
		playersTable
			.on('click', 'tr', function () {
				var data = api.row(this).data();
				if (!data) {
					return;
				}
				self.Pane.emit({ pane: 'player', event: 'load', value: api.row(this).data().player.nickname });
			});
	};

	Class.prototype.__attach = function (Pane) {
		this.Pane = Pane;
	};

	Class.prototype._render = function (data) {
		this._players(data.players);
		this._stats(data.stats);
		var html = `<h3 class="clan__info-title">[${data.abbr}] ${data.name}</h3>
					<dl class="def-list">
						<dt class="def-list__term">${i18n.clanLevel}</dt>
						<dd class="def-list__desc">${data.level}</dd>
					</dl>`;
		return this.info.html(html);
	};

	return Class;
};
