enyo.kind({
	name: "enyo.FadeTransition",
	kind: "PanelsTransition",
	components: [
		{kind: "Animator", onStep: "step", onEnd: "completed", onStop: "completed"}
	],
	getAnimator: function() {
		return this.$.animator;
	},
	begin: function() {
		this.$.animator.stop();
		this.inherited(arguments);
	},
	transition: function() {
		var p = this.container.getPanels();
		this.from = p[this.container.lastIndex];
		this.to = p[this.container.index];
		if (!this.container.hasNode() || (this.from == this.to)) {
			this.from = this.to = null;
			this.inherited(arguments);
			return;
		}
		//
		this.to.applyStyle("z-index", -1);
		this.to.show();
		this.$.animator.play();
	},
	step: function(inSender) {
		var v = inSender.value;
		if (this.to) {
			this.to.applyStyle("opacity", v);
		}
		if (this.from) {
			var v = 1 - (v != 1 ? Math.min(0.99, v) : v);
			this.from.applyStyle("opacity", v);
		}
	},
	finish: function() {
		if (this.from) {
			this.from.applyStyle("opacity", null);
			this.from.hide();
		}
		if (this.to) {
			this.to.applyStyle("opacity", null);
			this.to.applyStyle("z-index", null);
		}
		this.from = this.to = null;
		this.inherited(arguments);
	}
});