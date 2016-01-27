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

	var metrikaScript   = doc.createElement(tagname), n = doc.getElementsByTagName(tagname)[0];
	metrikaScript.async = true;
	metrikaScript.src   = 'https://mc.yandex.ru/metrika/watch.js';
	n.parentNode.insertBefore(metrikaScript, n);

	(function (gaSrc, gaName, n, gaScript) {
		win['GoogleAnalyticsObject'] = gaName;
		win[gaName] = win[gaName] || function () {
				(win[gaName].q = win[gaName].q || []).push(arguments)
			}, win[gaName].l = 1 * new Date();
		gaScript = doc.createElement(tagname), n = doc.getElementsByTagName(tagname)[0];
		gaScript.async = 1;
		gaScript.src   = gaSrc;
		n.parentNode.insertBefore(gaScript, n);
	})('//www.google-analytics.com/analytics.js', 'ga', n);

	ga('create', 'UA-72532245-1', 'auto');
	ga('send', 'pageview');
})(window, document, 'script');

exports.track = function (page, title) {
	try {
		ga('set', 'page', page);
		ga('send', {
			hitType: 'pageview',
			page   : page,
			title  : title
		});
		metrica && metrica.hit(page, {
			title: title
		});
	} catch (e) {
		console.log('track error', e);
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
			eventLabel   : [title, opts.action, opts.value].filter(Boolean).join(':')
		});
	} catch (e) {
	}
};
