var getQuery = function () {
	return window.location.search ?
		window.location.search.slice(1).split('&').reduce(function (result, pair) {
			var keyVal = pair.split('=');
			var key = keyVal[0];
			var val = keyVal[1];
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

/**
 * Обновить ?query
 * @param {Object}  params              список ключ-значение
 * @param {Object}  [options]
 * @param {Boolean} [options.replace]   не объединять с текущим query
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

	window.history.pushState(params, null, '?' + query);
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

exports.query = getQuery;
exports.setQuery = setQuery;
exports.duration = duration;
exports.leadZeros = leadZeros;
exports.timeParse = timeParse;
