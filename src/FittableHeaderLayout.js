/**
* Contains the declaration for the {@link module:layout/FittableHeaderLayout~FittableHeaderLayout} kind.
* @module layout/FittableHeaderLayout
*/

var
	kind = require('enyo/kind');

var
	FittableLayout = require('./FittableLayout'),
	FittableColumnsLayout = FittableLayout.Columns;

/**
* {@link module:layout/FittableHeaderLayout~FittableHeaderLayout} extends {@link module:layout/FittableLayout~FittableColumnsLayout},
* providing a container in which items are laid out in a set of vertical columns,
* with most items having natural size, but one expanding to fill the remaining
* space. The one that expands is labeled with the attribute `fit: true`.
*
* For more information, see the documentation on
* [Fittables]{@linkplain $dev-guide/building-apps/layout/fittables.html} in the
* Enyo Developer Guide.
*
* @class FittableHeaderLayout
* @extends module:layout/FittableColumnsLayout~FittableColumnsLayout
* @public
*/
module.exports = kind(/** @lends module:layout/FittableHeaderLayout~FittableHeaderLayout.prototype */{

	/**
	* @private
	*/
	name: 'enyo.FittableHeaderLayout',

	/**
	* @private
	*/
	kind: FittableColumnsLayout,

	/**
	* @private
	*/
	applyFitSize: function(measure, total, before, after) {
		var padding = before - after;
		var f = this.getFitControl();

		if (padding < 0) {
			f.applyStyle('padding-left', Math.abs(padding) + 'px');
			f.applyStyle('padding-right', null);
		} else if (padding > 0) {
			f.applyStyle('padding-left', null);
			f.applyStyle('padding-right', Math.abs(padding) + 'px');
		} else {
			f.applyStyle('padding-left', null);
			f.applyStyle('padding-right', null);
		}

		FittableColumnsLayout.prototype.applyFitSize.apply(this, arguments);
	}
});
