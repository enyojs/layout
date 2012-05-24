enyo.kind({
	name: "enyo.LeftRightArranger",
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
	name: "enyo.TopBottomArranger",
	kind: "LeftRightArranger",
	dragProp: "ddy",
	dragDirectionProp: "yDirection",
	canDragProp: "vertical",
	axisSize: "height",
	offAxisSize: "width",
	axisPosition: "top",
});

enyo.kind({
	name: "enyo.SpiralArranger",
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
	name: "enyo.GridArranger",
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
		enyo.Arranger.opacifyControl(inControl, inA.top % this.colHeight != 0 ? 0.25 : 1);
	},
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		return this.colWidth;
	}
});
