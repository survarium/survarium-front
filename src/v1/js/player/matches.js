require('../../styl/grid.styl');
require('../../styl/player/matches.styl');

var Loader = require('../loader');
var utils  = require('../utils');

require('datatables.net');

module.exports = function (params) {
	var $ = params.$;
	var lang = params.language;

	var i18n = {
		russian: {
			title: 'Матчи игрока',
			noMatches: 'Матчи не найдены',
			win: 'Победа',
			loose: 'Проигрыш',
			date: 'Дата',
			map: 'Карта',
			mode: 'Режим',
			level: 'Уровень',
			kdStat: 'У/С (KD)',
			score: 'Счет',
			kills: 'Убийств',
			dies: 'Смертей',
			kd: 'У/С',
			dt: {
				basic: 'Общее',
				actions: 'Действия',
				all: 'Показать все'
			}
		},
		english: {
			title: 'Player\'s matches',
			noMatches: 'Matches not found',
			win: 'Win',
			loose: 'Loose',
			date: 'Date',
			map: 'Map',
			mode: 'Mode',
			level: 'Level',
			kdStat: 'K/D (KD)',
			score: 'Score',
			kills: 'Kills',
			dies: 'Dies',
			kd: 'K/D',
			dt: {
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
			class: 'player__matches'
		});

		this._loader = new (Loader(params))();
		this._loader.elem.appendTo(this.elem);
	};

	Class.prototype.load = function (matches) {
		if (!matches || !matches.length) {
			return this._empty();
		}
		return this._table(matches);
	};

	Class.prototype._empty = function () {
		this.table && this.tableApi.clear().draw();
		return this.elem.text(i18n.noMatches);
	};

	Class.prototype._table = function (matches) {
		var table = this.table;
		if (table) {
			return this.tableApi.clear().rows.add(matches).draw();
		}
		table = this.table = $('<table>');
		table.appendTo(this.elem);
		table.dataTable({
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
					show: [ 9, 10, 11, 12, 13, 14, 15 ],
					hide: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]
				},
				{
					extend: 'colvisGroup',
					text: i18n.dt.all,
					show: ':hidden'
				}
			],
			data       : matches,
			columnDefs: [
				{ className: 'dataTable__cell_centered', targets: [ 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ] }
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
		table.on('click', 'tr', function () {
			console.log('match', api.row(this).data().match.id);
		});
	};

	Class.prototype._render = function (matches) {
		var grid = matches.map(function (stat) {
					return `<div class="player__matches__stat" data-id="${stat.match.id}">
						<div class="grid grid_ta_center">
							<div class="grid__cell">${utils.timeParse(stat.date)}</div>
							<div class="grid__cell">${stat.map.lang[lang].name} – ${stat.map.lang[lang].mode}</div>
							<div class="grid__cell">${stat.match.level}</div>
							<div class="grid__cell">${stat.victory ? i18n.win : i18n.loose}</div>
							<div class="grid__cell">${stat.kills}/${stat.dies} (${stat.kd})</div>
							<div class="grid__cell">${stat.score}</div>
						</div>
						<div class="grid grid_ta_center player__matches__stat__actions">
							<div class="grid__cell" title="${i18n.headshots.full}">${i18n.headshots.abbr}: ${stat.headshots}</div>
							<div class="grid__cell" title="${i18n.grenadeKills.full}">${i18n.grenadeKills.abbr}: ${stat.grenadeKills}</div>
							<div class="grid__cell" title="${i18n.meleeKills.full}">${i18n.meleeKills.abbr}: ${stat.meleeKills}</div>
							<div class="grid__cell" title="${i18n.artefactKills.full} / ${i18n.artefactUses.full}">${i18n.artefactKills.abbr} / ${i18n.artefactUses.abbr}: ${stat.artefactKills} / ${stat.artefactUses}</div>
							<div class="grid__cell" title="${i18n.pointCaptures.full}">${i18n.pointCaptures.abbr}: ${stat.pointCaptures}</div>
							<div class="grid__cell" title="${i18n.boxesBringed.full}">${i18n.boxesBringed.abbr}: ${stat.boxesBringed}</div>
						</div>
					</div>`;
				}).join('');

		var html = `<h3 class="player__matches__title">${i18n.title}</h3>
		<div class="player__matches__matches">
			<div class="grid grid_ta_center player__matches__stat__descriptions">
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
	};

	return Class;
};
