enyo.kind({
	name: "enyo.sample.SlideableInfo",
	kind: enyo.Control,
	published: {
		info: null
	},
	components: [
		{layoutKind: enyo.FittableColumnsLayout, components: [
			{content: "Name:"},
			{style: "padding-left: .25em"},
			{name: "name", content: ""}
		]},
		{layoutKind: enyo.FittableColumnsLayout, components: [
			{content: "Axis:"},
			{style: "padding-left: .25em"},
			{name: "axis", content: ""}
		]},
		{layoutKind: enyo.FittableColumnsLayout, components: [
			{content: "Unit:"},
			{style: "padding-left: .25em"},
			{name: "unit", content: ""}
		]},
		{layoutKind: enyo.FittableColumnsLayout, components: [
			{content: "Min:"},
			{style: "padding-left: .25em"},
			{name: "min", content: ""}
		]},
		{layoutKind: enyo.FittableColumnsLayout, components: [
			{content: "Max:"},
			{style: "padding-left: .25em"},
			{name: "max", content: ""}
		]},
		/*{layoutKind: enyo.FittableColumnsLayout, components: [
			{content: "Value:"},
			{style: "padding-left: .25em"},
			{name: "value", content: ""}
		]}*/
	],
	create: function() {
		this.inherited(arguments);
		this.infoChanged();
	},
	infoChanged: function() {
		for (var p in this.info) {
			if (this.$[p]) {
				this.$[p].setContent(this.info[p]);
			}
		}
	}
});

enyo.kind({
	name: "enyo.sample.SlideableSample",
	classes: "enyo-unselectable",
	style: "overflow: hidden;",
	components: [
		{ondragstart: "suppressPanelDrag", classes: "enyo-fit", components: [
			{name: "startTop", kind: "Slideable", axis: "v", unit: "%", min: -90, max: 0, classes: "enyo-fit slideable-sample top", components: []},
			{name: "startRight", kind: "Slideable", axis: "h", unit: "%", min: 0, max: 90, classes: "enyo-fit slideable-sample right", components: []},
			{name: "startBottom", kind: "Slideable", axis: "v", unit: "%", min: 0, max: 90, classes: "enyo-fit slideable-sample bottom", components: []},
			{name: "startLeft", kind: "Slideable", axis: "h", unit: "%", min: -90, max: 0, classes: "enyo-fit slideable-sample left", components: []}
		]}
	],
	create: function() {
		this.inherited(arguments);
		var slideables = [];

		for (var c in this.$) {
			if (this.$[c].kind === "Slideable") {
				slideables.push(this.$[c]);
			}
		}
		this.populate(slideables);
	},
	populate: function(inSlideables) {
		var slideable;
		for (var s in inSlideables) {
			slideable = inSlideables[s];
			slideable.createComponent({kind: "enyo.sample.SlideableInfo", layoutKind: (slideable.axis === "v") ? enyo.FittableColumnsLayout : enyo.FittableRowsLayout, classes: "enyo-center", info: {name: slideable.name, axis: slideable.axis, unit: slideable.unit, min: slideable.min, max: slideable.max, value: slideable.value}});
		}
	},
	// keeps the view panel from resizing in Sampler app
	suppressPanelDrag: function() {
		return true;
	}
});