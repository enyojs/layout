/*
 * enyo.GridFlyweightRepeater extends enyo.FlyweightRepeater to layout items in a Grid fashion 
 * 
 * @author: Surya Vakkalanka
 * @date: September 2012 
 * 
 */

enyo.kind({
	name: "enyo.GridFlyWeightRepeater", 
	kind: "enyo.FlyweightRepeater",
	events: {
		/**
		Fires once per tile at pre-render time (to figure out dimensions of the tile). 
		_inEvent.index_ contains the current tile index.
		_inEvent.selected_ is a boolean indicating whether the current tile is selected.
		*/
		onSizeupItem: "",
		/**
		Fires once per tile at render time. 
		_inEvent.index_ contains the current tile index.
		_inEvent.selected_ is a boolean indicating whether the current tile is selected.
		*/
		onSetupItem: ""
	},
	//See GridList.js for comments on these properties.  
    itemFluidWidth: false,
    itemFixedSize: false,
    itemDefaultWidth: 160,
    itemMinWidth: 160,
    itemWidth: 160,
    itemDefaultHeight: 120,
    itemMinHeight: 120,
    itemHeight: 120,
    itemSpacing: 0,
    normalizeRows: true,
    itemsPerRow: 0,
	_tilesFromPreviousPage: 0,
	generateChildHtml: function() {
		if (this.itemFluidWidth || this.itemFixedSize) {
			return this._generateChildHtmlEqualSizedItems();
		} 
		return this._generateChildHtmlVariableSizedItems();
	},
	_generateChildHtmlEqualSizedItems: function() {
  		var cw = this.owner.hasNode().clientWidth;
		var cl = this.$.client, ht = "";
		var itemWidthPercent = 0;
		if (this.itemFixedSize) {
			this.itemsPerRow = Math.floor(cw/(this.itemWidth));
			if (this.itemSpacing >= 0) {
				this.itemsPerRow = Math.floor((cw - this.itemSpacing)/(this.itemWidth + this.itemSpacing));
			}
		} else if (this.itemFluidWidth) {
			this.itemsPerRow = Math.floor(cw/(this.itemDefaultWidth));
			itemWidthPercent = 100/this.itemsPerRow;
	  		var totalMargin = 0;
			if (this.itemSpacing >= 0) {
				this.itemsPerRow = Math.floor((cw - this.itemSpacing)/(this.itemMinWidth + this.itemSpacing));
				totalMargin = (this.itemsPerRow + 1) * this.itemSpacing;
				itemWidthPercent = 100/this.itemsPerRow - ((100 * totalMargin)/(this.itemsPerRow * cw));
			}
		}
		for (var i=this.rowOffset; i < this.rowOffset + this.count; i++) {
			//Setup each item
			cl.setAttribute("data-enyo-index", i);
			this.doSetupItem({index: i, selected: this.isSelected(i)});
			if (this.itemFluidWidth) {
				cl.addStyles("width:" + itemWidthPercent + "%;height:" + this.itemHeight + "px;");
			} else {
				cl.addStyles("width:" + this.itemWidth + "px;height:" + this.itemHeight + "px;");
			}
			if (this.itemSpacing >= 0) {
				cl.addStyles("margin-top:" + this.itemSpacing + "px;margin-left:" + this.itemSpacing + "px;");
			}
			ht += cl.generateHtml();
			cl.teardownRender();
		}
		return ht;
	},
	_generateChildHtmlVariableSizedItems: function() {
		this.index = null;
		var tile = null;
		var cl = this.$.client;
		var cw = this.owner.hasNode().clientWidth;
  		var w = 0, rw = 0, h = 0, rh = 0, raw = 0, rah = 0,  rowIndex = 0, tileW = 0, tileH = 0, w2h = this.itemDefaultWidth/this.itemDefaultHeight;
  		var rows = [{index: 0, tiles: []}];
  		var lastTile = false;
  		var dummy = this.owner.$._dummy_.hasNode();
  		
  		if (this.owner.page == 0) {
  			this._tilesFromPreviousPage = 0;
  		}
  		var count = this.count + this._tilesFromPreviousPage;
  		for (var i=0, r = i + this.rowOffset - this._tilesFromPreviousPage; i < count; i++, r++) {
  			tileW = 0;
			tileH = 0;
			this.doSizeupItem({index: r, selected: this.isSelected(r)});
			tileW = this.itemWidth;
			tileH = this.itemHeight;
			if (!tileW || tileW==undefined || isNaN(tileW) || tileW <= 0) {
				//Try setupitem
				this.doSetupItem({index: r, selected: this.isSelected(r)});
				dummy.innerHTML = cl.generateChildHtml();
				tileW = dummy.clientWidth;
				tileH = dummy.clientHeight;
			}
			if (!tileW || tileW==undefined || isNaN(tileW) || tileW <= 0) {
				//Use default values
				tileW = this.itemDefaultWidth;
				tileH = this.itemDefaultHeight;
			}
			if (!tileH || tileH==undefined || isNaN(tileH) || tileH <= 0) {
				tileH = this.itemDefaultHeight;
			}
			w2h = tileW/tileH;
			w = Math.min(tileW, cw);
			if (this.itemMinWidth && this.itemMinWidth > 0) {
				w = Math.max(tileW, this.itemMinWidth);
			}
			lastRowInPage = (i == count - 1);
			h = w/w2h;
			
			rw += w;
			rh += h;
			
			tile = {index: r, pageIndex: i, width: w, height: h};
			rows[rowIndex].tiles.push(tile);
			if (!this.normalizeRows) {
				continue;
			}
			
			raw = rw/(rows[rowIndex].tiles.length);
			rah = rh/(rows[rowIndex].tiles.length);
			
			if (rw >= cw || lastRowInPage) {
				rows[rowIndex].avgHeight = rah;
				rows[rowIndex].index = rowIndex;
				
				//Spill over tiles collected so far on this page to next page if they don't scale well to fill up remaining gutter  
				var tilesInRow = rows[rowIndex].tiles.length;
				var gutterPerTile = (cw-rw)/tilesInRow;
				var lastRowInList = (r == this.owner.count - 1);
				
				//If remaining tiles in the row need to be stretched more than 50% of the avg tile width in the row, ditch/spill them over into the next page
				this._tilesFromPreviousPage = 0;
				if ((lastRowInPage && gutterPerTile + raw > (1.5 * raw))) {
					//Remove all these tiles from this row and push them to next page
					this._tilesFromPreviousPage = tilesInRow;
					rows[rowIndex] = {avgHeight: 0, index: rowIndex, tiles: []};
					break;
				} 
				this._normalizeRow(rows[rowIndex]);
				if (!lastRowInPage) {
					rowIndex++;
					rows[rowIndex] = {avgHeight: 0, index: 0, tiles: []};
				}
				rw = 0, rh = 0, rah = 0, raw = 0, w = 0, h = 0, tileW = 0, tileH = 0;
			}
		}
		dummy.innerHTML = "";
  		
  		// Now that we have completed normalization of tiles into rows and pages, we have the computed tile widths and heights. Render the tiles now. 
  		var ht = "", clh = "";
  		var row;
  		for (var i=0; i < rows.length; i++) {
  			row = rows[i];
  			if (!row.tiles || row.tiles.length==0)
  				continue;
  			for (var j=0; j < row.tiles.length; j++) {
  				tile = row.tiles[j];
  				this.doSetupItem({index: tile.index, selected: this.isSelected(tile.index)});
  				cl.setAttribute("data-enyo-index", tile.index);
  				cl.addStyles("width:" + tile.width + "px;height:" + tile.height + "px;");
  				if (this.itemSpacing >= 0) {
  					cl.addStyles("margin-top:" + this.itemSpacing + "px;margin-left:" + this.itemSpacing + "px;");
  				}
  				clh = cl.generateHtml();
  				cl.teardownRender();
  				ht += clh;
  			}
  		}
  		return ht;
	},
	//Normalizes items in each GridList row so that they maintain the correct (original) aspect ratio while ensuring the height of each item is the same. 
	_normalizeRow: function(inRowData) {
		if (!this.normalizeRows) {
			return;
		}
		if (!inRowData.tiles || inRowData.tiles.length == 0) {
			return;
		}
		var cw = this.owner.hasNode().clientWidth;
  		//Use avg height to scale heights of all items in row to the same height
		var tile;
		var runningWidth = 0, nw = 0;
		var newWidths = "";
		var tileW = 0, tileH = 0, scale = 0, gutter = 0;
		for (var i=0; i < inRowData.tiles.length; i++) {
			tile = inRowData.tiles[i];
			tileW = tile.width;
  			tileH = tile.height;
  			
  			nw = Math.floor((inRowData.avgHeight/tileH) * tileW);
			newWidths += " " + nw;
			
			tile.width = nw;
    		tile.height = inRowData.avgHeight;
			runningWidth += nw;
			if (this.itemSpacing >= 0) {
				//Spacing can range from 0-10px only - so cap at 10 - otherwise looks ugly
				runningWidth += this.itemSpacing;
				if (i==inRowData.tiles.length-1) {
					//Accomodate right margin on last tile 
					runningWidth += this.itemSpacing;
				}
			}
		}
		gutter = cw - runningWidth;
		
		//Now scale the whole row uniformly up or down depending on positive or negative width gutter
		var scale = cw/(cw-gutter);//Math.abs(1 + gutter/clientWidth);
		runningWidth = 0;
		nw = 0;
		newWidths = "";
		for (var i=0; i < inRowData.tiles.length; i++) {
			tile = inRowData.tiles[i];
			tileW = tile.width;
  			tileH = tile.height;
				
			nw = Math.floor(tileW * scale);
			newWidths += " " + nw;
			var nh = Math.floor(tileH * scale);
			tile.width = nw;
    		tile.height = nh;
			
			runningWidth += nw;
			if (this.itemSpacing >= 0) {
				//Spacing can range from 0-10px only - so cap at 10 - otherwise looks ugly
				runningWidth += this.itemSpacing;
				if (i==inRowData.tiles.length-1) {
					//Accomodate right margin on last tile 
					runningWidth += this.itemSpacing;
				}
			}
		}
		gutter = cw - runningWidth;
		
		//Adjust the remaining spill over gutter to last tile  
		tile = inRowData.tiles[inRowData.tiles.length-1];
		tileW = tile.width;
		tileH = tile.height;
		tile.width = (tileW + gutter);
  		tile.height = tileH;
  	}
});