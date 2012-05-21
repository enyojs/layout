/**
	enyo.Arranger is a enyo.Layout considers one of the controls it lays out as active.
	The other controls are placed relative to the active control as makes sense in the layout.
*/
enyo.kind({
	name: "enyo.Arranger",
	kind: "Layout",
	layoutClass: "enyo-arranger",
	accelerated: "auto",
	dragProp: "ddx",
	dragDirectionProp: "xDirection",
	canDragProp: "horizontal",
	arrange: function(inC, inIndex) {
	},
	size: function() {
	},
	start: function() {
		var f = this.container.fromIndex, t = this.container.toIndex;
		var p$ = this.container.transitionPoints = [f];
		// optionally add a transition point for each index between from and to.
		if (this.incrementalPoints) {
			var d = Math.abs(t - f) - 2;
			var i = f;
			while (d >= 0) {
				i = i + (t < f ? -1 : 1)
				p$.push(i);
				d--;
			}
		}
		p$.push(this.container.toIndex);
	},
	finish: function() {
	},
	//* @protected
	canDragEvent: function(inEvent) {
		return inEvent[this.canDragProp];
	},
	calcDragDirection: function(inEvent) {
		return inEvent[this.dragDirectionProp];
	},
	calcDrag: function(inEvent) {
		return inEvent[this.dragProp];
	},
	drag: function(inDp, inAn, inA, inBn, inB) {
		var f = this.measureArrangementDelta(-inDp, inAn, inA, inBn, inB);
		return f;
	},
	measureArrangementDelta: function(inX, inI0, inA0, inI1, inA1) {
		var d = this.calcArrangementDifference(inI0, inA0, inI1, inA1);
		var s = d ? inX / Math.abs(d) : 0;
		s = s * (this.container.fromIndex > this.container.toIndex ? -1 : 1);
		//enyo.log("delta", s);
		return s;
	},
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
	},
	_arrange: function(inIndex) {
		var c$ = this.getOrderedControls(inIndex);
		this.arrange(c$, inIndex);
	},
	arrangeControl: function(inControl, inArrangement) {
		inControl._arranger = enyo.mixin(inControl._arranger || {}, inArrangement);
	},
	flow: function() {
		this.c$ = [].concat(this.container.children);
		this.controlsIndex = 0;
		for (var i=0, c$=this.container.children, c; c=c$[i]; i++) {
			enyo.dom.accelerate(c, this.accelerated);
		}
	},
	reflow: function() {
		var cn = this.container.hasNode();
		this.containerBounds = cn ? {width: cn.clientWidth, height: cn.clientHeight} : {};
		this.size();
	},
	//* @public
	flowArrangement: function() {
		var a = this.container.arrangement;
		if (a) {
			for (var i=0, c$=this.container.children, c; c=c$[i]; i++) {
				this.flowControl(c, a[i]);
			}
		}
	},
	flowControl: function(inControl, inA) {
		enyo.Arranger.positionControl(inControl, inA);
		var o = inA.opacity;
		if (o != null) {
			o = o > .99 ? 1 : (o < .01 ? 0 : o);
			inControl.applyStyle("opacity",  o);
		}
	},
	//* @protected
	// get an array of controls arranged in state order.
	// note: optimization, dial around a single array.
	getOrderedControls: function(inIndex) {
		var whole = Math.floor(inIndex);
		var a = whole - this.controlsIndex;
		var sign = a > 0;
		var c$ = this.c$ || [];
		for (var i=0; i<Math.abs(a); i++) {
			if (sign) {
				c$.push(c$.shift());
			} else {
				c$.unshift(c$.pop());
			}
		}
		this.controlsIndex = whole;
		return c$;
	},
	statics: {
		positionControl: function(inControl, inBounds, inUnit) {
			var unit = inUnit || "px";
			if (!this.updating) {
				var t = enyo.dom.getCssTransformProp();
				if (t) {
					var l = inBounds.left, t = inBounds.top;
					var l = enyo.isString(l) ? l : l && (l + "px");
					var t = enyo.isString(t) ? t : t && (t + "px");
					enyo.dom.transform(inControl, {translateX: l || null, translateY: t || null});
				} else {
					inControl.setBounds(inBounds, inUnit);
				}
			}
		}
	}
});