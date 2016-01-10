module.exports = function ($, params) {
	var select = $('<select>', {
		name: params.name,
		html: params.data.map(function (param) {
			return `<option${param.value ? ' value="' + param.value + '"' : ''}>${param.title || param.value}</option>`;
		})
	});
	params.current && select.val(params.current);
	return select;
};
