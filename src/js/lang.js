require('../styl/lang.styl');

var Switcher = function (params) {
	var $ = params.$;

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

	return function () {
		var domElem = $('<div>', {
			class: 'lang-switcher',
			html: params.languages.map(function (lang) {
				return `<a href="#!/${lang}" data-lang="${lang}" class="lang-switcher__elem">${i18n[lang]}</a>`;
			}).join('&nbsp;|&nbsp;')
		});

		domElem.on('click', '.lang-switcher__elem', function (e) {
			e.preventDefault();
			var $this = $(this);
			var lang  = $this.data('lang');
			if (lang !== params.language) {
				params.storage.set(params.langStorageKey, lang);
				window.location.reload();
			}
		});

		return domElem;
	};
};

exports.Switcher = Switcher;
