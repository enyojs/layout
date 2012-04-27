/**
A control that displays a scrolling list of rows. It is suitable for displaying very large
lists. List is optimized such that only a small portion of the list is rendered
at a given time. 

##Basic Use

A List's components block contains the controls to be used for a single row.
This set of controls will be rendered for each row.

The onSetupRow event allows for customization of row rendering. Here's a simple example:

	components: [
		{kind: "List", fit: true, rows: 1000, onSetupRow: "setupRow", components: [
			{name: "item"}
		]}
	],
	setupRow: function(inSender, inEvent) {
		this.$.item.setContent("I am row: " + inEvent.index);
	}

##Modifying List Rows

Controls inside a list are non-interactive. This means that outside the onSetupRow event, 
calling methods that would otherwise cause rendering to occur will not do so (e.g. setContent).
A row can be forced to render by calling the renderRow(inRow) method. In addition, a row can be 
temporarily made interactive by calling the prepareRow(inRow) method. When interaction is complete, the
lockRow method should be called.

*/

enyo.kind({
	name: "enyo.List",
	kind: "Scroller",
	classes: "enyo-list",
	published: {
		//* The number of rows contained in the list. Note, as the amount of list data changes
		//* setRows can be called to adjust the number of rows. To re-render the list at the 
		//* current position when rows has changed, call the refresh() method.
		rows: 0,
		//* The number of rows to be shown on a given list page segment. 
		//* It is not common to need to adjust this.
		rowsPerPage: 50,
		//* Render the list such that row 0 is at the bottom of the viewport
		//* and the beginning position of the list is scrolled to the bottom.
		bottomUp: false,
		//* If true, allow multiple selections
		multiSelect: false,
		//* If true, the selected item will toggle
		toggleSelected: false
	},
	events: {
		//* Fired once per row at render-time, with event object: {index: <index of row>}
		onSetupRow: ""
	},
	//* @protected
	rowHeight: 0,
	fixedHeight: false,
	listTools: [
		{name: "port", classes: "enyo-list-port enyo-border-box", components: [
			{name: "generator", kind: "FlyweightRepeater", canGenerate: false, components: [
				{tag: null, name: "client"}
			]},
			{name: "page0", allowHtml: true, classes: "enyo-list-page"},
			{name: "page1", allowHtml: true, classes: "enyo-list-page"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.getStrategy().translateOptimized = true;
		this.bottomUpChanged();
		this.multiSelectChanged();
		this.toggleSelectedChanged();
	},
	createStrategy: function() {
		this.controlParentName = "strategy";
		this.inherited(arguments);
		this.createChrome(this.listTools);
		this.controlParentName = "client";
		this.discoverControlParent();
	},
	rendered: function() {
		this.inherited(arguments);
		this.$.generator.node = this.$.port.hasNode();
		this.$.generator.generated = true;
		this.reset();
	},
	resize: function() {
		this.inherited(arguments);
		this.adjustPortSize();
	},
	bottomUpChanged: function() {
		this.$.generator.bottomUp = this.bottomUp;
		this.$.page0.applyStyle(this.pageBound, null);
		this.$.page1.applyStyle(this.pageBound, null);
		this.pageBound = this.bottomUp ? "bottom" : "top";
		if (this.hasNode()) {
			this.reset();
		}
	},
	multiSelectChanged: function() {
		this.$.generator.setMultiSelect(this.multiSelect);
	},
	toggleSelectedChanged: function() {
		this.$.generator.setToggleSelected(this.toggleSelected);
	},
	rowsChanged: function() {
		this.updateMetrics();
	},
	updateMetrics: function() {
		this.defaultPageHeight = this.rowsPerPage * (this.rowHeight || 100);
		this.pageCount = Math.ceil(this.rows / this.rowsPerPage);
		this.portSize = 0;
		for (var i=0; i < this.pageCount; i++) {
			this.portSize += this.getPageHeight(i);
		}
		this.adjustPortSize();
	},
	generatePage: function(inPageNo, inTarget) {
		this.page = inPageNo;
		var r = this.$.generator.rowOffset = this.rowsPerPage * this.page;
		var rpp = this.$.generator.rows = Math.min(this.rows - r, this.rowsPerPage);
		var html = this.$.generator.generateChildHtml();
		inTarget.setContent(html);
		// if rowHeight is not set, use the height from the first generated page
		if (!this.rowHeight) {
			this.rowHeight = Math.floor(inTarget.getBounds().height / rpp);
			this.updateMetrics();
		}
		// update known page heights
		if (!this.fixedHeight) {
			var h0 = this.getPageHeight(inPageNo);
			var h1 = this.pageHeights[inPageNo] = inTarget.getBounds().height;
			if (h0 != h1) {
				this.portSize += h1 - h0;
			}
		}
	},
	update: function(inScrollTop) {
		var updated = false;
		// get page info for position
		var pi = this.positionToPageInfo(inScrollTop);
		// zone line position
		var pos = pi.pos + this.scrollerHeight/2;
		// leap-frog zone position
		var k = Math.floor(pos/pi.height + 1/2) + pi.no;
		// which page number for page0 (even number pages)?
		var p = k % 2 == 0 ? k : k-1;
		if (this.p0 != p && this.isPageInRange(p)) {
			//this.log("update page0", p);
			this.generatePage(p, this.$.page0);
			this.positionPage(p, this.$.page0);
			this.p0 = p;
			updated = true;
		}
		// which page number for page1 (odd number pages)?
		p = k % 2 == 0 ? Math.max(1, k-1) : k;
		// position data page 1
		if (this.p1 != p && this.isPageInRange(p)) {
			//this.log("update page1", p);
			this.generatePage(p, this.$.page1);
			this.positionPage(p, this.$.page1);
			this.p1 = p;
			updated = true;
		}
		if (updated && !this.fixedHeight) {
			this.adjustBottomPage();
			this.adjustPortSize();
		}
	},
	adjustBottomPage: function() {
		var bp = this.p0 >= this.p1 ? this.$.page0 : this.$.page1;
		this.positionPage(bp.pageNo, bp);
	},
	adjustPortSize: function() {
		this.scrollerHeight = this.getBounds().height;
		var s = Math.max(this.scrollerHeight, this.portSize);
		this.$.port.applyStyle("height", s + "px");
	},
	positionPage: function(inPage, inTarget) {
		inTarget.pageNo = inPage;
		var y = this.pageToPosition(inPage);
		inTarget.applyStyle(this.pageBound, y + "px");
	},
	pageToPosition: function(inPage) {
		var y = 0;
		var p = inPage;
		while (p > 0) {
			p--;
			y += this.getPageHeight(p);
		}
		return y;
	},
	positionToPageInfo: function(inY) {
		var page = -1;
		var p = this.bottomUp ? this.portSize - inY : inY;
		var h = this.defaultPageHeight;
		while (p >= 0) {
			page++;
			h = this.getPageHeight(page);
			p -= h;
		}
		//page = Math.min(page, this.pageCount-1);
		return {no: page, height: h, pos: p+h};
	},
	isPageInRange: function(inPage) {
		return inPage == Math.max(0, Math.min(this.pageCount-1, inPage));
	},
	getPageHeight: function(inPageNo) {
		return this.pageHeights[inPageNo] || this.defaultPageHeight;
	},
	invalidatePages: function() {
		this.p0 = this.p1 = null;
		// clear the html in our render targets
		this.$.page0.setContent("");
		this.$.page1.setContent("");
	},
	invalidateMetrics: function() {
		this.pageHeights = [];
		this.rowHeight = 0;
		this.updateMetrics();
	},
	scroll: function(inSender, inEvent) {
		var r = this.inherited(arguments);
		this.update(this.getScrollTop());
		return r;
	},
	//* @public
	scrollToBottom: function() {
		this.update(this.getScrollBounds().maxTop);
		this.inherited(arguments);
	},
	setScrollTop: function(inScrollTop) {
		this.update(inScrollTop);
		this.inherited(arguments);
	},
	//* Scrolls to a specific row.
	scrollToRow: function(inRow) {
		var page = Math.floor(inRow / this.rowsPerPage);
		var pageRow = inRow % this.rowsPerPage;
		var h = this.pageToPosition(page);
		// update the page
		this.update(h);
		// call pageToPosition again and this time should return the right pos since the page info is populated
		h = this.pageToPosition(page);
		this.setScrollTop(h);
		if (page == this.p0 || page == this.p1) {
			var rowNode = this.$.generator.fetchRowNode(inRow);
			if (rowNode) {
				var y = this.getScrollTop() + rowNode.offsetTop;
				this.setScrollTop(y);
			}
		}
	},
	//* Scrolls to the beginning of the list.
	scrollToStart: function() {
		this[this.bottomUp ? "scrollToBottom" : "scrollToTop"]();
	},
	//* Scrolls to the end of the list.
	scrollToEnd: function() {
		this[this.bottomUp ? "scrollToTop" : "scrollToBottom"]();
	},
	//* Re-render the list at the current position
	refresh: function() {
		this.invalidatePages();
		this.update(this.getScrollTop());
		this.stabilize();
	},
	//* Re-render the list from the beginning
	reset: function() {
		this.getSelection().clear();
		this.invalidateMetrics();
		this.invalidatePages();
		this.stabilize();
		this.scrollToStart();
	},
	//* Returns the selection component (<a href="#enyo.Selection">enyo.Selection</a>) that manages the selection state for this list.
	getSelection: function() {
		return this.$.generator.getSelection();
	},
	//* Set the selection state for the given row index. 
	select: function(inIndex, inData) {
		return this.getSelection().select(inIndex, inData);
	},
	//* Get the selection state for the given row index.
	isSelected: function(inIndex) {
		return this.$.generator.isSelected(inIndex);
	},
	//* Re-render the specified row. Call after making modifications to the row to force it to render.
	renderRow: function(inIndex) {
		this.$.generator.renderRow(inIndex);
	},
	//* Prepare the row to become interactive.
	prepareRow: function(inIndex) {
		this.$.generator.prepareRow(inIndex);
	},
	//* Restore the row to being non-interactive.
	lockRow: function() {
		this.$.generator.lockRow();
	},
	//* Perform a set of tasks by runnin the function inFunc on a row that require it to be interactive
	//* when those tasks are performed. Lock the row when done.
	performOnRow: function(inIndex, inFunc, inContext) {
		this.$.generator.performOnRow(inIndex, inFunc, inContext);
	}
});
