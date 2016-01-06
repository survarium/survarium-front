require('../styl/error.styl');

module.exports = function (params) {
	var $ = params.$;

	var i18n = {
		russian: {
		},
		english: {
		}
	}[params.language];

	var Class = function () {
		this.elem = $('<pre>', {
			class: 'error'
		});
	};

	Class.prototype.show = function (msg) {
		return this
			.elem
			.text(msg ? JSON.stringify(msg.responseJSON || msg, null, 4) : '')
			.addClass('error_show');
	};

	Class.prototype.hide = function () {
		return this.elem.removeClass('error_show');
	};

	return Class;
};
