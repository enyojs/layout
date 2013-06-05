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
		switch (this.layout.kindName) {
			case 'enyo.ContentLayout':
				this.layout.reflow();
				break;
		}
	},
	
	rendered: function() {
		this.inherited(arguments);
		this.invalidateLayout();
	},

	invalidateLayout: function() {
		if (!this.hasNode()) { return; }
		this.bubble('onInvalidateLayout', {}, this);
		// if (typeof this.reflow == 'function') {
		// 			this.reflow();
		// 		}
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
