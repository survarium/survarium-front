var metrica;
var ga;

(function (win, doc, tagname) {
	ga = ga || function () {
			(ga.q = ga.q || []).push(arguments)
		}, ga.l = 1 * new Date();
	var a = doc.createElement(tagname), m = doc.getElementsByTagName(tagname)[0];
	a.async = 1;
	a.src   = '//www.google-analytics.com/analytics.js';
	m.parentNode.insertBefore(a, m);

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

	var s = doc.createElement(tagname), n = doc.getElementsByTagName(tagname)[0];
	s.async = true;
	s.src = 'https://mc.yandex.ru/metrika/watch.js';
	n.parentNode.insertBefore(s, n);
})(window, document, 'script');

ga('create', 'UA-72511738-1', 'auto');
ga('require', 'linkid');
ga('send', 'pageview');

exports.track = function (page, value) {
	ga('send', 'event', {
		'eventCategory': page,
		'eventAction': 'Track',
		'eventValue': value
	});
	metrica && metrica.hit(`?${page}`, {
		player  : value
	});
};

exports.goal = function (id, opts) {
	metrica && metrica.reachGoal(id, opts);
};
