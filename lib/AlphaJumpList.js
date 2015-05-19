/**
* Contains the declaration for the {@link enyo.AlphaJumpList} kind.
* @module layout/AlphaJumpList
*/

var
	kind = require('enyo/kind');

var
	AlphaJumper = require('./AlphaJumper'),
	List = require('./List');

/**
* {@link enyo.AlphaJumpList} is an {@link enyo.List} that features an alphabetical
* panel from which a selection may be made. Actions are performed based on the item
* that was selected.
*
* ```
* {kind: 'AlphaJumpList', onSetupItem: 'setupItem',
* 	onAlphaJump: 'alphaJump',
* 	components: [
* 		{name: 'divider'},
* 		{kind: 'onyx.Item'}
* 	]
* }
* ```
*
* @ui
* @namespace enyo
* @class enyo.AlphaJumpList
* @extends enyo.List
* @definedby module:layout/AlphaJumpList
* @public
*/
module.exports = kind(
	/** @lends enyo.AlphaJumpList.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.AlphaJumpList',

	/**
	* @private
	*/
	kind: List,

	/**
	* @private
	*/
	scrollTools: [
		{name: 'jumper', kind: AlphaJumper}
	],

	/**
	* @method
	* @private
	*/
	initComponents: function () {
		this.createChrome(this.scrollTools);
		List.prototype.initComponents.apply(this, arguments);
	},

	/**
	* @method
	* @private
	*/
	rendered: function () {
		List.prototype.rendered.apply(this, arguments);
		this.centerJumper();
	},

	/**
	* @method
	* @private
	*/
	handleResize: function () {
		List.prototype.handleResize.apply(this, arguments);
		this.centerJumper();
	},

	/**
	* Vertically centers the {@link enyo.AlphaJumper} control within the scroller.
	*
	* @private
	*/
	centerJumper: function () {
		var b = this.getBounds(), sb = this.$.jumper.getBounds();
		this.$.jumper.applyStyle('top', ((b.height - sb.height) / 2) + 'px');
	}
});
