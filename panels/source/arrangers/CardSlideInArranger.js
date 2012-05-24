enyo.kind({
	name: "enyo.CardSlideInArranger",
	kind: "CardArranger",
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