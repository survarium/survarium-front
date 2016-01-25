var metrica;

(function (win, doc, tagname) {
	(win['yandex_metrika_callbacks'] = win['yandex_metrika_callbacks'] || []).push(function () {
		try {
			metrica = new Ya.Metrika({
				id                 : 34289435,
				clickmap           : true,
				trackLinks         : true,
				accurateTrackBounce: true,
				webvisor           : true,
				trackHash          : true
			});
		} catch (e) {
		}
	});

	var s   = doc.createElement(tagname), n = doc.getElementsByTagName(tagname)[0];
	s.async = true;
	s.src   = 'https://mc.yandex.ru/metrika/watch.js';
	n.parentNode.insertBefore(s, n);
})(window, document, 'script');

exports.track = function (page, title) {
	try {
		ga.set('page', page);
		ga('send', {
			hitType: 'pageview',
			page: page,
			title: title
		});
		metrica && metrica.hit(page, {
			title: title
		});
	} catch (e) {
	}
};

/**
 * Goals
 * @param {String} title       event title
 * @param {Object} opts
 * @param {String} opts.action event name
 * @param {*} opts.value  event value
 */
exports.goal = function (title, opts) {
	try {
		metrica && metrica.reachGoal([title, opts.action].join(':'), opts.value);
		ga('send', {
			hitType      : opts.type || 'event',
			eventCategory: title,
			eventAction  : opts.action,
			eventLabel   : `${title}:${opts.action}:${opts.value}`
		});
	} catch (e) {
	}
};
