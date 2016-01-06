require('./styl/global.styl');

var config        = require('./js/config');
var utils         = require('./js/utils');
var LangSwitcher  = require('./js/lang-switcher');
var PlayerFind    = require('./js/player/find');
var PlayerDetails = require('./js/player/details');
var PlayerMatches = require('./js/player/matches');

var $ = config.$;

$(document).ready(function () {
	var main = $('#main');
	var footer = $('#footer');

	var langSwitcher  = new (LangSwitcher(config))();
	var playerFind    = new (PlayerFind(config))();
	var playerDetails = new (PlayerDetails(config))();
	var playerMatches = new (PlayerMatches(config))();

	playerFind.attachPlayerDetails(playerDetails);
	playerDetails.attachPlayerMatches(playerMatches);

	playerFind.elem.appendTo(main);
	playerDetails.elem.appendTo(main);
	playerMatches.elem.appendTo(main);

	langSwitcher.elem.prependTo(footer);

	(function () {
		var query = utils.query();
		if (!query) {
			return;
		}
		if (query.player) {
			playerDetails.load(query.player, { noStory: true });
		}
	})();

	main.find('> .loading').remove();
});
