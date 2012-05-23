enyo.kind({
	name: "enyo.CollapsingArranger",
	kind: "CarouselArranger",
	size: function() {
		this.clearLastSize();
		this.inherited(arguments);
	},
	// clear size from last if it's not actually the last
	// (required for adding another control)
	clearLastSize: function() {
		for (var i=0, c$=this.container.children, c; c=c$[i]; i++) {
			if (c._fit && i != c$.length-1) {
				c.applyStyle("width", null);
				c._fit = null;
			}
		}
	},
	arrange: function(inC, inIndex) {
		var c$ = this.container.children;
		for (var i=0, e=this.containerPadding.left, m, c; c=c$[i]; i++) {
			this.arrangeControl(c, {left: e});
			if (i >= inIndex) {
				e += c.width + c.marginWidth;
			}
			// FIXME: overdragging-ish
			if (i == c$.length - 1 && inIndex < 0) {
				this.arrangeControl(c, {left: e - inIndex});
			}
		}
	},
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		var i = this.container.children.length-1;
		return Math.abs(inA1[i].left - inA0[i].left);
	},
	flowControl: function(inControl, inA) {
		this.inherited(arguments);
		if (this.container.realtimeFit) {
			var c$ = this.container.children;
			var l = c$.length-1;
			var last = c$[l];
			if (inControl == last) {
				this.fitControl(inControl, inA.left);
			}
		}
		
	},
	finish: function() {
		this.inherited(arguments);
		if (!this.container.realtimeFit && this.containerBounds) {
			var c$ = this.container.children;
			var a$ = this.container.arrangement;
			var l = c$.length-1;
			var c = c$[l];
			this.fitControl(c, a$[l].left);
		}
	},
	fitControl: function(inControl, inOffset) {
		inControl._fit = true;
		inControl.applyStyle("width", (this.containerBounds.width - inOffset) + "px");
		inControl.resized();	
	}
});
