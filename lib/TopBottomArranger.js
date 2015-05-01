/**
* Contains the declaration for the {@link enyo.TopBottomArranger} kind.
* @module layout/TopBottomArranger
*/

var
	kind = require('enyo/kind');

var
	LeftRightArranger = require('./LeftRightArranger');

/**
* {@link enyo.TopBottomArranger} is an {@link enyo.Arranger} that displays
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
* @namespace enyo
* @class enyo.TopBottomArranger
* @extends enyo.LeftRightArranger
* @definedby module:layout/TopBottomArranger
* @public
*/
module.exports = kind(
	/** @lends enyo.TopBottomArranger.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.TopBottomArranger',

	/**
	* @private
	*/
	kind: LeftRightArranger,

	/**
	* @see {@link enyo.Arranger.dragProp}
	* @private
	*/
	dragProp: 'ddy',

	/**
	* @see {@link enyo.Arranger.dragDirectionProp}
	* @private
	*/
	dragDirectionProp: 'yDirection',

	/**
	* @see {@link enyo.Arranger.canDragProp}
	* @private
	*/
	canDragProp: 'vertical',

	/**
	* @see {@link enyo.LeftRightArranger.axisSize}
	* @protected
	*/
	axisSize: 'height',

	/**
	* @see {@link enyo.LeftRightArranger.offAxisSize}
	* @protected
	*/
	offAxisSize: 'width',

	/**
	* @see {@link enyo.LeftRightArranger.axisPosition}
	* @protected
	*/
	axisPosition: 'top'
});
