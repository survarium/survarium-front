require('../../styl/grid.styl');
require('../../styl/player/stats.styl');

var Loader = require('../loader');
var utils  = require('../utils');

require('datatables.net');
var Highcharts = require('../charts');

module.exports = function (params) {
	var $ = params.$;
	var lang = params.language;

	var i18n = {
		russian: {
			title  : 'Матчи игрока',
			noStats: 'Матчи не найдены',
			win    : 'Победа',
			loose  : 'Проигрыш',
			date   : 'Дата',
			map    : 'Карта',
			mode   : 'Режим',
			level  : 'Уровень',
			kdStat : 'У/С (KD)',
			score  : 'Счет',
			kills  : 'Убийств',
			dies   : 'Смертей',
			kd     : 'У/С',
			dt     : {
				basic: 'Общее',
				actions: 'Действия',
				all: 'Показать все'
			}
		},
		english: {
			title  : 'Player stats',
			noStats: 'Stats not found',
			win    : 'Win',
			loose  : 'Loose',
			date   : 'Date',
			map    : 'Map',
			mode   : 'Mode',
			level  : 'Level',
			kdStat : 'K/D (KD)',
			score  : 'Score',
			kills  : 'Kills',
			dies   : 'Dies',
			kd     : 'K/D',
			dt     : {
				basic: 'Basic',
				actions: 'Actions',
				all: 'Show all'
			}
		}
	}[lang];

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
		i18n[action] = { full: _actionsI18N[action][lang], abbr: _actionsI18N[action].abbr };
		return i18n;
	}, i18n);

	var Class = function () {
		this.elem = $('<div>', {
			class: 'player__stats'
		});

		this._loader = new (Loader(params))();
		this._loader.elem.appendTo(this.elem);
	};

	Class.prototype.__attach = function (Pane) {
		this.Pane = Pane;
	};

	Class.prototype.load = function (stats) {
		if (!stats || !stats.length) {
			return this._empty();
		}
		this._graph(stats);
		return this._table(stats);
	};

	Class.prototype._empty = function () {
		this.table && this.tableApi.clear().draw();
		this._graphClear();
		return this.elem.text(i18n.noStats);
	};

	Class.prototype._graphData = function (stats) {
		return stats.reverse().reduce(function (result, stat) {
			var time = (new Date(stat.date)).getTime();
			result[0].series[0].data.push([time, stat.score]);
			result[1].series[0].data.push([time, stat.kills]);
			result[1].series[1].data.push([time, stat.dies]);
			result[2].series[0].data.push([time, stat.match.level]);
			result[3].series[0].data.push([time, stat.kd]);
			return result;
		}, [
			{ name: 'Score', navigator: { enabled: false }, scrollbar: { enabled: false }, series: [{ name: 'Score', type: 'spline', data: [] }],
				color: Highcharts.getOptions().colors[0], fillOpacity: 0.3 },
			{ name: 'Kills & Deaths', navigator: { enabled: false }, scrollbar: { enabled: false }, series: [
				{ name: 'Kills', type: 'area', data: [],
					color: Highcharts.getOptions().colors[1], fillOpacity: 0.3, fillColor : {
					linearGradient : {
						x1: 0,
						y1: 0,
						x2: 0,
						y2: 1
					},
					stops : [
						[0, Highcharts.getOptions().colors[1]],
						[1, Highcharts.Color(Highcharts.getOptions().colors[1]).setOpacity(0).get('rgba')]
					]
				} },
				{ name: 'Dies' , type: 'spline', data: [],
					color: Highcharts.getOptions().colors[2], fillOpacity: 0.3 }
			] },
			{ name: 'Level', navigator: { enabled: false }, scrollbar: { enabled: false }, series: [{ name: 'Level', type: 'spline', data: [],
				color: Highcharts.getOptions().colors[3], fillOpacity: 0.3 }] },
			{ name: 'KD', navigator: { enabled: false }, scrollbar: { enabled: false }, series: [{ name: 'KD', type: 'spline', data: [],
				color: Highcharts.getOptions().colors[4], fillOpacity: 0.3 }] }
		]);
	};

	Class.prototype._graphUpdate = function (stats) {
		var charts = this.charts;
		if (!charts || !charts.length) {
			return;
		}
		var data = this._graphData(stats);
		charts.forEach(function (chart, i) {
			var series = data[i].series;
			series.forEach(function (serie, j) {
				chart.series[j].setData(serie.data, false);
			});
			chart.redraw(300);
		});
	};

	Class.prototype._graph = function (stats) {
		if (this.charts) {
			return this._graphUpdate(stats);
		}

		var graph = this.graph;
		if (!graph) {
			graph = $('<div>', { class: 'player__graph' });
			graph.appendTo(this.elem);
		}

		var charts = [];

		function syncExtremes(e) {
			var thisChart = this.chart;

			if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
				Highcharts.each(charts, function (chart) {
					if (chart !== thisChart) {
						if (chart.xAxis[0].setExtremes) { // It is null while updating
							chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, { trigger: 'syncExtremes' });
						}
					}
				});
			}
		}

		function resize() {
			var chart, i;
			for (i = 0; i < charts.length; i++) {
				chart = charts[i];
				if (chart.__elem) {
					chart.__pos = chart.__elem.offset();
					chart.__dim = {
						left: chart.__pos.left,
						right: chart.__pos.left + chart.__elem.width(),
						top: chart.__pos.top,
						bottom: chart.__pos.top + chart.__elem.height()
					};
				}
			}
		}
		var resizeDebounce;

		charts = this._graphData(stats).map(function (dataset) {
			var elem = $('<div>', { class: 'player__stats-chart' }).appendTo(graph);
			var chart = new Highcharts.StockChart({
				chart: {
					marginLeft: 40, // Keep all charts left aligned
					spacingTop: 20,
					spacingBottom: 20,
					zoomType: 'x',
					renderTo: elem[0],
					events: {
						redraw: function () {
							clearTimeout(resizeDebounce);
							resizeDebounce = setTimeout(resize, 300);
						}
					}
				},
				scrollbar: dataset.scrollbar || {},
				navigator: dataset.navigator || {},
				title: {
					text: dataset.name,
					align: 'left',
					margin: 0,
					x: 30
				},
				credits: {
					enabled: false
				},
				legend: {
					enabled: false
				},
				xAxis: {
					crosshair: true,
					events: {
						setExtremes: syncExtremes
					},
					type: 'datetime',
					dateTimeLabelFormats: { // don't display the dummy year
						month: '%e. %b',
						year: '%b'
					},
					title: {
						text: 'Date'
					}
				},
				yAxis: {
					title: {
						text: null
					}
				},
				tooltip: {
					positioner: function () {
						return {
							x: this.chart.chartWidth - this.label.width, // right aligned
							y: -1 // align to title
						};
					},
					borderWidth: 0,
					backgroundColor: 'none',
					headerFormat: '',
					shadow: false,
					style: {
						fontSize: '18px'
					},
					valueDecimals: 1
				},
				series: dataset.series
			});
			chart.__elem = elem;
			return chart;
		});

		this.charts = charts;

		resize();

		graph.bind('mousemove touchmove', 'player__stats-chart', this._graphSyncPoints.bind(this));
	};

	Class.prototype._graphInBounds = function (pos) {
		var charts = this.charts,
			left = pos.pageX,
		    top = pos.pageY,
		    i = 0,
		    dim,
		    len = charts.length;
		for (i; i < len; i++) {
			dim = charts[i].__dim;
			if (dim.left <= left && dim.right >= left && dim.top <= top && dim.bottom >= top) {
				return i;
			}
		}
	};

	Class.prototype._graphSyncPoints = function (e) {
		var trigger = this._graphInBounds(e);
		if (trigger === undefined) {
			return;
		}
		var charts = this.charts;
		var triggerChart = charts[trigger];
		var pos = {
			chartX: e.pageX - triggerChart.__dim.left,
			chartY: e.pageY - triggerChart.__dim.top
		};
		charts.forEach(function (chart, i) {
			if (i === trigger) {
				return;
			}
			var points = chart.series.map(function (serie) {
				var point = serie.searchPoint(pos, true); // Get the hovered point by XY axis distance
				point && point.onMouseOver(); // Show the hover marker
				return point;
			}).filter(Boolean);
			if (points && points.length) {
				chart.tooltip.refresh(points, pos); // Show the tooltip
				chart.xAxis[0].drawCrosshair(pos, points[0]); // Show the crosshair
			}
		});
	};

	Class.prototype._graphClear = function () {
		var charts = this.charts;
		if (!charts || !charts.length) {
			return;
		}
		charts.forEach(function (chart, i) {
			chart.__elem.remove();
			chart.destroy();
			charts[i] = null;
		});
		this.charts = null;
		this.graph.off('mousemove touchmove');
	};

	Class.prototype._table = function (stats) {
		var table = this.table;
		if (table) {
			return this.tableApi.clear().rows.add(stats).draw();
		}
		table = this.table = $('<table>', {
			id: 'player__stats'
		});
		table.appendTo(this.elem);
		table.dataTable({
			scroller   : true,
			buttons    : [
				'colvis',
				{
					extend: 'colvisGroup',
					text: i18n.dt.basic,
					show: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ],
					hide: [ 9, 10, 11, 12, 13, 14, 15 ]
				},
				{
					extend: 'colvisGroup',
					text: i18n.dt.actions,
					show: [ 1, 9, 10, 11, 12, 13, 14, 15 ],
					hide: [ 0, 2, 3, 4, 5, 6, 7, 8 ]
				},
				{
					extend: 'colvisGroup',
					text: i18n.dt.all,
					show: ':hidden'
				}
			],
			data       : stats,
			columnDefs: [
				{ className: 'dataTable__cell_centered', targets: [ 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ] },
				{ targets: [1, 2], searchable: true },
				{ targets: '_all', searchable: false },
				{ targets: [9, 10, 11, 12, 13, 14, 15], visible: false }
			],
			columns: [
				{
					title: i18n.date,
					data: 'date',
					render: function (data) {
						return utils.timeParse(data);
					}
				},
				{ title: i18n.map, data: `map.lang.${lang}.name` },
				{ title: i18n.mode, data: `map.lang.${lang}.mode` },
				{ title: i18n.level, data: 'match.level' },
				{
					title: i18n.win,
					data: 'victory',
					render: function (data) {
						return data ? i18n.win : i18n.loose;
					}
				},
				{ title: i18n.kills, data: 'kills' },
				{ title: i18n.dies, data: 'dies' },
				{ title: i18n.kd, data: 'kd' },
				{ title: i18n.score, data: 'score' },
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
		table.on('click', 'tr', function () {
			self.Pane.emit({ pane: 'match', event: 'load', value: api.row(this).data().match.id });
		});
	};

	/*Class.prototype._render = function (matches) {
		var grid = matches.map(function (stat) {
					return `<div class="player__stats__stat" data-id="${stat.match.id}">
						<div class="grid grid_ta_center">
							<div class="grid__cell">${utils.timeParse(stat.date)}</div>
							<div class="grid__cell">${stat.map.lang[lang].name} – ${stat.map.lang[lang].mode}</div>
							<div class="grid__cell">${stat.match.level}</div>
							<div class="grid__cell">${stat.victory ? i18n.win : i18n.loose}</div>
							<div class="grid__cell">${stat.kills}/${stat.dies} (${stat.kd})</div>
							<div class="grid__cell">${stat.score}</div>
						</div>
						<div class="grid grid_ta_center player__stats__stat__actions">
							<div class="grid__cell" title="${i18n.headshots.full}">${i18n.headshots.abbr}: ${stat.headshots}</div>
							<div class="grid__cell" title="${i18n.grenadeKills.full}">${i18n.grenadeKills.abbr}: ${stat.grenadeKills}</div>
							<div class="grid__cell" title="${i18n.meleeKills.full}">${i18n.meleeKills.abbr}: ${stat.meleeKills}</div>
							<div class="grid__cell" title="${i18n.artefactKills.full} / ${i18n.artefactUses.full}">${i18n.artefactKills.abbr} / ${i18n.artefactUses.abbr}: ${stat.artefactKills} / ${stat.artefactUses}</div>
							<div class="grid__cell" title="${i18n.pointCaptures.full}">${i18n.pointCaptures.abbr}: ${stat.pointCaptures}</div>
							<div class="grid__cell" title="${i18n.boxesBringed.full}">${i18n.boxesBringed.abbr}: ${stat.boxesBringed}</div>
						</div>
					</div>`;
				}).join('');

		var html = `<h3 class="player__stats__title">${i18n.title}</h3>
		<div class="player__stats__matches">
			<div class="grid grid_ta_center player__stats__stat__descriptions">
				<div class="grid__cell">${i18n.date}</div>
				<div class="grid__cell">${i18n.map}</div>
				<div class="grid__cell">${i18n.level}</div>
				<div class="grid__cell">${i18n.win}</div>
				<div class="grid__cell">${i18n.kdStat}</div>
				<div class="grid__cell">${i18n.score}</div>
			</div>
			${grid}
		</div>`;
		return this.elem.html(html);
	};*/

	return Class;
};
