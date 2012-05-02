enyo.kind({
	name: "LeftRightArranger",
	kind: "Arranger",
	margin: 40,
	axisSize: "width",
	offAxisSize: "height",
	axisPosition: "left",
	constructor: function() {
		this.inherited(arguments);
		this.margin = this.container.margin != null ? this.container.margin : this.margin;
	},
	size: function() {
		var c$ = this.container.children;
		var port = this.containerBounds[this.axisSize];
		var box = port - this.margin -this.margin;
		for (var i=0, b, c; c=c$[i]; i++) {
			b = {};
			b[this.axisSize] = box;
			b[this.offAxisSize] = "100%";
			c.setBounds(b);
		}
	},
	arrange: function(inC, inIndex) {
		var o = Math.floor(this.container.children.length/2);
		var c$ = this.getOrderedControls(Math.floor(inIndex)-o);
		var box = this.containerBounds[this.axisSize] - this.margin -this.margin;
		var e = this.margin - box * o;
		var m = (c$.length - 1) / 2;
		for (var i=0, c, b, v; c=c$[i]; i++) {
			b = {};
			b[this.axisPosition] = e;
			b.opacity  = (i == 0 || i == c$.length-1) ? 0 : 1;
			this.arrangeControl(c, b);
			e += box;
		}
	},
	calcArrangementDifference: function(inA0, inA1) {
		return Math.abs(inA1[0][this.axisPosition] - inA0[0][this.axisPosition]);
	}
});

enyo.kind({
	name: "TopBottomArranger",
	kind: "LeftRightArranger",
	dragProp: "ddy",
	dragDirectionProp: "yDirection",
	canDragProp: "vertical",
	axisSize: "height",
	offAxisSize: "width",
	axisPosition: "top",
});

enyo.kind({
	name: "SpiralArranger",
	kind: "Arranger",
	inc: 20,
	size: function() {
		var c$ = this.container.children;
		var b = this.containerBounds;
		var w = this.controlWidth = b.width/3;
		var h = this.controlHeight = b.height/3;
		for (var i=0, c; c=c$[i]; i++) {
			c.setBounds({width: w, height: h});
		}
	},
	arrange: function(inC, inState) {
		var s = this.inc;
		for (var i=0, l=inC.length, c; c=inC[i]; i++) {
			var x = Math.cos(i/l * 2*Math.PI) * i * s + this.controlWidth;
			var y = Math.sin(i/l * 2*Math.PI) * i * s + this.controlHeight;
			this.arrangeControl(c, {left: x, top: y});
		}
	},
	applyState: function() {
		this.inherited(arguments);
		var c$ = this.getOrderedControls(this.container.state);
		for (var i=0, c; c=c$[i]; i++) {
			c.applyStyle("z-index", i);
		}
	},
	calcArrangementDifference: function(inState0, inState1) {
		return this.controlWidth;
	}
});


enyo.kind({
	name: "GridArranger",
	kind: "Arranger",
	colWidth: 100,
	colHeight: 100,
	size: function() {
		var c$ = this.container.children;
		var w=this.colWidth, h=this.colHeight;
		for (var i=0, c; c=c$[i]; i++) {
			c.setBounds({width: w, height: h});
		}
	},
	arrange: function(inC, inIndex) {
		var w=this.colWidth, h=this.colHeight;
		var cols = Math.floor(this.containerBounds.width / w);
		for (var y=0, i=0; i<inC.length; y++) {
			for (var x=0; (x<cols) && (c=inC[i]); x++, i++) {
				this.arrangeControl(c, {left: w*x, top: h*y});
			}
		}
	},
	flowControl: function(inControl, inA) {
		this.inherited(arguments);
		inControl.applyStyle("opacity", inA.top % this.colHeight != 0 ? 0.25 : 1);
	},
	calcArrangementDifference: function(inState0, inState1) {
		return this.colWidth;
	}
});


enyo.kind({
	name: "FittableColumnsArranger",
	kind: "Arranger",
	size: function() {
		var c$ = this.container.children;
		var padding = this.containerPadding = this.container.hasNode() ? enyo.FittableLayout.calcPaddingExtents(this.container.node) : {};
		var pb = this.containerBounds;
		pb.height -= padding.top + padding.bottom;
		pb.width -= padding.left + padding.right;
		// used space
		var fit;
		for (var i=0, s=0, m, c; c=c$[i]; i++) {
			m = enyo.FittableLayout.calcMarginExtents(c.hasNode());
			c.width = c.getBounds().width;
			c.marginWidth = m.right + m.left;
			s += (c.fit ? 0 : c.width) + c.marginWidth;
			if (c.fit) {
				fit = c;
			}
		}
		if (fit) {
				fit.width = pb.width - s;
			}
		for (var i=0, e=padding.left, m, c; c=c$[i]; i++) {
			c.setBounds({top: padding.top, bottom: padding.bottom, width: c.fit ? c.width : null});
		}
	},
	arrange: function(inC, inState) {
		if (this.container.wrap) {
			this.arrangeWrap(inC, inState);
		} else {
			this.arrangeNoWrap(inC, inState);
		}
		
	},
	arrangeNoWrap: function(inC, inState) {
		var c$ = this.container.children;
		var s = this.container.clamp(inState);
		var offset = 0;
		for (var i=0, c; (i < s) && (c=c$[i]); i++) {
			offset += c.width + c.marginWidth;
		}
		
		for (var i=0, e=this.containerPadding.left - offset, m, c; c=c$[i]; i++) {
			this.arrangeControl(c, {left: Math.floor(e)});
			e += c.width + c.marginWidth;
		}
	},
	arrangeWrap: function(inC, inState) {
		for (var i=0, e=this.containerPadding.left, m, c; c=inC[i]; i++) {
			this.arrangeControl(c, {left: e});
			e += c.width + c.marginWidth;
		}
	},
	calcArrangementDifference: function() {
		return this.containerBounds.width / this.c$.length;
	}
});

enyo.kind({
	name: "SlidingArranger",
	kind: "FittableColumnsArranger",
	arrange: function(inC, inState) {
		var c$ = this.container.children;
		for (var i=0, e=this.containerPadding.left, m, c; c=c$[i]; i++) {
			this.arrangeControl(c, {left: e});
			if (i >= inState) {
				e += c.width + c.marginWidth;
			}
		}
	},
	calcArrangementDifference: function(inA0, inA1) {
		var i = this.container.children.length-1;
		return Math.abs(inA1[i].left - inA0[i].left);
	}
});


enyo.kind({
	name: "FitArranger",
	kind: "Arranger",
	layoutClass: "enyo-arranger enyo-arranger-fit"
});

enyo.kind({
	name: "FadeArranger",
	kind: "FitArranger",
	arrange: function(inC, inState) {
		for (var i=0, c, b, v; c=inC[i]; i++) {
			v = (i == 0) ? 1 : 0;
			this.arrangeControl(c, {opacity: v});
		}
	},
	calcArrangementDifference: function(inA0, inA1) {
		return this.containerBounds.width;
	}
});

enyo.kind({
	name: "Fade1Arranger",
	kind: "FadeArranger",
	start: function() {
		var c$ = this.container.children;
		for (var i=0, c; c=c$[i]; i++) {
			c.setShowing(i == this.container.index || i == this.container.state);
		}
		this.container.startState = this.container.state;
		this.container.endState = this.container.index;
	},
	finish: function() {
		this.container.startState = null;
		this.container.endState = null;
		var c$ = this.container.children;
		for (var i=0, c; c=c$[i]; i++) {
			c.setShowing(i == this.container.index);
		}
	}
});