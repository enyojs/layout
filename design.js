/**
	Descriptions to make layout kinds available in Ares.
*/
Palette.model.push(
	{name: "fittable", items: [
		{name: "FittableRows", title: "Vertical stacked layout", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "Stack of vertical rows, one of which can be made to fit.",
			inline: {kind: "FittableRows", style: "height: 80px; position: relative;", padding: 4, components: [
				{style: "background-color: lightblue; border: 1px dotted blue; height: 15px;"},
				{style: "background-color: lightblue; border: 1px dotted blue;", fit: true},
				{style: "background-color: lightblue; border: 1px dotted blue; height: 15px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "FittableRows"}
		},
		{name: "FittableColumns", title: "Horizontal stacked layout", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "Stack of horizontal columns, one of which can be made to fit.",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightblue; border: 1px dotted blue; width: 20px;"},
				{style: "background-color: lightblue; border: 1px dotted blue;", fit: true},
				{style: "background-color: lightblue; border: 1px dotted blue; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "FittableColumns"}
		}
	]},
	{name: "imageview", items: [
		{name: "ImageCarousel", title: "A carousel of images", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "Stack of vertical rows, one of which can be made to fit.",
			inline: {},
			config: {content: "$name", isContainer: true, kind: "ImageCarousel"}
		},
		{name: "ImageView", title: "A scalable Image View", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "Stack of horizontal columns, one of which can be made to fit.",
			inline: {},
			config: {content: "$name", isContainer: true, kind: "ImageView"}
		},
		{name: "ImageViewPin", title: "An unscaled item inside an ImageView", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "Stack of horizontal columns, one of which can be made to fit.",
			inline: {},
			config: {content: "$name", isContainer: true, kind: "ImageViewPin"}
		},
	]},
	{name: "List", items: [
		{name: "AroundList", title: "List with elements above the list", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "A component for very long lists",
			inline: {kind: "FittableRows", style: "height: 80px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true, content: ". . ."},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"}
			]},
			config: {content: "$name", isContainer: false, kind: "AroundList", onSetupItem: "", count: 0}
		},
		{name: "List", title: "Infinite scrolling list", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "A component for very long lists",
			inline: {kind: "FittableRows", style: "height: 80px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true, content: ". . ."},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"}
			]},
			config: {content: "$name", isContainer: false, kind: "List", onSetupItem: "", count: 0}
		},
		{name: "PulldownList", title: "List with pull-to-refresh", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "A component for very long lists",
			inline: {kind: "FittableRows", style: "height: 80px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true, content: ". . ."},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"}
			]},
			config: {content: "$name", isContainer: false, kind: "PulldownList", onSetupItem: "", count: 0}
		}
	]},
	{name: "Panels", items: [
		{name: "CardArranger", title: "Selectable sub-view", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "A component for panels",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true},
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "Panels", arrangerKind: "CardArranger"}
		},
		{name: "CardSlideInArranger", title: "Selectable sub-view", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "A component for panels",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true},
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "Panels", arrangerKind: "CardSlideInArranger"}
		},
		{name: "CarouselArranger", title: "Selectable sub-view", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "A component for panels",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true},
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "Panels", arrangerKind: "CarouselArranger"}
		},
		{name: "CollapsingArranger", title: "Selectable sub-view", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "A component for panels",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true},
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "Panels", arrangerKind: "CollapsingArranger"}
		},
		{name: "DockRightArranger", title: "Selectable sub-view", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "A component for panels",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true},
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "Panels", arrangerKind: "DockRightArranger"}
		},
		{name: "GridArranger", title: "Selectable sub-view", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "A component for panels",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true},
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "Panels", arrangerKind: "GridArranger"}
		},
		{name: "LeftRightArranger", title: "Selectable sub-view", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "A component for panels",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true},
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "Panels", arrangerKind: "LeftRightArranger"}
		},
		{name: "UpDownArranger", title: "Selectable sub-view", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "A component for panels",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true},
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "Panels", arrangerKind: "UpDownArranger"}
		},
	]},
	{name: "Slideable", items: [
		{name: "Slideable", title: "Slideable sub-view", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "A component for slideable",
			inline: {kind: "FittableColumns", style: "height: 40px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightblue; border: 1px dotted blue;", fit: true}
			]},
			config: {content: "$name", isContainer: true, kind: "Slideable"}
		}
	]},
	{name: "Tree", items: [
		{name: "Node", title: "A tree node", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "A component for Trees",
			inline: {kind: "FittableColumns", style: "height: 40px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightblue; border: 1px dotted blue;", fit: true},
			]},
			config: {content: "$name", isContainer: true, kind: "Node"}
		}
	]}	
);