/*
 * enyo.GridList extends enyo.List
 * 
 * @author: Surya Vakkalanka
 * @date: September 2012 
 * 
 * Extends List, but can display multiple items (tiles) per row based on available container width
 * Supports 3 modes of rendering items: fixedSize, fluidWidth and normalized
 *      fixedSize: all items are of the same size which can be configured up front at creation time by setting itemWidth and itemHeight properties.
 *      fluidWidth: all items are of the same size but can stretch or shrink to fit in the available container width, honoring the itemMinWidth property. 
 *      normalizeRows: itemWidth and itemHeight are not known at create time. The sizeupItem event can be used to set up the dimensions of each item at runtime. 
 * 
 * Usage:
 * enyo.kind( { 
 *		name: "App",
 *		components: [
 *			{ name: "gridList", kind: "enyo.GridList", onSizeupTile: "sizeupTile", onSetupTile: "setupTile", itemMinWidth: 160, itemSpacing: 2, components: [ {name: "img", kind: "enyo.Image"} ] },
 *		],
 *		... 
 *		//array of all tile data 
 *		_data: [], 		//example: [{width: 100, height: 100, source: "http://www.flickr.com/myimage.jpg"},....]
 *		sizeupTile: function(inSender, inEvent) {
 *			var tile = this._data[inEvent.index];
 *			inSender.setItemWidth(tile.width);
 *			inSender.setItemHeight(tile.height);
 *		},
 *		setupTile: function(inSender, inEvent) {
 *			var tile = this._data[inEvent.index];
 *			this.$.img.setSrc(tile.source);
 *			this.$.img.addStyles("width:100%; height: auto;");
 *		}
 *		...
 * });
*/

