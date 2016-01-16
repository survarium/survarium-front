var config = require('./config');
var $title = config.$('title');
var _title = $title.text();

var getQuery = function () {
	return window.location.search ?
		window.location.search.slice(1).split('&').reduce(function (result, pair) {
			var keyVal = pair.split('=');
			var key = keyVal[0];
			var val = decodeURIComponent(keyVal[1]);
			if (!result[key]) {
				result[key] = val;
			} else if (result[key] instanceof Array) {
				result[key].push(val);
			} else {
				result[key] = [
					result[key],
					val
				];
			}
			return result;
		}, {}) : null;
};

var makeTitle = function (dyn) {
	return [_title].concat(dyn instanceof Array ? dyn : [dyn]).join(' | ');
};

var setTitle = function (title) {
	title = title ? makeTitle(title) : _title;
	$title.text(title);
	return title;
};

/**
 * Обновить ?query
 * @param {Object}       params              список ключ-значение
 * @param {Object}       [options]
 * @param {Boolean}      [options.noStory]   не добавлять объект истории
 * @param {Boolean}      [options.replace]   не объединять с текущим query
 * @param {String|Array} [options.title]     заголовок страницы
 */
var setQuery = function (params, options) {
	if (!params || !(params instanceof Object)) {
		return;
	}
	options = options || {};
	var query = Object.keys(params).reduce(function (result, key) {
		result[key] = params[key];
		return result;
	}, options.replace ? {} : getQuery() || {});

	query = Object.keys(query).map(function (key) {
		var value = query[key];
		key = encodeURIComponent(key);
		if (value instanceof Array) {
			return value.map(function (val) {
				return key + '=' + encodeURIComponent(val);
			}).join('&');
		}
		return key + '=' + encodeURIComponent(value);
	}).join('&');

	var state = [params, null, '?' + query];
	window.history[(!options.noStory ? 'push' : 'replace') + 'State'].apply(window.history, state);
	setTitle(options.title);
};

var leadZeros = function (num, rate) {
	rate = rate || 2;
	var str = String(num);
	var fill = rate - str.length;
	if (fill <= 0) {
		return str;
	}
	return (new Array(fill + 1)).join('0') + str;
};

var duration = function (sec) {
	var d = new Date();
	d.setUTCHours(0, 0, 0, 0);
	d.setSeconds(sec);
	return leadZeros(d.getUTCMinutes(), 2) + ':' + leadZeros(d.getUTCSeconds(), 2);
};

var timeParse = function (date) {
	if (! (date instanceof Date)) {
		date = new Date(date);
	}
	return date.getFullYear() + '-' +
		leadZeros(date.getMonth() + 1) + '-' +
		leadZeros(date.getDate()) + ' ' +
		leadZeros(date.getHours()) + ':' +
		leadZeros(date.getMinutes()) + ':' +
		leadZeros(date.getSeconds());
};

String.prototype.capitalize = function () {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

var kdRatio = function (kill, die) {
	return die ?
		kill ? (kill / die).toFixed(2) :
			0:
		kill;
};

var updateTable = function (tableApi, data) {
	tableApi.clear().rows.add(data).draw().scroller.measure(false);
	tableApi.row(tableApi.rows({ order: 'applied', search: 'applied' }).indexes()).scrollTo(false);
};

exports.query = getQuery;
exports.setQuery = setQuery;
exports.duration = duration;
exports.leadZeros = leadZeros;
exports.timeParse = timeParse;
exports.kd = kdRatio;
exports.updateTable = updateTable;
