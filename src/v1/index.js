require('./styl/global.styl');

var config        = require('./js/config');
var LangSwitcher  = require('./js/lang-switcher');
var Panes         = require('./js/panes/panes');
var PlayerPane    = require('./js/panes/playerPane');
var MatchPane     = require('./js/panes/matchPane');

var $ = config.$;

$(document).ready(function () {
	var main = $('#main');
	var footer = $('#footer');

	var panes = new (Panes(config))();
	var playerPane = new PlayerPane(config);
	var matchPane = new MatchPane(config);
	panes.add(playerPane);
	panes.add(matchPane);
	panes.elem.appendTo(main);

	panes.ensureActive(playerPane.name);

	var langSwitcher  = new (LangSwitcher(config))();
	langSwitcher.elem.prependTo(footer);

	main.find('> .loading').remove();
});
