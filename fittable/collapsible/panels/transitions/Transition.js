enyo.kind({
	name: "enyo.Transition",
	kind: "Component",
	events: {
		onTransition: ""
	},
	begin: function() {
		this.transition();
	},
	transition: function() {
		this.completed();
	},
	finish: function() {
	},
	completed: function() {
		this.finish();
		this.doTransition();
	}
});