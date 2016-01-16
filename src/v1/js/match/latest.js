var Select = require('../select');

module.exports = function (params) {
	var $ = params.$;

	var i18n = {
		russian: {
			title: 'Последний матч',
			level: 'Уровень',
			any: 'Любой',
			find: 'Найти'
		},
		english: {
			title: 'Match search',
			level: 'Level',
			any: 'Any',
			find: 'Find'
		}
	}[params.language];

	var storageKey = 'match:latest';

	var Class = function () {
		var self = this;

		this.elem = $('<form>', {
			class: 'match__latest',
			html: `<h3>${i18n.title}</h3>`
		});

		this.elem.append([
			Select($, {
				current: params.storage.get(storageKey),
				name: 'level',
				data: [
					{ title: i18n.level },
					{ value: 1 },
					{ value: 2 },
					{ value: 3 },
					{ value: 4 },
					{ value: 5 },
					{ value: 6 },
					{ value: 7 },
					{ value: 8 },
					{ value: 9 },
					{ value: 10 }
				]
			}),
		    `<input type="submit" value="${i18n.find}">`
		]);

		this
			.elem
			.on('submit', function (e) {
				e.preventDefault();

				var level = this.level.value;

				if (!(/^\d+$/.test(level))) {
					level = undefined;
				}

				params.storage.set(storageKey, level);

				self.Pane.emit({ pane: 'match', event: 'load', value: 'latest', opts: { level } });
			});
	};

	return Class;
};
