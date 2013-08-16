/**
 * Layout Invalidator Mixin for IE
 * Triggers FlexLayout reflow whenever content or class is changed
 * @author Lex Podgorny <lex.podgorny@lge.com>
 */

enyo.LayoutInvalidator = {
	name: 'LayoutInvalidator',

	handlers: {
		onInvalidateLayout: 'onInvalidateLayout'
	},

	onInvalidateLayout: function() {
		if (!this.layoutKind) { return false; }
		if (this.layout.kindName == 'enyo.ContentLayout') {
			this.layout.reflow();
		}
	},

	rendered: enyo.super(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.invalidateLayout();
		};
	}),

	invalidateLayout: function() {
		if (!this.hasNode()) { return; }
		this.bubble('onInvalidateLayout', {}, this);
	},

	contentChanged: enyo.super(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.invalidateLayout();
		};
	}),

	classesChanged: enyo.super(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.invalidateLayout();
		};
	})

	// Causes stack overflow
	// domStylesChanged: function() {
	//    this.inherited(arguments);
	//    this.invalidateLayout();
	// }
};

enyo.Control.extend({
	mixins: ['enyo.LayoutInvalidator']
});
