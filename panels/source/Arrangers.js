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
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		var i = Math.abs(inI0 % this.c$.length);
		//enyo.log(inI0, inI1);
		return inA0[i][this.axisPosition] - inA1[i][this.axisPosition];
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
	incrementalPoints: true,
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
	arrange: function(inC, inName) {
		var s = this.inc;
		for (var i=0, l=inC.length, c; c=inC[i]; i++) {
			var x = Math.cos(i/l * 2*Math.PI) * i * s + this.controlWidth;
			var y = Math.sin(i/l * 2*Math.PI) * i * s + this.controlHeight;
			this.arrangeControl(c, {left: x, top: y});
		}
	},
	start: function() {
		this.inherited(arguments);
		var c$ = this.getOrderedControls(this.container.toIndex);
		for (var i=0, c; c=c$[i]; i++) {
			c.applyStyle("z-index", c$.length - i);
		}
	},
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		return this.controlWidth;
	}
});


enyo.kind({
	name: "GridArranger",
	kind: "Arranger",
	incrementalPoints: true,
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
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
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
				var w = pb.width - s;
				fit.width = w >= 0 ? w : fit.width;
			}
		for (var i=0, e=padding.left, m, c; c=c$[i]; i++) {
			c.setBounds({top: padding.top, bottom: padding.bottom, width: c.fit ? c.width : null});
		}
	},
	arrange: function(inC, inName) {
		if (this.container.wrap) {
			this.arrangeWrap(inC, inName);
		} else {
			this.arrangeNoWrap(inC, inName);
		}
		
	},
	arrangeNoWrap: function(inC, inName) {
		var c$ = this.container.children;
		var s = this.container.clamp(inName);
		var nw = this.containerBounds.width;
		// do we have enough content to fill the width?
		for (var i=s, cw=0, c; c=c$[i]; i++) {
			cw += c.width + c.marginWidth;
			if (cw > nw) {
				break;
			}
		}
		// if content width is less than needed, adjust starting point index and offset
		var n = nw - cw;
		var o = 0;
		if (n > 0) {
			var s1 = s;
			for (var i=s-1, aw=0, c; c=c$[i]; i--) {
				aw += c.width + c.marginWidth;
				if (n - aw <= 0) {
					o = (n - aw);
					s = i;
					break;
				}
			}
		}
		// arrange starting from needed index with detected offset so we fill space
		for (var i=0, e=this.containerPadding.left + o, w, c; c=c$[i]; i++) {
			w = c.width + c.marginWidth;
			if (i < s) {
				this.arrangeControl(c, {left: -(w)});
			} else {
				this.arrangeControl(c, {left: Math.floor(e)});
				e += w;
			}
		}
	},
	arrangeWrap: function(inC, inName) {
		for (var i=0, e=this.containerPadding.left, m, c; c=inC[i]; i++) {
			this.arrangeControl(c, {left: e});
			e += c.width + c.marginWidth;
		}
	},
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		//enyo.log(inI0, inA0[inI0].left, inA1[inI0].left);
		var i = Math.abs(inI0 % this.c$.length);
		return inA0[i].left - inA1[i].left;
		//return this.containerBounds.width / this.c$.length;
	}
});

enyo.kind({
	name: "SlidingArranger",
	kind: "FittableColumnsArranger",
	arrange: function(inC, inIndex) {
		var c$ = this.container.children;
		enyo.log(inIndex);
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
	}
});


enyo.kind({
	name: "FitArranger",
	kind: "Arranger",
	layoutClass: "enyo-arranger enyo-arranger-fit",
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		return this.containerBounds.width;
	}
});

enyo.kind({
	name: "FadeArranger",
	kind: "FitArranger",
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

enyo.kind({
	name: "SlideInArranger",
	kind: "FitArranger",
	start: function() {
		var c$ = this.container.children;
		for (var i=0, c; c=c$[i]; i++) {
			c.setShowing(i == this.container.fromIndex || i == this.container.toIndex);
			if (c.showing) {
				c.resized();
			}
		}
		var l = this.container.fromIndex;
		var i = this.container.toIndex;
		this.container.transitionPoints = [
			i + "." + l + ".s",
			i + "." + l + ".f"
		]
	},
	finish: function() {
		this.inherited(arguments);
		var c$ = this.container.children;
		for (var i=0, c; c=c$[i]; i++) {
			c.setShowing(i == this.container.toIndex);
		}
	},
	arrange: function(inC, inName) {
		var p = inName.split(".");
		var f = p[0], s= p[1], starting = (p[2] == "s");
		var b = this.containerBounds.width;
		for (var i=0, c$=this.container.children, c, b, v; c=c$[i]; i++) {
			v = b;
			if (s == i) {
				v = starting ? 0 : -b;
			}
			if (f == i) {
				v = starting ? b : 0;
			}
			if (s == i && s == f) {
				v = 0;
			}
			this.arrangeControl(c, {left: v});
		}
	}
});