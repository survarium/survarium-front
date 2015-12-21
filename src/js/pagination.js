var Pagination = function () {
	return function () {
		var domElem = $('<div>', {
			className: 'pagination'
		});

		var total;
		var limit;
		var skip = 0;

		domElem.data('build', function ($total, $limit, $skip) {
			if (!$total || $total < 0 || !$limit || $limit < 0) {
				return domElem.empty();
			}

			total = $total;
			limit = $limit;

			if ($skip < 0) {
				$skip = 0;
			}

			skip = $skip;
		});

		return domElem;
	}
};

module.exports = Pagination;

