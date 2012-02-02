enyo.kind({
	name: "enyo.FitLayout",
	kind: "Layout",
	destroy: function() {
		this.inherited(arguments);
		this.unflow();
	},
	flow: function() {
		var t = this.container.layoutIndex || 0;
		for (var i=0, c$=this.container.children, c; c=c$[i]; i++) {
			c.addClass("enyo-fit");
			c.setShowing(t == i);
		}
	},
	reflow: function() {
		this.flow();
	},
	unflow: function() {
		for (var i=0, c$=this.container.children, c; c=c$[i]; i++) {
			c.removeClass("enyo-fit");
			c.setShowing(true);
		}
	}
});
