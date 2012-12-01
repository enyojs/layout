enyo.kind({
	name: "enyo.sample.PanZoomViewSample",
	handlers:{
		onresize: "resized"
	},
	components: [
		{kind:"PanZoomView", contentWidth: 600, contentHeight: 600, classes:"demo", onZoom:"zoom", components: [
			{kind: "FittableColumns", components: [
				{content: "Hello World", style:"background: orange; width: 200px; height: 200px;"},
				{content: "Hello World", style:"background: blue; width: 200px; height: 200px;"},
				{content: "Hello World", style:"background: cyan; width: 200px; height: 200px;"},
			]},
			{kind: "FittableColumns", components: [
				{content: "Hello World", style:"background: lightblue; width: 200px; height: 200px;"},
				{content: "Hello World", style:"background: yellow; width: 200px; height: 200px;"},
				{content: "Hello World", style:"background: red; width: 200px; height: 200px;"}
			]},
			{kind: "FittableColumns", components: [
				{content: "Hello World", style:"background: brown; width: 200px; height: 200px;"},
				{content: "Hello World", style:"background: green; width: 200px; height: 200px;"},
				{content: "Hello World", style:"background: pink; width: 200px; height: 200px;"}
			]}
		]},

		{kind:"onyx.Groupbox",  style:"padding-top:10px; width:60%; margin:auto;", components: [
			{kind:"onyx.GroupboxHeader", content: "panZoomView Scale"},
			{style:"text-align:center;", components: [
				{kind:"onyx.Button", content:"\"auto\"", ontap:"autoScale", classes:"demoButton"},
				{kind:"onyx.Button", content:"\"width\"", ontap:"widthScale", classes:"demoButton"},
				{kind:"onyx.Button", content:"\"height\"", ontap:"heightScale",  classes:"demoButton"},
				{kind:"onyx.Button", content:"0.5", ontap:"halfScale", classes:"demoButton"},
				{kind:"onyx.Button", content:"1.0", ontap:"normalScale", classes:"demoButton"},
				{kind:"onyx.Button", content:"2.0", ontap:"doubleScale", classes:"demoButton"}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.scale = "auto";
	},
	load: function(inSender, inEvent) {
		enyo.log("onload occurred: " + inSender.src);
	},
	error: function(inSender, inEvent) {
		enyo.log("onerror occurred: " + inSender.src);
	},
	zoom: function(inSender, inEvent) {
		enyo.log("onZoom occurred: " + inEvent.scale + " scale");
	},
	resized: function(inSender, inEvent) {
		this.$.panZoomView.setScale(this.scale);
	},
	autoScale: function(inSender, inEvent) {
		this.scale = "auto";
		this.$.panZoomView.setScale(this.scale);
	},
	widthScale: function(inSender, inEvent) {
		this.scale = "width";
		this.$.panZoomView.setScale(this.scale);
	},
	heightScale: function(inSender, inEvent) {
		this.scale = "height";
		this.$.panZoomView.setScale(this.scale);
	},
	halfScale: function(inSender, inEvent) {
		this.scale = 0.5;
		this.$.panZoomView.setScale(this.scale);
	},
	normalScale: function(inSender, inEvent) {
		this.scale = 1.0;
		this.$.panZoomView.setScale(this.scale);
	},
	doubleScale: function(inSender, inEvent) {
		this.scale = 2.0;
		this.$.panZoomView.setScale(this.scale);
	}
});
