enyo.kind({
	name: "enyo.Fittable",
	published: {
		stretch: true
	},
	classes: "enyo-fittable",
	layoutComponents: [
		// box offsetHeight equals Rows content height, which is otherwise unavailable with calculations
		{name: "box", classes: "enyo-0 enyo-stretch", components: [
			// top offsetHeight will be sum of child heights (including child pad-border-margin) which otherwise requires calculations
			{name: "pre", classes: "enyo-0"},
			// flex can be sized without regard to child pad-border-margin, sizing child directly would require calculations
			{name: "flex", classes: "enyo-0 enyo-fittable-flex"},
			// bottom offsetHeight will be sum of child heights (including child pad-border-margin) which otherwise requires calculations
			{name: "post", classes: "enyo-0"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		if (!this.stretch) {
			this.stretchChanged();
		}
	},
	initComponents: function() {
		this.createChrome(this.layoutComponents);
		this.inherited(arguments);
	},
	stretchChanged: function() {
		this.$.box.addRemoveClass("enyo-stretch", this.stretch);
	},
	addChild: function(inControl) {
		if (this.$.box) {
			var p = this.$.pre;
			if (this.$.flex.children.length) {
				p = this.$.post;
			} else if (inControl.fit) {
				p = this.$.flex;
			}
			p.addChild(inControl);
		} else {
			this.inherited(arguments);
		}
	}
});

