enyo.kind({
	name: "enyo.sample.ImageCarouselSample",
	handlers:{
		onresize: "resized"
	},
	components: [
		{kind: "onyx.Toolbar", components: [
			{kind: "onyx.Button", content:"previous", ontap:"previous"},
			{kind: "onyx.Button", content:"next", ontap:"next"},
			{kind: "onyx.InputDecorator", classes: "imageCarouselInput", components: [
				{name: "carouselIndexInput", kind: "onyx.Input", value: "0"}
			]},
			{kind: "onyx.Button", content:"setIndex", ontap:"indexAnimated"},
			{kind: "onyx.Button", content:"setIndexDirect", ontap:"indexDirect"}
		]},
		{name:"carousel", kind:"ImageCarousel", classes:"demo", onload:"load", onZoom:"zoom", onerror:"error", onTransitionStart: "transitionStart", onTransitionFinish: "transitionFinish"}
	],
	create: function() {
		this.inherited(arguments);
		this.urls = [
			"assets/mercury.jpg",
			"assets/venus.jpg",
			"assets/earth.jpg",
			"assets/mars.jpg",
			"assets/jupiter.jpg",
			"assets/saturn.jpg",
			"assets/uranus.jpg",
			"assets/neptune.jpg"
		];
		// although we're specifying all the image urls now, the images themselves
		// only get created/loaded as needed
		this.$.carousel.setImages(this.urls);
	},
	load: function(inSender, inEvent) {
		enyo.log("image loaded: " + inEvent.originator.src);
	},
	zoom: function(inSender, inEvent) {
		enyo.log("image zoomed: " + inEvent.scale + " scale on " + inEvent.originator.src);
	},
	error: function(inSender, inEvent) {
		enyo.log("image error: " + inEvent.originator.src);
	},
	transitionStart: function(inSender, inEvent) {
		enyo.log("image now transitioning from: " + this.$.carousel.getImageByIndex(inEvent.fromIndex).src
				+ " to " + this.$.carousel.getImageByIndex(inEvent.toIndex).src);
	},
	transitionFinish: function(inSender, inEvent) {
		enyo.log("image transitioned to: " + this.$.carousel.getActiveImage().src);
		this.$.carouselIndexInput.setValue(inEvent.toIndex);
	},
	resized: function(inSender, inEvent) {
		this.$.carousel.getActiveImage().setScale(this.$.carousel.defaultScale);
	},
	previous: function(inSender, inEvent) {
		this.$.carousel.previous();
	},
	next: function(inSender, inEvent) {
		this.$.carousel.next();
	},
	getRandomIndex: function() {
		var i = Math.floor(Math.random()*this.$.carousel.images.length);
		while(i==this.$.carousel.index) { //make sure it isn't the active index
			i = Math.floor(Math.random()*this.$.carousel.images.length);
		}
		return i;
	},
	indexAnimated: function(inSender, inEvent) {
		this.$.carousel.setIndex(parseInt(this.$.carouselIndexInput.getValue()));
	},
	indexDirect: function(inSender, inEvent) {
		this.$.carousel.setIndexDirect(parseInt(this.$.carouselIndexInput.getValue()));
	}
});