enyo.kind({
	name: "enyo.SnapLayout",
	kind: "Layout",
	layoutClass: "enyo-snap-scroll-layout",
	offset: 0,
	centered: true,
	minifySize: 1000,
	unit: "px",
	pad: 0,
	//* @protected
	constructor: function(inContainer) {
		this.inherited(arguments);
		this.index = this.container.index || 0;
		this.offset = this.container.offset || 0;
		this.orientationChanged();
	},
	orientationChanged: function() {
		var h = this.orient == "h";
		this.measure = h ? "width" : "height";
		this.transform = h ? "translateX" : "translateY";
		this.offExtent = h ? "bottom" : "right";
	},
	// static-y property based layout
	flow: function() {
		var s = (this.container.pad||0) + this.unit;
		var b = {top: s, left: s};
		b[this.offExtent] = s;
		for (var i=0, c$ = this.container.children, c, m; c=c$[i]; i++) {
			// place offff screen (what about using display: none?)
			this.applyTransform(c, "-200%");
			m = c[this.measure];
			b[this.measure] = Number(m) == m ? m+this.unit : m;
			if (this.minified) {
				b[this.measure] = "100%";
			}
			c.setBounds(b, "");
		}
	},
	setMinified: function(inMinify) {
		if (this.minified != inMinify) {
			console.log("change minify!");
			this.minified = inMinify;
			this.flow();
		}
	},
	// dynamic-y measure based layout
	reflow: function() {
		var cb = this.container.getBounds()[this.measure];
		this.setMinified(cb < this.minifySize);
		var li = this.index || 0;
		var b = !this.centered ? 0 : (cb - this.measureControl(this.container.children[li])) / 2;
		var o = this.offset + b;
		// layout out foward from offset until screen is filled
		for (var i=li || 0, c$ = this.container.children, c; c=c$[i]; i++) {
			this.applyTransform(c, o + "px", true);
			o += this.measureControl(c);
			if (o > cb) {
				break;
			}
		}
		// layout out backward from offset until screen is filled
		o = this.offset + b;
		if (o > 0) {
			for (var i=li-1, c$ = this.container.children, c; c=c$[i]; i--) {
				o -= this.measureControl(c);
				this.applyTransform(c, o+"px", true);
				if (o < 0) {
					break;
				}
			}
		}
	},
	applyTransform: function(inControl, inValue, inApply) {
		var t = this.transform + "(" + inValue + ")";
		var ds = inControl.domStyles;
		ds["-webkit-transform"] = ds["-moz-transform"] = ds["-ms-transform"] = ds["transform"] = t;
		if (inApply && inControl.hasNode()) {
			var s = inControl.node.style;
			s.webkitTransform = s.MozTransform = s.msTransform = s.transform = t;
		}
	},
	measureControl: function(inControl) {
		return inControl.getBounds()[this.measure] + (this.container.pad || 0) * 2;
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

enyo.kind({
	name: "HSnap",
	kind: "Control",
	layoutKind: "HSnapLayout"
});

enyo.kind({
	name: "VSnap",
	kind: "Control",
	layoutKind: "VSnapLayout"
});