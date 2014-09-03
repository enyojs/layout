(function (enyo, scope) {

	/**
	* Fires when a letter is selected
	*
	* @event enyo.AlphaJumper#event:onAlphaJump
	* @type {Object}
	* @param {String} letter - The selected letter
	* @param {Number} index  - Index of the selected letter
	* @public
	*/

	/**
	* Presents a vertical alphabet list useful as a navigation aid for lists, specifically
	* {@link enyo.AlphaJumpList}.
	*
	* @ui
	* @class enyo.AlphaJumper
	* @extends enyo.Control
	* @public
	*/
	enyo.kind(
		/** @lends enyo.AlphaJumper.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.AlphaJumper',

		/**
		* @private
		*/
		kind: 'enyo.Control',

		/**
		* @private
		*/
		classes: 'enyo-alpha-jumper enyo-border-box',

		/**
		* @lends enyo.AlphaJumper.prototype
		* @private
		*/
		published: {
			/**
			* The selected letter control
			*
			* @type {enyo.Control}
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
		initComponents: enyo.inherit(function(sup) {
			return function() {
				for (var s='A'.charCodeAt(0), i=s; i<s+26; i++) {
					this.createComponent({content: String.fromCharCode(i)});
				}
				sup.apply(this, arguments);
			};
		}),

		/**
		* @private
		*/
		down: function(sender, event) {
			if (this.tracking) {
				enyo.dispatcher.release();
			}
			this.tracking = true;
			if (this.hasNode()) {
				var b = this.node.getBoundingClientRect();
				// IE8 does not return width
				var w = (b.width === undefined) ? (b.right - b.left) : b.width;
				this.x = b.left + w/2;
			}
			enyo.dispatcher.capture(this);
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
				enyo.dispatcher.release();
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
		* Iterates it's controls to find one associated with `node`
		*
		* @param {Node} node
		* @return {enyo.Control}
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
		* @fires enyo.AlphaJumper#event:onAlphaJump
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

})(enyo, this);