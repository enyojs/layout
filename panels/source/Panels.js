/**
The enyo.Panels kind is designed to satisfy a variety of common application layout use cases.
For example, controls can be arranged as a carousel, a set of collapsing panels, a card stack
that fades between panels, a grid, and more.

Of the set of controls contained inside an enyo.Panels, one is considered active.
Any enyo kind can be placed inside an enyo.Panels but by convention we refer to each of these
controls as a "panel." The active panel is set by index using the setIndex method.

The layout of panels is controlled by the specified layoutKind. By default, panels fit to
the size of the Panels that contains them and transition via fading. To setup a carousel, 
specify a layoutKind of "CarouselArranger" and give each panel a width.

Panels are also animate and are draggable by default. These behaviors can be defeated by
setting the draggable and animate properties to false.

Here's an example:

		enyo.kind({
			name: "App",
			kind: "Panels",
			fit: true,
			components: [
				{kind: "MyStartPanel"},
				{kind: "MyMiddlePanel"},
				{kind: "MyLastPanel"}
			]
		});
		new App().write();
*/
enyo.kind({
	name: "enyo.Panels",
	classes: "enyo-panels",
	published: {
		/**
			Specify the index of the active panel. The layout of panels is
			controlled by the layoutKind, but as a rule, the active panel is displayed
			in the most prominent position. In the default, CardArranger layout, for example,
			the active panel is shown and the other panels are hidden.
		*/
		index: 0,
		//* Controls if the user can drag between panels.
		draggable: true,
		//* Controls if the panels animate when transitioning; for example, when setIndex is called.
		animate: true,
		wrap: false,
		//* Sets the arranger kind to be used for dynamic layout.
		arrangerKind: "CardArranger",
		//* By default each panel will be sized to fit the Panels' width when 
		//* the screen size is narrow enough (~800px). Set narrowFit to false to avoid this behavior.
		narrowFit: true
	},
	events: {
		/**
			Event that fires at the start of a panel transition.
			Note, this event fires when setIndex is called and also during dragging.
		*/
		onTransitionStart: "",
		/**
			Event that fires at the end of a panel transition.
			Note, this event fires when setIndex is called and also during dragging.
		*/
		onTransitionFinish: ""
	},
	//* @protected
	handlers: {
		ondragstart: "dragstart",
		ondrag: "drag",
		ondragfinish: "dragfinish"
	},
	tools: [
		{kind: "Animator", onStep: "step", onEnd: "completed"}
	],
	fraction: 0,
	create: function() {
		this.transitionPoints = [];
		this.inherited(arguments);
		this.arrangerKindChanged();
		this.avoidFitChanged();
		this.indexChanged();
	},
	initComponents: function() {
		this.createChrome(this.tools);
		this.inherited(arguments);
	},
	arrangerKindChanged: function() {
		this.setLayoutKind(this.arrangerKind);
	},
	avoidFitChanged: function() {
		this.addRemoveClass("enyo-panels-fit-narrow", this.narrowFit);
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
	//* @public
	//* Return an array of contained panels.
	getPanels: function() {
		var p = this.controlParent || this;
		return p.children;
	},
	//* Return a reference to the active panel; the panel at the specified index.
	getActive: function() {
		var p$ = this.getPanels();
		return p$[this.index];
	},
	/**
		Return a reference to the <a href="#enyo.Animator">enyo.Animator</a> 
		instance used to animate panel transitions. The Panels' animator can be used
		to, for example set the duration of panel transitions: e.g. this.getAnimator().setDuration(1000);
	*/
	getAnimator: function() {
		return this.$.animator;
	},
	/** Set the active panel to the panel specified by the given index.
	Note that if the animate property is set to true, the active panel 
	will animate into view.
	*/
	setIndex: function(inIndex) {
		// override setIndex so that indexChanged is called 
		// whether this.index has actually changed or not
		this.setPropertyValue("index", inIndex, "indexChanged");
	},
	/**
		Set the active panel to the panel specified by the given index. 
		Regardless of the setting of the animate property, the transition to the next panel
		will not animate and will be immediate.
	*/
	setIndexDirect: function(inIndex) {
		this.setIndex(inIndex);
		this.completed();
	},
	//** Transition to the previous panel; the panel at the index one before the current active panel.
	previous: function() {
		this.setIndex(this.index-1);
	},
	//** Transition to the next panel; the panel at the index one after the current active panel.
	next: function() {
		this.setIndex(this.index+1);
	},
	//* @protected
	clamp: function(inValue) {
		var l = this.getPanels().length-1;
		if (this.wrap) {
			// FIXME: dragging makes assumptions about direction and from->start indexes.
			//return inValue < 0 ? l : (inValue > l ? 0 : inValue);
			return inValue;
		} else {
			return Math.max(0, Math.min(inValue, l));
		}
	},
	indexChanged: function(inOld) {
		this.lastIndex = inOld;
		this.index = this.clamp(this.index);
		if (!this.dragging) {
			if (this.$.animator.isAnimating()) {
				this.completed();
			}
			this.$.animator.stop();
			if (this.hasNode()) {
				if (this.animate) {
					this.startTransition();
					this.$.animator.play({
						startValue: this.fraction
					});
				} else {
					this.refresh();
				}
			}
		}
	},
	step: function(inSender) {
		this.fraction = inSender.value;
		this.stepTransition();
	},
	completed: function() {
		if (this.$.animator.isAnimating()) {
			this.$.animator.stop();
		}
		this.fraction = 1;
		this.stepTransition();
		this.finishTransition();
	},
	dragstart: function(inSender, inEvent) {
		if (this.draggable && this.layout && this.layout.canDragEvent(inEvent)) {
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
			this.toIndex = f - (this.layout ? this.layout.calcDragDirection(inEvent) : 0);
		} else {
			this.verifyDragTransition(inEvent);
		}
		this.fromIndex = this.clamp(this.fromIndex);
		this.toIndex = this.clamp(this.toIndex);
		//this.log(this.fromIndex, this.toIndex);
		this.fireTransitionStart();
		if (this.layout) {
			this.layout.start();
		}
	},
	dragTransition: function(inEvent) {
		// note: for simplicity we choose to calculate the distance directly between
		// the first and last transition point.
		var d = this.layout ? this.layout.calcDrag(inEvent) : 0;
		var t$ = this.transitionPoints, s = t$[0], f = t$[t$.length-1];
		var as = this.fetchArrangement(s);
		var af = this.fetchArrangement(f);
		var dx = this.layout ? this.layout.drag(d, s, as, f, af) : 0;
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
		// note: if we're still dragging, then we're at a transition boundary 
		// and should fire the finish event
		if (this.dragging) {
			this.fireTransitionFinish();
		}
	},
	verifyDragTransition: function(inEvent) {
		var d = this.layout ? this.layout.calcDragDirection(inEvent) : 0;
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
		if (this.$.animator.isAnimating()) {
			this.$.animator.stop();
		}
		this.startTransition()
		this.fraction = 1;
		this.stepTransition();
		this.finishTransition();
	},
	startTransition: function() {
		this.fromIndex = this.fromIndex != null ? this.fromIndex : this.lastIndex || 0;
		this.toIndex = this.toIndex != null ? this.toIndex : this.index;
		//this.log(this.id, this.fromIndex, this.toIndex);
		if (this.layout) {
			this.layout.start();
		}
		this.fireTransitionStart();
	},
	finishTransition: function() {
		if (this.layout) {
			this.layout.finish();
		}
		this.transitionPoints = [];
		this.fraction = 0;
		this.fromIndex = this.toIndex = null;
		this.fireTransitionFinish();
	},
	fireTransitionStart: function() {
		var t = this.startTransitionInfo;
		if (this.hasNode() && (!t || (t.fromIndex != this.fromIndex || t.toIndex != this.toIndex))) {
			this.startTransitionInfo = {fromIndex: this.fromIndex, toIndex: this.toIndex};
			this.doTransitionStart(enyo.clone(this.startTransitionInfo));
		}
	},
	fireTransitionFinish: function() {
		var t = this.finishTransitionInfo;
		if (this.hasNode() && (!t || (t.fromIndex != this.lastIndex || t.toIndex != this.index))) {
			this.finishTransitionInfo = {fromIndex: this.lastIndex, toIndex: this.index};
			this.doTransitionFinish(enyo.clone(this.finishTransitionInfo));
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
			if (this.arrangement && this.layout) {
				this.layout.flowArrangement();
			}
		}
	},
	fetchArrangement: function(inName) {
		if ((inName != null) && !this.arrangements[inName] && this.layout) {
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
		isScreenNarrow: function() {
			return enyo.dom.getWindowWidth() <= 800;
		},
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
