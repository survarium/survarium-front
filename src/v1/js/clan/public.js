require('../../styl/clan/details.styl');

var utils = require('../utils');

require('datatables.net');

module.exports = function (params) {
	var $        = params.$;
	var api      = params.api;
	var language = params.language;
	var counters = params.counters;

	var i18n = {
		russian: {
			title       : 'Клан',
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
			matches     : 'Матчи в паблике',
			role        : 'Роль',
			rating      : 'Рейтинг',
			winrate     : 'Винрейт',
			victories   : 'Побед',
			totalMatches: 'Всего матчей',
			actions     : 'Действия',
			details     : 'Детали',
			progress    : 'Прогресс',
			dt          : {
				basic  : 'Общее',
				actions: 'Действия',
				all    : 'Показать все'
			},
			roles       : {
				commander: 'Командир',
				warlord  : 'Сержант',
				assistant: 'Зам. командира',
				soldier  : 'Солдат'
			}
		},
		english: {
			title       : 'Clan',
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
			matches     : 'Matches in public',
			role        : 'Role',
			rating      : 'Rating',
			winrate     : 'Winrate',
			victories   : 'Victories',
			totalMatches: 'Total matches',
			details     : 'Details',
			actions     : 'Actions',
			progress    : 'Progress',
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
		this.api = api;

		this.elem = $(`<div class="clan__players-wrap"></div>`);

		var table = this.table = $('<table>', {
			id: 'clan__public_stats'
		});
		table.appendTo(this.elem);
	};

	Class.prototype.load = function (abbr) {
		this._abbr = abbr;
		this._stats();
	};

	Class.prototype._ajax = function (data, cb) {
		var abbr     = this._abbr;
		var order    = data.order[0];
		data.meta    = true;
		data.skip    = data.start;
		data.limit   = data.length;
		data.sortBy  = data.columns[+order.column].name;
		data.sort    = order.dir;
		data.abbr    = abbr;
		data.lang    = language;
		data.columns = undefined;
		data.order   = undefined;
		data.search  = undefined;
		api
			.clanPublicStats(data)
			.then(function (data) {
				data.recordsFiltered = data.filtered === undefined ? data.total : data.filtered;
				data.recordsTotal    = data.total;
				cb(data);
			});
	};

	Class.prototype._stats = function () {
		if (this.tableApi) {
			this.tableApi.ajax.reload();
			this.tableApi.page(0);
			return;
		}
		this.elem.prepend(`<h3>${i18n.matches}</h3>`);
		this.table.dataTable({
			buttons    : ['colvis', {
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
			dom        : 'Brtip',
			serverSide : true,
			ajax       : this._ajax.bind(this),
			pageLength : 10,
			searchDelay: 400,
			scrollY    : 'auto',
			stateSave  : true,
			colReorder : false,
			scroller   : false,
			order      : [[0, 'desc']],
			columnDefs : [{
				className: 'foo',
				targets  : [2]
			}, {
				targets   : [2, 3, 4],
				searchable: true
			}, {
				className : 'dataTable__cell_centered',
				targets   : '_all',
				searchable: false,
				sortable  : false
			}, {
				visible: false,
				targets: [10, 11, 12, 13, 14, 15, 16]
			}],
			columns    : [{
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

		var tableApi = this.tableApi = this.table.api();
		var self = this;
		this.table
			.on('click', 'tr', function () {
				var data = tableApi.row(this).data();
				if (!data) {
					return;
				}
				counters.goal('Match', {
					action: 'from:clan',
					value : self._abbr
				});
				self.Pane.emit({
					pane : 'match',
					event: 'load',
					value: tableApi.row(this).data().match.id
				});
			});
	};

	return Class;
};
