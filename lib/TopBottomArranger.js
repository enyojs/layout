/**
* Contains the declaration for the {@link module:layout/TopBottomArranger~TopBottomArranger} kind.
* @module layout/TopBottomArranger
*/

var
	kind = require('enyo/kind');

var
	LeftRightArranger = require('./LeftRightArranger');

/**
* {@link module:layout/TopBottomArranger~TopBottomArranger} is an {@link module:layout/Arranger~Arranger} that displays
* the active control and some of the previous and next controls. The active
* control is centered vertically in the container, and the previous and next
* controls are laid out above and below, respectively.
*
* Transitions between arrangements are handled by sliding the new control in
* from the bottom and sliding the active control out the top.
*
* For more information, see the documentation on
* [Arrangers]{@linkplain $dev-guide/building-apps/layout/arrangers.html} in the
* Enyo Developer Guide.
*
* @class TopBottomArranger
* @extends module:layout/LeftRightArranger~LeftRightArranger
* @public
*/
module.exports = kind(
	/** @lends module:layout/TopBottomArranger~TopBottomArranger.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.TopBottomArranger',

	/**
	* @private
	*/
	kind: LeftRightArranger,

	/**
	* @see {@link module:layout/Arranger~Arranger#dragProp}
	* @private
	*/
	dragProp: 'ddy',

	/**
	* @see {@link module:layout/Arranger~Arranger#dragDirectionProp}
	* @private
	*/
	dragDirectionProp: 'yDirection',

	/**
	* @see {@link module:layout/Arranger~Arranger#canDragProp}
	* @private
	*/
	canDragProp: 'vertical',

	/**
	* @see {@link module:layout/LeftRightArranger~LeftRightArranger#axisSize}
	* @protected
	*/
	axisSize: 'height',

	/**
	* @see {@link module:layout/LeftRightArranger~LeftRightArranger#offAxisSize}
	* @protected
	*/
	offAxisSize: 'width',

	/**
	* @see {@link module:layout/LeftRightArranger~LeftRightArranger#axisPosition}
	* @protected
	*/
	axisPosition: 'top'
});
