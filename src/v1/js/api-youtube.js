module.exports = function (config) {
	var $       = config.$;
	var key     = 'AIzaSyACWiZhJnrmKyr4ox1coOH7JsHJr_0NBQA';
	var apiHost = 'https://www.googleapis.com/youtube/v3';

	//https://developers.google.com/youtube/v3/docs/search/list

	return {
		streams: function (options) {
			options = options || {};
			return $.ajax(apiHost + '/search', {
				data: {
					maxResults     : 4,
					key            : key,
					q              : 'survarium',
					type           : 'video',
					order          : 'date',
					part           : 'snippet',
					videoEmbeddable: true,
					videoSyndicated: true,
					videoDefinition: options.live ? 'any' : 'high',
					videoDuration  : options.live ? 'any' : 'long',
					eventType      : options.live ? 'live' : 'completed'
				}
			});
		}
	};
};
