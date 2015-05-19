/**
* Contains the declaration for the {@link enyo.GridArranger} kind.
* @module layout/GridArranger
*/

var
	kind = require('enyo/kind');

var
	Arranger = require('./Arranger');

/**
* {@link enyo.GridArranger} is an {@link enyo.Arranger} that arranges
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
* @namespace enyo
* @class enyo.GridArranger
* @extends enyo.Arranger
* @definedby module:layout/GridArranger
* @public
*/
module.exports = kind(
	/** @lends enyo.GridArranger.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.GridArranger',

	/**
	* @private
	*/
	kind: Arranger,

	/**
	* @see {@link enyo.Arranger.incrementalPoints}
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
	* Sizes each panel to be [colWidth]{@link enyo.GridArranger#colWidth} pixels wide
	* and [colHeight]{@link enyo.GridArranger#colHeight} pixels high.
	*
	* @see {@link enyo.Arranger.size}
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
	* [colWidth]{@link enyo.GridArranger#colWidth}. Each row is positioned
	* starting at the top-left of the container.
	*
	* @see {@link enyo.Arranger.arrange}
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
	* @see {@link enyo.Arranger.flowControl}
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
	* @see {@link enyo.Arranger.calcArrangementDifference}
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
