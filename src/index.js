require('./styl/index.styl');

var config = require('./js/config');

var Lang   = require('./js/lang');
var Player = require('./js/player');
var Match  = require('./js/match');

var $ = config.$;

$(document).ready(function () {
	var main = $('#main');

	var langSwitcher = (new Lang.Switcher(config))();
	var match        = (new Match.Match(config))();
	var playerSearch = (new Player.Search(config))({ match: match });
	var matchSearch  = (new Match.Search(config))({ match: match });
	var latestMatch  = (new Match.Latest(config))({ match: match });

	match.data('setPlayer')(playerSearch.data('player'));

	langSwitcher.prependTo(main);
	latestMatch .appendTo(main);
	matchSearch .appendTo(main);
	match       .appendTo(main);
	playerSearch.appendTo(main);

	main.find('> .loading').remove();
});
