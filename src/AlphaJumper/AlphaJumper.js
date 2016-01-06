/**
* Contains the declaration for the {@link module:layout/AlphaJumper~AlphaJumper} kind.
* @module layout/AlphaJumper
*/

var
	kind = require('enyo/kind'),
	dispatcher = require('enyo/dispatcher'),
	Control = require('enyo/Control');

/**
* Fires when a letter is selected.
*
* @event module:layout/AlphaJumper~AlphaJumper#onAlphaJump
* @type {Object}
* @param {String} letter - The selected letter.
* @param {Number} index  - The index of the selected letter.
* @public
*/

/**
* {@link module:layout/AlphaJumper~AlphaJumper} provides a vertical list of alphabetical characters.
* It can help to streamline navigation within lists, particularly when used
* together with {@link module:layout/AlphaJumpList~AlphaJumpList}.
*
* @class AlphaJumper
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:layout/AlphaJumper~AlphaJumper.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.AlphaJumper',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	classes: 'enyo-alpha-jumper enyo-border-box',

	/**
	* @lends module:layout/AlphaJumper~AlphaJumper.prototype
	* @private
	*/
	published: {
		/**
		* The selected letter control.
		*
		* @type {module:enyo/Control~Control}
		* @default null
		* @public
		*/
		marker: null
	},

	/**
	* @private
	*/
	events: {
		onAlphaJump: ''
	},

	/**
	* @private
	*/
	handlers: {
		ondown: 'down',
		onmove: 'move',
		onup: 'up'
	},

	/**
	* @method
	* @private
	*/
	initComponents: function() {
		for (var s='A'.charCodeAt(0), i=s; i<s+26; i++) {
			this.createComponent({content: String.fromCharCode(i)});
		}
		Control.prototype.initComponents.apply(this, arguments);
	},

	/**
	* @private
	*/
	down: function(sender, event) {
		if (this.tracking) {
			dispatcher.release();
		}
		this.tracking = true;
		if (this.hasNode()) {
			var b = this.node.getBoundingClientRect();
			// IE8 does not return width
			var w = (b.width === undefined) ? (b.right - b.left) : b.width;
			this.x = b.left + w/2;
		}
		dispatcher.capture(this);
		this.track(event);
	},

	/**
	* @private
	*/
	move: function(sender, event) {
		if (this.tracking) {
			this.track(event);
		}
	},

	/**
	* @private
	*/
	up: function() {
		if (this.tracking) {
			dispatcher.release();
			this.setMarker(null);
			this.tracking = false;
		}
	},

	/**
	* @private
	*/
	track: function(event) {
		var n = document.elementFromPoint(this.x, event.pageY);
		var c = this.nodeToControl(n);
		if (c) {
			this.setMarker(c);
		}
	},

	/**
	* Iterates through controls to find one associated with `node`.
	*
	* @param {Node} node - The node whose associated control is sought.
	* @return {module:enyo/Control~Control} The control associated with the passed-in node.
	* @private
	*/
	nodeToControl: function(node) {
		for (var i=0, c$=this.controls, c; (c=c$[i]); i++) {
			if (node == c.hasNode()) {
				return c;
			}
		}
	},

	/**
	* @fires module:layout/AlphaJumper~AlphaJumper#onAlphaJump
	* @private
	*/
	markerChanged: function(last) {
		if (last) {
			last.removeClass('active');
		}
		if (this.marker) {
			this.marker.addClass('active');
			this.doAlphaJump({letter: this.marker.getContent(), index: this.marker.indexInContainer()});
		}
	}
});
