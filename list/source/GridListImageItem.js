/**
	_enyo.GridList.ImageItem_ is a convenience component that may be used
	inside an <a href="#enyo.DataGridList">enyo.DataGridList</a> to display an
	image grid with an optional caption and sub-caption.
*/

enyo.kind({
	name: "enyo.GridListImageItem",
	classes: "enyo-gridlist-imageitem",
	components: [
		{name: "image", kind: "enyo.Image", classes:"image"},
		{name: "caption", classes: "caption"},
		{name: "subCaption", classes: "sub-caption"}
	],
	published: {
		//* The absolute URL path to the image
		source: "",
		//* The primary caption to be displayed with the image
		caption: "",
		//* The second caption line to be displayed with the image
		subCaption: "",
		/**
            Set to true to add the _selected_ class to the image tile; set to
            false to remove the _selected_ class
        */
		selected: false,
		//* When true, caption & subCaption are centered; otherwise left-aligned
		centered: true,
		/** 
			By default, the image width fits the width of the item, and the height
			is sized naturally, based on the aspect ratio of the image.  Set this 
			property to _constrain_ to letterbox the image in the available space,
			or _cover_ to cover the available space with the image (cropping the
			larger dimension).  Note, when _imageSizing_ is set, you must indicate
			whether the caption and subCaption are used, based on the _useCaption_
			and _useSubCaption_ flags, for proper sizing.
		*/
		imageSizing: "",
		/**
			When using an _imageSizing_ option, set to false if the caption space
			should not be reserved.  Has no effect when imageSizing is default.
		*/
		useCaption: true,
		/**
			When using an _imageSizing_ option, set to false if the subcaption space
			should not be reserved.  Has no effect when imageSizing is default.
		*/
		useSubCaption: true
	},
	bindings: [
		{from: ".source", to: ".$.image.src"},
		{from: ".caption", to: ".$.caption.content"},
		{from: ".caption", to: ".$.caption.showing", kind: "enyo.EmptyBinding"},
		{from: ".subCaption", to: ".$.subCaption.content"},
		{from: ".subCaption", to: ".$.subCaption.showing", kind: "enyo.EmptyBinding"}
	],
	create: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.selectedChanged();
			this.imageSizingChanged();
			this.centeredChanged();
		};
	}),
	selectedChanged: function() {
		this.addRemoveClass("selected", this.selected);
	},
	disabledChanged: function() {
		this.addRemoveClass("disabled", this.disabled);
	},
	imageSizingChanged: function() {
		this.$.image.setSizing(this.imageSizing);
		this.addRemoveClass("sized-image", !!this.imageSizing);
		if (this.imageSizing) {
			this.useCaptionChanged();
			this.useSubCaptionChanged();
		}
	},
	useCaptionChanged: function() {
		this.addRemoveClass("use-caption", this.useCaption);
	},
	useSubCaptionChanged: function() {
		this.addRemoveClass("use-subcaption", this.useSubCaption);
	},
	centeredChanged: function() {
		this.addRemoveClass("centered", this.centered);
	}
});