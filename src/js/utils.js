exports.kdRatio = function (kill, die) {
	return die ?
		kill ? (kill / die).toFixed(1) :
			-die:
		kill;
};

exports.query = function () {
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
