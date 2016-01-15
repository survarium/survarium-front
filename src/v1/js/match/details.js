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
			replay: 'Скачать реплей',
			level  : 'Уровень',
			time_start: 'Время начала',
			duration: 'Продолжительность',
			win    : 'Победа',
			loose  : 'Проигрыш',
			score  : 'Счет',
			kills  : 'Убийств',
			dies   : 'Смертей',
			kd     : 'У/С',
			player : 'Имя',
			team   : 'Команда',
			dt     : {
				basic: 'Общее',
				actions: 'Действия',
				all: 'Показать все'
			}
		},
		english: {
			id: 'ID',
			replay: 'Download replay',
			time_start: 'Time of start',
			duration: 'Duration',
			win    : 'Win',
			loose  : 'Loose',
			level  : 'Level',
			score  : 'Score',
			kills  : 'Kills',
			dies   : 'Dies',
			kd     : 'K/D',
			player : 'Name',
			team   : 'Team',
			dt     : {
				basic: 'Basic',
				actions: 'Actions',
				all: 'Show all'
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
			class: 'match__info'
		});

		this._loader = new (Loader(params))();
		this._loader.elem.appendTo(this.elem);

		this._error = new (Error(params))();
		this._error.elem.appendTo(this.elem);

		this.info = $('<div>', { class: 'match__details' })
			.appendTo(this.elem);
	};

	Class.prototype.load = function (id, opts) {
		if (this._current === id) {
			return;
		}
		var self = this;
		opts = opts || {};

		self._loader.show();
		self._error.hide();

		return (id === 'latest' ?
			api.latestMatch(opts.level) :
			api.match(id))
			.then(function (match) {
				self._setCurrent(id, opts);
				self._render(match);
			})
			.fail(self._error.show.bind(self._error))
			.always(self._loader.hide.bind(self._loader));
	};

	Class.prototype._setCurrent = function (id, opts) {
		if (!opts.noStory) {
			utils.setQuery({ match: id }, { replace: true });
		}
		this._current = id;
		clearTimeout(this._currentUnset);
		this._currentUnset = setTimeout(function () {
			this._current = null;
		}.bind(this), 5000);
	};

	Class.prototype._replay = function (link) {
		return link ? `<a href="http://${decodeURIComponent(link)}" target="_blank">${i18n.replay}</a>` : '';
	};

	Class.prototype._table = function (stats) {
		var table = this.table;
		if (table) {
			this.tableApi.clear().rows.add(stats).draw();
			return;
		}
		table = this.table = $('<table>', {
			id: 'match__details-table'
		});
		table.appendTo(this.elem);
		table.dataTable({
			paging     : false,
			scrollY    : null,
			filter     : false,
			info       : false,
			buttons    : [
				{
					extend: 'colvis',
					columns: ':gt(1)'
				},
				{
					extend: 'colvisGroup',
					text: i18n.dt.basic,
					show: [ 2, 3, 4, 5, 6 ],
					hide: [ 0, 1, 7, 8, 9, 10, 11, 12, 13]
				},
				{
					extend: 'colvisGroup',
					text: i18n.dt.actions,
					show: [ 2, 7, 8, 9, 10, 11, 12, 13],
					hide: [ 0, 1, 3, 4, 5, 6 ]
				},
				{
					extend: 'colvisGroup',
					text: i18n.dt.all,
					show: ':gt(1):hidden'
				}
			],
			data       : stats,
			columnDefs: [
				{ className: 'foo', targets: [2] },
				{ className: 'dataTable__cell_centered', targets: '_all' },
				{ visible: false, targets: [0, 1, 7, 8, 9, 10, 11, 12, 13] },
				{ orderData: [1, 3], targets: [1, 3] },
				{ orderData: [1, 2], targets: [2] }
			],
			drawCallback: function () {
				var api  = this.api();
				var rows = api.rows({ page:'current' }).nodes();
				var last = null;

				api.column(1, { page:'current' }).data().each(function (group, i) {
					if (last !== group) {
						$(rows).eq( i ).before(
							`<tr class="dataTable__row_group"><td colspan="12">${i18n.team}: ` + (!group ? 'A': 'B') + `</td></tr>`
						);
						last = group;
					}
				});
			},
			columns: [
				{
					title: i18n.win,
					data: 'victory',
					render: function (data) {
						return data ? i18n.win : i18n.loose;
					}
				},
				{
					title: i18n.team,
					data: 'team'
				},
				{
					title: i18n.player,
					data: 'player.nickname',
					render: function (data, type, row) {
						var clan = row.player.clan_meta;
						return (clan ? `<a href="#" class="player__clan" data-abbr="${clan.abbr}">[${clan.abbr}]</a> ` : '') +
								data;
					}
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

		var api = this.tableApi = table.api();
		var self = this;
		table
			.on('click', '.player__clan', function (e) {
				e.preventDefault();
				self.Pane.emit({ pane: 'clan', event: 'load', value: $(e.target).data('abbr') });
				return false;
			})
			/*.on('click', '.dataTable__row_group', function (e) {
				e.preventDefault();
				var currentOrder = api.order()[0];
				if ( currentOrder[0] === 1 && currentOrder[1] === 'asc' ) {
					api.order( [ 1, 'desc' ] ).draw();
				}
				else {
					api.order( [ 1, 'asc' ] ).draw();
				}
				return false;
			})*/
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
		this._table(data.stats);
		var map = data.map.lang[language];
		var html = `<h3 class="match__info-title">${i18n.id} ${data.id} / ${map.name} (${map.weather}) / ${map.mode}</h3>
					<dl class="def-list">
						<dt class="def-list__term">${i18n.time_start}</dt>
						<dd class="def-list__desc">${utils.timeParse(data.date)}</dd>
					</dl>

					<dl class="def-list">
						<dt class="def-list__term">${i18n.duration}</dt>
						<dd class="def-list__desc">${utils.duration(data.duration)}</dd>
					</dl>

					<dl class="def-list">
						<dt class="def-list__term">${i18n.level}</dt>
						<dd class="def-list__desc">${data.level}</dd>
					</dl>
					`
					+ (data.stats.length ?
					`<dl class="def-list">
						<dt class="def-list__term">${i18n.win}</dt>
						<dd class="def-list__desc">${(data.stats[0].victory && !data.stats[0].team) ? 'A' : 'B' }</dd>
					</dl>` : ``) +

					`<div>
						${this._replay(data.replay)}
					</div>`;
		return this.info.html(html);
	};

	return Class;
};
