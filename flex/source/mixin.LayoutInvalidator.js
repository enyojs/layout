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
	
	onInvalidateLayout: function(oSender, oEvent) {
		// console.log('onInvalidateLayout', this.name, 'from', oEvent.originator.name);

		if (!this.layoutKind) { return false; }

		if (this.layout instanceof enyo.ContentLayout) {
			this.layout.reflow();
			return true;
		} else if (this.layout instanceof enyo.FlexLayout) {
			if (this.layout.isSizeChanged(oEvent.originator)) {
				this.layout.reflow();
			}
			return true;
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
	},
	
	setBounds: function(inBounds, inUnit) {
		this.inherited(arguments);
		// console.log('Set bounds');
	},
	
	applyStyle: function(inStyle, inValue) {
		this.inherited(arguments);
		// console.log('applyStyle');
	},
	
	addStyles: function(inCssText) {
		this.inherited(arguments);
		// console.log('addStyles');
	},
	
	domStylesChanged: function(bDontInvalidate) {
		this.inherited(arguments);
		if (!bDontInvalidate) {
			// console.log('Style changed', !!bDontInvalidate);
			this.invalidateLayout();
		}
	}
});

enyo.Control.extend({
	mixins: ['LayoutInvalidator']
});
