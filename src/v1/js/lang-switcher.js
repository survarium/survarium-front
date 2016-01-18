require('../styl/lang-switcher.styl');

module.exports = function (params) {
	var $ = params.$;
	var counters = params.counters;

	var i18n = {
		russian: {
			russian: 'Русский',
			english: 'English'
		},
		english: {
			russian: 'Русский',
			english: 'English'
		}
	}[params.language];

	var Class = function () {
		var domElem = this.elem = $('<div>', {
			class: 'lang-switcher',
			html: params.languages.map(function (lang) {
				return `<a href="#!/lang=${lang}" data-lang="${lang}" class="lang-switcher__elem">${i18n[lang]}</a>`;
			}).join('&nbsp;|&nbsp;')
		});

		var setLang = function (lang) {
			if (lang !== params.language) {
				params.storage.set(params.langStorageKey, lang);
				window.location = window.location.href.split('#')[0];
			}
		};

		if (window.location.hash && window.location.hash.match(/#!\/(lang\=)?(english|russian)/)) {
			counters.track(`/#!/lang=${RegExp.$2}`);
			setLang(RegExp.$2);
		}

		domElem.on('click', '.lang-switcher__elem', function (e) {
			e.preventDefault();
			var $this = $(this);
			var lang  = $this.data('lang');
			counters.goal('Lang', { action: 'switch', value: lang });
			setLang(lang);
		});
	};

	return Class;
};
