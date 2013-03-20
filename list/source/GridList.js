/**
    _enyo.GridList_ extends _enyo.List_

    @author: Surya Vakkalanka
    @date: September 2012

    Extends _enyo.List_ to allow displaying multiple items per row based on available container width
    Supports 3 modes of rendering items: fixedSize, fluidWidth and variableSize (with or without normalization of rows)

    fixedSize: all items are of the same size which can be configured up front at creation time by setting itemWidth and itemHeight properties.
    fluidWidth: all items are of the same size but can stretch or shrink to fit in the available container width, honoring the itemMinWidth property.
    normalizeRows: itemWidth and itemHeight are not known at create time. The sizeupItem event can be used to set up the dimensions of each item at runtime.

    Usage:
    enyo.kind( {
        name: "App",
        components: [
            { name: "gridList", kind: "enyo.GridList", onSizeupItem: "sizeupItem", onSetupItem: "setupItem", itemMinWidth: 160, itemSpacing: 2, components: [ {name: "img", kind: "enyo.Image"} ] },
        ],
        ...
        //array of all item data
        _data: [],      //example: [{width: 100, height: 100, source: "http://www.flickr.com/myimage.jpg"},....]
        sizeupItem: function(inSender, inEvent) {
            var item = this._data[inEvent.index];
            inSender.setItemWidth(item.width);
            inSender.setItemHeight(item.height);
        },
        setupItem: function(inSender, inEvent) {
            var item = this._data[inEvent.index];
            this.$.img.setSrc(item.source);
            this.$.img.addStyles("width:100%; height: auto;");
        }
        ...
    });
*/

