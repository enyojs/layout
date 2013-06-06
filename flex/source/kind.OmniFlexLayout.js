/**
 * Flex Layout
 * Allows for multiple flexible columns and rows.
 * Supports Webkit, Mozilla, Partially supports IE8+
 * @author Lex Podgorny <lex.podgorny@lge.com>
 */

enyo.kind({
	name         : 'enyo.OmniFlexLayout',
	kind         : 'Layout',
	layoutClass  : 'enyo-omniflex-layout',
	defaultFlex  : 10,                          // if container's child flex property set to true, default to this value
	strategyKind : 'enyo.ResponseStrategy',     // Default strategy, if none specified at control
	strategy     : null,
	spacing      : 0,
	
	/******************** PRIVATE *********************/
	
	_nReflow      : 0,                          // Reflow counter

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
	
	_getSpacing: function() {
		if (typeof this.container.flexSpacing == 'undefined' || this.container.flexSpacing === false) {
			return this.spacing;
		}
		return parseInt(this.container.flexSpacing, 10);
	},

	_isColumn: function(oControl) {
		return (
			typeof oControl.flexOrient != 'undefined' && 
			oControl.flexOrient        == 'column'
		);
	},
	
	_renderMetrics: function(aMetrics, oStylesContainer) {
		var n  = 0,
			nX = 0,
			nY = 0,
			bInCols = false,
			o;
			
		for (;n<aMetrics.length; n++) {
			o = aMetrics[n];
			
			if (o.isColumn) {
				if (!bInCols) { 
					bInCols = true;	
					nX      = 0;
				}
				
				o.styles.setBoxLeft(nX, oStylesContainer);
				o.styles.setBoxTop (nY, oStylesContainer);
				
				if (o.flex > 0) { nX += o.width            + this.spacing; }
				else            { nX += o.styles.box.width + this.spacing; }
				
			} else {
				if (bInCols) {
					bInCols = false;
					nX      = 0;
					nY     += aMetrics[n-1].height + this.spacing;
				}
				
				o.styles.setBoxLeft(nX, oStylesContainer);
				o.styles.setBoxTop (nY, oStylesContainer);
				
				if (o.flex > 0) { nY += o.height            + this.spacing; }
				else            { nY += o.styles.box.height + this.spacing; }				
			}
			
			if (o.width)  { o.styles.setBoxWidth (o.width);  }
			if (o.height) { o.styles.setBoxHeight(o.height); }
			
			o.styles.setPosition('absolute');
			o.styles.commit();
		}
	},
	
	_collectMetrics: function(aChildren, oBounds) {
		var oThis            = this,
			oControl,
			oStyles,
			nChildren        = aChildren.length,
			n                = 0,
			oMetrics         = {},
			aMetrics         = [],
			
			nFlexHeight      = 0,
			nRemainingHeight = oBounds.content.height,
			nFlexRows        = 0,
			nRows            = 0,
			
			nFlexWidth       = 0,
			nRemainingWidth  = oBounds.content.width,
			nFlexCols        = 0,
			nCols            = 0,
			
			bInCols          = false;
			
		function _beginColumnGroup() {
			if (!bInCols) {
				bInCols         = true;
				nRemainingWidth = oBounds.content.width;
				nFlexCols       = 0;
				nCols           = 0;
				
				nRows     ++;
				nFlexRows ++;
			}
		}
		
		function _endColumnGroup() {
			if (bInCols) {
				bInCols    = false;
				nFlexWidth = Math.ceil((nRemainingWidth - oThis.spacing * (nCols - 1))/(nFlexCols ? nFlexCols : 1));
				var n1 = n - 1;
				while (aMetrics[n1] && aMetrics[n1].isColumn) {
					if (aMetrics[n1].flex > 0) {
						aMetrics[n1].width = nFlexWidth;
					}
					n1 --;
				}
			}
		}
		
		for (;n<nChildren; n++) {
			oControl = aChildren[n];
			oStyles  = new enyo.Styles(oControl);
			oMetrics  = {
				control : oControl,
				flex    : this._getFlex(oControl),
				styles  : oStyles,
				width   : null,
				height  : null
			};
			
			if (this._isColumn(oControl)) {
				_beginColumnGroup();

				if (oMetrics.flex > 0) { nFlexCols ++; } 
				else                   { nRemainingWidth -= oStyles.box.width; }

				nCols ++;
				oMetrics.isColumn = true;
			} else {
				_endColumnGroup();
				
				if (oMetrics.flex > 0) { nFlexRows ++; } 
				else                   { nRemainingHeight -= oStyles.box.height; }
				
				nRows ++;
				oMetrics.width    = oBounds.content.width;
				oMetrics.isColumn = false;
			}
			aMetrics.push(oMetrics);
		}
		_endColumnGroup();
		
		nFlexHeight = Math.ceil((nRemainingHeight - this.spacing * (nRows - 1))/nFlexRows);

		for (n=0; n<aMetrics.length; n++) {
			if (aMetrics[n].isColumn) {
				aMetrics[n].height = nFlexHeight;
			} else {
				if (aMetrics[n].flex > 0) {
					aMetrics[n].height = nFlexHeight;
				}
			}
		}
		
		return aMetrics;
	},
	
	_getOrderedChildren: function() {
		var n = 0,
			oControl,
			aChildren = enyo.cloneArray(this.container.children),
			nChildren = aChildren.length;
			
		for (;n<nChildren; n++) {
				oControl = aChildren[n];
				if (typeof oControl.flexOrder != 'undefined' && oControl._flexMoved != this._nReflow) {
					aChildren.splice(n, 1);
					aChildren.splice(oControl.flexOrder, 0, oControl);
					oControl._flexMoved = this._nReflow;
					n --;
				}
			}
		
		return aChildren;
	},
	
	_applyContentLayouts: function() {
		var n = 0,
			oControl;
			
		for (;n<this.container.children.length; n++) {
			oControl = this.container.children[n];
			if (oControl.flex == 'content') {
				oControl.setLayoutKind('enyo.ContentLayout');
			}
		}
	},
	
	_updateStrategy: function() {
		if (this.container.strategyKind && this.container.strategyKind != '') {
			if (this.strategyKind != this.container.strategyKind) {
				this.strategyKind = this.container.strategyKind;
			}
		}
		
		if (!this.strategy) { 
			this.strategy = enyo.createFromKind(this.strategyKind, this);
		} else if (this.strategyKind != this.strategy.kindName) { 
			this.strategy.destroy();
			this.strategy = enyo.createFromKind(this.strategyKind, this);
		}
		
		this.strategy.layout = this;
	},
	
	_initialize : function() {
		if (this._nReflow > 0) { return; }
		
		this._nReflow = 1;
		
		// This code runes only on (right before) first reflow
		this._applyContentLayouts();
	},

	/******************** PUBLIC *********************/
	
	reflow: function(bDontTriggerStragety) {
		// var nTime = (new Date()).getTime();
		this.inherited(arguments);
		this.spacing = this._getSpacing();
		this._initialize();
		this._updateStrategy();
		
		var oStylesContainer = new enyo.Styles(this.container),
			aChildren        = this._getOrderedChildren(),
			aMetrics         = this._collectMetrics(aChildren, oStylesContainer);
			
		this._renderMetrics(aMetrics, oStylesContainer);
		
		if (!bDontTriggerStragety) {
			// this.strategy.respond();
		}
		
		this._nReflow ++;
		
		// enyo.OmniFlexLayout.time += ((new Date()).getTime() - nTime);
		// console.log(enyo.OmniFlexLayout.time);
		// setTimeout(function() {
		// 	enyo.OmniFlexLayout.time = 0;
		// }, 1000)
	},
	
	statics: {
		time: 0
	}
});

enyo.kind({
	name        : 'enyo.OmniFlexBox',
	kind        : enyo.Control,
	layoutKind  : 'OmniFlexLayout'
});