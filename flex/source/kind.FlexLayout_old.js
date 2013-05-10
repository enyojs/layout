/**
 * Flex Layout
 * Allows for multiple flexible columns and rows.
 * Supports Webkit, Mozilla, Partially supports IE8+
 * @author Lex Podgorny <lex.podgorny@lge.com>
 */

enyo.kind({
	name        : 'enyo.FlexLayout',
	kind        : 'Layout',

	orient      : 'horizontal',         // horizontal | vertical
	pack        : 'start',              // start | center | end | baseline | stretch
	align       : 'stretch',            // start | center | end | baseline | stretch
	prefix      : '-webkit',            // style browser-specific prefix
	defaultFlex : 10,                   // if container's child flex property set to true, default to this value

	_getAbsoluteBounds: function(oControl) {
		var oLeft           = 0,
			oTop            = 0,
			oMatch          = null,
			oNode           = oControl instanceof enyo.Control ? oControl.hasNode() : oControl,
			nWidth          = oNode.offsetWidth,
			nHeight         = oNode.offsetHeight,
			sTransformProp  = enyo.dom.getStyleTransformProp(),
			oXRegEx         = /translateX\((-?\d+)px\)/i,
			oYRegEx         = /translateY\((-?\d+)px\)/i;

		if (oNode.offsetParent) {
			do {
				// Fix for FF (GF-2036), offsetParent is working differently between FF and chrome
				// if (enyo.platform.firefox) {
				//                  oLeft += oNode.offsetLeft;
				//                  oTop  += oNode.offsetTop;
				//              } else {
				oLeft += oNode.offsetLeft - (oNode.offsetParent ? oNode.offsetParent.scrollLeft : 0);
				oTop  += oNode.offsetTop  - (oNode.offsetParent ? oNode.offsetParent.scrollTop  : 0);
				// }
				if (sTransformProp) {
					oMatch = oNode.style[sTransformProp].match(oXRegEx);
					if (oMatch && typeof oMatch[1] != 'undefined' && oMatch[1]) {
						oLeft += parseInt(oMatch[1], 10);
					}
					oMatch = oNode.style[sTransformProp].match(oYRegEx);
					if (oMatch && typeof oMatch[1] != 'undefined' && oMatch[1]) {
						oTop += parseInt(oMatch[1], 10);
					}
				}
			} while ((oNode = oNode.offsetParent));
		}
		return {
			top     : oTop,
			left    : oLeft,
			bottom  : document.body.offsetHeight - oTop  - nHeight,
			right   : document.body.offsetWidth  - oLeft - nWidth,
			height  : nHeight,
			width   : nWidth
		};
	},

	_getComputedStyle: function(oControl, sStyleName) {
		if (enyo.platform.ie && enyo.platform.ie < 9) {
			sStyleName = sStyleName.replace(/([\-][a-z]+)/gi, function($1) {
				return $1.charAt(1).toUpperCase() + $1.substr(2);
			});
		}
		return oControl.getComputedStyleValue(sStyleName);
	},

	_getVOffset: function(oControl) {
		return (
			parseInt(this._getComputedStyle(oControl, 'padding-top'), 10) +
			parseInt(this._getComputedStyle(oControl, 'padding-bottom'), 10) +
			parseInt(this._getComputedStyle(oControl, 'border-top-width'), 10) +
			parseInt(this._getComputedStyle(oControl, 'border-bottom-width'), 10)
		);
	},

	_getHOffset: function(oControl) {
		return (
			parseInt(this._getComputedStyle(oControl, 'padding-left'), 10) +
			parseInt(this._getComputedStyle(oControl, 'padding-right'), 10) +
			parseInt(this._getComputedStyle(oControl, 'border-left-width'), 10) +
			parseInt(this._getComputedStyle(oControl, 'border-right-width'), 10)
		);
	},

	_setStyles: function(oControl, oStyles) {
		enyo.mixin(oControl.domStyles, oStyles);
		oControl.domStylesChanged();
	},

	_hasFlexLayout: function(oControl) {
		return (
			oControl.layout &&
			oControl.layout instanceof enyo.FlexLayout
		);
	},

	_getFlex: function(oControl) {
		if (typeof oControl.flex == 'undefined' || oControl.flex === false) {
			return 0;
		}
		if (oControl.flex === true) {
			return this.defaultFlex;
		}
		return oControl.flex;
	},

	_reflowChildrenWebkit: function() {
		var n = 0,
			sDimension = this.orient == 'vertical' ? 'height' : 'width',
			oControl,
			oStyles,
			nFlex;

		for (;n<this.container.children.length; n++) {
			oControl    = this.container.children[n];
			oStyles     = {};
			nFlex       = this._getFlex(oControl);

			this._setStyles(oControl, {display: 'block'});

			if (nFlex === 0) { continue; }

			// Set box-flex to flex value
			oStyles['-webkit-box-flex'] = nFlex;

			// We redefine flex to mean 'be exactly the left over space' TODO: experiment with removing this block, causes scroller to break	
			// as opposed to 'natural size plus the left over space'
			if (!oControl.domStyles[sDimension]) {
				oStyles[sDimension] = '0px';
			}

			this._setStyles(oControl, oStyles);
		}
	},

	_reflowChildrenMozilla: function() {
		var n = 0,
			oControl,
			oStyles,
			nFlex;

		for (;n<this.container.children.length; n++) {
			oControl = this.container.children[n];
			oStyles  = {};
			nFlex    = this._getFlex(oControl);

			if (nFlex === 0) { continue; }

			// Set box-flex to flex value
			oStyles['-moz-box-flex'] = nFlex;

			this._setStyles(oControl, oStyles);
		}
	},

	_reflowChildrenIE: function() {
		var n = 0,
			oControl,
			oStyles,
			nFlex,
			nOccupiedSize     = 0,
			nHOffset          = 0,
			nVOffset          = 0,
			oBounds           = {},
			aFlexChildren     = [],
			oBoundsContainer  = this._getAbsoluteBounds(this.container),
			nHOffsetContainer = this._getHOffset(this.container),
			nVOffsetContainer = this._getVOffset(this.container);

		for (;n<this.container.children.length; n++) {
			oControl = this.container.children[n];
			nHOffset = this._getHOffset(oControl);
			nVOffset = this._getVOffset(oControl);
			nFlex    = this._getFlex(oControl);
			oBounds  = this._getAbsoluteBounds(oControl);
			oStyles  = {
				'overflow'  : 'hidden'
			};

			if (this.orient == 'vertical') {
				if (nFlex > 0)  { aFlexChildren.push(oControl); }
				else            { nOccupiedSize += oBounds.height; }
				oStyles.width = oBoundsContainer.width - nHOffset - nHOffsetContainer + 'px';
			} else {
				if (nFlex > 0)  { aFlexChildren.push(oControl); }
				else            { nOccupiedSize += oBounds.width; }
				oStyles['float'] = 'left';
				oStyles.height = oBoundsContainer.height - nVOffset - nVOffsetContainer + 'px';
			}
			this._setStyles(oControl, oStyles);
		}

		for (n=0; n<aFlexChildren.length; n++) {
			oControl = aFlexChildren[n];
			nHOffset = this._getHOffset(oControl);
			nVOffset = this._getVOffset(oControl);
			oStyles  = {};

			if (this.orient == 'vertical') {
				oStyles.height = Math.floor(
					(oBoundsContainer.height - nOccupiedSize - nVOffsetContainer) /
					aFlexChildren.length - nVOffset
				) + 'px';
			} else {
				oStyles.width = Math.floor(
					(oBoundsContainer.width - nOccupiedSize - nHOffsetContainer) /
					aFlexChildren.length - nHOffset
				) + 'px';
			}
			this._setStyles(oControl, oStyles);
		}
	},

	_reflowWebkit: function() {
		this._setStyles(this.container, {
			'display'               : '-webkit-box',
			'-webkit-box-pack'      : this.pack,
			'-webkit-box-align'     : this.align,
			'-webkit-box-orient'    : this.orient,
			'box-sizing'            : 'border-box'
		});
		this._reflowChildrenWebkit();
	},

	_reflowMozilla: function() {
		var oStyles = {
			'display'           : '-moz-box',
			'-moz-box-pack'     : this.pack,
			'-moz-box-align'    : this.align,
			'-moz-box-orient'   : this.orient,
			'-moz-box-sizing'   : 'border-box',
			'position'          : 'relative',
			'overflow'          : 'visible'
		};
		if (this.orient == 'horizontal') {
			oStyles.height = '100%';
		}
		this._setStyles(this.container, oStyles);
		this._reflowChildrenMozilla();
	},

	_reflowIE: function() {
		var oStyles = {
			'box-sizing' : 'border-box'
		};

		if (this.orient == 'horizontal') { oStyles.width  = '100%'; }
		else                             { oStyles.height = '100%'; }

		this._setStyles(this.container, oStyles);
		this._reflowChildrenIE();

		// For JS size to be calculated correctly, layout must reflow twice when loaded
		var oThis = this;
		if (!this._reflowIE.bRepeated) {
			setTimeout(function() {
				oThis._reflowIE.bRepeated = true;
				oThis._reflowIE();
			}, 50);
		}

		enyo.FlexLayout.registerFlexLayout(this);
	},

	/******************** PUBLIC *********************/

	constructor: function(oContainer) {
		this.inherited(arguments);
		this.pack   = this.container.pack   || this.pack;
		this.align  = this.container.align  || this.align;
	},

	reflow: function() {
		this._setStyles(this.container, {
			'margin'    : '0',
			'padding'   : '0',
			'border'    : '0',
			'overflow'  : 'hidden'
		});
		if (enyo.platform.firefox)  { this._reflowMozilla(); }
		else if (enyo.platform.ie)  { this._reflowIE();      }
		else                        { this._reflowWebkit();  }
	},

	/******************** STATIC *********************/

	// Needed for IE only
	statics: {
		_aFlexLayouts: [],

		registerFlexLayout: function(oLayout) {
			var bFound = false,
				n      = 0;

			for (;n<this._aFlexLayouts.length; n++) {
				if (this._aFlexLayouts[n] === oLayout) {
					bFound = true;
				}
			}
			if (!bFound) {
				this._aFlexLayouts.push(oLayout);
			}
		},

		unregisterFlexLayout: function(oLayout) {
			var n = 0;
			for (;n<this._aFlexLayouts.length; n++) {
				if (this._aFlexLayouts[n] === oLayout) {
					delete this._aFlexLayouts[n];
					return;
				}
			}
		},

		reflowFlexLayouts: function() {
			var n = 0;
			for (;n<this._aFlexLayouts.length; n++) {
				this._aFlexLayouts[n].reflow();
			}
		}
	}

});

enyo.kind({
	name        : 'enyo.VFlexLayout',
	kind        : 'FlexLayout',
	orient      : 'vertical',
	layoutClass : 'enyo-vflex-layout'
});

enyo.kind({
	name        : 'enyo.HFlexLayout',
	kind        : 'FlexLayout',
	layoutClass : 'enyo-hflex-layout',
	orient      : 'horizontal'
});

enyo.kind({
	name        : 'enyo.HFlexBox',
	kind        : enyo.Control,
	layoutKind  : 'HFlexLayout'
});

enyo.kind({
	name        : 'enyo.VFlexBox',
	kind        : enyo.Control,
	layoutKind  : 'VFlexLayout'
});
