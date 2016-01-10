var utils         = require('../utils');
var ClanFind    = require('../clan/find');
var ClanDetails = require('../clan/details');

module.exports = function (params) {
	var i18n = {
		russian: {
			title: 'Клан'
		},
		english: {
			title: 'Clan'
		}
	}[params.language];

	var pane = params.$('<div>');

	var clanFind    = new (ClanFind(params))();
	var clanDetails = new (ClanDetails(params))();

	pane.append([
		clanFind.elem,
		clanDetails.elem
	]);

	var isActive = (function () {
		var query = utils.query();
		if (!query) {
			return;
		}
		if (query.clan) {
			return clanDetails.load(query.clan, { noStory: true });
		}
	})();

	return {
		name: 'clan',
		title: i18n.title,
		pane: pane,
		active: isActive,
		components: {
			find: clanFind,
			details: clanDetails
		},
		events: {
			load: function (value) {
				this.setActive('clan');
				clanDetails.load(value);
			}
		}
	};
};
