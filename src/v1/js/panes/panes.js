require('../../styl/panes.styl');

module.exports = function (params) {
	var $ = params.$;

	var i18n = {
		russian: {
		},
		english: {
		}
	}[params.language];

	var Class = function () {
		var self = this;
		this.panes = {};
		this.active = null;

		var domElem = this.elem = $('<div>', { class: 'panes' });
		this._tabs = $('<div>', { class: 'panes__tabs' });
		this._body = $('<div>', { class: 'panes__pane' });

		domElem.append([this._tabs, this._body]);

		domElem.on('click', '.panes__tab', function (e) {
			e.preventDefault();
			var $this = $(this);
			var pane = self.panes[$this.data('name')];
			if (!pane || pane.name === self.active) {
				return;
			}
			self._close();
			self._open(pane);
			window.scrollTop = 0;
		});
	};

	Class.prototype._open = function (pane) {
		pane.tab.addClass('panes__tab_active');
		pane.pane.appendTo(this._body);
		this.active = pane.name;
	};

	Class.prototype._close = function () {
		if (!this.active) {
			return;
		}
		var active = this.panes[this.active];
		active.tab.removeClass('panes__tab_active');
		active.pane.detach();
		this.active = null;
	};

	Class.prototype.add = function (paneInstance) {
		if (this.panes[paneInstance.name]) {
			return;
		}
		paneInstance.tab = $(`<div data-name="${paneInstance.name}" class="panes__tab">${paneInstance.title}</div>`);
		paneInstance.events = paneInstance.events || {};
		this.panes[paneInstance.name] = paneInstance;
		this._tabs.append(paneInstance.tab);

		if (paneInstance.active) {
			this.ensureActive(paneInstance.name);
		}

		this._attachPaneInstance(paneInstance);
	};

	/**
	 * Привязка большого Pane к компонентам вкладки
	 * @param paneInstance
	 * @private
	 */
	Class.prototype._attachPaneInstance = function (paneInstance) {
		var components = paneInstance.components;
		var component;
		Object.keys(components).forEach(function (componentName) {
			component = components[componentName];
			if (!component.__attach) {
				return;
			}
			component.__attach(this);
		}, this);
	};

	Class.prototype.emit = function (params) {
		this.panes[params.pane].events[params.event].call(this, params.value);
	};

	Class.prototype.ensureActive = function (name) {
		if (this.active || this.active === name) {
			return;
		}
		this.setActive(name);
	};

	Class.prototype.setActive = function (name) {
		if (this.active === name || !this.panes[name]) {
			return;
		}
		this.panes[name].tab.click();
	};

	return Class;
};
