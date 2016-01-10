require('../../styl/grid.styl');

var utils         = require('../utils');
var MatchFind     = require('../match/find');
var MatchLatest   = require('../match/latest');
var MatchDetails  = require('../match/details');

module.exports = function (params) {
	var i18n = {
		russian: {
			title: 'Матч'
		},
		english: {
			title: 'Match'
		}
	}[params.language];

	var pane = params.$('<div>');
	var search = params.$('<div>', { class: 'match-search grid' });

	var matchFind    = new (MatchFind(params))();
	var matchLatest  = new (MatchLatest(params))();
	var matchDetails = new (MatchDetails(params))();

	matchFind.attachDetails(matchDetails);
	matchLatest.attachDetails(matchDetails);

	search.append($(matchFind.elem).add(matchLatest.elem).addClass('grid__cell'));

	pane.append([
		search,
		matchDetails.elem
	]);

	var isActive = (function () {
		var query = utils.query();
		if (!query) {
			return;
		}
		if (query.match) {
			return matchDetails.load(query.match, { noStory: true });
		}
	})();

	return {
		name: 'match',
		title: i18n.title,
		pane: pane,
		active: isActive,
		components: {
			find: matchFind,
			latest: matchLatest,
			details: matchDetails
		},
		events: {
			load: function (value) {
				this.setActive('match');
				matchDetails.load(value);
			}
		}
	};
};
