// FIXME: promote to Fittable.
enyo.kind({
	name: "enyo.FittableColumns2",
	kind: "FittableColumns",
	getContentControls: function() {
		var c$ = [];
		c$ = c$.concat(this.$.pre.getClientControls());
		c$ = c$.concat(this.$.flex.getClientControls());
		c$ = c$.concat(this.$.post.getClientControls());
		return c$;
	}
});

enyo.kind({
	name: "enyo.CollapsibleColumns",
	kind: "enyo.Panels",
	collapseWidth: 800,
	transitionKind: "FadeTransition",
	published: {
		collapsed: true
	},
	tools: [
		{name: "columns", kind: "FittableColumns2", classes: "enyo-fit", showing: false},
		{name: "panels", kind: "Panels", classes: "enyo-fit enyo-collapsed-children"},
	],
	create: function() {
		this.inherited(arguments);
		this.collapsedChanged();
	},
	initComponents: function() {
		this.createChrome(this.tools);
		this.inherited(arguments);
	},
	reflow: function() {
		this.inherited(arguments);
		if (this.hasNode()) {
			var w = this.getBounds().width;
			this.setCollapsed(w < this.collapseWidth);
		}
	},
	layoutKindChanged: function() {
		this.$.panels.setLayoutKind(this.layoutKind);
	},
	transitionKindChanged: function() {
		this.$.panels.setTransitionKind(this.transitionKind);
	},
	indexChanged: function() {
		this.$.panels.setIndex(this.index);
	},
	getPanels: function() {
		var p$ =  this.columnar ? this.$.columns.getContentControls() : this.$.panels.getPanels();
		if (!p$.length) {
			p$ = this.inherited(arguments);
		}
		return p$;
	},
	collapsedChanged: function() {
		this.log(this.collapsed);
		var target = this.collapsed ? this.$.panels : this.$.columns;
		var p$ = this.getPanels();
		for (var i=0, p; p=p$[i]; i++) {
			p.setContainer(target);
			p.setShowing(true);
		}
		//
		target.flow();
		// re-add to parent
		for (var i=0, p; p=p$[i]; i++) {
			if (p.hasNode()) {
				p.addNodeToParent();
			}
		}
		//
		// FIXME: can't set to an out of range index so index setting fails when not collapsed.
		if (this.collapsed) {
			this.$.panels.setIndexDirect(this.index);
		}
		this.$.columns.setShowing(!this.collapsed);
		this.$.panels.setShowing(this.collapsed);
		//
		target.resized();
		this.columnar = !this.collapsed;
	}
});