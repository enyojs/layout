/**
 * Layout Invalidator Mixin for IE
 * Triggers FlexLayout reflow whenever content or class is changed
 * @author Lex Podgorny <lex.podgorny@lge.com>
 */

enyo.createMixin({
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
	
	rendered: function() {
		this.inherited(arguments);
		this.invalidateLayout();
	},

	invalidateLayout: function() {
		if (!this.hasNode()) { return; }
		this.bubble('onInvalidateLayout', {}, this);
	},

	contentChanged: function() {
		this.inherited(arguments);
		this.invalidateLayout();
	},

	classesChanged: function() {
		this.inherited(arguments);
		this.invalidateLayout();
	}

	// Causes stack overflow
	// domStylesChanged: function() {
	//    this.inherited(arguments);
	//    this.invalidateLayout();
	// }
});

enyo.Control.extend({
	mixins: ['LayoutInvalidator']
});
