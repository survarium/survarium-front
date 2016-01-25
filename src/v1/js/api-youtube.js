module.exports = function (config) {
	var $ = config.$;
	var key = 'AIzaSyACWiZhJnrmKyr4ox1coOH7JsHJr_0NBQA';
	var apiHost = 'https://www.googleapis.com/youtube/v3';

	//https://developers.google.com/youtube/v3/docs/search/list

	return {
		streams: function (options) {
			options = options || {};
			return $.ajax(apiHost + '/search', {
				data: {
					key: key,
					q: 'survarium',
					eventType: options.live ? 'live' : 'completed',
					type: 'video',
					order: 'date',
					videoDefinition: 'high',
					videoDuration: options.live ? 'any' : 'long',
					videoEmbeddable: true,
					videoSyndicated: true,
					maxResults: 4,
					part: 'snippet'
				}
			});
		}
	};
};
