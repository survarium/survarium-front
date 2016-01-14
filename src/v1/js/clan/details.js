require('../../styl/def-list.styl');
require('../../styl/clan/details.styl');

var Loader = require('../loader');
var Error  = require('../error');
var utils  = require('../utils');

require('datatables.net');
var Highcharts = require('../charts');

module.exports = function (params) {
	var $        = params.$;
	var api      = params.api;
	var language = params.language;

	var i18n = {
		russian: {
			id          : 'ID',
			date        : 'Дата',
			level       : 'Уровень',
			win         : 'Победа',
			wins        : 'Побед',
			map         : 'Карта',
			mode        : 'Режим',
			loose       : 'Проигрыш',
			score       : 'Счет',
			kills       : 'Убийств',
			dies        : 'Смертей',
			kd          : 'У/С',
			player      : 'Имя',
			members     : 'Участники',
			matches     : 'Матчи',
			role        : 'Роль',
			rating      : 'Рейтинг',
			winrate     : 'Винрейт',
			victories   : 'Побед',
			totalMatches: 'Всего матчей',
			actions     : 'Действия',
			details     : 'Детали',
			dt          : {
				basic  : 'Общее',
				actions: 'Действия',
				all    : 'Показать все'
			},
			roles       : {
				commander: 'Командир',
				warlord  : 'Военачальник',
				assistant: 'Зам. командира',
				soldier  : 'Рядовой'
			}
		},
		english: {
			id          : 'ID',
			data        : 'Date',
			win         : 'Win',
			wins        : 'Wins',
			map         : 'Map',
			mode        : 'Mode',
			loose       : 'Loose',
			level       : 'Level',
			score       : 'Score',
			kills       : 'Kills',
			dies        : 'Dies',
			kd          : 'K/D',
			player      : 'Name',
			members     : 'Members',
			matches     : 'Matches',
			role        : 'Role',
			rating      : 'Rating',
			winrate     : 'Winrate',
			victories   : 'Victories',
			totalMatches: 'Total matches',
			details     : 'Details',
			actions     : 'Actions',
			dt          : {
				basic  : 'Basic',
				actions: 'Actions',
				all    : 'Show all'
			},
			roles       : {}
		}
	}[language];

	var _actionsI18N = {
		headshots    : {
			russian: 'Хедшоты',
			english: 'Headshots',
			abbr   : 'HS'
		},
		grenadeKills : {
			russian: 'Убийств гранатами',
			english: 'Grenade kills',
			abbr   : 'G'
		},
		meleeKills   : {
			russian: 'Убийств прикладом',
			english: 'Melee kills',
			abbr   : 'M'
		},
		artefactKills: {
			russian: 'Убийств артефактами',
			english: 'Artefacts kills',
			abbr   : 'AK'
		},
		pointCaptures: {
			russian: 'Захватов точек',
			english: 'Point captures',
			abbr   : 'CAP'
		},
		boxesBringed : {
			russian: 'Принесено ящиков',
			english: 'Boxes bringed',
			abbr   : 'BB'
		},
		artefactUses : {
			russian: 'Использований артефактов',
			english: 'Artifacts usages',
			abbr   : 'AU'
		}
	};

	Object.keys(_actionsI18N).reduce(function (i18n, action) {
		i18n[action] = {
			full: _actionsI18N[action][language],
			abbr: _actionsI18N[action].abbr
		};
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

		this.elem.append([
			this.title = $('<h3>', { class: 'clan__title' }),
			this.info = $('<div>', { class: 'clan__details' })
		]);
	};

	Class.prototype.load = function (abbr, opts) {
		if (this._current === abbr) {
			return;
		}
		var self = this;
		opts     = opts || {};

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
		var wrap   = $(`<div class="clan__players-wrap"><h3>${i18n.matches}</h3></div>`);
		statsTable = this.statsTable = $('<table>', {
			id: 'clan__stats'
		});
		statsTable.appendTo(wrap);
		wrap.appendTo(this.elem);
		statsTable.dataTable({
			scroller  : true,
			buttons   : ['colvis', {
				extend: 'colvisGroup',
				text  : i18n.dt.basic,
				show  : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
				hide  : [10, 11, 12, 13, 14, 15, 16]
			}, {
				extend: 'colvisGroup',
				text  : i18n.dt.actions,
				show  : [5, 10, 11, 12, 13, 14, 15, 16],
				hide  : [0, 1, 2, 3, 4, 6, 7, 8, 9]
			}, {
				extend: 'colvisGroup',
				text  : i18n.dt.all,
				show  : ':hidden'
			}],
			data      : stats,
			columnDefs: [{
				className: 'foo',
				targets  : [2]
			}, {
				targets   : [2, 3, 4],
				searchable: true
			}, {
				className : 'dataTable__cell_centered',
				targets   : '_all',
				searchable: false
			}, {
				visible: false,
				targets: [8, 9, 10, 11, 12, 13, 14, 15]
			}],
			stateSave : true,
			columns   : [{
				title : i18n.date,
				data  : 'date',
				render: function (data) {
					return utils.timeParse(data);
				}
			}, {
				title : i18n.win,
				data  : 'victory',
				render: function (data) {
					return data ? i18n.win : i18n.loose;
				}
			}, {
				title: i18n.map,
				data : `map.lang.${language}.name`
			}, {
				title: i18n.mode,
				data : `map.lang.${language}.mode`
			}, {
				title: i18n.level,
				data : `match.level`
			}, {
				title: i18n.player,
				data : 'player.nickname'
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

		var api = this.statsTableApi = statsTable.api();
		var self = this;
		statsTable
			.on('click', 'tr', function () {
				var data = api.row(this).data();
				if (!data) {
					return;
				}
				self.Pane.emit({
					pane : 'match',
					event: 'load',
					value: api.row(this).data().match.id
				});
			});
	};

	Class.prototype._players = function (stats) {
		var playersTable = this.playersTable;
		if (playersTable) {
			this.playersTableApi.clear().rows.add(stats).draw();
			return;
		}
		var wrap     = $(`<div class="clan__players-wrap"><h3>${i18n.members}</h3></div>`);
		playersTable = this.playersTable = $('<table>', {
			id: 'clan__players'
		});
		playersTable.appendTo(wrap);
		wrap.appendTo(this.elem);
		playersTable.dataTable({
			scroller  : true,
			buttons   : ['colvis', {
				extend: 'colvisGroup',
				text  : i18n.dt.basic,
				show  : [0, 1, 2, 3, 4, 5, 6],
				hide  : [7, 8, 9, 10, 11, 12, 13]
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
				searchable: false
			}, {
				visible: false,
				targets: [8, 9, 10, 11, 12, 13]
			}],
			stateSave : true,
			columns   : [{
				title : i18n.role,
				data  : `role`,
				render: function (data) {
					return i18n.roles[data] || data.capitalize();
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
				self.Pane.emit({
					pane : 'player',
					event: 'load',
					value: api.row(this).data().player.nickname
				});
			});
	};

	Class.prototype._graphData = function (totals) {
		return [
			{
				chart: {
					type: 'solidgauge'
				},

				title: null,

				pane: {
					center: ['50%', '85%'],
					size: '140%',
					startAngle: -90,
					endAngle: 90,
					background: {
						backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
						innerRadius: '60%',
						outerRadius: '100%',
						shape: 'arc'
					}
				},

				tooltip: {
					enabled: false
				},

				// the value axis
				yAxis: {
					stops: [
						[0.1, '#DF5353'], // red
						[0.5, '#DDDF0D'], // yellow
						[0.9, '#55BF3B']  // green

					],
					lineWidth: 0,
					minorTickInterval: null,
					tickPixelInterval: 400,
					tickWidth: 0,
					labels: {
						y: 16
					},
					min: 0,
					max: 100,
					title: {
						text: i18n.winrate,
						y: -70
					}
				},

				plotOptions: {
					solidgauge: {
						dataLabels: {
							y: 5,
							borderWidth: 0,
							useHTML: true
						}
					}
				},
				credits: {
					enabled: false
				},
				series: [{
					name: i18n.winrate,
					data: [+(totals.kd = totals.victories / totals.matches * 100).toFixed(2)],
					dataLabels: {
						format: '<div style="text-align:center"><span style="font-size:25px;color:' +
						((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
						'<span style="font-size:12px;color:silver">%</span></div>'
					},
					tooltip: {
						valueSuffix: ' %'
					}
				}]
			}
		];
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
			var elem = $('<div>', { class: 'clan__stats-chart' }).appendTo(graph);
			var chart = new Highcharts.Chart(Highcharts.merge({ chart: { renderTo: elem[0] } }, dataset));
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

	Class.prototype.__attach = function (Pane) {
		this.Pane = Pane;
	};

	Class.prototype._render = function (data) {
		this._graph(data.total);
		this._players(data.players);
		this._stats(data.stats);
		var html = `<dl class="def-list">
						<dt class="def-list__term">${i18n.level}</dt>
						<dd class="def-list__desc">${data.level}</dd>
					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.rating}</dt>
					  <dd class="def-list__desc">${data.elo}</dd>
					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.winrate}</dt>
					  <dd class="def-list__desc">${(data.total.kd).toFixed(2)}%</dd>
					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.totalMatches}</dt>
					  <dd class="def-list__desc">${data.total.matches}</dd>
					</dl>


					<dl class="def-list">
					  <dt class="def-list__term">${i18n.victories}</dt>
					  <dd class="def-list__desc">${data.total.victories}</dd>
					</dl>

					<h4>${i18n.actions}</h4>
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
					  <dd class="def-list__desc">${utils.kd(data.total.kills, data.total.dies)}</dd>
					</dl>

					<h4>${i18n.details}</h4>
					<dl class="def-list">
					  <dt class="def-list__term">${i18n.headshots.full}</dt>
					  <dd class="def-list__desc">${data.total.headshots}</dd>

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
					  <dt class="def-list__term">${i18n.pointCaptures.full}</dt>
					  <dd class="def-list__desc">${data.total.pointCaptures}</dd>
					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.boxesBringed.full}</dt>
					  <dd class="def-list__desc">${data.total.boxesBringed}</dd>
					</dl>

					<dl class="def-list">
					  <dt class="def-list__term">${i18n.artefactUses.full}</dt>
					  <dd class="def-list__desc">${data.total.artefactUses}</dd>
					</dl>`;
		this.title.text(`[${data.abbr}] ${data.name}`);
		return this.info.html(html);
	};

	return Class;
};
