enyo.kind({
	name: "enyo.CardArranger",
	kind: "Arranger",
	layoutClass: "enyo-arranger enyo-arranger-fit",
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		return this.containerBounds.width;
	},
	arrange: function(inC, inName) {
		for (var i=0, c, b, v; c=inC[i]; i++) {
			v = (i == 0) ? 1 : 0;
			this.arrangeControl(c, {opacity: v});
		}
	},
	start: function() {
		this.inherited(arguments);
		var c$ = this.container.children;
		for (var i=0, c; c=c$[i]; i++) {
			c.setShowing(i == this.container.fromIndex || i == (this.container.toIndex));
			if (c.showing) {
				c.resized();
			}
		}
		
	},
	finish: function() {
		this.inherited(arguments);
		var c$ = this.container.children;
		for (var i=0, c; c=c$[i]; i++) {
			c.setShowing(i == this.container.toIndex);
		}
	}
});