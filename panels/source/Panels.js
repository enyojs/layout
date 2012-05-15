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
		onTransitionStart: "",
		onTransitionFinish: ""
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
		this.transitionPoints = [];
		this.inherited(arguments);
		this.indexChanged();
	},
	initComponents: function() {
		this.createChrome(this.tools);
		this.inherited(arguments);
	},
	removeControl: function(inControl) {
		this.inherited(arguments);
		if (this.isPanel(inControl)) {
			this.flow();
			this.reflow();
			this.setIndex(0);
		}
	},
	isPanel: function() {
		return true;
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
		this.fireTransitionStart();
		this.layout.start();
	},
	dragTransition: function(inEvent) {
		// note: for simplicity we choose to calculate the distance directly between
		// the first and last transition point.
		var d = inEvent[this.layout.dragProp];
		var t$ = this.transitionPoints, s = t$[0], f = t$[t$.length-1];
		var as = this.fetchArrangement(s);
		var af = this.fetchArrangement(f);
		var dx = this.layout.drag(d, s, as, f, af);
		var dragFail = d && !dx;
		if (dragFail) {
			//this.log(dx, s, as, f, af);
		}
		this.fraction += dx;
		var f = this.fraction;
		if (f > 1 || f < 0 || dragFail) {
			if (f > 0 || dragFail) {
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
		this.fireTransitionStart();
	},
	finishTransition: function() {
		this.layout.finish();
		this.transitionPoints = [];
		this.fraction = 0;
		this.fromIndex = this.toIndex = null;
	},
	fireTransitionStart: function() {
		if (this.hasNode()) {
			this.doTransitionStart({fromIndex: this.fromIndex, toIndex: this.toIndex});
		}
	},
	fireTransitionFinish: function() {
		if (this.hasNode()) {
			this.doTransitionFinish({fromIndex: this.lastIndex, toIndex: this.index});
		}
	},
	// gambit: we interpolate between arrangements as needed.
	stepTransition: function() {
		if (this.hasNode()) {
			// select correct transition points and normalize fraction.
			var t$ = this.transitionPoints;
			var r = (this.fraction || 0) * (t$.length-1);
			var i = Math.floor(r);
			r = r - i;
			var s = t$[i], f = t$[i+1];
			// get arrangements and lerp between them
			var s0 = this.fetchArrangement(s);
			var s1 = this.fetchArrangement(f);
			this.arrangement = s0 && s1 ? enyo.Panels.lerp(s0, s1, r) : (s0 || s1);
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
