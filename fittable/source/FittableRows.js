/**
	_enyo.FittableRows_ provides a container to lay out items as a set of horizontal rows, 
	with most of the items having a natural size, but one item expanding to fill the remaining space. 
	The one that grows is labeled with the attribute _fit: true_.
	
	For example the following will align three components as rows with the second filling 
	the available container space between the first and third.

		enyo.kind({
			kind: "FittableRows",
			components: [
				{content: "1"},
				{content: "2", fit:true},
				{content: "3"}
			]
		});
	
	Or instead the _layoutKind_ attribute can be set to <a href="#enyo.FittableRowsLayout">enyo.FittableRowsLayout</a>
	in order to use a different base kind while still using the fittable layout strategy:

		enyo.kind({
		  kind: enyo.Control,
		  layoutKind: "FittableRowsLayout",
			components: [
				{content: "1"},
				{content: "2", fit:true},
				{content: "3"}
			]
		});
*/
enyo.kind({
	name: "enyo.FittableRows",
	layoutKind: "FittableRowsLayout",
	/** By default items in columns stretch to fit horizontally; set to false to avoid this. */
	noStretch: false
});
