/**
	_enyo.GridList.ImageItem_ is a convenience component that may be used inside
	an [enyo.DataGridList](#enyo.DataGridList) to display an image grid with an
	optional caption and subcaption.
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
			Set to true to add the _selected_ CSS class to the image tile; set to
			false to remove the _selected_ class
		*/
		selected: false,
		/**
			When true, the caption and subcaption are centered; otherwise, they are
			left-aligned
		*/
		centered: true,
		/**
			By default, the width of the image fits the width of the item, and the
			height is sized naturally, based on the image's aspect ratio.  Set this 
			property to _constrain_ to letterbox the image in the available space,
			or _cover_ to cover the available space with the image (cropping the
			larger dimension).  Note that, when _imageSizing_ is explicitly specified,
			you must indicate whether the caption and subcaption are used (by setting
			the _useCaption_ and _useSubCaption_ flags) to ensure proper sizing.
		*/
		imageSizing: "",
		/**
			When explicitly specifying an _imageSizing_ option, set to false if the
			caption space should not be reserved. This property has no effect when
			_imageSizing_ retains its default value.
		*/
		useCaption: true,
		/**
			When explicitly specifying an _imageSizing_ option, set to false if the
			subcaption space should not be reserved. This property has no effect when
			_imageSizing_ retains its default value.
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