require('./styl/global.styl');

var config        = require('./js/config');
var LangSwitcher  = require('./js/lang-switcher');
var Panes         = require('./js/panes/panes');
var PlayerPane    = require('./js/panes/playerPane');

var $ = config.$;

$(document).ready(function () {
	var main = $('#main');
	var footer = $('#footer');

	var panes = new (Panes(config))();
	var playerPane = new PlayerPane(config);
	panes.add(playerPane);
	panes.elem.appendTo(main);

	panes.ensureActive(playerPane.name);

	var langSwitcher  = new (LangSwitcher(config))();
	langSwitcher.elem.prependTo(footer);

	main.find('> .loading').remove();
});
