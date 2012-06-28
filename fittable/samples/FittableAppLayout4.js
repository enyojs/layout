enyo.kind({
	name: "FittableAppLayout4",
	kind: "FittableColumns", 
	classes: "enyo-fit", 
	components: [
		{kind: "FittableRows", style: "width: 30%; box-shadow: 6px 0px 6px rgba(0,0,0,0.3); position: relative; z-index: 1;", components: [
			{style: "height: 200px;"},
			{style: "height: 200px;"},
			{fit: true},
			{kind: "onyx.Toolbar", style: "height: 57px;", components: [
				{content: "Toolbar"}
			]}
		]},
		{kind: "FittableRows", fit: true, components: [
			{fit: true, classes: "fittable-sample-fitting-color"},
			{kind: "onyx.Toolbar", style: "height: 57px;",components: [
				{kind: "onyx.Button", content: "2"}
			]}
		]}
	]
});