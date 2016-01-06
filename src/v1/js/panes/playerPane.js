var utils         = require('../utils');
var PlayerFind    = require('../player/find');
var PlayerDetails = require('../player/details');
var PlayerMatches = require('../player/matches');

module.exports = function (params) {
	var i18n = {
		russian: {
			title: 'Игрок'
		},
		english: {
			title: 'Player'
		}
	}[params.language];

	var pane = params.$('<div>');

	var playerFind    = new (PlayerFind(params))();
	var playerDetails = new (PlayerDetails(params))();
	var playerMatches = new (PlayerMatches(params))();

	playerFind.attachPlayerDetails(playerDetails);
	playerDetails.attachPlayerMatches(playerMatches);

	pane.append([
		playerFind.elem,
		playerDetails.elem,
		playerMatches.elem
	]);

	var isActive = (function () {
		var query = utils.query();
		if (!query) {
			return;
		}
		if (query.player) {
			return playerDetails.load(query.player, { noStory: true });
		}
	})();

	return {
		name: 'player',
		title: i18n.title,
		pane: pane,
		active: isActive,
		components: {
			find: playerFind,
			details: playerDetails,
			matches: playerMatches
		}
	};
};
