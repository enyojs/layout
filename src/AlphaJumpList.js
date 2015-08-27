/**
* Contains the declaration for the {@link module:layout/AlphaJumpList~AlphaJumpList} kind.
* @module layout/AlphaJumpList
*/

var
	kind = require('enyo/kind');

var
	AlphaJumper = require('./AlphaJumper'),
	List = require('./List');

/**
* {@link module:layout/AlphaJumpList~AlphaJumpList} is an {@link module:layout/List~List} that features an alphabetical
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
* @class AlphaJumpList
* @extends module:layout/List~List
* @public
*/
module.exports = kind(
	/** @lends module:layout/AlphaJumpList~AlphaJumpList.prototype */ {

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
	* Vertically centers the {@link module:layout/AlphaJumper~AlphaJumper} control within the scroller.
	*
	* @private
	*/
	centerJumper: function () {
		var b = this.getBounds(), sb = this.$.jumper.getBounds();
		this.$.jumper.applyStyle('top', ((b.height - sb.height) / 2) + 'px');
	}
});
