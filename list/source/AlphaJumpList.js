(function (enyo, scope) {

	/**
	* A control that presents an alphabetic panel that you can select from, in
	* order to perform actions based on the item selected.
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
	* @class enyo.AlphaJumpList
	* @extends enyo.List
	* @public
	*/
	enyo.kind(
		/** @lends enyo.AlphaJumpList.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.AlphaJumpList',

		/**
		* @private
		*/
		kind: 'List',

		/**
		* @private
		*/
		scrollTools: [
			{name: 'jumper', kind: 'AlphaJumper'}
		],

		/**
		* @method
		* @private
		*/
		initComponents: enyo.inherit(function (sup) {
			return function () {
				this.createChrome(this.scrollTools);
				sup.apply(this, arguments);
			};
		}),

		/**
		* @method
		* @private
		*/
		rendered: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.centerJumper();
			};
		}),

		/**
		* @method
		* @private
		*/
		handleResize: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.centerJumper();
			};
		}),

		/**
		* Vertically centers the {@link enyo.AlphaJumper} control within the scroller
		*
		* @private
		*/
		centerJumper: function () {
			var b = this.getBounds(), sb = this.$.jumper.getBounds();
			this.$.jumper.applyStyle('top', ((b.height - sb.height) / 2) + 'px');
		}
	});

})(enyo, this);