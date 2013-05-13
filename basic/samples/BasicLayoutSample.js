
enyo.kind({
	name : 'enyo.sample.BasicLayoutSample',
	classes: 'basic-layout-sample enyo-fit',
	kind: "enyo.HBox",
	components: [
		{kind: "Image", src: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQNyN629BoVBFfGUM6Sc6SaFhdqOOGTHjRz38cTJqlzpffPOj3Y", style: "width: 200px;"},
		{kind: "enyo.VBox", components: [
			{name: 'row1', content: "row1", style: "width: 100px;"},
			{name: 'row2', content: "row2", style: "width: 100px;"},
			{name: 'row3', content: "row3", style: "width: 100px;"},
			{name: 'row4', content: "row4", style: "width: 100px;"},
		]}
	]
});