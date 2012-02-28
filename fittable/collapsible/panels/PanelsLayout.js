enyo.kind({
	name: "enyo.PanelsLayout",
	kind: "Layout",
	layoutClass: "enyo-fit-children",
	destroy: function() {
		this.inherited(arguments);
		this.unflow();
	},
	flow: function() {
		var t = this.index || 0;
		for (var i=0, c$=this.container.children, c; c=c$[i]; i++) {
			c.setShowing(t == i);
		}
	},
	unflow: function() {
		for (var i=0, c$=this.container.children, c; c=c$[i]; i++) {
			c.setShowing(true);
		}
	}
});
