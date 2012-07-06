/**
	_enyo.FittableColumns_ provides a container to lay out items as a set of vertical columns, 
	with most of the items having a natural size, but one item expanding to fill the remaining space. 
	The one that grows is labeled with the attribute _fit: true_.
	
	For example the following will align three components as columns with the second filling 
	the available container space between the first and third.

		enyo.kind({
			kind: "FittableColumns",
			components: [
				{content: "1"},
				{content: "2", fit:true},
				{content: "3"}
			]
		});
	
	Or instead the _layoutKind_ attribute can be set to <a href="#enyo.FittableColumnsLayout">enyo.FittableColumnsLayout</a>
	in order to use a different base kind while still using the fittable layout strategy:

		enyo.kind({
		  kind: enyo.Control,
		  layoutKind: "FittableColumnsLayout",
			components: [
				{content: "1"},
				{content: "2", fit:true},
				{content: "3"}
			]
		});
*/

enyo.kind({
	name: "enyo.FittableColumns",
	layoutKind: "FittableColumnsLayout",
	/** By default, items in columns stretch to fit vertically; set to true to
		avoid this behavior. */
	noStretch: false
});
