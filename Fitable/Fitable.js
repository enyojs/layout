enyo.kind({
	name: "enyo.Stack",
	components: [
		// box offsetHeight equals Rows content height, which is otherwise unavailable with calculations
		{name: "box", classes: "enyo-0", style: "height: 100%;", components: [
			// top offsetHeight will be sum of child heights (including child pad-border-margin) which otherwise requires calculations
			{name: "pre", classes: "enyo-0", Xstyle: "overflow: hidden;"},
			// flex can be sized without regard to child pad-border-margin, sizing child directly would require calculations
			{name: "flex", classes: "enyo-0 enyo-row-flex"},
			// bottom offsetHeight will be sum of child heights (including child pad-border-margin) which otherwise requires calculations
			{name: "post", classes: "enyo-0", Xstyle: "overflow: hidden;"}
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

enyo.kind({
	name: "enyo.Rows",
	kind: "enyo.Stack",
	reflow: function() {
		var t = this.$.pre.getBounds().height;
		var b = this.$.post.getBounds().height;
		var h = this.$.box.getBounds().height;
		this.$.flex.applyStyle("height", h - t -b + "px");
	}
});

enyo.kind({
	// doesn't support top/bottom margin on child elements (left/right ok)
	name: "enyo.Cols",
	kind: "enyo.Stack",
	initComponents: function() {
		this.inherited(arguments);
		this.$.box.addClass("enyo-col-box");
	},
	reflow: function() {
		var l = this.$.pre.getBounds().width;
		var r = this.$.post.getBounds().width;
		var w = this.$.box.getBounds().width;
		this.$.flex.applyStyle("width", w - l - r + "px");
	}
});