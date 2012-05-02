enyo.kind({
	name: "enyo.Panels",
	classes: "enyo-panels",
	published: {
		index: 0,
		state: 0,
		draggable: true,
		animate: true,
		wrap: true
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
	create: function() {
		this.states = [];
		this.inherited(arguments);
		this.state = this.index;
	},
	reflow: function() {
		this.states = [];
		this.inherited(arguments);
		this.layout.start()
		this.stateChanged();
		this.layout.finish();
	},
	initComponents: function() {
		this.createChrome(this.tools);
		this.inherited(arguments);
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
		this.$.animator.stop();
		if (this.hasNode() && this.animate) {
			this.layout.start();
			this.$.animator.play({
				startValue: this.state,
				endValue: this.index
			});
		} else {
			this.layout.start();
			this.setState(this.index);
			this.layout.finish();
		}
	},
	step: function(inSender) {
		this.setState(inSender.value);
	},
	completed: function(inSender) {
		if (this.$.animator.isAnimating()) {
			this.$.animator.stop();
		}
		this.setState(this.index);
		this.layout.finish();
	},
	dragstart: function(inSender, inEvent) {
		if (this.layout.canDragEvent(inEvent)) {
			inEvent.preventDefault();
			this.dragging = true;
			this.$.animator.stop();
			this.layout.start();
			return true;
		}
	},
	drag: function(inSender, inEvent) {
		if (this.dragging) {
			inEvent.preventDefault();
			var s = this.calcDragState(inEvent);
			/*
			var f = Math.floor(s);
			this.log(s, f, Math.floor(this.state));
			if (s != f && f != Math.floor(this.state)) {
				this.log(s, this.state);
				this.layout.start();
			}
			*/
			this.setState(s);
		}
	},
	dragfinish: function(inSender, inEvent) {
		if (this.dragging) {
			this.dragging = false;
			inEvent.preventTap();
			var i = Math[inEvent[this.layout.dragDirectionProp] < 0 ? "ceil" : "floor"](this.state);
			this.setIndex(i);
		}
	},
	calcDragState: function(inEvent) {
		var s = this.state;
		var dp = inEvent[this.layout.dragProp], ddp = inEvent[this.layout.dragDirectionProp];
		if (dp) {
			var f = Math.floor(this.state);
			var r0 = this.fetchState(f);
			var r1 = this.fetchState(f - ddp);
			var ds = this.layout.measureArrangementDelta(-dp, r0, r1) || 0;
			s = this.clamp(s + ds);
		}
		return s;
	},
	calcStateInfo: function() {
		var s = this.state;
		var last = this.startState != null ? this.startState : Math.floor(s);
		var next = this.endState != null ? this.endState : last+1;
		var frac = (s - last) / ((next - last) || 1);
		return {last: last, next: next, fraction: frac};
	},
	// gambit: We choose to make arrangements only for integer states because this simplifies creation of arrangers.
	// Then we interpolate between the states as needed; inState is a floating point number.
	stateChanged: function() {
		var i = this.calcStateInfo();
		var s1 = this.fetchState(i.next);
		var s0 = this.fetchState(i.last);
		this.arrangement = enyo.Panels.lerpState(s0, s1, i.fraction);
		this.layout.flowArrangement();
	},
	fetchState: function(inState) {
		if (!this.states[inState]) {
			this.layout._arrange(inState);
			this.states[inState] = this.readState(this.children);
		}
		return this.states[inState];
	},
	readState: function(inC) {
		var r = [];
		for (var i=0, c$=inC, c; c=c$[i]; i++) {
			r.push(enyo.clone(c._arranger));
		}
		return r;
	},
	statics: {
		lerpState: function(inState0, inState1, inFrac) {
			var r = [];
			for (var i=0, k$=enyo.keys(inState0), k; k=k$[i]; i++) {
				r.push(this.lerp(inState0[k], inState1[k], inFrac));
			}
			return r;
		},
		lerp: function(inNew, inOld, inFrac) {
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
