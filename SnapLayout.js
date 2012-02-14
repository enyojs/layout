enyo.kind({
	name: "enyo.SnapLayout",
	kind: "Layout",
	layoutClass: "enyo-snap-scroll-layout",
	useTransform: true,
	centered: true,
	scale: 1,
	accelerated: "auto",
	unit: "px",
	pad: 0,
	//* @protected
	constructor: function(inContainer) {
		this.inherited(arguments);
		this.orientChanged();
	},
	setOrient: function(inOrient) {
		this.orient = inOrient;
		this.unflow();
		this.orientChanged();
		this.flow();
		this.reflow();
	},
	orientChanged: function() {
		var h = this.orient == "h";
		this.measure = h ? "width" : "height";
		this.transform = h ? "translateX" : "translateY";
		this.offExtent = h ? "bottom" : "right";
	},
	unflow: function() {
		for (var i=0, c$ = this.container.children, c, ds; c=c$[i]; i++) {
			ds = c.domStyles;
			ds["top"] = ds["right"] = ds["left"] = ds["bottom"] = null;
			c.domStylesChanged();
			this.controlToPosition(c, 0 + "px");
		}
	},
	// static-y property based layout
	flow: function() {
		var s = (this.container.pad||0) + this.unit;
		var b = {top: s, left: s};
		b[this.offExtent] = s;
		for (var i=0, c$ = this.container.children, c; c=c$[i]; i++) {
			enyo.Layout.accelerate(c, this.accelerated);
			b[this.measure] = this.calcMeasuredBound(c);
			c.setBounds(b, "");
		}
	},
	calcMeasuredBound: function(inControl) {
		var m = inControl[this.measure];
		return Number(m) == m ? m+this.unit : m;
	},
	// dynamic-y measure based layout
	reflow: function() {
		var offset = this.offset || (this.offset = 0);
		var li = this.index || (this.index = 0);
		var cb = this.container.getBounds()[this.measure];
		var scale = this.scale;
		var ci = this.container.children[li];
		var b = !this.centered || !ci ? 0 : (cb - this.measureControl(ci)) / 2;
		var o = offset + b;
		// layout out foward from offset until screen is filled
		for (var i=li || 0, c$ = this.container.children, c; c=c$[i]; i++) {
			if (o < cb) {
				this.controlToPosition(c, o + "px");
				o += this.measureControl(c);
			} else {
				this.hideControl(c);
			}
		}
		// layout out backward from offset until screen is filled
		o = offset + b;
		for (var i=li-1, c$ = this.container.children, c; c=c$[i]; i--) {
			if (o >= 0) {
				o -= this.measureControl(c);
				this.controlToPosition(c, o+"px");
			} else {
				this.hideControl(c);
			}
		}
	},
	hideControl: function(inControl) {
		this.controlToPosition(inControl, this.useTransform ? "-100%" : "5000px");
	},
	controlToPosition: function(inControl, inValue) {
		if (this.useTransform) {
			enyo.Layout.transformValue(inControl, this.transform, inValue);
		} else {
			var n = inControl.hasNode();
			if (n) {
				var d = this.orient == "h" ? "left" : "top";
				n.style[d] = inControl.domStyles[d] = inValue;
			}
		}
	},
	measureControl: function(inControl) {
		return ((inControl.getBounds()[this.measure]) + (this.container.pad || 0) * 2) * this.scale;
	}
});

enyo.kind({
	name: "enyo.HSnapLayout",
	kind: enyo.SnapLayout,
	orient: "h"
});

enyo.kind({
	name: "enyo.VSnapLayout",
	kind: enyo.SnapLayout,
	orient: "v"
});
