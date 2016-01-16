module.exports = function (params) {
	var $ = params.$;

	var i18n = {
		russian: {
			title: 'Поиск клана',
			abbr: 'Тег клана',
			find: 'Найти'
		},
		english: {
			title: 'Clan search',
			abbr: 'Clan tag',
			find: 'Find'
		}
	}[params.language];

	var storageKey = 'clan:find';

	var Class = function () {
		var self = this;

		this.elem = $('<form>', {
			class: 'clan__find',
			html: `
			<h3>${i18n.title}</h3>
			<input name="abbr" placeholder="${i18n.abbr}" value="${params.storage.get(storageKey) || ''}" />
			<input type="submit" value="${i18n.find}">`
		});

		this
			.elem
			.on('submit', function (e) {
				e.preventDefault();

				var abbr = this.abbr.value;

				if ([undefined, null, ''].indexOf(abbr) > -1) {
					return console.error('wrong format of clan tag');
				}

				params.storage.set(storageKey, abbr);

				self.Pane.emit({ pane: 'clan', event: 'load', value: abbr });
			});
	};

	return Class;
};
