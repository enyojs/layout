enyo.kind({
	name: "Stack",
	published: {
		margin: 0,
		padding: 0
	},
	rendered: function() {
		this.inherited(arguments);
		this.reflow();
	},
	marginChanged: function() {
		this.reflow();
	},
	paddingChanged: function() {
		this.reflow();
	}

});
enyo.kind({
	name: "Columns",
	kind: "Stack",
	reflow: function() {
		var b = {left: this.margin, right: this.margin};
		var c$ = this.getControls(), c;
		for (var i=0; (c=c$[i]); i++) {
			//c.addStyles("position: absolute; top: 0; bottom: 0; margin-left: 0; margin-right: 0; right: auto;");
			c.addStyles("position: absolute; top: 0; bottom: 0; right: auto;");
			c.applyStyle("left", b.left + "px");
			if (c.fit) {
				break;
			}
			b.left += c.getBounds().width + this.padding;
		}
		if (c && c.fit) {
			for (var j=c$.length-1; c=c$[j]; j--) {
				c.applyStyle("right", b.right + "px");
				if (c.fit) {
					break;
				}
				c.addStyles("position: absolute; top: 0; bottom: 0; left: auto;");
				//c.addStyles("position: absolute; top: 0; bottom: 0; margin-left: 0; margin-right: 0; left: auto;");
				b.right += c.getBounds().width + this.padding;
			}
		}
	}
});

enyo.kind({
	name: "Rows",
	kind: "Stack",
	reflow: function() {
		var b = {top: this.margin, bottom: this.margin};
		var c$ = this.getControls(), c;
		for (var i=0; (c=c$[i]); i++) {
			c.addStyles("position: absolute; left: 0; right: 0; bottom: auto;");
			//c.addStyles("position: absolute; left: 0; right: 0; margin-top: 0; margin-bottom: 0; bottom: auto;");
			c.applyStyle("top", b.top + "px");
			if (c.fit) {
				break;
			}
			b.top += c.getBounds().height + this.padding;
		}
		if (c && c.fit) {
			for (var j=c$.length-1; c=c$[j]; j--) {
				c.applyStyle("bottom", b.bottom + "px");
				if (c.fit) {
					break;
				}
				c.addStyles("position: absolute; left: 0; right: 0; top: auto;");
				//c.addStyles("position: absolute; left: 0; right: 0; margin-top: 0; margin-bottom: 0; top: auto;");
				b.bottom += c.getBounds().height + this.padding;
			}
		}
	}
});

enyo.kind({
	name: "Rows",
	components: [
		// box offsetHeight equals Rows content height, which is otherwise unavailable with calculations
		{name: "box", classes: "enyo-0", style: "height: 100%;", components: [
			// top offsetHeight will be sum of child heights (including child pad-border-margin) which otherwise requires calculations
			{name: "top", classes: "enyo-0", style: "overflow: hidden;"},
			// flex can be sized without regard to child pad-border-margin, sizing child directly would require calculations
			{name: "flex", classes: "enyo-0 enyo-row-flex"},
			// bottom offsetHeight will be sum of child heights (including child pad-border-margin) which otherwise requires calculations
			{name: "bottom", classes: "enyo-0", style: "overflow: hidden;"}
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
			recontain(c, this.$.top);
		}
		for (i++; c=c$[i]; i++) {
			recontain(c, this.$.bottom);
		}
	},
	reflow: function() {
		var ch = this.$.box.getBounds().height;
		//console.log(ch);
		//
		var t = this.$.top.getBounds().height;
		var b = this.$.bottom.getBounds().height;
		//console.log(t, b);
		//
		var h = t + b;
		this.$.flex.applyStyle("height", ch - h + "px");
	}
});

enyo.kind({
	name: "Cols",
	components: [
		// box offsetHeight equals Rows content height, which is otherwise unavailable with calculations
		{name: "box", classes: "enyo-0 enyo-col-box", style: "width: 100%; height: 100%;", components: [
			// offsetHeight will be sum of child heights (including child pad-border-margin) which otherwise requires calculations
			{name: "left", classes: "enyo-0", style: "overflow: hidden; height: 100%;"},
			// flex can be sized without regard to child pad-border-margin, sizing child directly would require calculations
			{name: "flex", classes: "enyo-0 enyo-row-flex", style: "height: 100%;"},
			// offsetHeight will be sum of child heights (including child pad-border-margin) which otherwise requires calculations
			{name: "right", classes: "enyo-0", style: "overflow: hidden; height: 100%;"}
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
			recontain(c, this.$.left);
		}
		for (i++; c=c$[i]; i++) {
			recontain(c, this.$.right);
		}
	},
	reflow: function() {
		var bb = this.$.box.getBounds();
		//
		var cw = bb.width;
		//console.log(ch);
		//
		var l = this.$.left.getBounds().width;
		var r = this.$.right.getBounds().width;
		//console.log(t, b);
		//
		var w = l + r;
		this.$.flex.applyStyle("width", cw - w + "px");
		//
		/*
		var c$ = this.$.left.getClientControls();
		for (var i=0, c; c=c$[i]; i++) {
			c.applyStyle("height", bb.height + "px");
		}
		var c$ = this.$.flex.getClientControls();
		for (var i=0, c; c=c$[i]; i++) {
			c.applyStyle("height", bb.height + "px");
		}
		var c$ = this.$.right.getClientControls();
		for (var i=0, c; c=c$[i]; i++) {
			c.applyStyle("height", bb.height + "px");
		}
		*/
	}
});