enyo.kind(
	{
		name: "enyo.GridList", 
		kind: "enyo.List", 
		classes: "enyo-gridlist", 
		published: {
            //Set to true if you want all items to be of same size with fluid width (%-based width depending on how many items can fit in the available container width while honoring itemMinWidth). 
            //sizeupItem event is not fired in this case.  
            itemFluidWidth: false,
            //Set to true if you want all items to be of same size with fixed dimensions (configured by setting itemWidth and itemHeight upfront). 
            //sizeupItem event is not fired in this case. 
    		itemFixedSize: false,
            //Default width (in pixels) of items. This value is used if the itemWidth is not set explicitly OR if itemWidth cannot be calculated for any reason. 
    		itemDefaultWidth: 160,
            //Minimum width (in pixels) of items. This is used to calculate the optimal rowsPerPage (items per page) setting based on available width of container. 
    		itemMinWidth: 160,
            //Width (in pixels) of each item. sizeupItem event can be used to set the width of each item at run-time. 
    		itemWidth: 160,
            //Default height (in pixels) of items. This value is used if the itemHeight is not set explicitly OR if itemHeight cannot be calculated for any reason. 
    		itemDefaultHeight: 120,
            //Minimum height (in pixels) of items. This is used to calculate the optimal rowsPerPage (items per page) setting based on available width of container. 
    		itemMinHeight: 120,
            //Height (in pixels) of each item. sizeupItem event can be used to set the height of each item at run-time. 
    		itemHeight: 120,
            //Spacing (in units. 1 unit = 8px) between GridList items. The max allowed/supported value is 5. 
    		itemSpacing: 0,
            //Set this to true if you want the items in each GridList row to be normalized to the same height. 
            //This setting is ignored (meaning rows are not normalized for performance benefits since we already know that the items have the same height) for the cases when either of itemFluidWidth or itemFixedSize is set to true. 
    		normalizeRows: true
    	},
        events: {
            /**
            Fires once per tile (GridList item) at pre-render (before rendering) time to give the developer an opportunity to set the dimensions of the item.
            _inEvent.index_ contains the current tile index.
            */
            onSizeupItem: "",
            /**
            Fires once per tile (GridList item) at render time.
            _inEvent.index_ contains the current tile index.
            */
            onSetupItem: ""
        },
        //Call this function after the GridList data is ready. This method renders (displays) the GridList. 
        //This is a convenience method that does a) setCount and b) reset on the List instead of the developer having to invoke these two calls separately. 
        show: function(count) {
            this._calculateRowsPerPage();
            this.setCount(count);
            this.reset();
        },
        horizontal: "hidden",
    	create: function() {
    		this.inherited(arguments);
            this.itemFluidWidthChanged();
    		this.itemFixedSizeChanged();
    		this.itemDefaultWidthChanged();
    		this.itemMinWidthChanged();
    		this.itemDefaultHeightChanged();
    		this.itemMinHeightChanged();
    		this.itemSpacingChanged();
    		this.normalizeRowsChanged();
    		this.$.generator.setClientClasses("enyo-gridlist-row");
            if (this.fixedHeight) {
                this.rowHeight = this.itemHeight + this.itemSpacing;
            }
    	},
    	//Relay the published-property changes over to the GridFlyweightRepeater
    	itemFluidWidthChanged: function() {
    		if (this.itemFluidWidth) {
    			this.setItemHeight(this.itemDefaultHeight); 
    		}
    		this.$.generator.itemFluidWidth = this.itemFluidWidth;
            this.fixedHeight = this.$.generator.itemFixedSize || this.$.generator.itemFluidWidth;
    	},
    	itemFixedSizeChanged: function() {
    		this.$.generator.itemFixedSize = this.itemFixedSize;
            this.fixedHeight = this.$.generator.itemFixedSize || this.$.generator.itemFluidWidth;
    	},
    	itemDefaultWidthChanged: function() {
    		this.itemDefaultWidth = Math.max(this.itemDefaultWidth, this.itemMinWidth);
    		this.$.generator.itemDefaultWidth = this.itemDefaultWidth;
    		this._calculateRowsPerPage();
    	},
    	itemDefaultHeightChanged: function() {
    		this.itemDefaultHeight = Math.max(this.itemDefaultHeight, this.itemMinHeight);
    		this.$.generator.itemDefaultHeight = this.itemDefaultHeight;
    	},
    	itemWidthChanged: function() {
    		if (this.itemWidth >=0 && !this.itemFixedSize) {
    			this.itemWidth = Math.max(this.itemWidth, this.itemMinWidth);
    		}
    		this.$.generator.itemWidth = this.itemWidth;
    	},
    	itemHeightChanged: function() {
    		this.$.generator.itemHeight = this.itemHeight;
    	},
    	itemMinWidthChanged: function() {
    		var n = this.hasNode();
			if (n) {
	    		if (!this.itemMinWidth || isNaN(this.itemMinWidth) || this.itemMinWidth == 0) {
					this.itemMinWidth = this.itemDefaultWidth;
				}
	    		this.itemMinWidth = Math.min(this.itemMinWidth, n.clientWidth);
			}
    		this.$.generator.itemMinWidth = this.itemMinWidth;
    	},
    	itemMinHeightChanged: function() {
    		var n = this.hasNode();
			if (n) {
	    		if (!this.itemMinHeight || isNaN(this.itemMinHeight) || this.itemMinHeight == 0) {
					this.itemMinHeight = this.itemDefaultHeight;
				}
	    		this.itemMinHeight = Math.min(this.itemMinHeight, n.clientHeight);
			}
    		this.$.generator.itemMinHeight = this.itemMinHeight;
    	},
    	itemSpacingChanged: function() {
			if (this.itemSpacing < 0) {
				this.itemSpacing = 0;
			}
			this.itemSpacing = Math.min(5, this.itemSpacing);
			this.$.generator.itemSpacing = 8 * this.itemSpacing;
            this.show(this.count);
    	},
    	normalizeRowsChanged: function() {
    		this.$.generator.normalizeRows = this.normalizeRows;
    	},
        rowsPerPageChanged: function() {
            //Don't let users change this (rowsPerPage is a published property of List but is not supported by GridList)
            this._calculateRowsPerPage();
        },
        bottomUpChanged: function() {
            //Don't let users change this (bottomUp is a published property of List but is not supported by GridList)
            this.bottomUp = false;
            this.pageBound = 'top';
        },
        fixedHeightChanged: function() {
            if (this.fixedHeight) {
                this.rowHeight = this.itemHeight + this.itemSpacing;
            }
        },
        //Figure out rowsPerPage (itemsPerPage) based on container clientWidth, itemWidth and itemHeight
        _calculateRowsPerPage: function() {
            var n = this.hasNode();
            if (n) {
                this.itemsPerRow = Math.floor((n.clientWidth - this.itemSpacing)/(this.itemMinWidth + this.itemSpacing));
                var visibleRows = Math.round((n.clientHeight - this.itemSpacing)/(this.itemMinHeight + this.itemSpacing));
                if (this.itemFixedSize) {
                    this.itemsPerRow = Math.floor((n.clientWidth - this.itemSpacing)/(this.itemWidth + this.itemSpacing));
                    visibleRows = Math.round((n.clientHeight - this.itemSpacing)/(this.itemHeight + this.itemSpacing));
                }
                this.rowsPerPage = 3 * this.itemsPerRow * visibleRows;
            }
        },
        //Override List functions that use rowsPerPage to repaint UI because rowsPerPage is really itemsPerPage in GridList
        updateMetrics: function() {
            this.defaultPageHeight = Math.ceil(this.rowsPerPage/this.itemsPerRow) * (this.rowHeight || 100);
            this.pageCount = Math.ceil(this.count / this.rowsPerPage);
            this.portSize = 0;
            for (var i=0; i < this.pageCount; i++) {
                this.portSize += this.getPageHeight(i);
            }
            this.adjustPortSize();
        },
        generatePage: function(inPageNo, inTarget) {
            this.page = inPageNo;
            var r = this.$.generator.rowOffset = this.rowsPerPage * this.page;
            var rpp = this.$.generator.count = Math.min(this.count - r, this.rowsPerPage);
            var html = this.$.generator.generateChildHtml();
            inTarget.setContent(html);
            var pageHeight = inTarget.getBounds().height;
            if (pageHeight > 0) {
                this.pageHeights[inPageNo] = pageHeight;
                this.updateMetrics();
            }
        },
        invalidatePages: function() {
            this.inherited(arguments);
            this._calculateRowsPerPage();
        },
        //Override List's listTools array to a) use GridFlyweightRepeater instead of FlyweightRepeater and b) define an extra "_dummy_" component used to measure the dimensions of items at run-time. 
		listTools: [ 
    		{
    			name: "port", classes: "enyo-list-port enyo-border-box", 
    			components: [
	    			{
	    				name: "generator", kind: "GridFlyWeightRepeater", showing: false, 
	    				components: [
				             {kind: "Selection", onSelect: "selectDeselect", onDeselect: "selectDeselect"},
	    			         {tag: null, name: "client"}
	    			    ]
	    			},
	    			{name: "page0", allowHtml: true, classes: "enyo-list-page"},
	    			{name: "page1", allowHtml: true, classes: "enyo-list-page"},
                    //Use this component to dynamically compute the dimensions of an item based on the actual content inside the item. 
	    			{name: "_dummy_", allowHtml: true, classes: "enyo-gridlist-dummy", showing: false}
    			]
    		}
    	]
	}	
);