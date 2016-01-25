require('../../styl/grid.styl');

var utils   = require('../utils');
var Streams = require('../streams');

module.exports = function (params) {
	var i18n = {
		russian: {
			title: 'Стримы'
		},
		english: {
			title: 'Streams'
		}
	}[params.language];

	var pane = params.$('<div>');

	var streams = new (Streams(params))();

	pane.append([streams.elem]);

	var isActive = (function () {
		var query = utils.query();
		if (!query) {
			return;
		}
		if (query.streams) {
			streams.load(null, { noStory: true });
			return true;
		}
	})();

	return {
		name      : 'streams',
		title     : i18n.title,
		pane      : pane,
		active    : isActive,
		components: {
			streams: streams
		},
		events    : {
			onOpen: function () {
				this.active !== 'streams' && streams.load();
			},
			onClose: function () {
				console.log('closing streams tab');
			}
		}
	};
};
