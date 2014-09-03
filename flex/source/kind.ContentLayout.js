(function (enyo, scope) {
    /**
    * Content Layout
    * Provides a container with fixed width and/or height that resizes to reveal it's content
    * Supports Webkit, Mozilla, IE8
    *
    * @ui
    * @class enyo.ContentLayout
    * @extends enyo.Layout
    * @private
    */

    enyo.kind(/** @lends  enyo.ContentLayout.prototype */ {

        /**
        * @private
        */
        name        : 'enyo.ContentLayout',

        /**
        * Determines CSS class used for layout
        *
        * @type {String}
        * @default  'enyo-content-layout'
        * @public
        */
        layoutClass : 'enyo-content-layout',

        /**
        * @private
        */
        kind        : 'Layout',

        /**
        * Determines minimum container width
        *
        * @type {Number}
        * @default  'enyo-content-layout'
        * @public
        */
        minWidth    : 0,

        /**
        * Determines minimum container height
        *
        * @type {Number}
        * @default 0
        * @public
        */
        minHeigh    : 0,

        /**
        * Determines maximum container width
        *
        * @type {Number}
        * @default 0
        * @public
        */
        maxWidth    : 0,

        /**
        * Determines maximum container Height
        *
        * @type {Number}
        * @default 0
        * @public
        */
        maxHeight   : 0,

        /**
        * @private
        */
        _width      : 0,
        /**
        * @private
        */
        _height     : 0,

        /**
        * @private
        * @method
        */
        _updateBoundValues: function() {
            if (this._isFlexChild()) {
                if (this._isFlexColumn()) {
                    // console.log(this.container.name, 'updating max/min width');
                    this.minWidth  = this.container.minWidth;
                    this.maxWidth  = this.container.maxWidth;
                } else {
                    // console.log(this.container.name, 'updating max/min height');
                    this.minHeight = this.container.minHeight;
                    this.maxHeight = this.container.maxHeight;
                }
            } else {
                this.minWidth  = this.container.minWidth;
                this.minHeight = this.container.minHeight;
                this.maxWidth  = this.container.maxWidth;
                this.maxHeight = this.container.maxHeight;
            }
        },

        /**
        * @private
        * @method
        */
        _isFlexChild: function() {
            return this.container.parent.layoutKind == 'enyo.FlexLayout';
        },

        /**
        * @private
        * @method
        */
        _isFlexColumn: function() {
            return this.container.parent.layout._isColumn(this.container);
        },

        /**
        * @private
        * @method
        */
        _setSize: function(nWidth, nHeight, oStyles) {
            var bReflow = this._width != nWidth || this._height != nHeight;

            this._width  = nWidth;
            this._height = nHeight;

            if (this._isFlexChild()) {
                if (this._isFlexColumn()) {	oStyles.setContentWidth(nWidth);   }
                else                      { oStyles.setContentHeight(nHeight); }
            } else {
                oStyles.setContentWidth(nWidth);
                oStyles.setContentHeight(nHeight);
            }

            oStyles.set('overflow', 'auto');
            oStyles.commit();

            if (bReflow) {
                if (this._isFlexChild()) {
                    this.reflow();
                    this.container.parent.layout.reflow();
                }
            }
        },

        /**
        * @private
        * @method
        */
        _updateSize: function() {
            this._updateBoundValues();

            var oStyles = new enyo.Styles(this.container);

            // If empty container, return min sizes
            /************************************************************************/
            if (this.container.children.length === 0 && this.container.content.length === 0) {
                this._setSize(this.minWidth, this.minHeight, oStyles);
                return;
            }

            // If at max size, simply return max sizes
            /************************************************************************/
            if (oStyles.content.width >= this.maxWidth && oStyles.content.height >= this.maxHeight) {
                this._setSize(this.maxWidth, this.maxHeight, oStyles);
                return;
            }

            // Otherwise
            /************************************************************************/

            var oElement = document.createElement(this.container.node.nodeName),
                nWidth,
                nHeight = this.minHeight;

            // Get width
            /************************************************************************/

            this.container.node.parentNode.appendChild(oElement);

            oElement.innerHTML     = this.container.node.innerHTML;
            oElement.className     = this.container.node.className;
            oElement.id            = this.container.node.id;
            oElement.style.display = 'inline';
            nWidth                 = oElement.offsetWidth - oStyles.h.padding;

            // Constrain to maxWidth

            if (nWidth < this.minWidth)   { nWidth = this.minWidth; }
            if (nWidth > this.maxWidth)   { nWidth = this.maxWidth; }

            // Get height
            /************************************************************************/

            oElement.height       = 'auto';
            oElement.style.width  = nWidth > 0 ? nWidth + 'px' : 'auto';
            nHeight               = oElement.offsetHeight - oStyles.v.padding;

            this.container.node.parentNode.removeChild(oElement);

            // Constrain to maxHeight

            if (nHeight < this.minHeight) { nHeight = this.minHeight; }
            if (nHeight > this.maxHeight) { nHeight = this.maxHeight; }

            /************************************************************************/
            this._setSize(nWidth, nHeight, oStyles);
        },

        /**
        * Assigns any static layout properties not dependent on changes to the
        * rendered component or contaner sizes, etc.
        *
        * @method
        * @public
        */
        flow: enyo.inherit(function(sup) {
            return function() {
                sup.apply(this, arguments);
            };
        }),

        /**
        * Updates the layout to reflect any changes made to the layout container or
        * the contained components.
        *
        * @method
        * @public
        */
        reflow : enyo.inherit(function(sup) {
            return function() {
                sup.apply(this, arguments);
                this._updateSize();
            };
        })
    });

})(enyo, this);