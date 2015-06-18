/**
* Contains the declaration for the {@link module:layout/GridArranger~GridArranger} kind.
* @module layout/GridArranger
*/

var
	kind = require('enyo/kind');

var
	Arranger = require('./Arranger');

/**
* {@link module:layout/GridArranger~GridArranger} is an {@link module:layout/Arranger~Arranger} that arranges
* controls in a grid. The active control is positioned at the top-left of the
* grid and the other controls are laid out from left to right and then from
* top to bottom.
*
* Transitions between arrangements are handled by moving the active control to
* the end of the grid and shifting the other controls	to the left, or by
* moving it up to the previous row, to fill the space.
*
* For more information, see the documentation on
* [Arrangers]{@linkplain $dev-guide/building-apps/layout/arrangers.html} in the
* Enyo Developer Guide.
* @class GridArranger
* @extends module:layout/Arranger~Arranger
* @public
*/
module.exports = kind(
	/** @lends module:layout/GridArranger~GridArranger.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.GridArranger',

	/**
	* @private
	*/
	kind: Arranger,

	/**
	* @see {@link module:layout/Arranger~Arranger#incrementalPoints}
	* @private
	*/
	incrementalPoints: true,

	/**
	 * The column width in pixels.
	 *
	 * @type {Number}
	 * @default 100
	 * @public
	 */
	colWidth: 100,

	/**
	 * The column height in pixels.
	 *
	 * @type {Number}
	 * @default 100
	 * @public
	 */
	colHeight: 100,

	/**
	* Sizes each panel to be [colWidth]{@link module:layout/GridArranger~GridArranger#colWidth} pixels wide
	* and [colHeight]{@link module:layout/GridArranger~GridArranger#colHeight} pixels high.
	*
	* @see {@link module:layout/Arranger~Arranger#size}
	* @protected
	*/
	size: function () {
		var c$ = this.container.getPanels();
		var w=this.colWidth, h=this.colHeight;
		for (var i=0, c; (c=c$[i]); i++) {
			c.setBounds({width: w, height: h});
		}
	},

	/**
	* Calculates the number of columns based on the container's width and
	* [colWidth]{@link module:layout/GridArranger~GridArranger#colWidth}. Each row is positioned
	* starting at the top-left of the container.
	*
	* @see {@link module:layout/Arranger~Arranger#arrange}
	* @protected
	*/
	arrange: function (controls, arrangement) {
		var w=this.colWidth, h=this.colHeight;
		var cols = Math.max(1, Math.floor(this.containerBounds.width / w));
		var c;
		for (var y=0, i=0; i<controls.length; y++) {
			for (var x=0; (x<cols) && (c=controls[i]); x++, i++) {
				this.arrangeControl(c, {left: w*x, top: h*y});
			}
		}
	},

	/**
	* If the control is moving between rows, adjusts its opacity during the transition.
	*
	* @see {@link module:layout/Arranger~Arranger#flowControl}
	* @method
	* @protected
	*/
	flowControl: kind.inherit(function (sup) {
		return function (inControl, inA) {
			sup.apply(this, arguments);
			Arranger.opacifyControl(inControl, inA.top % this.colHeight !== 0 ? 0.25 : 1);
		};
	}),

	/**
	* @see {@link module:layout/Arranger~Arranger#calcArrangementDifference}
	* @protected
	*/
	calcArrangementDifference: function (inI0, inA0, inI1, inA1) {
		return this.colWidth;
	},

	/**
	* Resets position of panels.
	*
	* @method
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				Arranger.positionControl(c, {left: null, top: null});
				c.applyStyle('left', null);
				c.applyStyle('top', null);
				c.applyStyle('height', null);
				c.applyStyle('width', null);
			}
			sup.apply(this, arguments);
		};
	})
});
