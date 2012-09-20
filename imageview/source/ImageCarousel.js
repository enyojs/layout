/**
	enyo.ImageCarousel is a kind of <a href="#enyo.Panels">enyo.Panels</a>,
	using the <a href="#enyo.CarouselArranger">enyo.CarouselArranger</a>, that
	dynamically creates and loads <a href="#enyo.ImageView">enyo.ImageView</a>
	controls as they're needed, to create an image gallery or sorts.

		{kind:"ImageCarousel", images:[
			"assets/mercury.jpg",
			"assets/venus.jpg",
			"assets/earth.jpg",
			"assets/mars.jpg",
			"assets/jupiter.jpg",
			"assets/saturn.jpg",
			"assets/uranus.jpg",
			"assets/neptune.jpg"
		], defaultScale:"auto"},
	
	All of the inner ImageViews' events (onload, onerror, and onZoom) will
	bubble up, and the ImageCarousel inherits the onTransitionStart and
	onTransitionFinish events.
	
	The images array property can be altered and updated at any time, and the
	index can be manipulated at runtime via the inherited getIndex() and
	setIndex() functions.
	
    Note: It's best to specify a size for the ImageCarousel to avoid
	complications   
*/

enyo.kind({
	name: "enyo.ImageCarousel",
	kind: enyo.Panels,
	arrangerKind: "enyo.CarouselArranger",
	//* The default scale value to be applied to each ImageView. Can be "auto", "width", "height", or any positive numeric value
	defaultScale: "auto",
	//* Disables the zoom on ImageViews when they're created
	disableZoom:  false,
	/**
		When true, will destroy any ImageViews that are not in the immediate
		viewing area (the currently active image and the first image on either
		side of it) to free up memory. The has the benefit of using minimal
		memory which is good for mobile devices, but has the downside that
		ImagesViews will be recreated and the images re-fetched if you want to
		view them again, increasing the number of GET calls needed for the
		image files. Default is false.
	*/
	lowMemory: false,
	published: {
		//* Array of image source filepaths
		images:[]
	},
	//* @protected
	handlers: {
		onTransitionStart: "transitionStart",
		onTransitionFinish: "transitionFinish"
	},
	create: function() {
		this.inherited(arguments);
		this.imageCount = this.images.length;
		if(this.images.length>0) {
			this.initContainers();
			this.loadNearby();
		}
	},
	initContainers: function() {
		for(var i=0; i<this.images.length; i++) {
			if(!this.$["container" + i]) {
				this.createComponent({
					name: "container" + i,
					style: "height:100%; width:100%;"
				});
				this.$["container" + i].render();
			}
		}
		for(i=this.images.length; i<this.imageCount; i++) {
			if(this.$["image" + i]) {
				this.$["image" + i].destroy();
			}
			this.$["container" + i].destroy();
		}
		this.imageCount = this.images.length;
	},
	loadNearby: function() {
		if(this.images.length>0) {
			this.loadImageView(this.index-1);
			this.loadImageView(this.index);
			this.loadImageView(this.index+1);
		}
	},
	loadImageView: function(index) {
		// NOTE: wrap bugged in enyo.CarouselArranger, but once fixed, wrap should work in this
		if(this.wrap) {
			// Used this modulo technique to get around javascript issue with negative values
			// ref: http://javascript.about.com/od/problemsolving/a/modulobug.htm
			index = ((index % this.images.length)+this.images.length)%this.images.length;
		}
		if(index>=0 && index<=this.images.length-1) {
			if(!this.$["image" + index]) {
				this.$["container" + index].createComponent({
					name: "image" + index,
					kind: "ImageView",
					scale: this.defaultScale,
					disableZoom: this.disableZoom,
					src: this.images[index],
					verticalDragPropagation: false,
					style: "height:100%; width:100%;"
				}, {owner: this});
				this.$["image" + index].render();
			} else {
				if(this.$["image" + index].src != this.images[index]) {
					this.$["image" + index].setSrc(this.images[index]);
				}
				this.$["image" + index].setScale(this.defaultScale);
				this.$["image" + index].setDisableZoom(this.disableZoom);
			}
		}
		return this.$["image" + index];
	},
	setImages: function(inImages) {
		// always invoke imagesChanged because this is an array property
		// which might otherwise seem to be the same object
		this.setPropertyValue("images", inImages, "imagesChanged");
	},
	imagesChanged: function() {
		this.initContainers();
		this.loadNearby();		
	},
	indexChanged: function() {
		this.loadNearby();
		if(this.lowMemory) {
			this.cleanupMemory();
		}
		this.inherited(arguments);
	},
	transitionStart: function(inSender, inEvent) {
		if(inEvent.fromIndex==inEvent.toIndex)
			return true; //prevent from bubbling if there's no change
	},
	transitionFinish: function(inSender, inEvent) {
		this.loadImageView(this.index-1);
		this.loadImageView(this.index+1);
		if(this.lowMemory) {
			this.cleanupMemory();
		}
	},
	//* @public
	//* Returns the currently displayed ImageView
	getActiveImage: function() {
		return this.getImageByIndex(this.index);
	},
	//* Returns a given ImageView control by it's index
	getImageByIndex: function(index) {
		return this.$["image" + index] || this.loadImageView(index);
	},
	/**
		Destroys any ImageViews that are not in the immediate viewing area (the currently active image
		and the first image on either side of it) to free up memory. Alternatively, you just set the lowMemory
		propert of the ImageCarousel to true and this function will get called automatically as needed.
	*/
	cleanupMemory: function() {
		for(var i=0; i<this.images.length; i++) {
			if(i<this.index-1 || i>this.index+1) {
				if(this.$["image" + i]) {
					this.$["image" + i].destroy();
				}
			}
		}
	}
});
