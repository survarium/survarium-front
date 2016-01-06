require('../styl/loader.styl');

module.exports = function (params) {
	var $ = params.$;

	var i18n = {
		russian: {
			loading: 'Загрузка...'
		},
		english: {
			loading: 'Loading...'
		}
	}[params.language];

	var Class = function () {
		this.elem = $('<div>', {
			class: 'loader',
			html: i18n.loading
		});
	};

	Class.prototype.show = function () {
		return this.elem.addClass('loader_loading');
	};

	Class.prototype.hide = function () {
		return this.elem.removeClass('loader_loading');
	};

	return Class;
};
