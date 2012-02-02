enyo.kind({
	name: "enyo.MeasuredBoxLayout",
	kind: "Layout",
	unit: "px",
	//* @protected
	destroy: function() {
		this.inherited(arguments);
		this.unflow();
	},
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
	},
	unflow: function() {
		if (this.orient == "h") {
			this._unflow("width", "left", "right", "top", "bottom");
		} else {
			this._unflow("height", "top", "bottom", "left", "right");
		}
	},
	_unflow: function(measure, mAttr, nAttr, pAttr, qAttr) {
		for (var i=0, c$ = this.container.children, c, ds; c=c$[i]; i++) {
			ds = c.domStyles;
			ds[measure] = ds[mAttr] = ds[nAttr] = ds[pAttr] = ds[qAttr] = null;
			c.domStylesChanged();
		}
	}
});

enyo.kind({
	name: "enyo.HMeasuredBoxLayout",
	kind: enyo.MeasuredBoxLayout,
	orient: "h"
});

enyo.kind({
	name: "enyo.VMeasuredBoxLayout",
	kind: enyo.MeasuredBoxLayout,
	orient: "v"
});


enyo.kind({
	name: "MeasuredControl",
	/*
	showingChanged: function() {
		this.inherited(arguments);
		if (this.showing) {
			this.reflowControls();
		}
	},
	*/
	reflowControls: function() {
		this.broadcastMessage("reflowControls");
	},
	reflowControlsHandler: function() {
		this.reflow();
		this.broadcastToControls("reflowControls");
	}
});

enyo.kind({
	name: "enyo.HMeasuredBox",
	kind: "Control",
	layoutKind: "enyo.HMeasuredBoxLayout"
});

enyo.kind({
	name: "enyo.VMeasuredBox",
	kind: "Control",
	layoutKind: "enyo.VMeasuredBoxLayout"
});

enyo.kind({
	name: "BoxFitLayout",
	kind: "DynamicLayout",
	strategyKind: "MeasuredBoxLayout",
	minStrategyKind: "FitLayout",
	createStrategy: function(inKind) {
		var r =  enyo.createFromKind(inKind, this.container);
		r.orient = this.container.orient || "v";
		return r;
	}
});