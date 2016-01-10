require('datatables.net');

module.exports = function (config) {
	var $ = config.$;

	var i18n = {
		russian: {
			buttons: {
				colvis: 'Выбор колонок'
			},
			info: 'Отображается с _START_ по _END_ из _TOTAL_ записей',
			lengthMenu: 'Показывать _MENU_ записей',
			lengthAll: 'Все',
			search: 'Фильтр:',
			infoFiltered: '(отфильтровано из _MAX_ записей)',
			paginate: {
				first: 'Начало',
				last: 'Послед.',
				next: 'Вперед',
				previous: 'Назад'
			},
			emptyTable: 'Нет данных для отображения',
			zeroRecords: 'Данные не найдены'
		},
		english: {
			buttons: {
				colvis: 'Change columns'
			},
			info: 'Showing _START_ to _END_ of _TOTAL_ entries',
			lengthMenu: 'Show _MENU_ entries',
			lengthAll: 'All',
			search: 'Search:',
			infoFiltered: '(filtered from _MAX_ total entries)',
			paginate: {
				first: 'First',
				last: 'Last',
				next: 'Next',
				previous: 'Previous'
			},
			emptyTable: 'No data available in table',
			zeroRecords: 'No matching records found'
		}
	}[config.language];

	$.extend( $.fn.dataTable.defaults, {
		dom        : 'Bfrtip', // l - amount of entities
		deferRender: true,
		scrollX    : false,
		scrollY    : 400,
		paging     : true,
		responsive : false,
		colReorder : true,
		fixedHeader: false,
		processing : true,
		stateSave  : true,
		language   : i18n,
		sessionStorage: 0, // localStorage
		lengthMenu : [ [10, 25, 50, 100, -1], [10, 25, 50, 100, i18n.lengthAll] ],
		pageLength : 25,
		order      : [[0, 'desc']],
		destroy    : true
	} );
};
