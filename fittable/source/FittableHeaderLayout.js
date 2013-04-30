/**
	_enyo.FittableHeaderLayout is a specializetion of _enyo.FittableColumnsLayout_
	where

	provides a container in which items are laid out in a
	set of vertical columns, with most items having natural size, but one
	expanding to fill the remaining space. The one that expands is labeled with
	the attribute _fit: true_.

	For more information, see the documentation on
	[Fittables](https://github.com/enyojs/enyo/wiki/Fittables) in the Enyo
	Developer Guide.

*/
enyo.kind({
	name: "enyo.FittableHeaderLayout",
	kind: "FittableColumnsLayout",
	applyFitSize: function(measure, total, before, after) {
		var padding = before - after;
		var f = this.getFitControl();

		if (padding < 0) {
			f.applyStyle("padding-left", Math.abs(padding) + "px");
			f.applyStyle("padding-right", null);
		} else if (padding > 0) {
			f.applyStyle("padding-left", null);
			f.applyStyle("padding-right", Math.abs(padding) + "px");
		} else {
			f.applyStyle("padding-left", null);
			f.applyStyle("padding-right", null);
		}

		this.inherited(arguments);
	}
});