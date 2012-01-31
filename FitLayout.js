enyo.kind({
	name: "enyo.FitLayout",
	kind: "Layout",
	index: 0,
	destroy: function() {
		this.inherited(arguments);
		this.unflow();
	},
	flow: function() {
		for (var i=0, c$=this.container.children, c; c=c$[i]; i++) {
			c.addClass("enyo-fit");
			c.setShowing(this.index == i);
		}
	},
	unflow: function() {
		for (var i=0, c$=this.container.children, c; c=c$[i]; i++) {
			c.removeClass("enyo-fit");
			c.setShowing(true);
		}
	}
});