enyo.kind(
    {
        name: "enyo.GridList",
        kind: "enyo.List",
        classes: "enyo-gridlist",
        published: {
            /**
                Set to true if you want all items to be of same size with fluid width (%-based width depending on how many items can fit in the available container width while honoring itemMinWidth).
                sizeupItem event is not fired in this case.
            */
            itemFluidWidth: false,
            /**
                Set to true if you want all items to be of same size with fixed dimensions (configured by setting itemWidth and itemHeight upfront).
                sizeupItem event is not fired in this case.
            */
            itemFixedSize: false,
            //* Minimum width (in pixels) of items. This is used to calculate the optimal rowsPerPage (items per page) setting based on available width of container.
            itemMinWidth: 160,
            //* Minimum height (in pixels) of items. This is used to calculate the optimal rowsPerPage (items per page) setting based on available width of container.
            itemMinHeight: 160,
            //* Width (in pixels) of each item. sizeupItem event can be used to set the width of each item at run-time. This value can be set upfront for all items in the case of fixedSize items. Setting this upfront is ignored in the case of variable sized items.
            itemWidth: 160,
            //* Height (in pixels) of each item. sizeupItem event can be used to set the height of each item at run-time. This value can be set upfront for all items in the case of fixedSize items. Setting this upfront is ignored in the case of variable sized items.
            itemHeight: 160,
            //* Spacing (in pixels) between GridList items.
            itemSpacing: 0,
            /**
                Set this to true if you want the items in each GridList row to be normalized to the same height.
                This setting is ignored (meaning rows are not normalized for performance benefits since we already know that the items have the same height) for the cases when either of itemFluidWidth or itemFixedSize is set to true.
            */
            normalizeRows: false
        },
        horizontal: "hidden",
        events: {
            /**
                Fires once per item only in the cases when items are NOT fluid width OR fixed size at pre-render (before rendering) time to give the developer an opportunity to set the dimensions of the item.
                _inEvent.index_ contains the current item index.
            */
            onSizeupItem: ""
        },
        /**
            Call this function after the GridList data is ready. This method sets the count on the list and renders (displays) it.
            This is a convenience method that does a) setCount and b) reset on the List instead of the developer having to invoke these two calls separately.
        */
        show: function(count) {
            this._calculateItemsPerRow();
            this.setCount(count);
            this.reset();
        },
        create: function() {
            this._setComponents();
            this.inherited(arguments);
            this.itemFluidWidthChanged();
            this.itemFixedSizeChanged();
            this.itemMinWidthChanged();
            this.itemMinHeightChanged();
            this.itemWidthChanged();
            this.itemHeightChanged();
            this.itemSpacingChanged();
            this.normalizeRowsChanged();
            this.$.generator.setClientClasses("enyo-gridlist-row");
        },
        //Relay the published-property changes over to the GridFlyweightRepeater
        itemFluidWidthChanged: function() {
            this.$.generator.itemFluidWidth = this.itemFluidWidth;
            this.setNormalizeRows(!this.itemFluidWidth && !this.itemFixedSize);
        },
        itemFixedSizeChanged: function() {
            this.$.generator.itemFixedSize = this.itemFixedSize;
            this.setNormalizeRows(!this.itemFluidWidth && !this.itemFixedSize);
        },
        itemWidthChanged: function() {
            this.$.generator.itemWidth = this.itemWidth;
        },
        itemHeightChanged: function() {
            this.$.generator.itemHeight = this.itemHeight;
        },
        itemMinWidthChanged: function() {
            var n = this.hasNode();
            if (n) {
                if (!this.itemMinWidth) {
                    this.itemMinWidth = 160;
                }
                this.itemMinWidth = Math.min(this.itemMinWidth, n.clientWidth);
            }
            this.$.generator.itemMinWidth = this.itemMinWidth;
        },
        itemMinHeightChanged: function() {
            var n = this.hasNode();
            if (n) {
                if (!this.itemMinHeight) {
                    this.itemMinHeight = 160;
                }
                this.itemMinHeight = Math.min(this.itemMinHeight, n.clientHeight);
            }
            this.$.generator.itemMinHeight = this.itemMinHeight;
        },
        itemSpacingChanged: function() {
            if (this.itemSpacing < 0) {
                this.itemSpacing = 0;
            }
            this.itemSpacing = this.itemSpacing;
            this.$.generator.itemSpacing = this.itemSpacing;
        },
        normalizeRowsChanged: function() {
            this.$.generator.normalizeRows = this.normalizeRows;
        },
        //* @protected
        bottomUpChanged: function() {
            //Don't let users change this (bottomUp is a published property of List but is not supported by GridList)
            this.bottomUp = false;
            this.pageBound = 'top';
        },
        //* @protected
        reflow: function() {
            this._calculateItemsPerRow();
            this.inherited(arguments);
        },
        //* @protected
        _calculateItemsPerRow: function() {
            var n = this.hasNode();
            if (n) {
                this.itemsPerRow = Math.floor((n.clientWidth - this.itemSpacing)/(this.itemMinWidth + this.itemSpacing));
                var visibleRows = Math.round((n.clientHeight - this.itemSpacing)/(this.itemMinHeight + this.itemSpacing));
                if (this.itemFixedSize || this.itemFluidWidth) {
                    var itemsPerRow = Math.floor((n.clientWidth - this.itemSpacing)/(this.itemWidth + this.itemSpacing));
                    var low = Math.floor(itemsPerRow);
                    var high = Math.ceil(itemsPerRow);
                    var gutter = n.clientWidth - this.itemSpacing - (high * (this.itemWidth + this.itemSpacing));
                    this.itemsPerRow = (gutter > 0) ? high : low;
                    visibleRows = Math.round((n.clientHeight - this.itemSpacing)/(this.itemHeight + this.itemSpacing));
                }
                // Make sure there's at least 1 item per row
                this.itemsPerRow = Math.max(1, this.itemsPerRow);
                this.rowsPerPage = 3 * this.itemsPerRow * visibleRows;
                this.$.generator.itemsPerRow = this.itemsPerRow;
            }
        },
        //* @protected
        _setComponents: function() {
            var c = this.listTools[0].components, comp;
            // Create a dummy component to dynamically compute the dimensions of items at run-time (once for each item during sizeupItem) based on the actual content inside the item (only for variable sized items where sizeupItem is called).
            this.createComponent(new enyo.Component({name: "_dummy_", allowHtml: true, classes: "enyo-gridlist-dummy", showing: false}, {owner: this}));
            // Override List's listTools array to use GridFlyweightRepeater instead of FlyweightRepeater
            for (var i=0; i<c.length; i++) {
                comp = c[i];
                if (comp.name == 'generator') {
                    comp.kind = "enyo.GridFlyWeightRepeater";
                    return;
                }
            }
        }
    }
);