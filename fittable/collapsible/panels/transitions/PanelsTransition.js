enyo.kind({
	name: "enyo.PanelsTransition",
	kind: "Transition",
	finish: function() {
		this.layout.index = this.container.index;
		this.layout.flow();
		this.inherited(arguments);
	}
});