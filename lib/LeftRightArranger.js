/**
* Contains the declaration for the {@link module:layout/LeftRightArranger~LeftRightArranger} kind.
* @module layout/LeftRightArranger
*/

var
	kind = require('enyo/kind');

var
	Arranger = require('./Arranger');

/**
* {@link module:layout/LeftRightArranger~LeftRightArranger} is an {@link module:layout/Arranger~Arranger} that displays
* the active control and some of the previous and next controls. The active
* control is centered horizontally in the container, and the previous and next
* controls are laid out to the left and right, respectively.
*
* Transitions between arrangements are handled by sliding the new control in
* from the right and sliding the active control out to the left.
*
* For more information, see the documentation on
* [Arrangers]{@linkplain $dev-guide/building-apps/layout/arrangers.html} in the
* Enyo Developer Guide.
*
* @class LeftRightArranger
* @extends module:layout/Arranger~Arranger
* @public
*/
module.exports = kind(
	/** @lends module:layout/LeftRightArranger~LeftRightArranger.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.LeftRightArranger',

	/**
	* @private
	*/
	kind: Arranger,

	/**
	 * The margin width (i.e., how much of the previous and next controls
	 * are visible) in pixels.
	 *
	 * Note that this is imported from the container at construction time.
	 *
	 * @type {Number}
	 * @default 40
	 * @public
	 */
	margin: 40,

	/**
	 * The axis along which the panels will animate.
	 *
	 * @type {String}
	 * @readOnly
	 * @default 'width'
	 * @protected
	 */
	axisSize: 'width',

	/**
	 * The axis along which the panels will **not** animate.
	 *
	 * @type {String}
	 * @readOnly
	 * @default 'height'
	 * @protected
	 */
	offAxisSize: 'height',

	/**
	 * The axis position at which the panel will animate.
	 *
	 * @type {String}
	 * @readOnly
	 * @default 'left'
	 * @protected
	 */
	axisPosition: 'left',

	/**
	* @method
	* @private
	*/
	constructor: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.margin = this.container.margin != null ? this.container.margin : this.margin;
		};
	}),

	/**
	* Sizes the panels such that they fill [offAxisSize]{@link module:layout/LeftRightArranger~LeftRightArranger#offAxisSize}
	* and yield [margin]{@link module:layout/LeftRightArranger~LeftRightArranger#margin} pixels on each side of
	* [axisSize]{@link module:layout/LeftRightArranger~LeftRightArranger#axisSize}.
	*
	* @see {@link module:layout/Arranger~Arranger#size}
	* @protected
	*/
	size: function () {
		var c$ = this.container.getPanels();
		var port = this.containerBounds[this.axisSize];
		var box = port - this.margin -this.margin;
		for (var i=0, b, c; (c=c$[i]); i++) {
			b = {};
			b[this.axisSize] = box;
			b[this.offAxisSize] = '100%';
			c.setBounds(b);
		}
	},

	/**
	* To prevent a panel that is switching sides (to maintain the balance) from overlapping
	* the active panel during the animation, updates the `z-index` of the switching panel
	* to ensure that it stays behind the other panels.
	*
	* @todo Could use some optimization in its `for` loop (e.g. .length lookup and calc)
	* @see {@link module:layout/Arranger~Arranger#start}
	* @method
	* @protected
	*/
	start: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);

			var s = this.container.fromIndex;
			var f = this.container.toIndex;
			var c$ = this.getOrderedControls(f);
			var o = Math.floor(c$.length/2);

			for (var i=0, c; (c=c$[i]); i++) {
				if (s > f){
					if (i == (c$.length - o)){
						c.applyStyle('z-index', 0);
					} else {
						c.applyStyle('z-index', 1);
					}
				} else {
					if (i == (c$.length-1 - o)){
						c.applyStyle('z-index', 0);
					} else {
						c.applyStyle('z-index', 1);
					}
				}
			}
		};
	}),

	/**
	* Balances the panels laid out to each side of the active panel
	* such that, for a set of `n` panels, `floor(n/2)` are before and `ceil(n/2)` are after
	* the active panel.
	*
	* @protected
	*/
	arrange: function (controls, arrangement) {
		var i,c,b;
		if (this.container.getPanels().length==1){
			b = {};
			b[this.axisPosition] = this.margin;
			this.arrangeControl(this.container.getPanels()[0], b);
			return;
		}
		var o = Math.floor(this.container.getPanels().length/2);
		var c$ = this.getOrderedControls(Math.floor(arrangement)-o);
		var box = this.containerBounds[this.axisSize] - this.margin - this.margin;
		var e = this.margin - box * o;
		for (i=0; (c=c$[i]); i++) {
			b = {};
			b[this.axisPosition] = e;
			this.arrangeControl(c, b);
			e += box;
		}
	},

	/**
	* Calculates the difference along the
	* [axisPosition]{@link module:layout/LeftRightArranger~LeftRightArranger#axisPosition} (e.g., `'left'`).
	*
	* @param {Number} inI0 - The initial layout setting.
	* @param {Object} inA0 - The initial arrangement.
	* @param {Number} inI1 - The target layout setting.
	* @param {Object} inA1 - The target arrangement.
	* @protected
	*/
	calcArrangementDifference: function (inI0, inA0, inI1, inA1) {
		if (this.container.getPanels().length==1){
			return 0;
		}

		var i = Math.abs(inI0 % this.c$.length);
		//enyo.log(inI0, inI1);
		return inA0[i][this.axisPosition] - inA1[i][this.axisPosition];
	},

	/**
	* Resets the positioning and opacity of panels.
	*
	* @method
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				Arranger.positionControl(c, {left: null, top: null});
				Arranger.opacifyControl(c, 1);
				c.applyStyle('left', null);
				c.applyStyle('top', null);
				c.applyStyle('height', null);
				c.applyStyle('width', null);
			}
			sup.apply(this, arguments);
		};
	})
});
