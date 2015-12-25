var kdRatio = function (kill, die) {
	return die ?
		kill ? (kill / die).toFixed(1) :
			0:
		kill;
};

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

var setQuery = function (params) {
	if (!params || !(params instanceof Object)) {
		return;
	}
	var query = Object.keys(params).reduce(function (result, key) {
		result[key] = params[key];
		return result;
	}, getQuery() || {});

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
	return (Array(fill + 1)).join('0') + str;
};

var duration = function (sec) {
	var d = new Date();
	d.setUTCHours(0, 0, 0, 0);
	d.setSeconds(sec);
	return leadZeros(d.getUTCMinutes(), 2) + ':' + leadZeros(d.getUTCSeconds(), 2);
};

exports.kdRatio = kdRatio;
exports.query = getQuery;
exports.setQuery = setQuery;
exports.duration = duration;

