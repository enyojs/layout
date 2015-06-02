/**
* Contains the declaration for the {@link module:layout/SpiralArranger~SpiralArranger} kind.
* @module layout/SpiralArranger
*/

var
	kind = require('enyo/kind');

var
	Arranger = require('./Arranger');

/**
* {@link module:layout/SpiralArranger~SpiralArranger} is an {@link module:layout/Arranger~Arranger} that arranges
* controls in a spiral. The active control is positioned on top and the other
* controls are laid out in a spiral pattern below.
*
* Transitions between arrangements are handled by rotating the new control up
* from below and rotating the active control down to the end of the spiral.
*
* For more information, see the documentation on
* [Arrangers]{@linkplain $dev-guide/building-apps/layout/arrangers.html} in the
* Enyo Developer Guide.
*
* @class SpiralArranger
* @extends module:layout/Arranger~Arranger
* @public
*/
module.exports = kind(
	/** @lends module:layout/SpiralArranger~SpiralArranger.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.SpiralArranger',

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
	* The amount of space between successive controls
	*
	* @private
	*/
	inc: 20,

	/**
	* Sizes each panel to one third of the container.
	*
	* @see  {@link module:layout/Arranger~Arranger#size}
	* @protected
	*/
	size: function () {
		var c$ = this.container.getPanels();
		var b = this.containerBounds;
		var w = this.controlWidth = b.width/3;
		var h = this.controlHeight = b.height/3;
		for (var i=0, c; (c=c$[i]); i++) {
			c.setBounds({width: w, height: h});
		}
	},

	/**
	* Arranges panels in a spiral with the active panel at the center.
	*
	* @see {@link module:layout/Arranger~Arranger#arrange}
	* @protected
	*/
	arrange: function (controls, arrangement) {
		var s = this.inc;
		for (var i=0, l=controls.length, c; (c=controls[i]); i++) {
			var x = Math.cos(i/l * 2*Math.PI) * i * s + this.controlWidth;
			var y = Math.sin(i/l * 2*Math.PI) * i * s + this.controlHeight;
			this.arrangeControl(c, {left: x, top: y});
		}
	},

	/**
	* Applies descending `z-index` values to each panel, starting with the active panel.
	*
	* @see {@link module:layout/Arranger~Arranger#start}
	* @method
	* @protected
	*/
	start: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			var c$ = this.getOrderedControls(this.container.toIndex);
			for (var i=0, c; (c=c$[i]); i++) {
				c.applyStyle('z-index', c$.length - i);
			}
		};
	}),

	/**
	* @see {@link module:layout/Arranger~Arranger#calcArrangementDifference}
	* @protected
	*/
	calcArrangementDifference: function (inI0, inA0, inI1, inA1) {
		return this.controlWidth;
	},

	/**
	* Resets position and z-index of all panels.
	*
	* @method
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				c.applyStyle('z-index', null);
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
