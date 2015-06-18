/**
* Contains the declaration for the {@link module:layout/CardArranger~CardArranger} kind.
* @module layout/CardArranger
*/

var
	kind = require('enyo/kind');

var
	Arranger = require('./Arranger');


/**
* {@link module:layout/CardArranger~CardArranger} is an {@link module:layout/Arranger~Arranger} that displays only
* one active control. The non-active controls are hidden with
* `setShowing(false)`. Transitions between arrangements are handled by fading
* from one control to the next.
*
* For more information, see the documentation on
* [Arrangers]{@linkplain $dev-guide/building-apps/layout/arrangers.html} in the
* Enyo Developer Guide.
*
* @class CardArranger
* @extends module:layout/Arranger~Arranger
* @public
*/
module.exports = kind(
	/** @lends module:layout/CardArranger~CardArranger.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.CardArranger',

	/**
	* @private
	*/
	kind: Arranger,

	/**
	* @private
	*/
	layoutClass: 'enyo-arranger enyo-arranger-fit',

	/**
	* @see {@link module:layout/Arranger~Arranger#calcArrangementDifference}
	* @protected
	*/
	calcArrangementDifference: function (i0, a0, i1, a1) {
		return this.containerBounds.width;
	},

	/**
	* Applies opacity to the activation and deactivation of panels. Expects the passed-in
	* array of controls to be ordered such that the first control in the array is the active
	* panel.
	*
	* @see {@link module:layout/Arranger~Arranger#arrange}
	* @protected
	*/
	arrange: function (controls, arrangement) {
		for (var i=0, c, v; (c=controls[i]); i++) {
			v = (i === 0) ? 1 : 0;
			this.arrangeControl(c, {opacity: v});
		}
	},

	/**
	* Shows the active panel at the start of transition. Also triggers a resize on
	* the active panel if it wasn't previously showing.
	*
	* @see {@link module:layout/Arranger~Arranger#start}
	* @method
	* @protected
	*/
	start: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				var wasShowing=c.showing;
				c.setShowing(i == this.container.fromIndex || i == (this.container.toIndex));
				if (c.showing && !wasShowing) {
					c.resize();
				}
			}
		};
	}),

	/**
	* Hides all non-active panels when the transition completes.
	*
	* @see {@link module:layout/Arranger~Arranger#finish}
	* @method
	* @protected
	*/
	finish: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				c.setShowing(i == this.container.toIndex);
			}
		};
	}),

	/**
	* Ensures all panels are showing and visible when the arranger is destroyed.
	*
	* @method
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				Arranger.opacifyControl(c, 1);
				if (!c.showing) {
					c.setShowing(true);
				}
			}
			sup.apply(this, arguments);
		};
	})
});
