var utils = require('../utils');
var I18N  = require('../i18n');

require('datatables.net');

module.exports = function (params) {
	var $        = params.$;
	var api      = params.api;
	var language = params.language;
	var counters = params.counters;

	var i18n = I18N.load(language, {
		russian: {
			title: 'Игроки'
		},
		english: {
			title: 'Players'
		}
	});

	var Class = function () {
		this.elem = $('<div>', {
			class: 'players'
		});
	};

	Class.prototype.load = function (params, opts) {
		opts = opts || {};

		utils.setQuery({ players: 'active' }, {
			replace: true,
			title  : i18n.title,
			noStory: opts.noStory
		});

		return this._players();
	};

	Class.prototype._players = function () {
		var playersTable = this.playersTable;
		if (playersTable) {
			return;
		}
		var wrap     = $(`<div class="players-wrap"><h3 class="title">${i18n.title}</h3></div>`);
		playersTable = this.playersTable = $('<table>', {
			id: 'players__list'
		});
		playersTable.appendTo(wrap);
		wrap.appendTo(this.elem);
		playersTable.dataTable({
			dom        : 'Bfrtip',
			serverSide : true,
			ajax       : function (data, cb) {
				var search    = data.search.value;
				var order     = data.order[0];
				data.search   = undefined;
				data.nickname = ~[undefined, null, ''].indexOf(search) ? undefined : search.length > 1 ? search.trim ? search.trim() : search : undefined;
				data.stats    = 0;
				data.noUrls   = true;
				data.meta     = true;
				data.skip     = data.start;
				data.limit    = data.length;
				data.sortBy   = data.columns[+order.column].name;
				data.sort     = order.dir;
				api.players(data).then(function (data) {
					data.recordsFiltered = data.filtered === undefined ? data.total : data.filtered;
					data.recordsTotal    = data.total;
					cb(data);
				});
			},
			pageLength : 20,
			searchDelay: 1000,
			scrollY    : 'auto',
			stateSave  : true,
			colReorder : false,
			scroller   : false,
			order      : [[1, 'desc']],
			buttons    : ['colvis', {
				extend: 'colvisGroup',
				text  : i18n.dt.basic,
				show  : [0, 1, 2, 3, 4, 5, 6, 7, 8],
				hide  : [9, 10, 11, 12, 13, 14, 15]
			}, {
				extend: 'colvisGroup',
				text  : i18n.dt.actions,
				show  : [0, 9, 10, 11, 12, 13, 14, 15],
				hide  : [1, 2, 3, 4, 5, 6, 7, 8]
			}, {
				extend: 'colvisGroup',
				text  : i18n.dt.all,
				show  : ':hidden'
			}],
			columnDefs : [{
				className: 'foo',
				targets  : 0
			}, {
				className: 'dataTable__cell_centered',
				targets  : '_all'
			}, {
				targets   : [0],
				searchable: true
			}, {
				targets      : '_all',
				searchable   : false,
				orderSequence: ['desc', 'asc']
			}, {
				targets: [9, 10, 11, 12, 13, 14, 15],
				visible: false
			}],
			columns    : [{
				title    : i18n.player,
				orderable: false,
				data     : 'nickname',
				render   : function (data, type, row) {
					var clan = row.clan;
					return (clan ? `<a href="?clan=${clan.abbr}" class="player__clan" data-abbr="${clan.abbr}">[${clan.abbr}]</a> ` : '') + data;
				}
			}, {
				title: i18n.level,
				data : 'progress.level',
				name : 'exp'
			}, {
				title: i18n.avgScore,
				data : 'total.scoreAvg',
				name : 'scoreAvg'
			}, {
				title: i18n.kills,
				data : 'total.kills',
				name : 'kill'
			}, {
				title: i18n.dies,
				data : 'total.dies',
				name : 'die'
			}, {
				title: i18n.kd,
				data : 'total.kd',
				name : 'kd'
			}, {
				title: i18n.wins,
				data : 'total.victories',
				name : 'win'
			}, {
				title: i18n.matches,
				data : 'total.matches',
				name : 'match'
			}, {
				title : i18n.winrate,
				data  : 'total.winRate',
				name  : 'winrate',
				render: function (data) {
					return data.toFixed(2) + '%';
				}
			}, {
				title: i18n.headshots.full,
				name : 'hs',
				data : 'total.headshots'
			}, {
				title: i18n.grenadeKills.full,
				name : 'gk',
				data : 'total.grenadeKills'
			}, {
				title: i18n.meleeKills.full,
				name : 'mk',
				data : 'total.meleeKills'
			}, {
				title: i18n.artefactKills.full,
				name : 'ak',
				data : 'total.artefactKills'
			}, {
				title: i18n.artefactUses.full,
				name : 'au',
				data : 'total.artefactUses'
			}, {
				title: i18n.pointCaptures.full,
				name : 'cap',
				data : 'total.pointCaptures'
			}, {
				title: i18n.boxesBringed.full,
				name : 'box',
				data : 'total.boxesBringed'
			}]
		});

		var tableApi = this.playersTableApi = playersTable.api();
		var self = this;
		playersTable
			.on('click', '.player__clan', function (e) {
				e.preventDefault();
				counters.goal('Clan', { action: 'from:players' });
				self.Pane.emit({
					pane : 'clan',
					event: 'load',
					value: $(e.target).data('abbr')
				});
				return false;
			})
			.on('click', 'tr', function () {
				var data = tableApi.row(this).data();
				if (!data) {
					return;
				}
				counters.goal('Player', {
					action: 'from:players'
				});
				self.Pane.emit({
					pane : 'player',
					event: 'load',
					value: tableApi.row(this).data().nickname
				});
			});
	};

	return Class;
};
