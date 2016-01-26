require('../../styl/def-list.styl');
require('../../styl/match/details.styl');

var Loader = require('../loader');
var Error  = require('../error');
var utils  = require('../utils');
var I18N   = require('../i18n');

require('datatables.net');

module.exports = function (params) {
	var $        = params.$;
	var api      = params.api;
	var language = params.language;
	var counters = params.counters;

	var i18n = I18N.load(language, {
		russian: {
			title: 'Матч'
		},
		english: {
			title: 'Match'
		}
	});

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
		if (this._current === id || !id) {
			return;
		}
		var self = this;
		opts     = opts || {};

		self._loader.show();
		self._error.hide();
		self._data = {};

		return (id === 'latest' ? api.latestMatch(opts.level) : api.match(id))
			.then(function (match) {
				self._data = match;
				self._setCurrent(match.id, opts);
				self._render(match);
			})
			.fail(self._error.show.bind(self._error))
			.always(self._loader.hide.bind(self._loader));
	};

	Class.prototype._setCurrent = function (id, opts) {
		utils.setQuery({ match: id }, {
			replace: true,
			title  : [i18n.title, id],
			noStory: opts.noStory
		});
		this._current = id;
		clearTimeout(this._currentUnset);
		this._currentUnset = setTimeout(function () {
			this._current = null;
		}.bind(this), 5000);
	};

	Class.prototype._replay = function (link) {
		return link ? `<a href="http://${decodeURIComponent(link)}" target="_blank">${i18n.download}</a>` : '';
	};

	Class.prototype._table = function (stats) {
		var table = this.table;
		if (table) {
			utils.updateTable(this.tableApi, stats);
			return;
		}
		table = this.table = $('<table>', {
			id: 'match__details-table'
		});
		table.appendTo(this.elem);
		table.dataTable({
			paging      : false,
			scrollY     : null,
			filter      : false,
			info        : false,
			buttons     : [{
				extend : 'colvis',
				columns: ':gt(1)'
			}, {
				extend: 'colvisGroup',
				text  : i18n.dt.basic,
				show  : [2, 3, 4, 5, 6],
				hide  : [0, 1, 7, 8, 9, 10, 11, 12, 13]
			}, {
				extend: 'colvisGroup',
				text  : i18n.dt.actions,
				show  : [2, 7, 8, 9, 10, 11, 12, 13],
				hide  : [0, 1, 3, 4, 5, 6]
			}, {
				extend: 'colvisGroup',
				text  : i18n.dt.all,
				show  : ':gt(1):hidden'
			}],
			data        : stats,
			columnDefs  : [{
				className: 'foo',
				targets  : [2]
			}, {
				className: 'dataTable__cell_centered',
				targets  : '_all'
			}, {
				visible: false,
				targets: [0, 1, 7, 8, 9, 10, 11, 12, 13]
			}],
			order       : [[3, 'desc']],
			orderFixed  : [1, 'asc'],
			drawCallback: function () {
				var api  = this.api();
				var rows = api.rows({ page: 'current' }).nodes();
				var last = null;

				api.column(1, { page: 'current' }).data().each(function (group, i) {
					if (last !== group) {
						$(rows).eq(i).before(`<tr class="dataTable__row_group"><td colspan="12">${i18n.team}: ` + (!group ? 'A' : 'B') + `</td></tr>`);
						last = group;
					}
				});
			},
			columns     : [{
				title : i18n.win,
				data  : 'victory',
				render: function (data) {
					return data ? i18n.win : i18n.loose;
				}
			}, {
				title: i18n.team,
				data : 'team'
			}, {
				title : i18n.player,
				data  : 'player.nickname',
				render: function (data, type, row) {
					var clan = row.player.clan_meta;
					return (clan ? `<a href="#" class="player__clan" data-abbr="${clan.abbr}">[${clan.abbr}]</a> ` : '') + data;
				}
			}, {
				title: i18n.score,
				data : 'score'
			}, {
				title: i18n.kills,
				data : 'kills'
			}, {
				title: i18n.dies,
				data : 'dies'
			}, {
				title: i18n.kd,
				data : 'kd'
			}, {
				title: i18n.headshots.full,
				data : 'headshots'
			}, {
				title: i18n.grenadeKills.full,
				data : 'grenadeKills'
			}, {
				title: i18n.meleeKills.full,
				data : 'meleeKills'
			}, {
				title: i18n.artefactKills.full,
				data : 'artefactKills'
			}, {
				title: i18n.artefactUses.full,
				data : 'artefactUses'
			}, {
				title: i18n.pointCaptures.full,
				data : 'pointCaptures'
			}, {
				title: i18n.boxesBringed.full,
				data : 'boxesBringed'
			}]
		});

		var api = this.tableApi = table.api();
		var self = this;
		table
			.on('click', '.player__clan', function (e) {
				e.preventDefault();
				counters.goal('Clan', {
					action: 'from:match',
					value : self._data.id
				});
				self.Pane.emit({
					pane : 'clan',
					event: 'load',
					value: $(e.target).data('abbr')
				});
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
				counters.goal('Player', {
					action: 'from:match',
					value : self._data.id
				});
				self.Pane.emit({
					pane : 'player',
					event: 'load',
					value: api.row(this).data().player.nickname
				});
			});
	};

	Class.prototype._clanWar = function (stats) {
		var clanwar = {
			clans : [null, null],
			winner: true
		};
		stats.forEach(stat => {
			if (!clanwar.winner) {
				return;
			}
			let clan = stat.player.clan_meta;
			if (!clan) {
				return clanwar.winner = false;
			}
			if (clanwar.clans[stat.team] !== null && clanwar.clans[stat.team] !== clan.id) {
				return clanwar.winner = false;
			}
			if (stat.victory) {
				clanwar.winner = clan.abbr;
			}
			return clanwar.clans[stat.team] = clan.id;
		});
		if (clanwar.winner === true) {
			clanwar.winner = i18n.draw;
		}
		return clanwar;
	};

	Class.prototype._render = function (data) {
		this._table(data.stats);
		var map     = data.map.lang[language];
		var clanwar = this._clanWar(data.stats);
		var html    = `<h3 class="match__info-title title">${i18n.id} ${data.id} / ${map.name} (${map.weather}) / ${map.mode}</h3>
				<div class="def-list__values">
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
					` + (data.stats.length ? `<dl class="def-list">
						<dt class="def-list__term">${i18n.win}</dt>
						<dd class="def-list__desc">${clanwar.winner || ((data.stats[0].victory && !data.stats[0].team) ? 'A' : 'B') }</dd>
					</dl>` : ``) +

			`<dl class="def-list">
						<dt class="def-list__term">${i18n.replay}</dt>
						<dd class="def-list__desc">${this._replay(data.replay)}</dd>
					</dl>
				</div>`;
		return this.info.html(html);
	};

	return Class;
};
