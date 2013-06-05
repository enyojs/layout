/**
 * Layout Invalidator Mixin for IE
 * Triggers FlexLayout reflow whenever content or class is changed
 * @author Lex Podgorny <lex.podgorny@lge.com>
 */

enyo.createMixin({
	name: 'LayoutInvalidator',
	
	// handlers: {
	// 	onInvalidateLayout: 'onInvalidateLayout'
	// },
	// 
	// onInvalidateLayout: function() {
	// 	switch (this.layoutKind) {
	// 		case 'enyo.OmniFlexLayout':
	// 			console.log('layout is', this.layout);
	// 			// this.layout.reflow();
	// 			break;
	// 	}
	// 	console.log(this.name, 'onInvalidateLayout');
	// },
	
	rendered: function() {
		this.inherited(arguments);
		this.invalidateLayout();
	},

	invalidateLayout: function() {
		if (!this.hasNode()) { return; }
		// this.bubbleUp('onInvalidateLayout', {}, this);
		if (typeof this.reflow == 'function') {
			this.reflow();
		}
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
