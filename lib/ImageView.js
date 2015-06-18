/**
* Contains the declaration for the {@link module:layout/ImageView~ImageView} kind.
* @module layout/ImageView
*/

var
	kind = require('enyo/kind'),
	dom = require('enyo/dom'),
	logger = require('enyo/logger'),
	platform = require('enyo/platform'),
	Img = require('enyo/Image');

var
	PanZoomView = require('./PanZoomView');

/**
* {@link module:layout/ImageView~ImageView} is a control that displays an image at a given scaling
* factor, with enhanced support for double-tap/double-click to zoom, panning,
* mousewheel zooming and pinch-zoom (on touchscreen devices that support it).
*
* ```
* {kind: 'ImageView', src: 'assets/globe.jpg', scale: 'auto', style: 'width:500px; height:400px;'}
* ```
*
* The `onload` and `onerror` events bubble up from the underlying image
* element and an [onZoom]{@link module:layout/PanZoomView~PanZoomView#onZoom} event is triggered
* when the user changes the zoom level of the image.
*
* If you wish, you may add {@link module:enyo/ScrollThumb~ScrollThumb} indicators, disable zoom
* animation, allow panning overscroll (with a bounce-back effect), and control
* the propagation of drag events, all using this kind's Boolean properties.
*
* Note that it's best to specify a size for the ImageView in order to avoid
* complications.
*
* @class ImageView
* @extends module:layout/PanZoomView~PanZoomView
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:layout/ImageView~ImageView.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.ImageView',

	/**
	* @private
	*/
	kind: PanZoomView,

	/**
	* @private
	*/
	subKindComponents: [
		{kind: Img, ondown: 'down', style: 'vertical-align: text-top;'}
	],

	/**
	* @method
	* @private
	*/
	create: function () {
		// move components (most likely imageViewPins) to unscaledComponents
		this.unscaledComponents = this.components;
		this.components = [];

		//amend kindComponents
		this.kindComponents[1].components[0].components = this.subKindComponents;

		PanZoomView.prototype.create.apply(this, arguments);

		// set content as inline-block to mimic behaviour of an image
		this.$.content.applyStyle('display', 'inline-block');

		//offscreen buffer image to get initial image dimensions
		//before displaying a scaled down image that can fit in the container
		this.bufferImage = new Image();
		this.bufferImage.onload = this.bindSafely('imageLoaded');
		this.bufferImage.onerror = this.bindSafely('imageError');
		this.srcChanged();
		//	Needed to kickoff pin redrawing (otherwise they won't redraw on intitial scroll)
		if(this.getStrategy().$.scrollMath) {
			this.getStrategy().$.scrollMath.start();
		}
	},

	/**
	* @method
	* @private
	*/
	destroy: function () {
		if (this.bufferImage) {
			this.bufferImage.onerror = undefined;
			this.bufferImage.onerror = undefined;
			delete this.bufferImage;
		}
		PanZoomView.prototype.destroy.apply(this, arguments);
	},

	/**
	* @private
	*/
	down: function (sender, event) {
		// Fix to prevent image drag in Firefox
		event.preventDefault();
	},

	/**
	* @private
	*/
	srcChanged: function () {
		if(this.src && this.src.length>0 && this.bufferImage && this.src!=this.bufferImage.src) {
			this.bufferImage.src = this.src;
		}
	},

	/**
	* Handles `onload` events bubbled up from children to reset the scale when
	* the image changes.
	*
	* @private
	*/
	imageLoaded: function (event) {
		this.scale = this.scaleKeyword;
		this.originalWidth = this.contentWidth = this.bufferImage.width;
		this.originalHeight = this.contentHeight = this.bufferImage.height;

		//scale to fit before setting src, so unscaled image isn't visible
		this.scaleChanged();
		this.$.image.setSrc(this.bufferImage.src);

		// There appears to be a bug in Safari where due to the translation of these elements it
		// doesn't correctly render unless prodded
		if (platform.safari) {
			var n = this.$.image.hasNode(),
				src = this.bufferImage.src;

			if (n) {
				setTimeout(function () { n.src = src; }, 100);
			}
		}

		// Needed to ensure scroller contents height/width is calculated correctly when contents use enyo-fit
		dom.transformValue(this.getStrategy().$.client, 'translate3d', '0px, 0px, 0');

		this.positionClientControls(this.scale);
		this.align();
	},

	/**
	* @private
	*/
	imageError: function (event) {
		logger.error('Error loading image: ' + this.src);
		//bubble up the error event
		this.bubble('onerror', event);
	}
});
