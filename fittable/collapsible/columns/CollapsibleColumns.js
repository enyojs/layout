enyo.kind({
	name: "enyo.CollapsibleColumns",
	kind: "FittableColumns",
	published: {
		index: 0, 
		collapsed: false
	},
	collapseWidth: 800,
	reflow: function() {
		var w = this.getBounds().width;
		this.setCollapsed(w < this.collapseWidth);
		if (!this.collapsed) {
			this.inherited(arguments);
		}
	},
	collapsedChanged: function() {
		this.addRemoveClass("enyo-collapsed-fittable", this.collapsed);
		this.syncControlsShowing();
	},
	indexChanged: function() {
		if (this.collapsed) {
			this.syncControlsShowing();
		}
	},
	syncControlsShowing: function() {
		for (var i=0, c$=this.getContentControls(), c; c=c$[i]; i++) {
			c.setShowing(this.collapsed ? i==this.index : true);
		}
	},
	getContentControls: function() {
		var c$ = [];
		c$ = c$.concat(this.$.pre.getClientControls());
		c$ = c$.concat(this.$.flex.getClientControls());
		c$ = c$.concat(this.$.post.getClientControls());
		return c$;
	}
});