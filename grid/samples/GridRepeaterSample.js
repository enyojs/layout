enyo.kind({
	name: "enyo.sample.GridRepeaterSample",
	kind: "FittableRows",
	components: [
		{style:"padding: 10px;", oninput:"refresh", components: [
			{tag: "span", content: "Grid Layout", style:"font-weight: bold;"},
			{tag: "span", content: " | Spacing: "},
			{kind: "enyo.Input", name:"spacingInput", value: 20, style: "width: 50px;", type:"number"},
			{tag: "span", content: " Min-width: "},
			{kind: "enyo.Input", name:"minWidthInput", value: 300, style: "width: 50px;", type:"number"},
			{tag: "span", content: " Min-height: "},
			{kind: "enyo.Input", name:"minHeightInput", value: 300, style: "width: 50px;", type:"number"}
		]},
		{kind: "enyo.Scroller", fit:true, components: [
			{name: "repeater", kind: "enyo.DataRepeater", containerOptions: {
				layoutKind:"GridLayout",
				minWidth: 300,
				minHeight: 300,
				spacing: 20
			}, components: [
				{style: "background:lightblue; border-radius:10px; padding: 20px;", bindings: [
					{from: ".model.text", to:".content"}
				]}
			]}
		]}
	],
	bindings: [
		{from: ".collection", to: ".$.repeater.collection"}
	],
	create: function() {
		var recs = [];
		for (var i=0; i<20; i++) {
			recs.push({text: "Item " + i});
		}
		this.collection = new enyo.Collection(recs);
		this.inherited(arguments);
	},
	refresh: function() {
		var c = this.$.repeater.getContainer();
		c.spacing = parseFloat(this.$.spacingInput.getValue());
		c.minWidth = parseFloat(this.$.minWidthInput.getValue());
		c.minHeight = parseFloat(this.$.minHeightInput.getValue());
		c.reflow();
	}
});
