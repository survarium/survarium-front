require('../../styl/def-list.styl');
require('../../styl/clan/details.styl');

var Loader = require('../loader');
var Error  = require('../error');
var utils  = require('../utils');
var I18N   = require('../i18n');

require('datatables.net');
var Highcharts = require('../charts');

module.exports = function (params) {
	var $        = params.$;
	var api      = params.api;
	var language = params.language;
	var counters = params.counters;

	var i18n = I18N.load(language, {
		russian: {
			title: 'Клан'
		},
		english: {
			title: 'Clan'
		}
	});

	var Ranks = {
		commander: 99,
		assistant: 80,
		warlord  : 50,
		soldier  : 10
	};

	var Class = function () {
		this.elem = $('<div>', {
			class: 'clan__info'
		});

		this._loader = new (Loader(params))();
		this._loader.elem.appendTo(this.elem);

		this._error = new (Error(params))();
		this._error.elem.appendTo(this.elem);

		this.elem.append([this.title = $('<h3>', { class: 'clan__title title' }), this.info = $('<div>', { class: 'clan__details' })]);
	};

	Class.prototype.load = function (abbr, opts) {
		if (this._current === abbr || !abbr) {
			return;
		}
		var self = this;
		opts     = opts || {};

		self._loader.show();
		self._error.hide();
		self._data = {};

		return api.clan(abbr, { publicStats: true })
			.then(function (clan) {
				self._data = clan;
				self._setCurrent(clan.abbr, opts);
				self._render(clan);
			})
			.fail(self._error.show.bind(self._error))
			.always(self._loader.hide.bind(self._loader));
	};

	Class.prototype._setCurrent = function (abbr, opts) {
		utils.setQuery({ clan: abbr }, {
			replace: true,
			title  : [i18n.title, abbr],
			noStory: opts.noStory
		});
		this._current = abbr;
		clearTimeout(this._currentUnset);
		this._currentUnset = setTimeout(function () {
			this._current = null;
		}.bind(this), 5000);
	};

	Class.prototype._prepareStats = function (data) {
		var id      = data.id;
		var matches = data.matches || [];
		return matches.map(function (stat) {
			stat.clanwar.clans.forEach(function (result) {
				if (result.clan.id === id) {
					stat.clanwar.victory = result.win;
					stat.clanwar.clan    = result;
				} else {
					stat.clanwar.opponent = result;
				}
			});
			stat.clanwar.score = [stat.clanwar.clan.total.score, stat.clanwar.opponent.total.score];
			stat.clanwar.kills = [stat.clanwar.clan.total.kills, stat.clanwar.opponent.total.kills];
			return stat;
		});
	};

	Class.prototype._stats = function (data) {
		var stats      = this._prepareStats(data);
		var statsTable = this.statsTable;
		if (statsTable) {
			utils.updateTable(this.statsTableApi, stats);
			return;
		}
		var wrap   = $(`<div class="clan__players-wrap"><h3>${i18n.CWmatches}</h3></div>`);
		statsTable = this.statsTable = $('<table>', {
			id: 'clan__cw'
		});
		statsTable.appendTo(wrap);
		wrap.appendTo(this.elem);
		statsTable.dataTable({
			dom       : 'frtip',
			scroller  : true,
			buttons   : false,
			data      : stats,
			responsive: true,
			columnDefs: [{
				className: 'foo',
				targets  : [2]
			}, {
				targets   : [2],
				searchable: true
			}, {
				className : 'dataTable__cell_centered',
				targets   : '_all',
				searchable: false,
				orderSequence: ['desc', 'asc']
			}],
			columns   : [{
				title : i18n.date,
				data  : 'date',
				render: function (data) {
					return utils.timeParse(data);
				}
			}, {
				title : i18n.win,
				data  : 'clanwar.victory',
				render: function (data) {
					return data ? i18n.win : i18n.loose;
				}
			}, {
				title: i18n.opponent,
				data : 'clanwar.opponent.clan.abbr'
			}, {
				title : i18n.score,
				data  : 'clanwar.score',
				render: function (data) {
					return data.join(' : ');
				}
			}, {
				title : i18n.kills,
				data  : 'clanwar.kills',
				render: function (data) {
					return data.join(' : ');
				}
			}, {
				title: i18n.level,
				data : `level`
			}, {
				title: i18n.map,
				data : `map.lang.${language}.name`
			}, {
				title: i18n.mode,
				data : `map.lang.${language}.mode`
			}]
		});

		var api = this.statsTableApi = statsTable.api();
		var self = this;
		statsTable
			.on('click', 'tr', function () {
				var data = api.row(this).data();
				if (!data) {
					return;
				}
				counters.goal('Match', {
					action: 'from:clan',
					value : self._data.abbr
				});
				self.Pane.emit({
					pane : 'match',
					event: 'load',
					value: api.row(this).data().id
				});
			});
	};

	Class.prototype._players = function (stats) {
		var playersTable = this.playersTable;
		if (playersTable) {
			utils.updateTable(this.playersTableApi, stats);
			return;
		}
		var wrap     = $(`<div class="clan__players-wrap"><h3>${i18n.members}</h3></div>`);
		playersTable = this.playersTable = $('<table>', {
			id: 'clan__players'
		});
		playersTable.appendTo(wrap);
		wrap.appendTo(this.elem);
		playersTable.dataTable({
			scroller  : false,
			paging    : false,
			buttons   : ['colvis', {
				extend: 'colvisGroup',
				text  : i18n.dt.basic,
				show  : [0, 1, 2, 3, 5, 6],
				hide  : [4, 7, 8, 9, 10, 11, 12, 13]
			}, {
				extend: 'colvisGroup',
				text  : i18n.dt.actions,
				show  : [1, 7, 8, 9, 10, 11, 12, 13],
				hide  : [0, 2, 3, 4, 5, 6]
			}, {
				extend: 'colvisGroup',
				text  : i18n.dt.all,
				show  : ':hidden'
			}],
			data      : stats,
			columnDefs: [{
				className: 'foo',
				targets  : [0, 1]
			}, {
				targets   : [0, 1],
				searchable: true
			}, {
				className : 'dataTable__cell_centered',
				targets   : '_all',
				searchable: false,
				orderSequence: ['desc', 'asc']
			}, {
				visible: false,
				targets: [4, 7, 8, 9, 10, 11, 12, 13]
			}],
			order     : [[0, 'desc']],
			columns   : [{
				title : i18n.role,
				data  : `role`,
				render: function (data, type, row) {
					if (type === 'sort') {
						return Ranks[data] === undefined ? '0' + (i18n.roles[row.role] || row.role) : Ranks[data];
					}
					if (type === 'type') {
						return 'num';
					}
					return i18n.roles[row.role] || row.role.capitalize();
				}
			}, {
				title: i18n.player,
				data : 'player.nickname'
			}, {
				title: i18n.level,
				data : 'player.progress.level'
			}, {
				title: i18n.kills,
				data : 'player.total.kills'
			}, {
				title: i18n.dies,
				data : 'player.total.dies'
			}, {
				title: i18n.kd,
				data : 'player.total.kd'
			}, {
				title: i18n.wins,
				data : 'player.total.victories'
			}, {
				title: i18n.headshots.full,
				data : 'player.total.headshots'
			}, {
				title: i18n.grenadeKills.full,
				data : 'player.total.grenadeKills'
			}, {
				title: i18n.meleeKills.full,
				data : 'player.total.meleeKills'
			}, {
				title: i18n.artefactKills.full,
				data : 'player.total.artefactKills'
			}, {
				title: i18n.artefactUses.full,
				data : 'player.total.artefactUses'
			}, {
				title: i18n.pointCaptures.full,
				data : 'player.total.pointCaptures'
			}, {
				title: i18n.boxesBringed.full,
				data : 'player.total.boxesBringed'
			}]
		});

		var api = this.playersTableApi = playersTable.api();
		var self = this;
		playersTable
			.on('click', 'tr', function () {
				var data = api.row(this).data();
				if (!data) {
					return;
				}
				counters.goal('Player', {
					action: 'from:clan',
					value : self._data.abbr
				});
				self.Pane.emit({
					pane : 'player',
					event: 'load',
					value: api.row(this).data().player.nickname
				});
			});
	};

	Class.prototype._graphData = function (totals) {
		return [{
			chart: {
				type           : 'solidgauge',
				backgroundColor: 'transparent'
			},
			title: null,
			pane : {
				center    : ['50%', '85%'],
				size      : '140%',
				startAngle: -90,
				endAngle  : 90,
				background: {
					backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
					innerRadius    : '60%',
					outerRadius    : '100%',
					shape          : 'arc'
				}
			},

			tooltip    : {
				enabled: false
			},
			yAxis      : {
				stops            : [[0.1, '#DF5353'], // red
				                    [0.5, '#DDDF0D'], // yellow
				                    [0.9, '#55BF3B']  // green

				],
				lineWidth        : 0,
				minorTickInterval: null,
				tickPixelInterval: 400,
				tickWidth        : 0,
				labels           : {
					y: 16
				},
				min              : 0,
				max              : 100,
				title            : {
					text: i18n.winrate,
					y   : -70
				}
			},
			plotOptions: {
				solidgauge: {
					dataLabels: {
						y          : 5,
						borderWidth: 0,
						useHTML    : true
					}
				}
			},
			credits    : {
				enabled: false
			},
			series     : [{
				name      : i18n.winrate,
				data      : [+(totals.kd = totals.victories / totals.matches * 100).toFixed(2)],
				dataLabels: {
					format: '<div style="text-align:center"><span style="font-size:25px;color:' + ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' + '<span style="font-size:12px;color:silver">%</span></div>'
				},
				tooltip   : {
					valueSuffix: ' %'
				}
			}]
		}];
	};

	Class.prototype._graph = function (totals) {
		if (this.charts) {
			return this._graphUpdate(totals);
		}

		var graph = this.graph;
		if (!graph) {
			graph = $('<div>', { class: 'clan__graph' });
			graph.insertAfter(this.title);
		}

		this.charts = this._graphData(totals).map(function (dataset) {
			var elem     = $('<div>', { class: 'clan__stats-chart' }).appendTo(graph);
			var chart    = new Highcharts.Chart(Highcharts.merge({ chart: { renderTo: elem[0] } }, dataset));
			chart.__elem = elem;
			return chart;
		});
	};

	Class.prototype._graphUpdate = function (totals) {
		var charts = this.charts;
		if (!charts || !charts.length) {
			return;
		}
		var data = this._graphData(totals);
		charts.forEach(function (chart, i) {
			var series = data[i].series;
			series.forEach(function (serie, j) {
				chart.series[j].setData(serie.data, false);
			});
			chart.redraw(300);
		});
	};

	Class.prototype._render = function (data) {
		data.total && this._graph(data.total);
		data.total = data.total || {};
		this._players(data.players);
		//this._stats(data); // FIXME: wait for proper data
		this.Pane.emit({
			pane : 'clan',
			event: 'public',
			value: data.abbr
		});
		var html = `<h4 class="def-list__title">${i18n.progress}</h4>
			<div class="def-list__values">
				` + (data.foundation ? `
				<dl class="def-list">
					<dt class="def-list__term">${i18n.established}</dt>
					<dd class="def-list__desc">${utils.timeParse(data.foundation)}</dd>
				</dl>` : ``) +

			`<dl class="def-list">
					<dt class="def-list__term">${i18n.level}</dt>
					<dd class="def-list__desc">${data.level}</dd>
				</dl>

				<dl class="def-list">
				  <dt class="def-list__term">${i18n.rating}</dt>
				  <dd class="def-list__desc">${data.elo}</dd>
				</dl>

				<dl class="def-list">
				  <dt class="def-list__term">${i18n.winrate}</dt>
				  <dd class="def-list__desc">${(data.total.kd || 0).toFixed(2)}%</dd>
				</dl>

				<dl class="def-list">
				  <dt class="def-list__term">${i18n.totalMatches}</dt>
				  <dd class="def-list__desc">${data.total.matches || 0}</dd>
				</dl>


				<dl class="def-list">
				  <dt class="def-list__term">${i18n.victories}</dt>
				  <dd class="def-list__desc">${data.total.victories || 0}</dd>
				</dl>
			</div>

			<h4 class="def-list__title">${i18n.actions}</h4>
			<div class="def-list__values">
				<dl class="def-list">
				  <dt class="def-list__term">${i18n.kills}</dt>
				  <dd class="def-list__desc">${data.total.kills || 0}</dd>

				</dl>

				<dl class="def-list">
				  <dt class="def-list__term">${i18n.dies}</dt>
				  <dd class="def-list__desc">${data.total.dies || 0}</dd>

				</dl>

				<dl class="def-list">
				  <dt class="def-list__term">${i18n.kd}</dt>
				  <dd class="def-list__desc">${utils.kd(data.total.kills || 0, data.total.dies || 0)}</dd>
				</dl>
			</div>

			<h4 class="def-list__title">${i18n.details}</h4>
			<div class="def-list__values">
				<dl class="def-list">
				  <dt class="def-list__term">${i18n.headshots.full}</dt>
				  <dd class="def-list__desc">${data.total.headshots || 0}</dd>

				</dl>

				<dl class="def-list">
				  <dt class="def-list__term">${i18n.grenadeKills.full}</dt>
				  <dd class="def-list__desc">${data.total.grenadeKills || 0}</dd>

				</dl>

				<dl class="def-list">
				  <dt class="def-list__term">${i18n.meleeKills.full}</dt>
				  <dd class="def-list__desc">${data.total.meleeKills || 0}</dd>
				</dl>

				<dl class="def-list">
				  <dt class="def-list__term">${i18n.artefactKills.full}</dt>
				  <dd class="def-list__desc">${data.total.artefactKills || 0}</dd>
				</dl>

				<dl class="def-list">
				  <dt class="def-list__term">${i18n.pointCaptures.full}</dt>
				  <dd class="def-list__desc">${data.total.pointCaptures || 0}</dd>
				</dl>

				<dl class="def-list">
				  <dt class="def-list__term">${i18n.boxesBringed.full}</dt>
				  <dd class="def-list__desc">${data.total.boxesBringed || 0}</dd>
				</dl>

				<dl class="def-list">
				  <dt class="def-list__term">${i18n.artefactUses.full}</dt>
				  <dd class="def-list__desc">${data.total.artefactUses || 0}</dd>
				</dl>
			</div>`;
		this.title.text(`[${data.abbr}] ${data.name}`);
		return this.info.html(html);
	};

	return Class;
};
