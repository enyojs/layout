/**
	enyo.CollapsingArranger is an enyo.Arranger that displays the active 
	control, and some number of inactive controls, to fill the available 
	space. The active control is positioned on the left side of the
	container, and the rest of the views are laid out to the right, up to
	the available space. The last control, if it's visible, expands to fill
	whatever space is not taken by the previous controls.
	
	For best results with CollapsingArranger, you should set a minimum width
	for each control via a CSS style, for example { min-width: 25%; } or
	{ min-width: 250px; }
	
	Transitions between arrangements are handled by sliding the new control
	in from the right, and collapsing the old control to the left.
*/
enyo.kind({
	name: "enyo.CollapsingArranger",
	kind: "CarouselArranger",
	size: function() {
		this.clearLastSize();
		this.inherited(arguments);
	},
	//* @protected
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
	//* @public
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
	//* @protected
	fitControl: function(inControl, inOffset) {
		inControl._fit = true;
		inControl.applyStyle("width", (this.containerBounds.width - inOffset) + "px");
		inControl.resized();	
	}
});
