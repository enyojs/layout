enyo.kind({
	name: "enyo.BoxLayout",
	kind: "Layout",
	unit: "px",
	//* @protected
	calcMetrics: function(inMeasure) {
		var m = {flex: 0, fixed: 0};
		for (var i=0, c$ = this.container.children, c; c=c$[i]; i++) {
			m.flex += c.flex || 0;
			m.fixed += c[inMeasure] || 0;
		}
		return m;
	},
	flow: function() {
		var c$ = this.container.children;
		for (var i=0, c; c=c$[i]; i++) {
			c.addClass("enyo-box-div");
		}
	},
	_reflow: function(measure, mAttr, nAttr, pAttr, qAttr) {
		var m = this.calcMetrics(measure);
		var p = ("pad" in this.container) ? Number(this.container.pad) : 0;
		//
		var pb = this.container.getBounds();
		var c$ = this.container.children;
		var free = pb[measure] - m.fixed - (p * (c$.length + 1));
		//
		var b = {};
		b[pAttr] = b[qAttr] = p;
		//
		for (var i=0, o=0, ex, c; c=c$[i]; i++) {
			o += p;
			ex = Math.round(c.flex ? (c.flex / m.flex) * free : Number(c[measure]) || 96);
			b[measure] = ex;
			b[mAttr] = o;
			c.setBounds(b, this.unit);
			o += ex;
		}
	},
	reflow: function() {
		if (this.orient == "h") {
			this._reflow("width", "left", "right", "top", "bottom");
		} else {
			this._reflow("height", "top", "bottom", "left", "right");
		}
	}
});

enyo.kind({
	name: "enyo.HBoxLayout",
	kind: enyo.BoxLayout,
	orient: "h"
});

enyo.kind({
	name: "enyo.VBoxLayout",
	kind: enyo.BoxLayout,
	orient: "v"
});

enyo.kind({
	name: "enyo.HBox",
	kind: "Control",
	layoutKind: "enyo.HBoxLayout"
});

enyo.kind({
	name: "enyo.VBox",
	kind: "Control",
	layoutKind: "enyo.VBoxLayout"
});
