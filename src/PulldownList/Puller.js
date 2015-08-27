/**
* Contains the declaration for the {@link module:layout/PulldownList/Puller~Puller} kind.
* This module is automatically included by {@link module:layout/PulldownList}.
* @module layout/PulldownList/Puller
*/

var
	kind = require('enyo/kind'),
	Control = require('enyo/Control');

/**
* Fires when the Puller is created.
*
* @event module:layout/PulldownList/Puller~Puller#onCreate
* @type {Object}
* @public
*/

/**
* {@link module:layout/PulldownList/Puller~Puller} is a control displayed within an {@link module:layout/PulldownList~PulldownList}
* to indicate that the list is refreshing due to a pull-to-refresh.
*
* @class Puller
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:layout/PulldownList/Puller~Puller.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Puller',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	classes: 'enyo-puller',

	/**
	* @lends module:layout/PulldownList/Puller~Puller.prototype
	* @private
	*/
	published: {
		/**
		* Text to display below icon.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		text: '',

		/**
		* CSS classes to apply to the icon control.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		iconClass: ''
	},

	/**
	* @private
	*/
	events: {
		onCreate: ''
	},

	/**
	* @private
	*/
	components: [
		{name: 'icon'},
		{name: 'text', tag: 'span', classes: 'enyo-puller-text'}
	],

	/**
	* @method
	* @private
	*/
	create: function () {
		Control.prototype.create.apply(this, arguments);
		this.doCreate();
		this.textChanged();
		this.iconClassChanged();
	},

	/**
	* @private
	*/
	textChanged: function () {
		this.$.text.setContent(this.text);
	},

	/**
	* @private
	*/
	iconClassChanged: function () {
		this.$.icon.setClasses(this.iconClass);
	}
});
