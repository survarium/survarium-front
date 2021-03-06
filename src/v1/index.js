require('./styl/global.styl');

var config       = require('./js/config');
config.counters  = require('./js/counters');
require('./js/config-dt')(config);

var LangSwitcher = require('./js/lang-switcher');
var Panes        = require('./js/panes/panes');
var PlayerPane   = require('./js/panes/playerPane');
var PlayersPane  = require('./js/panes/playersPane');
var MatchPane    = require('./js/panes/matchPane');
var ClanPane     = require('./js/panes/clanPane');
var StreamsPane  = require('./js/panes/streamsPane');

var $ = config.$;

$(document).ready(function () {
	var main   = $('#main');
	var footer = $('#footer');

	var panes       = new (Panes(config))();
	var playerPane  = new PlayerPane(config);
	var playersPane = new PlayersPane(config);
	var matchPane   = new MatchPane(config);
	var clanPane    = new ClanPane(config);
	var streamsPane = new StreamsPane(config);

	panes.add(playerPane);
	panes.add(playersPane);
	panes.add(matchPane);
	panes.add(clanPane);
	panes.add(streamsPane);

	panes.elem.appendTo(main);

	panes.ensureActive(playerPane.name);

	var langSwitcher = new (LangSwitcher(config))();
	langSwitcher.elem.prependTo(footer);

	main.find('> .loading').remove();
});
