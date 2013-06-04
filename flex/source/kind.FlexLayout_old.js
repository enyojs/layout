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
	debug       : false,

	_hasFlexLayout: function(oControl) {
		return (
			oControl.layout &&
			oControl.layout instanceof enyo.FlexLayout
		);
	},

	_getFlex: function(oControl) {
		var nFit = this._getFit(oControl);
		if (nFit) { return nFit; }
		if (typeof oControl.flex == 'undefined' || oControl.flex === false) {
			return 0;
		}
		if (oControl.flex === true) {
			return this.defaultFlex;
		}
		return oControl.flex;
	},
	
	_getFit: function(oControl) {
		if (typeof oControl.fit == 'undefined' || oControl.fit === false) {
			return 0;
		}
		if (oControl.fit === true) {
			return this.defaultFlex;
		}
		return oControl.fit;
	},
	
	_getSpacing: function(oControl) {
		if (typeof oControl.spacing == 'undefined' || oControl.spacing === false) {
			return 0;
		}
		return parseInt(oControl.spacing, 10);
	},
	
	_reflowChildren: function() {
		var n = 0,
			nX,
			nY,
			nSpacing = this._getSpacing(this.container),
			oControl,
			
			nFlex,
			nFlexChildren       = 0,
			nFlexSize           = 0,
			
			aStyles          = [],
			oStyles          = null,
			oStylesContainer = new enyo.Styles(this.container),
			
			nRemainingSize      = (
				this.orient == 'vertical'
					? oStylesContainer.content.height
					: oStylesContainer.content.width
			);
			
		for (;n<this.container.children.length; n++) {     // Loop1: Iterate all children
			oControl = this.container.children[n];
			oStyles  = new enyo.Styles(oControl);
			nFlex    = this._getFlex(oControl);
			
			aStyles.push(oStyles);    // Cache for Loop2
			
			if (this.orient == 'vertical') {
				if (nFlex > 0) { nFlexChildren ++; }
				else           { nRemainingSize -= (oStyles.box.height); }
			} else {
				if (nFlex > 0) { nFlexChildren ++; }
				else           { nRemainingSize -= (oStyles.box.width); }
			}
		}
		
		nFlexSize = Math.ceil((nRemainingSize - nSpacing * (this.container.children.length - 1))/nFlexChildren); // ?
		nX        = 0;
		nY        = 0;

		for (n=0; n<this.container.children.length; n++) {   // Loop2: Position all children
			oControl = this.container.children[n];
			oStyles  = aStyles[n];                    // Get sum styles from cache created in Loop1
			nFlex    = this._getFlex(oControl);       // Is flex child?
			
			oStyles.setBoxLeft (nX, oStylesContainer);
			oStyles.setBoxTop  (nY, oStylesContainer);
			oStyles.setPosition('absolute');
			
			if (this.orient == 'vertical') {
				if (nFlex > 0) {             // VERTICAL FLEX
					oStyles.setBoxWidth(oStylesContainer.content.width); // ?
					oStyles.setBoxHeight(nFlexSize);
					
					nY += nFlexSize + nSpacing;
				} else {                     // VERTICAL NON-FLEX
					oStyles.setBoxWidth(oStylesContainer.content.width);
					// oStyles.setBoxHeight(oStyles.box.height);
					
					nY += oStyles.box.height + nSpacing;
				}
			} else {
				if (nFlex > 0) {             // HORIZONTAL FLEX
					oStyles.setBoxWidth(nFlexSize);
					// console.log('nFlexSize', nFlexSize);
					oStyles.setBoxHeight(oStylesContainer.content.height);
					
					nX += nFlexSize + nSpacing;
				} else {                     // HORIZONTAL NON-FLEX
					// oStyles.setBoxWidth(oStyles.box.width);
					oStyles.setBoxHeight(oStylesContainer.content.height);

					nX += oStyles.box.width + nSpacing;
				}
			}
	
			oStyles.commit();
			
			if (this.debug) {
				oControl.setContent('Box width: ' + oStyles.box.width + "\n" + 'Content width: ' + oStyles.content.width);
			}
		}
	},

	/******************** PUBLIC *********************/

	constructor: function(oContainer) {
		this.inherited(arguments);
		this.pack   = this.container.pack   || this.pack;
		this.align  = this.container.align  || this.align;
	},

	reflow: function() {
		enyo.FlexLayout._registerFlexLayout(this);
		this._reflowChildren();
	},

	/******************** STATIC *********************/

	// Needed for IE only
	statics: {
		_aFlexLayouts: [],

		_registerFlexLayout: function(oLayout) {
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

		_unregisterFlexLayout: function(oLayout) {
			var n = 0;
			for (;n<this._aFlexLayouts.length; n++) {
				if (this._aFlexLayouts[n] === oLayout) {
					delete this._aFlexLayouts[n];
					return;
				}
			}
		},

		reflowAll: function() {
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