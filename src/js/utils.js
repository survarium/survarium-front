exports.kdRatio = function (kill, die) {
	return die ?
		kill ? (kill / die).toFixed(1) :
			-die:
		kill;
};
