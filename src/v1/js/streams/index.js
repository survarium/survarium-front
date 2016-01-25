require('../../styl/streams.styl');

var utils = require('../utils');
var ApiYT = require('../api-youtube');

module.exports = function (params) {
	var $        = params.$;
	var apiYT    = ApiYT(params);
	var language = params.language;
	var counters = params.counters;

	var i18n = {
		russian: {
			title: 'Стримы',
			past : 'Недавние стримы'
		},
		english: {
			title: 'Streams',
			past : 'Ended stream'
		}
	}[language];

	var Class = function () {
		this.elem = $('<div>', {
			class: 'streams',
			html : '<div class="streams_type_live"></div>' + '<div class="streams_type_completed"></div>'
		});

		this.YTlive      = this.elem.find('.streams_type_live');
		this.YTcompleted = this.elem.find('.streams_type_completed');
	};

	Class.prototype._clear = function () {
		this.YTlive.empty();
		this.YTcompleted.empty();

		return this._data = {
			youtube: {
				live     : [],
				completed: []
			}
		};
	};

	Class.prototype.load = function (params, opts) {
		opts = opts || {};

		utils.setQuery({ streams: 'active' }, {
			replace: true,
			title  : i18n.title,
			noStory: opts.noStory
		});

		return this._streams();
	};

	Class.prototype._playerYT = function (yt) {
		var type   = null;
		var videos = yt.items.map(function (video) {
			type = video.snippet.liveBroadcastContent === 'none' ? 'completed' : 'live';
			return `<div class="streams__item">
					<iframe width="560" height="315" src="https://www.youtube.com/embed/${video.id.videoId}" frameborder="0" allowfullscreen></iframe>
					<a target="_blank" href="https://www.youtube.com/watch?v=${video.id.videoId}" class="streams__info">
						<h4 class="streams__title">${video.snippet.title}</h4>
						<small>${utils.timeParse(video.snippet.publishedAt)}</small>
					</a>
				</div>`;
		});
		return type ? this._data.youtube[type] = videos : [];
	};

	Class.prototype._streams = function () {
		if (this._debounce) {
			return;
		}

		this._debounce = setTimeout(function () {
			clearTimeout(this._debounce);
			this._debounce = null;
		}.bind(this), 1000 * 60 * 5);

		this._clear();

		var self = this;

		apiYT
			.streams({ live: true })
			.then(self._playerYT.bind(self))
			.then(function (videos) {
				if (!videos.length) {
					return;
				}
				self.YTlive.html(`<h3 class="title">LIVE</h3>
					<div class="streams__list">${videos.join('')}</div>`);
			});

		apiYT
			.streams({ live: false })
			.then(self._playerYT.bind(self))
			.then(function (videos) {
				if (!videos.length) {
					return;
				}
				self.YTcompleted.html(`<h3 class="title">${i18n.past}</h3>
					<div class="streams__list">${videos.join('')}</div>`);
			});
	};

	return Class;
};
