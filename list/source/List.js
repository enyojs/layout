/**
	_enyo.List_ is a control that displays a scrolling list of rows, suitable
	for displaying very large lists. It is optimized such that only a small
	portion of the list is rendered at a given time. A flyweight pattern is
	employed, in which controls placed inside the list are created once, but
	rendered for each list item. For this reason, it's best to use only simple
	controls in	a List, such as <a href="#enyo.Control">enyo.Control</a> and
	<a href="#enyo.Image">enyo.Image</a>.

	A List's _components_ block contains the controls to be used for a single
	row. This set of controls will be rendered for each row. You may customize
	row rendering by handling the _onSetupItem_ event.

	Events fired from within list rows contain the _index_ property, which may
	be used to identify the row	from which the event originated.

	The controls inside a List are non-interactive. This means that calling
	methods that would normally cause rendering to occur (e.g., _setContent_)
	will not do so. However, you can force a row to render by calling
	_renderRow(inRow)_.

	In addition, you can force a row to be temporarily interactive by calling
	_prepareRow(inRow)_. Call the _lockRow_ method when the interaction is
	complete.

	For more information, see the documentation on
	[Lists](https://github.com/enyojs/enyo/wiki/Lists)
	in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.List",
	kind: "Scroller",
	classes: "enyo-list",
	published: {
		/**
			The number of rows contained in the list. Note that as the amount of
			list data changes, _setRows_ can be called to adjust the number of
			rows. To re-render the list at the current position when the count
			has changed, call the _refresh_ method.  If the whole data model of
			the list has changed and you want to redisplay from the top, call
			the _reset_ method instead.
		*/
		count: 0,
		/**
			The number of rows to be shown on a given list page segment. 
			There is generally no need to adjust this value.
		*/
		rowsPerPage: 50,
		/**
			If true, renders the list such that row 0 is at the bottom of the
			viewport and the beginning position of the list is scrolled to the
			bottom
		*/
		bottomUp: false,
		/**
			If true, the selection mechanism is disabled. Tap events are still
			sent, but items won't be automatically re-rendered when tapped.
		*/
		noSelect: false,
		//* If true, multiple selections are allowed
		multiSelect: false,
		//* If true, the selected item will toggle
		toggleSelected: false,
		//* If true, the list will assume all rows have the same height for optimization
		fixedHeight: false,
		//* If true, the list will allow the user to reorder list items
		reorderable: true
	},
	events: {
		/**
			Fires once per row at render time.
			_inEvent.index_ contains the current row index.
		*/
		onSetupItem: "",
		onReorder: ""
	},
	handlers: {
		onAnimateFinish: "animateFinish",
        onhold: "hold",
		ondrag: "drag",
		onup: "dragfinish",
		//ondragout: "dragfinish"
	},
	//* @protected
	rowHeight: 0,
	listTools: [
		{name: "port", classes: "enyo-list-port enyo-border-box", components: [
			{name: "generator", kind: "FlyweightRepeater", canGenerate: false, components: [
				{tag: null, name: "client"}
			]},
			{name: "page0", allowHtml: true, classes: "enyo-list-page", style: "border:2px solid yellow"},
			{name: "page1", allowHtml: true, classes: "enyo-list-page", style: "border:2px solid red"},
			{name: "reorderContainer", classes: "list-reorder-container"},
			{name: "placeholder", classes: "listPlaceholder", style: "height:0px;"},
			{name: "pinnedPlaceholder", classes: "pinned-list-placeholder", components: [
				{name: "pinnedPlaceholderContents", allowHtml: true},
				{name: "testButton", kind:"onyx.Button", content: "Drop", ontap: "dropPinnedRow"}
			]}
		]}
	],
	
	draggingRowIndex: -1,
	dragToScrollThreshold: 0.1,
	prevScrollTop: 0,
	autoScrollTimeoutMS: 20,
	autoScrollTimeout: null,
	pinnedReorderMode: false,
	initialPinPosition: -1,
	itemMoved: false,
	currentPage: null,
	
	//* Hold event handler
    hold:function(inSender, inEvent){
		inEvent.preventDefault();
		
		// determine if we should handle the hold event
		if(!this.shouldHold(inEvent)) {
			return false;
		}
		
		// disable drag to scroll on strategy
		this.$.strategy.listReordering = true;
		
		// setup floating reorder container
        this.setupReorderContainer(inEvent);

		this.draggingRowIndex = this.placeholderRowIndex = inEvent.rowIndex;
		this.itemMoved = false;
		this.initialPageNumber = this.currentPageNumber = Math.floor(inEvent.rowIndex/this.rowsPerPage);
		this.currentPage = this.currentPageNumber%2;
		this.prevScrollTop = this.getScrollTop();
		
		// fill row being reordered with placeholder
		this.replaceNodeWithPlacholder(inEvent.rowIndex);
		
		return false;
    },
	//* Determine whether we should handle the hold event
	shouldHold: function(inEvent) {
		// if list is not set to be reorderable, ignore hold event
		if(!this.getReorderable()) {
			return false;
		}
        // if not holding a row in the list, ignore hold event
        if(inEvent.rowIndex < 0) {
            return false;
        }
		// if currently pinned, don't allow additional holds
		if(this.pinnedReorderMode) {
			return false;
		}
		
		return true;
	},
	//* Prepare floating reorder container
	setupReorderContainer: function(e) {
		this.setItemPosition(this.$.reorderContainer, e.rowIndex);
		this.setItemBounds(this.$.reorderContainer, e.rowIndex);
		this.appendNodeToReorderContainer(this.cloneRowNode(e.rowIndex));
		this.$.reorderContainer.setShowing(true);
	},
	appendNodeToReorderContainer: function(node) {
		this.$.reorderContainer.createComponent({allowHtml: true, content: node.innerHTML}).render();
	},
	
	//* Drag event handler
	drag: function(inSender, inEvent) {
		inEvent.preventDefault();
		
		// determine if we should handle the drag event
		if(!this.shouldDrag(inEvent)) {
			return true;
		}
		
		// position reorder node under mouse/pointer
		this.positionReorderNode(inEvent);
		
		// determine if we need to auto-scroll the list
		this.checkForAutoScroll(inEvent);
		
		// if the current index the user is dragging over has changed, move the placeholder
		var index = this.getRowIndexFromCoordinate(inEvent.pageY);
		if(index != this.placeholderRowIndex) {
			this.movePlaceholderToIndex(index);
		}
		
		return true;
	},
	//* Determine whether we should handle the drag event
	shouldDrag: function(inEvent) {
		if(!this.getReorderable()) {
			return false;
		}
		
		if(this.draggingRowIndex < 0) {
			return false;
		}
		
		if(this.pinnedReorderMode) {
			return false;
		}
		
		return true;
	},
	//* Position the reorder node based on the dx and dy of the drag event
	positionReorderNode: function(e) {
		var reorderNodeStyle = this.$.reorderContainer.hasNode().style;
		var left = parseInt(reorderNodeStyle.left) + e.ddx;
		var scrollTopDelta = this.getScrollTop() - this.prevScrollTop;
		var top = parseInt(reorderNodeStyle.top) + parseInt(e.ddy) + scrollTopDelta;
		this.$.reorderContainer.addStyles("top: "+top+"px ; left: "+left+"px");
		this.prevScrollTop = this.getScrollTop();
	},
	/**
		Checks if the list should scroll when dragging and starts the scroll timeout
		if so. Auto-scrolling happens when the user is dragging an item within the top/bottom
		boundary percentage defined in _this.dragToScrollThreshold_
	*/
    checkForAutoScroll:function(inEvent) {
        var position = this.getNodePosition(this.hasNode());
        var bounds = this.getBounds();
        if(inEvent.pageY - position.top < bounds.height * this.dragToScrollThreshold) {
			var perc = 100*(1 - ((inEvent.pageY - position.top) / (bounds.height * this.dragToScrollThreshold)));
			this.scrollDistance = -1*perc;
        } else if(inEvent.pageY - position.top > bounds.height * (1 - this.dragToScrollThreshold)) {
			var perc = 100*((inEvent.pageY - position.top - bounds.height*(1 - this.dragToScrollThreshold)) / (bounds.height - (bounds.height * (1 - this.dragToScrollThreshold))));
			this.scrollDistance = 1*perc;
        } else {
			this.scrollDistance = 0;
		}
		// stop scrolling if distance is zero (i.e. user isn't scrolling to the edges of
		// the list), otherwise start it if not already started
        if(this.scrollDistance == 0) {
			this.stopAutoScrolling();
		} else {
			if(!this.autoScrollTimeout) {
				this.startAutoScrolling();
			}
		}
    },
	//* Stop auto-scrolling
	stopAutoScrolling: function() {
		if(this.autoScrollTimeout) {
			clearTimeout(this.autoScrollTimeout);
			this.autoScrollTimeout = null;
		}
	},
	//* Start auto-scrolling
	startAutoScrolling: function() {
		this.autoScrollTimeout = setTimeout(enyo.bind(this,this.autoScroll), this.autoScrollTimeoutMS);
	},
	//* Scroll the list by the distance specified in _this.scrollDistance_
    autoScroll:function() {
		if(this.scrollDistance == 0) {
			this.stopAutoScrolling();
		} else {
			if(!this.autoScrollTimeout) {
				this.startAutoScrolling();
			}
		}
		this.setScrollPosition(this.getScrollPosition() + this.scrollDistance);
		this.positionReorderNode({ddx: 0, ddy: 0});
		
		this.startAutoScrolling();
	},
	/**
		Move the placeholder (i.e. gap between rows) to the row currently under
		the user's pointer. This provides a visual cue, showing the user where the item
		they are dragging will go if they drop it.
	*/
	movePlaceholderToIndex: function(index) {
		var node = this.$.generator.fetchRowNode(index);
		// safety first
		if(!node) {
			enyo.log("No node - "+index);
			return;
		}
		
		// figure next page and position for placeholder
		var newPlaceholderIndex = (index > this.draggingRowIndex) ? index + 1 : index;
		var nextPageNumber = Math.floor(newPlaceholderIndex/this.rowsPerPage);
		var nextPage = nextPageNumber%2;
		
		// don't add pages beyond the original page count
		if(nextPageNumber >= this.pageCount) {
			nextPageNumber = this.currentPageNumber;
			nextPage = this.currentPage;
		}
		
		// if moving to same page, simply move the placeholder to new position
		if(this.currentPage == nextPage) {
			this.$["page"+this.currentPage].hasNode().insertBefore(this.placeholderNode, this.$.generator.fetchRowNode(newPlaceholderIndex));
		// if moving to different page, recalculate page heights and reposition pages
		} else {
			this.updatePageHeights(nextPageNumber);
			this.updatePagePositions(nextPageNumber,nextPage);
			this.$["page"+nextPage].hasNode().insertBefore(this.placeholderNode, this.$.generator.fetchRowNode(newPlaceholderIndex));
		}
		
		// save updated state
		this.placeholderRowIndex = index;
		this.currentPageNumber = nextPageNumber;
		this.currentPage = nextPage;
		
		// remember that we moved an item (to prevent pinning at the wrong time)
		this.itemMoved = true;
	},

	//* Dragfinish event handler
	dragfinish: function(inSender, inEvent) {
		if(this.getReorderable()) {
			this.finishReordering(inSender, inEvent);
		}
	},
	/**
		Turn off reordering. If the user didn't drag the item being reordered
		outside of it's original position, go into pinned reorder mode.
	*/
	finishReordering: function(inSender, inEvent) {
		if(this.draggingRowIndex < 0 || this.pinnedReorderMode) {
			return;
		}
		
		this.stopAutoScrolling();
		this.removePlaceholderNode();

		// enable drag-scrolling on strategy
		this.$.strategy.listReordering = false;
		
		// if the user dropped the item in the same location where it was picked up, and they
		// didn't move any other items in the process, pin the item and go into pinned reorder mode
		if(this.draggingRowIndex == this.placeholderRowIndex && !this.itemMoved) {
			this.beginPinnedReorder(inEvent);
			return;
		}
		
		// release the row being reordered and complete the reordered event
		this.dropReorderedRow(inEvent);
		
		if(!this.shouldDoRefresh() && this.currentPageNumber != this.initialPageNumber) {
			this.correctPageHeights();		// TODO - fix the page height / port size problem
			this.adjustPortSize();
		}
		
		this.resetRerorderState();
		
		inEvent.preventDefault();
		return true;
	},
	//* Go into pinned reorder mode
	beginPinnedReorder: function(e) {
		this.emptyAndHideReorderContainer();
		this.setupPinnedPlaceholder();
		this.pinnedReorderMode = true;
		this.initialPinPosition = e.pageY;
	},
	//* clear contents of reorder container and re-render, then hide
	emptyAndHideReorderContainer: function() {
		this.$.reorderContainer.destroyComponents();
		this.$.reorderContainer.setShowing(false);
	},
	/**
		Show the pinned placeholder, match it's size to that of the item being reordered, and
		fill it with a clone of the item being reordered
	*/
	setupPinnedPlaceholder: function() {
		this.$.pinnedPlaceholderContents.setContent(this.cloneRowNode(this.draggingRowIndex).innerHTML);
		this.showNode(this.hiddenNode);
		this.setItemBounds(this.$.pinnedPlaceholder, this.draggingRowIndex);
		this.hideNode(this.hiddenNode);
		this.$["page"+this.currentPage].hasNode().insertBefore(this.$.pinnedPlaceholder.hasNode(), this.$.generator.fetchRowNode(this.draggingRowIndex));
		this.$.pinnedPlaceholder.setShowing(true);
	},
	//* Put away reorder container and bubble a reorder event
	dropReorderedRow: function(e) {
		this.emptyAndHideReorderContainer();
		this.doReorder(this.makeReorderEvent(e));
		this.positionReorderedNode();
		this.updateListIndices();
	},
	//* Add _reorderTo_ and _reorderFrom_ properties to the reorder event
	makeReorderEvent: function(e) {
		e.reorderFrom = this.draggingRowIndex;
		e.reorderTo = this.placeholderRowIndex;
		return e;
	},
	//* Move the node being reordered to the new position and show it
	positionReorderedNode: function() {
		var insertIndex = (this.placeholderRowIndex > this.draggingRowIndex) ? this.placeholderRowIndex+1 : this.placeholderRowIndex;
		var insertNode = this.$.generator.fetchRowNode(insertIndex);
		this.$["page"+this.currentPage].hasNode().insertBefore(this.hiddenNode, insertNode);
		this.showNode(this.hiddenNode);
	},
	//* Reset back to original values
	resetRerorderState: function() {
		this.draggingRowIndex = this.placeholderRowIndex = -1;
	},
	//* Update indices as needed in list to preserve reordering
	updateListIndices: function() {
		// don't do update if we've moved further than one page, refresh instead
		if(this.shouldDoRefresh()) {
			this.refresh();
			this.log("REFRESH");
			return;
		}
		
		var from = Math.min(this.draggingRowIndex, this.placeholderRowIndex);
		var to = Math.max(this.draggingRowIndex, this.placeholderRowIndex);
		var delta = (this.draggingRowIndex - this.placeholderRowIndex > 0) ? 1 : -1;
		
		if(delta === 1) {
			//this.log("moving up - "+this.draggingRowIndex, this.placeholderRowIndex, to, from);
			
			var node = this.$.generator.fetchRowNode(this.draggingRowIndex);
			//this.log("reordered: ",name, node, currentIndex+" ----> ", "reordered");
			node.setAttribute("data-enyo-index", "reordered");
			
			for(var i=(to-1),newIndex=to;i>=from;i--) {
				//this.log(i);
				var node = this.$.generator.fetchRowNode(i);
				if(!node) {
					this.log("no node - "+i);
					continue;
				}
				//var name = node.innerHTML.split('listContactsSample_item_name">')[1].split("<")[0];
				var currentIndex = parseInt(node.getAttribute("data-enyo-index"));
				newIndex = currentIndex + 1;
				//this.log(name, node, currentIndex+" ----> ", newIndex);
				node.setAttribute("data-enyo-index", newIndex);
			}
			
			//this.log(this.draggingRowIndex);
			var node = document.querySelectorAll('[data-enyo-index="reordered"]')[0];
			//var name = node.innerHTML.split('listContactsSample_item_name">')[1].split("<")[0];
			//this.log("reordered: ",name, node, node.getAttribute("data-enyo-index")+" ----> ", this.placeholderRowIndex);
			node.setAttribute("data-enyo-index", this.placeholderRowIndex);
			
		} else {
			//this.log("moving down - "+this.draggingRowIndex, this.placeholderRowIndex, to, from);
			
			//this.log(this.draggingRowIndex);
			var node = this.$.generator.fetchRowNode(this.draggingRowIndex);
			//var name = node.innerHTML.split('listContactsSample_item_name">')[1].split("<")[0];
			//this.log("reordered: ",name, node, node.getAttribute("data-enyo-index")+" ----> ", this.placeholderRowIndex);
			node.setAttribute("data-enyo-index", this.placeholderRowIndex);
			
			for(var i=(from+1), newIndex=from;i<=to;i++) {
				var node = this.$.generator.fetchRowNode(i);
				if(!node) {
					this.log("no node - "+i);
					continue;
				}
				//var name = node.innerHTML.split('listContactsSample_item_name">')[1].split("<")[0];
				var currentIndex = parseInt(node.getAttribute("data-enyo-index"));
				newIndex = currentIndex - 1;
				//this.log(name, node, currentIndex+" ----> ", newIndex);
				node.setAttribute("data-enyo-index", newIndex);
			}
		}
	},
	//* Determine if an item was reordered far enough that it warrants a refresh()
	shouldDoRefresh: function() {
		return (Math.abs(this.initialPageNumber - this.currentPageNumber) > 1)
	},
	//* Get node height, width, top, left
	getNodeStyle: function(index) {
		var node = this.$.generator.fetchRowNode(index);
		if(!node) {
			enyo.log("No node - "+index);
			return;
		}
		var offset = this.getRelativeOffset(node, this.hasNode());
		var dimensions = this.getDimensions(node);
		return {h: parseInt(dimensions.height), w: parseInt(dimensions.width), left: parseInt(offset.left), top: parseInt(offset.top)};
	},
	//* Get offset relative to a positioned ancestor node
    getRelativeOffset: function (n, p) {
        var ro = {top: 0, left: 0};
        if (n !== p && n.parentNode) {
            do {
                ro.top += n.offsetTop || 0;
                ro.left += n.offsetLeft || 0;
                n = n.offsetParent;
            } while (n && n !== p);
        }
        return ro;
    },
	//* Get height and width dimensions of the given dom node
	getDimensions: function(node) {
		var style = getComputedStyle(node,null);
		return {height: style.getPropertyValue("height"), width: style.getPropertyValue("width")};
	},
	/**
		Overloaded domScroll function for TouchScrollStrategy. When we are in pinned reorder mode,
		reposition the pinned placeholder when user has scrolled far enough.
	*/
	domScroll: function(inSender, e) {
		this.inherited(arguments);
		
		if(!this.getReorderable()) {
			return;
		}
		
		if(!this.pinnedReorderMode) {
			return;
		}
		
		var index = this.getRowIndexFromCoordinate(this.initialPinPosition);
		if(index != this.placeholderRowIndex) {
			this.movePinnedRow(index);
		}
	},
	//* Move the pinned row to a new index (determined by the current scroll position)
	movePinnedRow: function(index) {
		var node = this.$.generator.fetchRowNode(index);
		if(!node) {
			this.log("no node - "+index);
			return;
		}
		
		// figure next page and position for placeholder
		var nextPageNumber = Math.floor(index/this.rowsPerPage);
		var nextPage = nextPageNumber%2;
		
		// don't add pages beyond the original page count
		if(nextPageNumber >= this.pageCount) {
			nextPageNumber = this.currentPageNumber;
			nextPage = this.currentPage;
		}
		
		// if moving to same page, simply move the pinned row to new position
		if(this.currentPage == nextPage) {
			this.$["page"+this.currentPage].hasNode().insertBefore(this.$.pinnedPlaceholder.hasNode(), node);
		// if moving to different page, recalculate page heights and reposition pages
		} else {
			this.updatePageHeights(nextPageNumber);
			this.updatePagePositions(nextPageNumber,nextPage);
			this.$["page"+nextPage].hasNode().insertBefore(this.$.pinnedPlaceholder.hasNode(), node);
		}
		
		// save updated state
		this.placeholderRowIndex = index > this.draggingRowIndex ? index - 1 : index;
		this.currentPageNumber = nextPageNumber;
		this.currentPage = nextPage;
	},
	replaceNodeWithPlacholder: function(index) {
		var node = this.$.generator.fetchRowNode(index);
		if(!node) {
			enyo.log("No node - "+index);
			return;
		}
		// create and style placeholder node
		this.placeholderNode = this.createPlaceholderNode(node);
		// hide existing node
		this.hiddenNode = this.hideNode(node);
		// insert placeholder node where original node was
		this.$["page"+this.currentPage].hasNode().insertBefore(this.placeholderNode,this.hiddenNode);
	},
	//* Create and return a placeholder node with dimensions that match the input node
	createPlaceholderNode: function(node) {
		var placeholderNode = this.$.placeholder.hasNode().cloneNode(true);
		var nodeDimensions = this.getDimensions(node);
		placeholderNode.style.height = nodeDimensions.height;
		placeholderNode.style.width = nodeDimensions.width;
		return placeholderNode;
	},
	//* Remove the placeholder node from the DOM
	removePlaceholderNode: function() {
		this.removeNode(this.placeholderNode);
		this.placeholderNode = null;
	},
	//* Remove the placeholder node from the DOM
	removeHiddenNode: function() {
		this.removeNode(this.hiddenNode);
		this.hiddenNode = null;
	},
	//* Remove the node from the DOM
	removeNode: function(node) {
		if(!node || !node.parentNode) {
			return;
		}
		node.parentNode.removeChild(node);
	},
	//* Update _this.pageHeights_ to support the placeholder node jumping from one page to the next
	updatePageHeights: function(nextPageNumber) {
		this.pageHeights[this.currentPageNumber] = this.getPageHeight(this.currentPageNumber) - this.rowHeight;
		this.pageHeights[nextPageNumber] = this.getPageHeight(nextPageNumber) + this.rowHeight;
		//this.log("p"+this.currentPageNumber,this.pageHeights[this.currentPageNumber], "p"+nextPageNumber,this.pageHeights[nextPageNumber])
	},
	//* Reposition the two pages to support the placeholder node jumping from one page to the next
	updatePagePositions: function(nextPageNumber,nextPage) {
		this.positionPage(this.currentPageNumber, this.$["page"+this.currentPage]);
		this.positionPage(nextPageNumber, this.$["page"+nextPage]);
	},
	correctPageHeights: function() {
		var otherPage = (this.currentPage == 1) ? 0 : 1;
		
		
		
		// if moved down, move current page's firstChild to the end of previous page
		if(this.initialPageNumber < this.currentPageNumber) {
			var mover = this.$["page"+this.currentPage].hasNode().firstChild;
			this.$["page"+otherPage].hasNode().appendChild(mover);
			//this.log("moving page"+this.currentPage+"'s firstChild (",mover,") to the end of page"+otherPage);
		// if moved up, move current page's lastChild before previous page's firstChild
		} else {
			var mover = this.$["page"+this.currentPage].hasNode().lastChild;
			var movee = this.$["page"+otherPage].hasNode().firstChild;
			this.$["page"+otherPage].hasNode().insertBefore(mover, movee);
			//this.log("moving page"+this.currentPage+"'s lastChild (",mover,") in front of page"+otherPage+"'s firstChild (",movee,")");
		}
		this.pageHeights[this.initialPageNumber] = this.getPageHeight(this.initialPageNumber) + this.rowHeight;
		this.pageHeights[this.currentPageNumber] = this.getPageHeight(this.currentPageNumber) - this.rowHeight;
		this.updatePagePositions(this.initialPageNumber,otherPage);
	},
	hideNode: function(node) {
		node.style.display = "none";
		return node;
	},
	showNode: function(node) {
		node.style.display = "block";
		return node;
	},
	//* Called when the "Drop" button is pressed on the pinned placeholder row
	dropPinnedRow: function(inSender, inEvent) {
		this.pinnedReorderMode = false;
		this.dropReorderedRow(inEvent);
		this.$.pinnedPlaceholder.setShowing(false);
		this.resetRerorderState();
	},
	//* Returns the row index that is under the given position on the page
    getRowIndexFromCoordinate: function(y) {
        var positionInList = this.getScrollTop() + y - this.getNodePosition(this.hasNode()).top;
        return Math.floor(positionInList/this.rowHeight); // TODO assumes all nodes have same height
    },
	//* Get the position of a node (identified via index) on the page
	getIndexPosition: function(index) {
		return this.getNodePosition(this.$.generator.fetchRowNode(index));
	},
	//* Gets the position of a node on the page, taking translations into account
    getNodePosition:function(node) {
        var originalNode=node;
        var offsetTop=0;
        var offsetLeft=0;
        while(node && node.offsetParent){
            offsetTop+=node.offsetTop;
            offsetLeft+=node.offsetLeft;
            node=node.offsetParent;
        }
        // second pass to get transforms 
        node=originalNode;
        var cssTransformProp=enyo.dom.getCssTransformProp();
        while(node && node.getAttribute){
            var matrix=enyo.dom.getComputedStyleValue(node,cssTransformProp);
            if(matrix && matrix != "none"){
                var last=matrix.lastIndexOf(",");
                var secondToLast=matrix.lastIndexOf(",",last-1);
                if(last>=0 && secondToLast>=0){
                    offsetTop+=parseFloat(matrix.substr(last+1,matrix.length-last));
                    offsetLeft+=parseFloat(matrix.substr(secondToLast+1,last-secondToLast));             
                }
            }
            node=node.parentNode;
        }
        return {top:offsetTop,left:offsetLeft};
    },
	cloneRowNode: function(index) {
		return this.$.generator.fetchRowNode(index).cloneNode(true);
	},
	//* Set the _$item_'s position to match that of the item at _index_
	setItemPosition: function($item,index) {
		var clonedNodeStyle = this.getNodeStyle(index);
		var styleStr = "top:"+clonedNodeStyle.top+"px; left:"+clonedNodeStyle.left+"px;";
		$item.addStyles(styleStr);
	},
	//* Set the _$item_'s width and height to match that of the item at _index_
	setItemBounds: function($item,index) {
		var clonedNodeStyle = this.getNodeStyle(index);
		var styleStr = "width:"+clonedNodeStyle.w+"px; height:"+clonedNodeStyle.h+"px;";
		$item.addStyles(styleStr);
	},
	
	
	
	
	
	
	
	
	
	
	create: function() {
		this.pageHeights = [];
		this.inherited(arguments);
		this.getStrategy().translateOptimized = true;
		this.bottomUpChanged();
		this.noSelectChanged();
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
	initComponents: function() {
		this.inherited(arguments);
		this.hideReorderableContainer();
		this.hidePinnedPlaceholderContainer();
	},
	hideReorderableContainer: function() {
		this.$.reorderContainer.setShowing(false);
	},
	hidePinnedPlaceholderContainer: function() {
		this.$.pinnedPlaceholder.setShowing(false);
	},
	resizeHandler: function() {
		this.inherited(arguments);
		this.refresh();
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
	noSelectChanged: function() {
		this.$.generator.setNoSelect(this.noSelect);
	},
	multiSelectChanged: function() {
		this.$.generator.setMultiSelect(this.multiSelect);
	},
	toggleSelectedChanged: function() {
		this.$.generator.setToggleSelected(this.toggleSelected);
	},
	countChanged: function() {
		if (this.hasNode()) {
			this.updateMetrics();
		}
	},
	updateMetrics: function() {
		this.defaultPageHeight = this.rowsPerPage * (this.rowHeight || 100);
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
		// if rowHeight is not set, use the height from the first generated page
		if (!this.rowHeight && pageHeight > 0) {
			this.rowHeight = Math.floor(pageHeight / rpp);
			this.updateMetrics();
		}
		// update known page heights
		if (!this.fixedHeight) {
			var h0 = this.getPageHeight(inPageNo);
			if (h0 != pageHeight && pageHeight > 0) {
				this.pageHeights[inPageNo] = pageHeight;
				this.portSize += pageHeight - h0;
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
		var k = Math.floor(pos/Math.max(pi.height, this.scrollerHeight) + 1/2) + pi.no;
		// which page number for page0 (even number pages)?
		var p = (k % 2 === 0) ? k : k-1;
		if (this.p0 != p && this.isPageInRange(p)) {
			//this.log("update page0", p);
			this.generatePage(p, this.$.page0);
			this.positionPage(p, this.$.page0);
			this.p0 = p;
			updated = true;
		}
		// which page number for page1 (odd number pages)?
		p = (k % 2 === 0) ? Math.max(1, k-1) : k;
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
	updateForPosition: function(inPos) {
		this.update(this.calcPos(inPos));
	},
	calcPos: function(inPos) {
		return (this.bottomUp ? (this.portSize - this.scrollerHeight - inPos) : inPos);
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
		var p = this.calcPos(inY);
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
		this.twiddle();
	},
	getScrollPosition: function() {
		return this.calcPos(this.getScrollTop());
	},
	setScrollPosition: function(inPos) {
		this.setScrollTop(this.calcPos(inPos));
	},
	//* Scrolls to a specific row.
	scrollToRow: function(inRow) {
		var page = Math.floor(inRow / this.rowsPerPage);
		var pageRow = inRow % this.rowsPerPage;
		var h = this.pageToPosition(page);
		// update the page
		this.updateForPosition(h);
		// call pageToPosition again and this time should return the right pos since the page info is populated
		h = this.pageToPosition(page);
		this.setScrollPosition(h);
		if (page == this.p0 || page == this.p1) {
			var rowNode = this.$.generator.fetchRowNode(inRow);
			if (rowNode) {
				// calc row offset
				var offset = rowNode.offsetTop;
				if (this.bottomUp) {
					offset = this.getPageHeight(page) - rowNode.offsetHeight - offset;
				}
				var y = this.getScrollPosition() + offset;
				this.setScrollPosition(y);
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
	//* Re-renders the list at the current position.
	refresh: function() {
		this.invalidatePages();
		this.update(this.getScrollTop());
		this.stabilize();

		//FIXME: Necessary evil for Android 4.0.4 refresh bug
		if (enyo.platform.android === 4) {
			this.twiddle();
		}
	},
	/**
		Re-renders the list from the beginning.  This is used when changing the
		data model for the list.  This will also clear the selection state.
	*/
	reset: function() {
		this.getSelection().clear();
		this.invalidateMetrics();
		this.invalidatePages();
		this.stabilize();
		this.scrollToStart();
	},
	/**
		Returns the [enyo.Selection](#enyo.Selection) component that 
		manages the selection state for	this list.
	*/
	getSelection: function() {
		return this.$.generator.getSelection();
	},
	/**
		Sets the selection state for the given row index.
		_inData_ is an optional data value stored in the selection object.

		Modifying selection will not automatically rerender the row, 
		so use [renderRow](#enyo.List::renderRow) or [refresh](#enyo.List::refresh)
		to update the view.
	*/
	select: function(inIndex, inData) {
		return this.getSelection().select(inIndex, inData);
	},
	/**
		Clears the selection state for the given row index.

		Modifying selection will not automatically rerender the row, 
		so use [renderRow](#enyo.List::renderRow) or [refresh](#enyo.List::refresh)
		to update the view.
	*/
	deselect: function(inIndex) {
		return this.getSelection().deselect(inIndex);
	},
	//* Gets the selection state for the given row index.
	isSelected: function(inIndex) {
		return this.$.generator.isSelected(inIndex);
	},
	/**
    	Re-renders the specified row. Call after making modifications to a row,
        to force it to render.
    */
    renderRow: function(inIndex) {
    	this.$.generator.renderRow(inIndex);
    },
	//* Prepares the row to become interactive.
	prepareRow: function(inIndex) {
		this.$.generator.prepareRow(inIndex);
	},
	//* Restores the row to being non-interactive.
	lockRow: function() {
		this.$.generator.lockRow();
	},
	/**
		Performs a set of tasks by running the function _inFunc_ on a row (which
		must be interactive at the time the tasks are performed). Locks the	row
		when done.
	*/
	performOnRow: function(inIndex, inFunc, inContext) {
		this.$.generator.performOnRow(inIndex, inFunc, inContext);
	},
	//* @protected
	animateFinish: function(inSender) {
		this.twiddle();
		return true;
	},
	// FIXME: Android 4.04 has issues with nested composited elements; for example, a SwipeableItem, 
	// can incorrectly generate taps on its content when it has slid off the screen;
	// we address this BUG here by forcing the Scroller to "twiddle" which corrects the bug by
	// provoking a dom update.
	twiddle: function() {
		var s = this.getStrategy();
		enyo.call(s, "twiddle");
	}
});