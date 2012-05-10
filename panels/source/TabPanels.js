enyo.kind({
	name: "enyo.TabPanels",
	kind: "Panels",
	//draggable: false,
	//layoutKind: "FadeArranger",
	layoutKind: "SlideInArranger",
	tabTools: [
		{name: "scroller", kind: "Scroller", maxHeight: "100px", touch: true, thumb: false, vertical: "hidden", horizontal: "auto", components: [
			{name: "tabs", kind: "onyx.RadioGroup", style: "text-align: left; white-space: nowrap", controlClasses: "onyx-tabbutton", onActivate: "tabActivate"}
		]},
		{name: "client", fit: true, kind: "Panels", onTransition: "clientTransition"}
	],
	create: function() {
		this.inherited(arguments);
		this.draggableChanged();
		this.animateChanged();
		this.wrapChanged();
	},
	initComponents: function() {
		this.createChrome(this.tabTools);
		this.inherited(arguments);
	},
	flow: function() {
		this.inherited(arguments);
		this.$.client.flow();
	},
	reflow: function() {
		this.inherited(arguments);
		this.$.client.reflow();
	},
	draggableChanged: function() {
		this.$.client.setDraggable(this.draggable);
		this.draggable = false;
	},
	animateChanged: function() {
		this.$.client.setAnimate(this.animate);
		this.animate = false;
	},
	wrapChanged: function() {
		this.$.client.setWrap(this.wrap);
		this.wrap = false;
	},
	isTabTool: function(inControl) {
		var n = inControl.name;
		return (n == "tabs" || n == "client" || n == "scroller");
	},
	addControl: function(inControl) {
		this.inherited(arguments);
		if (!this.isTabTool(inControl)) {
			var c = inControl.caption || ("Tab " + this.$.tabs.controls.length);
			var t = inControl._tab = this.$.tabs.createComponent({content: c});
			if (this.hasNode()) {
				t.render();
			}
		}
	},
	removeControl: function(inControl) {
		var isPanel = !this.isTabTool(inControl);
		if (isPanel && inControl._tab) {
			inControl._tab.destroy();
		}
		this.inherited(arguments);
		if (isPanel) {
			// FIXME: flow + reflow is not acceptable api.
			this.flow();
			this.reflow();
			this.setIndex(0);
		}
	},
	layoutKindChanged: function() {
		if (!this.layout) {
			this.layout = enyo.createFromKind("FittableRowsLayout", this);
		}
		this.$.client.setLayoutKind(this.layoutKind);
	},
	indexChanged: function() {
		// FIXME: initialization order problem
		if (this.$.client.layout) {
			this.$.client.setIndex(this.index);
		}
		this.index = this.$.client.getIndex();
	},
	getPanels: function() {
		return this.$.client.children;
	},
	tabActivate: function(inSender, inEvent) {
		if (this.hasNode()) {
			if (inEvent.originator.active) {
				var i = inEvent.originator.indexInContainer();
				this.log(i);
				this.setIndex(i);
			}
		}
	},
	clientTransition: function(inSender) {
		var i = inSender.getIndex();
		var t = this.$.tabs.getClientControls()[i];
		if (t) {
			this.$.tabs.setActive(t);
			var tn = t.hasNode();
			var tl = tn.offsetLeft;
			var tr = tl + tn.offsetWidth;
			var sb = this.$.scroller.getScrollBounds();
			if (tr < sb.left || tr > sb.left + sb.clientWidth) {
				this.$.scroller.scrollToControl(t);
			}
		}
	},
	startTransition: enyo.nop,
	finishTransition: enyo.nop,
	stepTransition: enyo.nop
});