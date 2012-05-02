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
	},
	finish: function() {
	},
	calcArrangementDifference: function(inState0, inState1) {
	},
	_arrange: function(inIndex) {
		var c$ = this.getOrderedControls(inIndex);
		this.arrange(c$, inIndex);
	},
	arrangeControl: function(inControl, inArrangement) {
		inControl._arranger = enyo.mixin(inControl._arranger || {}, inArrangement);
	},
	canDragEvent: function(inEvent) {
		return this.container.draggable && inEvent[this.canDragProp];
	},
	measureArrangementDelta: function(inX, inA0, inA1) {
		var d = this.calcArrangementDifference(inA0, inA1);
		var s = d ? inX / d : 0;
		return s;
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
		if (inA.opacity != null) {
			inControl.applyStyle("opacity", inA.opacity);
		}
	},
	// get an array of controls arranged in state order.
	// note: optimization, dial around a single array.
	getOrderedControls: function(inIndex) {
		var whole = Math.floor(inIndex);
		var a = whole - this.controlsIndex;
		var sign = a > 0;
		var c$ = this.c$;
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