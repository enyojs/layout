(function (enyo, scope) {
    /**
    * Flex Layout
    * Supports Webkit, Mozilla, IE8+
    *
    * @ui
    * @class enyo.FlexLayout
    * @extends enyo.Layout
    * @private
    */

    enyo.kind(/** @lends  enyo.FlexLayout.prototype */ {

        /**
        * @private
        */
        name           : 'enyo.FlexLayout',

        /**
        * @private
        */
        kind           : 'Layout',

        /**
        * Determines CSS class used for layout
        *
        * @type {String}
        * @default  'enyo-content-layout'
        * @public
        */
        layoutClass    : 'enyo-flex-layout',

        /**
        * Determines the spacing between children inside the flex container
        *
        * @type {Number}
        * @default  0
        * @public
        */
        flexSpacing    : 0,

        /**
        * Determines the orientation of the flex
        *
        * @type {String}
        * @default  null
        * @public
        */
        flexBias       : null,

        /**
        * Determines CSS class used for layout
        *
        * @type {String}
        * @default  'enyo-content-layout'
        * @public
        */
        flexStretch    : null,

        /**
        * defaultSpacing to use for children
        *
        * @type {String}
        * @default  0
        * @public
        */
        defaultSpacing : 0,

        /**
        * Determines default dimensions for children
        *
        * @type {String}
        * @default  'enyo-content-layout'
        * @public
        */
        defaultFlex    : 10,

        /**
        * Determines default bias for children
        *
        * @type {String}
        * @default  'row'
        * @public
        */
        defaultBias    : 'row',

        /**
        * Determines default strech action for children
        *
        * @type {Boolean}
        * @default  true
        * @public
        */
        defaultStretch : true,

        /**
        * @private
        */
        _nReflow            : 0,                          // Reflow counter

        /**
        * @private
        */
        _nResponseCondition : 0,

        /**
        * Predicate function. Returns true if oControl has FlexLayout
        * @method
        * @private
        */
        _hasFlexLayout: function(oControl) {
            return (
                oControl.layout &&
                oControl.layout instanceof enyo.FlexLayout
            );
        },

        /**
        * Returns flex value assigned to oControl
        * @method
        * @private
        */
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

        /**
        * Returns flex value assigned to oControl
        * @method
        * @private
        */
        _getFit: function(oControl) {
            if (typeof oControl.fit == 'undefined' || oControl.fit === false) {
                return 0;
            }
            if (oControl.fit === true) {
                return this.defaultFlex;
            }
            return oControl.fit;
        },

        /**
        * Returns spacing value assigned to container of this layout
        * @method
        * @private
        */
        _getSpacing: function() {
            if (typeof this.container.flexSpacing == 'undefined' || this.container.flexSpacing === false) {
                return this.defaultSpacing;
            }
            return parseInt(this.container.flexSpacing, 10);
        },

        /**
        * Returns strech value assigned to container of this layout
        * @method
        * @private
        */
        _getStretch: function() {
            if (typeof this.container.noStretch != 'undefined') {
                return !this.container.noStretch;
            }
            if (typeof this.container.flexStretch == 'undefined') {
                return this.defaultStretch;
            }
            return !!this.container.flexStretch;
        },

        /**
        * Returns strech bias value assigned to container of this layout
        * @method
        * @private
        */
        _getBias: function() {
            if (typeof this.container.flexBias == 'undefined' || !this.container.flexBias) {
                return this.defaultBias;
            }
            return this.container.flexBias;
        },

        /**
        * Predicate function. Returns true if oControl.flexOrient is "column"
        * @method
        * @private
        */
        _isColumn: function(oControl) {
            if (typeof oControl.flexOrient == 'undefined' || oControl.flexOrient != 'column' && oControl.flexOrient != 'row') {
                return this.flexBias == 'column';
            }
            return oControl.flexOrient == 'column';
        },

        /**
        * Returns 0 if container width has NOT crossed flexResponseWidth
        * Otherwise returns 1 if flexResponseWidth has been crossed while increasing width,
        * and -1 while decreasing
        *
        * @method
        * @private
        */
        _getResponseFlag: function(oBounds) {
            var nResponseWidth        = this.container.flexResponseWidth,
                nNewResponseCondition = 0;

            if (typeof nResponseWidth != 'undefined' && nResponseWidth > 0) {
                if (oBounds.content.width < nResponseWidth) {
                    nNewResponseCondition = -1;
                } else {
                    nNewResponseCondition = 1;
                }
            }

            if (this._nResponseCondition > nNewResponseCondition) {
                this._nResponseCondition = nNewResponseCondition;
                return -1;
            } else if (this._nResponseCondition < nNewResponseCondition) {
                this._nResponseCondition = nNewResponseCondition;
                return 1;
            }

            return 0;
        },

        /**
        * Returns response strategy kind object as specified in oControl.flexResponse, otherwise null
        *
        * @method
        * @private
        */
        _getResponseStrategy: function(oControl) {
            if (typeof oControl.flexResponse != 'undefined') {
                if (typeof enyo.FlexLayout.ResponseStrategy[oControl.flexResponse] != 'undefined') {
                    return enyo.FlexLayout.ResponseStrategy[oControl.flexResponse];
                }
            }
            return null;
        },

        /**
        * Walks children and triggers their response strategies if specified
        *
        * @method
        * @private
        */
        _setResponseValues: function(oBounds) {
            var oControl,
                oStrategy,
                nResponseFlag = this._getResponseFlag(oBounds),
                nChildren     = this.container.children.length,
                n             = 0;

            if (nResponseFlag !== 0) {
                for (;n<nChildren; n++) {
                    oControl  = this.container.children[n];
                    oStrategy = this._getResponseStrategy(oControl);
                    if (oStrategy) {
                        oStrategy.respond(oControl, nResponseFlag > 0);
                    }
                }
            }
        },

        /**
        * Renders values set to aMetrics arrray by collectMetrics()
        * Calculates and renders coordinates of children
        *
        * @method
        * @private
        */
        _renderMetrics: function(aMetrics, oStylesContainer) {
            var n            = 0,
                nX           = 0,
                nY           = 0,
                bInSecondary = false, // bBiasCols ? bInRows : bInCols
                bBiasCols    = (this.flexBias == 'column'),
                o;

            for (;n<aMetrics.length; n++) {
                o = aMetrics[n];

                if (o.isColumn) {
                    if (bBiasCols) {
                        if (bInSecondary) {
                            bInSecondary = false;
                            nY           = 0;
                            nX          += aMetrics[n-1].width + this.flexSpacing;
                        }
                    } else {
                        if (!bInSecondary) {
                            bInSecondary = true;
                            nX           = 0;
                        }
                    }

                    o.styles.setBoxLeft(nX, oStylesContainer);
                    o.styles.setBoxTop (nY, oStylesContainer);

                    if (o.flex > 0) { nX += o.width            + this.flexSpacing; }
                    else            { nX += o.styles.box.width + this.flexSpacing; }
                } else {
                    if (bBiasCols) {
                        if (!bInSecondary) {
                            bInSecondary = true;
                            nY           = 0;
                        }
                    } else {
                        if (bInSecondary) {
                            bInSecondary = false;
                            nX           = 0;
                            nY          += aMetrics[n-1].height + this.flexSpacing;
                        }
                    }

                    o.styles.setBoxLeft(nX, oStylesContainer);
                    o.styles.setBoxTop (nY, oStylesContainer);

                    if (o.flex > 0) { nY += o.height            + this.flexSpacing; }
                    else            { nY += o.styles.box.height + this.flexSpacing; }
                }


                if (o.width)  { o.styles.setBoxWidth (o.width);  }
                if (o.height) { o.styles.setBoxHeight(o.height); }

                // o.styles.setPosition('absolute');
                o.styles.commit();
            }
        },


        /**
        * Makes a pass through children and gathers their sizes
        * Calculates sizes of flexible controls in row/column groups
        * Sets values to metrics array for subsequent rendering
        *
        * @method
        * @private
        */
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

                bInSecondary     = false, // bBiasCols ? bInRows : bInCols
                bColumn          = false,
                bBiasCols        = (this.flexBias == 'column');

            function _beginSecondaryGroup() {
                if (!bInSecondary) {
                    bInSecondary     = true;
                    if (bBiasCols) {
                        nRemainingHeight = oBounds.content.height;
                        nFlexRows        = 0;
                        nRows            = 0;

                        nCols     ++;
                        nFlexCols ++;
                    } else {
                        nRemainingWidth = oBounds.content.width;
                        nFlexCols       = 0;
                        nCols           = 0;

                        nRows     ++;
                        nFlexRows ++;
                    }
                }
            }

            function _endSecondaryGroup() {
                if (bInSecondary) {
                    bInSecondary = false;
                    var n1 = n - 1;

                    if (bBiasCols) {
                        nFlexHeight = Math.round((nRemainingHeight - oThis.flexSpacing * (nRows - 1))/(nFlexRows ? nFlexRows : 1));
                        while (aMetrics[n1] && !aMetrics[n1].isColumn) {
                            if (aMetrics[n1].flex > 0) {
                                aMetrics[n1].height = nFlexHeight;
                            }
                            n1 --;
                        }
                    } else {
                        nFlexWidth = Math.round((nRemainingWidth - oThis.flexSpacing * (nCols - 1))/(nFlexCols ? nFlexCols : 1));
                        while (aMetrics[n1] && aMetrics[n1].isColumn) {
                            if (aMetrics[n1].flex > 0) {
                                aMetrics[n1].width = nFlexWidth;
                            }
                            n1 --;
                        }
                    }
                }
            }

            for (;n<nChildren; n++) {
                oControl = aChildren[n];
                oStyles  = new enyo.Styles(oControl);
                bColumn  = this._isColumn(oControl);

                oMetrics  ={
                    control  : oControl,
                    flex     : this._getFlex(oControl),
                    styles   : oStyles,
                    width    : null,
                    height   : null,
                    isColumn : bColumn
                };

                if (bColumn) {
                    if (bBiasCols) {
                        _endSecondaryGroup();
                        if (this.flexStretch) {	oMetrics.height = oBounds.content.height; }
                    } else {
                        _beginSecondaryGroup();
                    }

                    nCols ++;

                    if (oMetrics.flex > 0) { nFlexCols ++; }
                    else                   { nRemainingWidth -= oStyles.box.width; }
                } else {
                    if (bBiasCols) {
                        _beginSecondaryGroup();
                    } else {
                        _endSecondaryGroup();
                        if (this.flexStretch) { oMetrics.width = oBounds.content.width; }
                    }

                    nRows ++;

                    if (oMetrics.flex > 0) { nFlexRows ++; }
                    else                   { nRemainingHeight -= oStyles.box.height; }
                }

                aMetrics.push(oMetrics);
            }

            _endSecondaryGroup();

            if (bBiasCols) {
                nFlexWidth = Math.round((nRemainingWidth - this.flexSpacing * (nCols - 1))/nFlexCols);

                for (n=0; n<aMetrics.length; n++) {
                    if (!aMetrics[n].isColumn && this.flexStretch || aMetrics[n].flex > 0) {
                        aMetrics[n].width = nFlexWidth;
                    }
                }
            } else {
                nFlexHeight = Math.round((nRemainingHeight - this.flexSpacing * (nRows - 1))/nFlexRows);

                for (n=0; n<aMetrics.length; n++) {
                    if (aMetrics[n].isColumn && this.flexStretch || aMetrics[n].flex > 0) {
                        aMetrics[n].height = nFlexHeight;
                    }
                }
            }

            return aMetrics;
        },

        /**
        * Returns clone array of children that have been ordered accordingly
        * to their flexOrder
        *
        * @method
        * @private
        */
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

        /**
        * Applies enyo.ContentLayout to children that are designated
        * with flex:"content"
        *
        * @method
        * @private
        */
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

        /**
        * Runs once and initializes all that needs to be initialized
        * Calls function that applies enyo.ContentLayout to children
        *
        * @method
        * @private
        */
        _initialize : function(oStylesContainer) {
            if (this._nReflow > 0) { return; }
            this._nReflow = 1;
            this._applyContentLayouts();
        },

        /**
        * Updates the layout to reflect any changes made to the layout container or
        * the contained components.
        *
        * @method
        * @public
        */
        reflow: enyo.inherit(function(sup) {
            return function() {
                sup.apply(this, arguments);

                // var now = enyo.now();
                this.flexSpacing = this._getSpacing();
                this.flexBias    = this._getBias();
                this.flexStretch = this._getStretch();

                this.container.addClass('enyo-flex-layout-relative');
                var oStylesContainer = new enyo.Styles(this.container);
                enyo.Styles.setStyles(this.container, {
                    'min-height' : oStylesContainer.content.height + 'px'
                });
                this.container.removeClass('enyo-flex-layout-relative');

                this._initialize(oStylesContainer);
                this._setResponseValues(oStylesContainer);

                var aChildren        = this._getOrderedChildren(),
                    aMetrics         = this._collectMetrics(aChildren, oStylesContainer);

                this._renderMetrics(aMetrics, oStylesContainer);
                this._nReflow ++;

                this.container.bubble('onReflow', {layout: this});

                // enyo.log(this.container.name, enyo.now() - now);
            };
        })
    });

    /**
    * Horizontal Flex Layout
    * Supports Webkit, Mozilla, IE8+
    *
    * @ui
    * @class enyo.HFlexLayout
    * @extends enyo.FlexLayout
    * @private
    */

    enyo.kind(/** @lends  enyo.HFlexLayout.prototype */ {
        name        : 'enyo.HFlexLayout',
        kind        : 'enyo.FlexLayout',
        defaultBias : 'column'
    });

    /**
    * Vertical Flex Layout
    * Supports Webkit, Mozilla, IE8+
    *
    * @ui
    * @class enyo.VFlexLayout
    * @extends enyo.FlexLayout
    * @private
    */

    enyo.kind(/** @lends  enyo.VFlexLayout.prototype */ {

        /**
        * @private
        */
        name        : 'enyo.VFlexLayout',

        /**
        * @private
        */
        kind        : 'enyo.FlexLayout',

        /**
        * @private
        */
        defaultBias : 'row'
    });


    /**
    * Flex Layout
    * Supports Webkit, Mozilla, IE8+
    *
    * @ui
    * @class enyo.FlexBox
    * @extends enyo.Control
    * @private
    */
    enyo.kind(/** @lends  enyo.FlexBox.prototype */ {

        /**
        * @private
        */
        name        : 'enyo.FlexBox',

        /**
        * @private
        */
        kind        : enyo.Control,

        /**
        * @private
        */
        layoutKind  : 'FlexLayout'
    });

})(enyo, this);