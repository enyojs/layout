enyo.kind({
	name: "enyo.SnapBgLayout",
	kind: "enyo.SnapLayout",
	bgSize: 1.2,
	reflow: function() {
		this.inherited(arguments);
		var s = this.container.getBounds()[this.measure] * this.bgSize;
		var f = this.calcOffsetFraction();
		// scroll distance
		var bs = s * this.bgSize - s;
		// scroll amount
		var x = Math.round(bs * f) || 0;
		this.container.applyStyle("background-position", this.orient == "h" ? x + "px 100%" : "100% " + x + "px");
	},
	calcOffsetFraction: function() {
		var li = this.index || 0;
		for (var i=0, c$=this.container.children, oi=0, o=0, v=0, l=0, n, c; c=c$[i]; i++) {
			if (i == li) {
				oi = o;
			}
			if (this.centered) {
				v = l || this.measureControl(c);
				n = c$[i+1];
				l = n && this.measureControl(n) || 0;
				o += (v + l) / 2;
			} else {
				o += i < c$.length-1 ? this.measureControl(c) || 0 : 0;
			}
		}
		var f = (-oi + this.offset) / o;
		return f;
	}
});