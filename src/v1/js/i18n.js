var i18n = {
	russian: {
		id          : 'ID',
		date        : 'Дата',
		abbr        : 'Тег клана',
		find        : 'Найти',
		level       : 'Уровень',
		replay      : 'Реплей',
		download    : 'Скачать',
		duration    : 'Продолжительность',
		nickname    : 'Никнейм',
		time_start  : 'Время начала',
		any         : 'Любой',
		win         : 'Победа',
		wins        : 'Побед',
		map         : 'Карта',
		mode        : 'Режим',
		loose       : 'Проигрыш',
		score       : 'Счет',
		kills       : 'Убийств',
		dies        : 'Смертей',
		kd          : 'У/С',
		player      : 'Имя',
		team        : 'Команда',
		members     : 'Участники',
		CWmatches   : 'Клановые матчи',
		opponent    : 'Противники',
		role        : 'Роль',
		rating      : 'Рейтинг',
		winrate     : 'Винрейт',
		matches     : 'Матчи',
		avgScore    : 'Ср.счет',
		victories   : 'Побед',
		totalMatches: 'Всего матчей',
		actions     : 'Действия',
		details     : 'Детали',
		progress    : 'Прогресс',
		established : 'Дата основания',
		exp         : 'Опыт',
		looses      : 'Поражений',
		profile     : 'Профиль',
		ammunition  : 'Аммуниция',
		active      : 'Активный',
		dt          : {
			basic  : 'Общее',
			actions: 'Действия',
			all    : 'Показать все'
		},
		roles       : {
			commander: 'Командир',
			warlord  : 'Сержант',
			assistant: 'Зам. командира',
			soldier  : 'Солдат'
		}
	},
	english: {
		id          : 'ID',
		date        : 'Date',
		abbr        : 'Clan tag',
		find        : 'Find',
		replay      : 'Replay',
		download    : 'Download',
		time_start  : 'Start time',
		any         : 'Any',
		duration    : 'Duration',
		nickname    : 'Nickname',
		win         : 'Win',
		wins        : 'Wins',
		map         : 'Map',
		mode        : 'Mode',
		loose       : 'Loose',
		level       : 'Level',
		score       : 'Score',
		kills       : 'Kills',
		dies        : 'Dies',
		kd          : 'K/D',
		player      : 'Name',
		team        : 'Team',
		members     : 'Members',
		CWmatches   : 'Clan matches',
		opponent    : 'Opponents',
		role        : 'Role',
		rating      : 'Rating',
		winrate     : 'Winrate',
		matches     : 'Matches',
		avgScore    : 'Avg.Score',
		victories   : 'Victories',
		totalMatches: 'Total matches',
		details     : 'Details',
		actions     : 'Actions',
		progress    : 'Progress',
		established : 'Established date',
		exp         : 'Experience',
		looses      : 'Looses',
		profile     : 'Profile',
		ammunition  : 'Ammunition',
		active      : 'Active',
		dt          : {
			basic  : 'General',
			actions: 'Actions',
			all    : 'Show all'
		},
		roles       : {}
	}
};

var _actionsI18N = {
	headshots    : {
		russian: 'Хедшоты',
		english: 'Headshots',
		abbr   : 'HS'
	},
	grenadeKills : {
		russian: 'Убийств гранатами',
		english: 'Grenade kills',
		abbr   : 'G'
	},
	meleeKills   : {
		russian: 'Убийств прикладом',
		english: 'Melee kills',
		abbr   : 'M'
	},
	artefactKills: {
		russian: 'Убийств артефактами',
		english: 'Artifacts kills',
		abbr   : 'AK'
	},
	pointCaptures: {
		russian: 'Точек захвачено',
		english: 'Captured points',
		abbr   : 'CAP'
	},
	boxesBringed : {
		russian: 'Принесено ящиков',
		english: 'Brought boxes',
		abbr   : 'BB'
	},
	artefactUses : {
		russian: 'Использовано артефактов',
		english: 'Artifacts usage',
		abbr   : 'AU'
	}
};

var langs = Object.keys(i18n);

Object.keys(_actionsI18N).reduce(function (i18n, action) {
	langs.forEach(lang => {
		i18n[lang][action] = {
			full: _actionsI18N[action][lang],
			abbr: _actionsI18N[action].abbr
		};

	});
	return i18n;
}, i18n);

exports.load = function load(language, ext) {
	return Object.assign({}, i18n[language], ext && ext[language] || {});
};
