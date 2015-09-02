/**
* Contains the declaration for the {@link module:layout/GridListImageItem~GridListImageItem} kind.
* @module layout/GridListImageItem
*/

var
	kind = require('enyo/kind'),
	Control = require('enyo/Control'),
	Img = require('enyo/Image'),
	EmptyBinding = require('enyo/EmptyBinding');

/**
* {@link module:layout/GridListImageItem~GridListImageItem} is a convenience component that may be used inside
* an {@link module:enyo/DataGridList~DataGridList} to display an image grid with an optional caption and
* subcaption.
*
* @class GridListImageItem
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:layout/GridListImageItem~GridListImageItem.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.GridListImageItem',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	classes: 'enyo-gridlist-imageitem',

	/**
	* @private
	*/
	components: [
		{name: 'image', kind: Img, classes:'image'},
		{name: 'caption', kind: Control, classes: 'caption'},
		{name: 'subCaption', kind: Control, classes: 'sub-caption'}
	],

	/**
	* @lends module:layout/GridListImageItem~GridListImageItem.prototype
	* @private
	*/
	published: {
		/**
		* The absolute URL path to the image.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		source: '',

		/**
		* The primary caption to be displayed with the image.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		caption: '',

		/**
		* The second caption line to be displayed with the image.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		subCaption: '',

		/**
		* Set to `true` to add the `selected` CSS class to the image tile; set to
		* `false` to remove the `selected` class.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		selected: false,

		/**
		* When `true`, the caption and subcaption are centered; otherwise, they are
		* left-aligned.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		centered: true,

		/**
		* By default, the width of the image fits the width of the item, and the
		* height is sized naturally, based on the image's aspect ratio. Set this
		* property to `'contain'` to letterbox the image in the available space,
		* or `'cover'` to cover the available space with the image (cropping the
		* larger dimension). Note that when `imageSizing` is explicitly specified,
		* you must indicate whether the caption and subcaption are used (by setting
		* the [useCaption]{@link module:layout/GridListImageItem~GridListImageItem#useCaption} and
		* [useSubCaption]{@link module:layout/GridListImageItem~GridListImageItem#useSubCaption} flags) to
		* ensure proper sizing.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		imageSizing: '',

		/**
		* When an [imageSizing]{@link module:layout/GridListImageItem~GridListImageItem#imageSizing} option is
		* explicitly specified, set this to `false` if the caption space should not
		* be reserved. This property has no effect when `imageSizing` retains its
		* default value.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		useCaption: true,

		/**
		* When an [imageSizing]{@link module:layout/GridListImageItem~GridListImageItem#imageSizing} option is
		* explicitly specified, set this to `false` if the subcaption space should
		* not be reserved. This property has no effect when `imageSizing` retains
		* its default value.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		useSubCaption: true,

		/**
		* Placeholder image used while [source]{@link module:layout/GridListImageItem~GridListImageItem#source} is loaded
		*
		* @see module:enyo/Image~Image#placeholder
		* @type {String}
		* @default ''
		* @public
		*/
		placeholder: ''
	},

	/**
	* @private
	*/
	bindings: [
		{from: 'source', to: '$.image.src'},
		{from: 'caption', to: '$.caption.content'},
		{from: 'caption', to: '$.caption.showing', kind: EmptyBinding},
		{from: 'subCaption', to: '$.subCaption.content'},
		{from: 'subCaption', to: '$.subCaption.showing', kind: EmptyBinding},
		{from: 'placeholder', to: '$.image.placeholder'}
	],

	/**
	* @method
	* @private
	*/
	create: function () {
		Control.prototype.create.apply(this, arguments);
		this.selectedChanged();
		this.imageSizingChanged();
		this.centeredChanged();
	},

	/**
	* @private
	*/
	selectedChanged: function () {
		this.addRemoveClass('selected', this.selected);
	},

	/**
	* @private
	*/
	disabledChanged: function () {
		this.addRemoveClass('disabled', this.disabled);
	},

	/**
	* @private
	*/
	imageSizingChanged: function () {
		this.$.image.setSizing(this.imageSizing);
		this.addRemoveClass('sized-image', !!this.imageSizing);
		if (this.imageSizing) {
			this.useCaptionChanged();
			this.useSubCaptionChanged();
		}
	},

	/**
	* @private
	*/
	useCaptionChanged: function () {
		this.addRemoveClass('use-caption', this.useCaption);
	},

	/**
	* @private
	*/
	useSubCaptionChanged: function () {
		this.addRemoveClass('use-subcaption', this.useSubCaption);
	},

	/**
	* @private
	*/
	centeredChanged: function () {
		this.addRemoveClass('centered', this.centered);
	}
});
