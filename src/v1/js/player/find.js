var I18N = require('../i18n');

module.exports = function (params) {
	var $ = params.$;

	var i18n = I18N.load(params.language, {
		russian: {
			title: 'Поиск игрока'
		},
		english: {
			title: 'Player search'
		}
	});

	var storageKey = 'player:find';

	var Class = function () {
		var self = this;

		this.elem = $('<form>', {
			class: 'player__find',
			html : `
			<h3>${i18n.title}</h3>
			<input type="text" name="nickname" placeholder="${i18n.nickname}" value="${params.storage.get(storageKey) || ''}" />
			<input type="submit" value="${i18n.find}">`
		});

		this.elem.on('submit', function (e) {
			e.preventDefault();

			var nickname = this.nickname.value;

			if ([undefined, null, ''].indexOf(nickname) > -1) {
				return console.error('wrong format of nickname');
			}

			params.storage.set(storageKey, nickname);

			self.Pane.emit({
				pane : 'player',
				event: 'load',
				value: nickname
			});
		});
	};

	return Class;
};
