var metrica;

(function (win, doc, tagname) {
	(function (i, s, o, g, r, a, m) {
		i['GoogleAnalyticsObject'] = r;
		i[r] = i[r] || function () {
				(i[r].q = i[r].q || []).push(arguments)
			}, i[r].l = 1 * new Date();
		a = s.createElement(o), m = s.getElementsByTagName(o)[0];
		a.async = 1;
		a.src = g;
		m.parentNode.insertBefore(a, m)
	})(win, doc, tagname, '//www.google-analytics.com/analytics.js', 'ga');

	ga('create', 'UA-72511738-1', 'auto');
	ga('send', 'pageview');

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

exports.track = function (page, value) {
	try {
		ga('send', 'event', {
			'eventCategory': page,
			'eventAction'  : 'Track',
			'eventValue'   : value
		});
		metrica && metrica.hit(`?${page}`, {
			player: value
		});
	} catch (e) {
	}
};

exports.goal = function (id, opts) {
	try {
		metrica && metrica.reachGoal(id, opts);
	} catch (e) {
	}
};
