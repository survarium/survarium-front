var utils   = require('../utils');
var Players = require('../players');

module.exports = function (params) {
	var i18n = {
		russian: {
			title: 'Игроки'
		},
		english: {
			title: 'Players'
		}
	}[params.language];

	var pane = params.$('<div>');

	var players    = new (Players(params))();

	pane.append([
		players.elem
	]);

	var isActive = (function () {
		var query = utils.query();
		if (!query) {
			return;
		}
		if (query.players) {
			players.load(null, { noStory: true });
			return true;
		}
	})();

	return {
		name: 'players',
		title: i18n.title,
		pane: pane,
		active: isActive,
		components: {
			list: players
		},
		events: {
			onOpen: function () {
				this.active !== 'players' && players.load();
			}
		}
	};
};
