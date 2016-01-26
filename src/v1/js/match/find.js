var I18N  = require('../i18n');

module.exports = function (params) {
	var $ = params.$;

	var i18n = I18N.load(params.language, {
		russian: {
			title: 'Поиск матча',
			match: 'Номер матча'
		},
		english: {
			title: 'Match search',
			match: 'Match number'
		}
	});

	var storageKey = 'match:find';

	var Class = function () {
		var self = this;

		this.elem = $('<form>', {
			class: 'match__find',
			html: `
			<h3>${i18n.title}</h3>
			<input name="match" type="number" placeholder="${i18n.match}" value="${params.storage.get(storageKey) || ''}" />
			<input type="submit" value="${i18n.find}">`
		});

		this
			.elem
			.on('submit', function (e) {
				e.preventDefault();

				var match = this.match.value;

				if ([undefined, null, ''].indexOf(match) > -1) {
					return console.error('wrong format of match');
				}

				params.storage.set(storageKey, match);
				self.Pane.emit({ pane: 'match', event: 'load', value: match });
			});
	};

	return Class;
};
