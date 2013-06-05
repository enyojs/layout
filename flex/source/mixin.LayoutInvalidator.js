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
		if (!this.hasNode()) { return; }
		switch (this.layoutKind) {
			case 'enyo.OmniFlexLayout':
				console.log('layout is', this.layout);
				// this.layout.reflow();
				break;
		}
		console.log(this.name, 'onInvalidateLayout');
	},
	
	rendered: function() {
		this.inherited(arguments);
		console.log('rendered', this.name);
		this.invalidateLayout();
	},

	invalidateLayout: function() {
		this.bubbleUp('onInvalidateLayout', {}, this);
	},

	contentChanged: function() {
		this.inherited(arguments);
		console.log(this.name, 'contentChanged');
		this.invalidateLayout();
	},

	classesChanged: function() {
		this.inherited(arguments);
		console.log(this.name, 'classesChanged');
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
