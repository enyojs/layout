enyo.kind({
	name: "enyo.Panels",
	kind: "Control",
	layoutKind: "PanelsLayout",
	published: {
		index: 0,
		transitionKind: "PanelsTransition"
	},
	events: {
		onTransition: ""
	},
	create: function() {
		this.inherited(arguments);
		this.transitionKindChanged();
		this.indexChanged();
	},
	transitionKindChanged: function() {
		if (this.$.transition) {
			this.$.transition.destroy();
		}
		this.createComponent({name: "transition", kind: this.transitionKind, container: this, onTransition: "transitionComplete", layout: this.layout});
	},
	layoutKindChanged: function() {
		this.inherited(arguments);
		if (this.$.transition) {
			this.$.transition.layout = this.layout;
		}
	},
	// always fire indexChanged since transitions may want to update.
	setIndex: function(inIndex) {
		var l = this.index;
		this.index = inIndex;
		this.indexChanged(l);
	},
	indexChanged: function(inOldValue) {
		this.lastIndex = inOldValue || 0;
		if (!this.panelAtIndex(this.index)) {
			this.index = 0;
		}
		this.$.transition.begin();
	},
	setIndexDirect: function(inIndex) {
		this.setIndex(inIndex);
		this.$.transition.finish();
	},
	transitionComplete: function(inSender, inEvent) {
		this.doTransition({index: this.index});
		return true;
	},
	panelAtIndex: function(inIndex) {
		return this.getPanels()[inIndex];
	},
	getPanels: function() {
		return this.getClientControls();
	}
});