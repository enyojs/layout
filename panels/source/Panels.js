enyo.kind({
	name: "enyo.Panels",
	classes: "enyo-panels",
	published: {
		index: 0,
		draggable: true,
		animate: true,
		wrap: true
	},
	events: {
		onTransition: ""
	},
	handlers: {
		ondragstart: "dragstart",
		ondrag: "drag",
		ondragfinish: "dragfinish"
	},
	tools: [
		{kind: "Animator", onStep: "step", onEnd: "completed"}
	],
	layoutKind: "LeftRightArranger",
	fraction: 0,
	create: function() {
		this.inherited(arguments);
		this.indexChanged();
	},
	initComponents: function() {
		this.createChrome(this.tools);
		this.inherited(arguments);
	},
	flow: function() {
		this.arrangements = [];
		this.inherited(arguments);
	},
	reflow: function() {
		this.arrangements = [];
		this.inherited(arguments);
		this.refresh();
	},
	getPanels: function() {
		return this.getClientControls();
	},
	getActive: function() {
		var p$ = this.getPanels();
		return p$[this.index];
	},
	getAnimator: function() {
		return this.$.animator;
	},
	setIndex: function(inIndex) {
		// override setIndex so that indexChanged is called 
		// whether this.index has actually changed or not
		this.setPropertyValue("index", inIndex, "indexChanged");
	},
	setIndexDirect: function(inIndex) {
		this.setIndex(inIndex);
		this.completed();
	},
	previous: function() {
		this.setIndex(this.index-1);
	},
	next: function() {
		this.setIndex(this.index+1);
	},
	clamp: function(inValue) {
		return this.wrap ? inValue : Math.max(0, Math.min(inValue, this.controls.length-1));
	},
	indexChanged: function(inOld) {
		this.lastIndex = inOld;
		this.index = this.clamp(this.index);
		if (!this.dragging) {
			this.$.animator.stop();
			if (this.hasNode() && this.animate) {
				this.startTransition();
				this.$.animator.play({
					startValue: this.fraction
				});
			} else {
				this.refresh();
			}
		}
	},
	step: function(inSender) {
		this.fraction = inSender.value;
		this.stepTransition();
	},
	completed: function(inSender) {
		if (this.$.animator.isAnimating()) {
			this.$.animator.stop();
		}
		this.stepTransition();
		this.finishTransition();
	},
	dragstart: function(inSender, inEvent) {
		if (this.draggable && inEvent[this.layout.canDragProp]) {
			inEvent.preventDefault();
			this.dragstartTransition(inEvent);
			this.dragging = true;
			this.$.animator.stop();
			return true;
		}
	},
	drag: function(inSender, inEvent) {
		if (this.dragging) {
			inEvent.preventDefault();
			this.dragTransition(inEvent);
		}
	},
	dragfinish: function(inSender, inEvent) {
		if (this.dragging) {
			this.dragging = false;
			inEvent.preventTap();
			this.dragfinishTransition(inEvent);
		}
	},
	dragstartTransition: function(inEvent) {
		if (!this.$.animator.isAnimating()) {
			var f = this.fromIndex = this.index;
			this.toIndex = f - inEvent[this.layout.dragDirectionProp];
		} else {
			this.verifyDragTransition(inEvent);
		}
		this.fromIndex = this.clamp(this.fromIndex);
		this.toIndex = this.clamp(this.toIndex);
		//this.log(this.fromIndex, this.toIndex);
		this.layout.start();
	},
	dragTransition: function(inEvent) {
		var r0 = this.fetchArrangement(this.startState);
		var r1 = this.fetchArrangement(this.endState);
		this.fraction += this.layout.drag(inEvent, this.startState, r0, this.endState, r1);
		var f = this.fraction;
		if (f > 1 || f < 0) {
			if (f > 0) {
				this.dragfinishTransition(inEvent);
			}
			this.dragstartTransition(inEvent);
			this.fraction = 0;
			// FIXME: account for lost fraction
			//this.dragTransition(inEvent);
		}
		this.stepTransition();
	},
	dragfinishTransition: function(inEvent) {
		this.verifyDragTransition(inEvent);
		this.setIndex(this.toIndex);
	},
	verifyDragTransition: function(inEvent) {
		var d = inEvent[this.layout.dragDirectionProp];
		var f = Math.min(this.fromIndex, this.toIndex);
		var t = Math.max(this.fromIndex, this.toIndex);
		if (d > 0) {
			var s = f;
			f = t;
			t = s;
		}
		if (f != this.fromIndex) {
			this.fraction = 1 - this.fraction;
		}
		//this.log("old", this.fromIndex, this.toIndex, "new", f, t);
		this.fromIndex = f;
		this.toIndex = t;
	},
	refresh: function() {
		this.startTransition()
		this.fraction = 1;
		this.stepTransition();
		this.finishTransition();
	},
	startTransition: function() {
		this.fromIndex = this.fromIndex != null ? this.fromIndex : this.lastIndex || 0;
		this.toIndex = this.toIndex != null ? this.toIndex : this.index;
		//this.log(this.fromIndex, this.toIndex);
		this.layout.start();
	},
	finishTransition: function() {
		this.layout.finish();
		this.fraction = 0;
		this.fromIndex = this.toIndex = null;
		if (this.hasNode()) {
			//this.log();
			this.doTransition();
		}
	},
	// gambit: we interpolate between arrangements as needed.
	stepTransition: function() {
		if (this.hasNode()) {
			var s0 = this.fetchArrangement(this.startState);
			var s1 = this.fetchArrangement(this.endState);
			var f = this.fraction || 0;
			this.arrangement = s0 && s1 ? enyo.Panels.lerp(s0, s1, f) : (s0 || s1);
			if (this.arrangement) {
				this.layout.flowArrangement();
			}
		}
	},
	fetchArrangement: function(inName) {
		if ((inName != null) && !this.arrangements[inName]) {
			this.layout._arrange(inName);
			this.arrangements[inName] = this.readArrangement(this.children);
		}
		return this.arrangements[inName];
	},
	readArrangement: function(inC) {
		var r = [];
		for (var i=0, c$=inC, c; c=c$[i]; i++) {
			r.push(enyo.clone(c._arranger));
		}
		return r;
	},
	statics: {
		lerp: function(inA0, inA1, inFrac) {
			var r = [];
			for (var i=0, k$=enyo.keys(inA0), k; k=k$[i]; i++) {
				r.push(this.lerpObject(inA0[k], inA1[k], inFrac));
			}
			return r;
		},
		lerpObject: function(inNew, inOld, inFrac) {
			var b = enyo.clone(inNew), n, o;
			for (var i in inNew) {
				n = inNew[i];
				o =  inOld[i];
				if (n != o) {
					b[i] = n - (n - o) * inFrac;
				}
			}
			return b;
		}
	}
});
