enyo.kind({
	name: "enyo.Fittable",
	classes: "enyo-fittable",
	components: [
		// box offsetHeight equals Rows content height, which is otherwise unavailable with calculations
		{name: "box", classes: "enyo-0", components: [
			// top offsetHeight will be sum of child heights (including child pad-border-margin) which otherwise requires calculations
			{name: "pre", classes: "enyo-0"},
			// flex can be sized without regard to child pad-border-margin, sizing child directly would require calculations
			{name: "flex", classes: "enyo-0 enyo-fittable-flex"},
			// bottom offsetHeight will be sum of child heights (including child pad-border-margin) which otherwise requires calculations
			{name: "post", classes: "enyo-0"}
		]}
	],
	flow: function() {
		var recontain = function(o, c) {
			if (o.container != c) {
				o.setContainer(c);
			}
		}
		var c$ = this.getClientControls();
		for (var i=0, c; c=c$[i]; i++) {
			if (c.fit) {
				recontain(c, this.$.flex);
				break;
			}
			recontain(c, this.$.pre);
		}
		for (i++; c=c$[i]; i++) {
			recontain(c, this.$.post);
		}
	}
});