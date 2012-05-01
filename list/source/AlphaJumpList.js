enyo.kind({
	name: "AlphaJumpList",
	kind: "List",
	scrollTools: [
		{name: "jumper", kind: "AlphaJumper"}
	],
	initComponents: function() {
		this.createChrome(this.scrollTools);
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		this.centerJumper();
	},
	resizeHandler: function() {
		this.inherited(arguments);
		this.centerJumper();
	},
	centerJumper: function() {
		var b = this.getBounds(), sb = this.$.jumper.getBounds();
		this.$.jumper.applyStyle("top", ((b.height - sb.height) / 2) + "px");
	}
});