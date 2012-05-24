/**
	enyo.Arranger is an enyo.Layout that considers one of the controls it lays out as active.
	The other controls are placed relative to the active control as makes sense for the layout.

	Arranger supports dynamic layouts, meaning it's possible to transition between its layouts
	via animation. Typically arrangers should layout controls using css transforms since 
	they are optimized for animation. To support this, controls in an Arranger are absolutely
	positioned, and arranger has an accelerated setting which will mark controls to
	receive css compositing. The default setting of "auto" ensure this will occur if 
	enabled by the platform.
	
	Arranger has methods to support dynamic layouts. Arranger subkinds are typically used as layouts
	for an <a href="#enyo.Panels">enyo.Panels</a> which uses the Arranger api to implement transitions
	between layouts. Implement the size method to size controls and perform other expensive layout
	operations that are only required when the layout reflows. Implement the start and finish methods to
	specify behavior that should occur when a transition begins and ends. The start method
	can set the transitionPoints array on the layout container. These are the arrangements between which
	the layout should transition.
	
	Implement the arrange method to position controls relative to each other. The arrange method is 
	where the real layout work occurs. An arranger need only specify the layout for each active position
	and need not concern itself with intermediate layouts. Instead of directly applying styling to controls
	in the arrange method, the arrangeControl(inControl, inArrangement) method should be used.
	The inArrangement argument is an object with settings that are later applied to the control via the 
	flowControl(inControl, inArrangement) method. By default, the flowControl method will process arrangement settings
	for left, top, and opacity, and this method should only be implemented to style the control in other ways.

	Arranger also supports dragging between active states. The arranger must specify how dragging will effect
	the layout. The dragProp, canDragProp, and dragDirectionProp are used to indicate which direction of drag
	is relevant. The calcArrangementDifference(inI0, inA0, inI1, inA1) method should be implemented to return the 
	difference measured in pixels between the arrangement inA0 for layout setting inI0 and arrangement inA1 for layout
	setting inI1. This data is used to calculate the percent a drag should move the layout between two active states.
*/
enyo.kind({
	name: "enyo.Arranger",
	kind: "Layout",
	layoutClass: "enyo-arranger",
	/** 
		Sets controls being laid out to use css compositing. A setting of auto will mark 
		controls for compositing if the platform supports it.
	*/
	accelerated: "auto",
	//* Property of the drag event that should be used to calculate the amount a drag moves the layout.
	dragProp: "ddx",
	//* Property of the drag event that should be used to calculate the direction of a drag.
	dragDirectionProp: "xDirection",
	//* Property of the drag event that should be used to calculate if a drag should occur.
	canDragProp: "horizontal",
	//* @protected
	destroy: function() {
		var c$ = this.container.children;
		for (var i=0, c; c=c$[i]; i++) {
			c._arranger = null;
		}
		this.inherited(arguments);
	},
	//* @public
	/**
		Arrange the given array of controls (inC) in the layout specified by inName.
		When implementing this method, rather than apply styling directly to controls, use the
		arrangeControl(inControl, inArrangement) method with an inArrangement object with styling settings.
		These will later be applied via the flowControl(inControl, inArrangement) method.
	*/
	arrange: function(inC, inName) {
	},
	/**
		Sizes the controls in the layout. This method is called only at reflow time. Note, sizing is separated 
		from other layout done in the arrange method because it is expensive and not suitable for dynamic layout.
	*/
	size: function() {
	},
	/**
		Called when a layout transition begins. Implement this method to perform tasks which should only occur
		when a transition starts; for example, some controls could be shown or hidden. In addition, the 
		transitionPoints array may be set on the container to dictate between which named arrangments
		the transition occurs.
	*/
	start: function() {
		var f = this.container.fromIndex, t = this.container.toIndex;
		var p$ = this.container.transitionPoints = [f];
		// optionally add a transition point for each index between from and to.
		if (this.incrementalPoints) {
			var d = Math.abs(t - f) - 2;
			var i = f;
			while (d >= 0) {
				i = i + (t < f ? -1 : 1)
				p$.push(i);
				d--;
			}
		}
		p$.push(this.container.toIndex);
	},
	/**
		Called when a layout transition completes. Implement this method to perform tasks which should only occur
		when a transition ends; for example, some controls could be shown or hidden.
	*/
	finish: function() {
	},
	//* @protected
	canDragEvent: function(inEvent) {
		return inEvent[this.canDragProp];
	},
	calcDragDirection: function(inEvent) {
		return inEvent[this.dragDirectionProp];
	},
	calcDrag: function(inEvent) {
		return inEvent[this.dragProp];
	},
	drag: function(inDp, inAn, inA, inBn, inB) {
		var f = this.measureArrangementDelta(-inDp, inAn, inA, inBn, inB);
		return f;
	},
	measureArrangementDelta: function(inX, inI0, inA0, inI1, inA1) {
		var d = this.calcArrangementDifference(inI0, inA0, inI1, inA1);
		var s = d ? inX / Math.abs(d) : 0;
		s = s * (this.container.fromIndex > this.container.toIndex ? -1 : 1);
		//enyo.log("delta", s);
		return s;
	},
	//* @public
	/**
	This method is called when dragging the layout, and it should return the the 
	difference measured in pixels between the arrangement inA0 for layout setting inI0 
	and arrangement inA1 for layout setting inI1. This data is used to calculate 
	the percent a drag should move the layout between two active states.
	*/
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
	},
	//* @protected
	_arrange: function(inIndex) {
		var c$ = this.getOrderedControls(inIndex);
		this.arrange(c$, inIndex);
	},
	arrangeControl: function(inControl, inArrangement) {
		inControl._arranger = enyo.mixin(inControl._arranger || {}, inArrangement);
	},
	flow: function() {
		this.c$ = [].concat(this.container.children);
		this.controlsIndex = 0;
		for (var i=0, c$=this.container.children, c; c=c$[i]; i++) {
			enyo.dom.accelerate(c, this.accelerated);
		}
	},
	reflow: function() {
		var cn = this.container.hasNode();
		this.containerBounds = cn ? {width: cn.clientWidth, height: cn.clientHeight} : {};
		this.size();
	},
	flowArrangement: function() {
		var a = this.container.arrangement;
		if (a) {
			for (var i=0, c$=this.container.children, c; c=c$[i]; i++) {
				this.flowControl(c, a[i]);
			}
		}
	},
	//* @public
	/**
		Layout the control (inControl) according to the settings stored in the inArrangment object.
		By default, flowControl will apply settings of left, top, and opacity. This method should 
		only be implemented to apply other settings made via arrangeControl.
	*/
	flowControl: function(inControl, inArrangement) {
		enyo.Arranger.positionControl(inControl, inArrangement);
		var o = inArrangement.opacity;
		if (o != null) {
			enyo.Arranger.opacifyControl(inControl, o);
		}
	},
	//* @protected
	// get an array of controls arranged in state order.
	// note: optimization, dial around a single array.
	getOrderedControls: function(inIndex) {
		var whole = Math.floor(inIndex);
		var a = whole - this.controlsIndex;
		var sign = a > 0;
		var c$ = this.c$ || [];
		for (var i=0; i<Math.abs(a); i++) {
			if (sign) {
				c$.push(c$.shift());
			} else {
				c$.unshift(c$.pop());
			}
		}
		this.controlsIndex = whole;
		return c$;
	},
	statics: {
		// Positions a control via transform: translateX/Y if supported and falls back to left/top if not.
		positionControl: function(inControl, inBounds, inUnit) {
			var unit = inUnit || "px";
			if (!this.updating) {
				if (enyo.dom.canTransform()) {
					var l = inBounds.left, t = inBounds.top;
					var l = enyo.isString(l) ? l : l && (l + unit);
					var t = enyo.isString(t) ? t : t && (t + unit);
					enyo.dom.transform(inControl, {translateX: l || null, translateY: t || null});
				} else {
					inControl.setBounds(inBounds, inUnit);
				}
			}
		},
		opacifyControl: function(inControl, inOpacity) {
			var o = inOpacity;
			// FIXME: very high/low settings of opacity can cause a control to
			// blink so cap this here.
			o = o > .99 ? 1 : (o < .01 ? 0 : o);
			// note: we only care about ie8
			if (enyo.platform.ie < 9) {
				inControl.applyStyle("filter", "progid:DXImageTransform.Microsoft.Alpha(Opacity=" + (o * 100) + ")");
			} else {
				inControl.applyStyle("opacity", o);
			}
		}
	}
});
