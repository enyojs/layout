if (enyo.platform.ie) {
	enyo.createMixin({
		name: 'LayoutInvalidator',
		invalidateLayout: function() {
			enyo.FlexLayout.reflowFlexLayouts();
		},
		contentChanged: function() {
			this.inherited(arguments);
			this.invalidateLayout();
		},
		classesChanged: function() {
			this.inherited(arguments);
			this.invalidateLayout();
		},
		// Causes stack overflow
		// domStylesChanged: function() {
		// 			this.inherited(arguments);
		// 			this.invalidateLayout();
		// 		}
	});

	enyo.Control.extend({
		mixins: ['LayoutInvalidator']
	});
}