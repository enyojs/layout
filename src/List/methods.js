var
	animation = require('enyo/animation'),
	dom = require('enyo/dom'),
	kind = require('enyo/kind'),
	logger = require('enyo/logger'),
	platform = require('enyo/platform'),
	utils = require('enyo/utils');

/**
* enyo.List was too large for the parser so we have to split it up. For now, we're arbitrarily
* splitting the methods into another file. A more appropriate refactoring is required.
*/

module.exports = /** @lends module:layout/List~List.prototype */ {
	/**
	* @method
	* @private
	*/
	importProps: kind.inherit(function (sup) {
		return function (props) {
			// force touch on desktop when we have reorderable items to work around
			// problems with native scroller
			if (props && props.reorderable) {
				this.touch = true;
			}
			sup.apply(this, arguments);
		};
	}),

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function () {
			this.pageSizes = [];
			this.orientV = this.orient == 'v';
			this.vertical = this.orientV ? 'default' : 'hidden';
			sup.apply(this, arguments);
			this.$.generator.orient = this.orient;
			this.getStrategy().translateOptimized = true;
			this.$.port.addRemoveClass('horizontal',!this.orientV);
			this.$.port.addRemoveClass('vertical',this.orientV);
			this.$.page0.addRemoveClass('vertical',this.orientV);
			this.$.page1.addRemoveClass('vertical',this.orientV);
			this.bottomUpChanged();  // Initializes pageBound also
			this.noSelectChanged();
			this.multiSelectChanged();
			this.toggleSelectedChanged();
			// setup generator to default to 'full-list' values
			this.$.generator.setRowOffset(0);
			this.$.generator.setCount(this.count);
		};
	}),

	/**
	* @method
	* @private
	*/
	initComponents: kind.inherit(function (sup) {
		return function () {
			this.createReorderTools();
			sup.apply(this, arguments);
			this.createSwipeableComponents();
		};
	}),

	/**
	* @private
	*/
	createReorderTools: function () {
		this.createComponent({
			name: 'reorderContainer',
			classes: 'enyo-list-reorder-container',
			ondown: 'sendToStrategy',
			ondrag: 'sendToStrategy',
			ondragstart: 'sendToStrategy',
			ondragfinish: 'sendToStrategy',
			onflick: 'sendToStrategy'
		});
	},

	/**
	* Adjusts the parent control so [listTools]{@link module:layout/List~List#listTools} are
	* created inside the strategy. This is necessary for strategies like
	* {@link module:enyo/TouchScrollStrategy~TouchScrollStrategy}, which wrap their contents with
	* additional DOM nodes.
	*
	* @see {@link module:enyo/Scroller~Scroller.createStrategy}
	* @method
	* @private
	*/
	createStrategy: kind.inherit(function (sup) {
		return function () {
			this.controlParentName = 'strategy';
			sup.apply(this, arguments);
			this.createChrome(this.listTools);
			this.controlParentName = 'client';
			this.discoverControlParent();
		};
	}),

	/**
	* @private
	*/
	createSwipeableComponents: function () {
		for (var i=0;i<this.swipeableComponents.length;i++) {
			this.$.swipeableComponents.createComponent(this.swipeableComponents[i], {owner: this.owner});
		}
	},

	/**
	* @method
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.$.generator.node = this.$.port.hasNode();
			this.$.generator.generated = true;
			this.reset();
		};
	}),

	/**
	* @method
	* @private
	*/
	handleResize: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.refresh();
		};
	}),

	/**
	* @private
	*/
	bottomUpChanged: function () {
		this.$.generator.bottomUp = this.bottomUp;
		this.$.page0.applyStyle(this.pageBound, null);
		this.$.page1.applyStyle(this.pageBound, null);

		if (this.orientV) {
			this.pageBound = this.bottomUp ? 'bottom' : 'top';
		} else {
			if (this.rtl) {
				this.pageBound = this.bottomUp ? 'left' : 'right';
			} else {
				this.pageBound = this.bottomUp ? 'right' : 'left';
			}
		}

		if (!this.orientV && this.bottomUp){
			this.$.page0.applyStyle('left', 'auto');
			this.$.page1.applyStyle('left', 'auto');
		}

		if (this.hasNode()) {
			this.reset();
		}
	},

	/**
	* @private
	*/
	noSelectChanged: function () {
		this.$.generator.setNoSelect(this.noSelect);
	},

	/**
	* @private
	*/
	multiSelectChanged: function () {
		this.$.generator.setMultiSelect(this.multiSelect);
	},

	/**
	* @private
	*/
	toggleSelectedChanged: function () {
		this.$.generator.setToggleSelected(this.toggleSelected);
	},

	/**
	* @private
	*/
	countChanged: function () {
		if (this.hasNode()) {
			this.updateMetrics();
		}
	},

	/**
	* Re-dispatches events from the reorder tools to the scroll strategy.
	*
	* @private
	*/
	sendToStrategy: function (sender, event) {
		this.$.strategy.dispatchEvent('on' + event.type, event, sender);
	},

	/**
	* Calculates page metrics (size, number of pages) and resizes the port.
	*
	* @private
	*/
	updateMetrics: function () {
		this.defaultPageSize = this.rowsPerPage * (this.rowSize || 100);
		this.pageCount = Math.ceil(this.count / this.rowsPerPage);
		this.portSize = 0;
		for (var i=0; i < this.pageCount; i++) {
			this.portSize += this.getPageSize(i);
		}
		this.adjustPortSize();
	},

	/**
	* Handles hold pulse events. Used to delay before running hold logic.
	*
	* @private
	*/
	holdpulse: function (sender, event) {
		// don't activate if we're not supporting reordering or if we've already
		// activated the reorder logic
		if (!this.getReorderable() || this.isReordering()) {
			return;
		}
		// first pulse event that exceeds our minimum hold time activates
		if (event.holdTime >= this.reorderHoldTimeMS) {
			// determine if we should handle the hold event
			if (this.shouldStartReordering(sender, event)) {
				this.startReordering(event);
				return false;
			}
		}
	},

	/**
	* Handles DragStart events.
	*
	* @private
	*/
	dragstart: function (sender, event) {
		// stop dragstart from propagating if we're in reorder mode
		if (this.isReordering()) {
			return true;
		}
		if (this.isSwipeable()) {
			return this.swipeDragStart(sender, event);
		}
	},

	/**
	* Determines whether we should handle the drag event.
	*
	* @private
	*/
	drag: function (sender, event) {
		if (this.shouldDoReorderDrag(event)) {
			event.preventDefault();
			this.reorderDrag(event);
			return true;
		} else if (this.isSwipeable()) {
			event.preventDefault();
			this.swipeDrag(sender, event);
			return true;
		}
	},

	/**
	* Handles DragFinish events.
	*
	* @private
	*/
	dragfinish: function (sender, event) {
		if (this.isReordering()) {
			this.finishReordering(sender, event);
		} else if (this.isSwipeable()) {
			this.swipeDragFinish(sender, event);
		}
	},

	/**
	* Handles up events.
	*
	* @private
	*/
	up: function (sender, event) {
		if (this.isReordering()) {
			this.finishReordering(sender, event);
		}
	},

	/**
	* Calculates the record indices for `pageNumber` and generates the markup
	* for that page.
	*
	* @private
	*/
	generatePage: function (pageNumber, target) {
		this.page = pageNumber;
		var r = this.rowsPerPage * this.page;
		this.$.generator.setRowOffset(r);
		var rpp = Math.min(this.count - r, this.rowsPerPage);
		this.$.generator.setCount(rpp);
		var html = this.$.generator.generateChildHtml();
		target.setContent(html);
		// prevent reordering row from being draw twice
		if (this.getReorderable() && this.draggingRowIndex > -1) {
			this.hideReorderingRow();
		}
		var bounds = target.getBounds();
		var pageSize = this.orientV ? bounds.height : bounds.width;
		// if rowSize is not set, use the height or width from the first generated page
		if (!this.rowSize && pageSize > 0) {
			this.rowSize = Math.floor(pageSize / rpp);
			this.updateMetrics();
		}
		// update known page sizes
		if (!this.fixedSize) {
			var s0 = this.getPageSize(pageNumber);
			if (s0 != pageSize && pageSize > 0) {
				this.pageSizes[pageNumber] = pageSize;
				this.portSize += pageSize - s0;
			}
		}
	},

	/**
	* Maps a row index number to the page number where it would be found.
	*
	* @private
	*/
	pageForRow: function (index) {
		return Math.floor(index / this.rowsPerPage);
	},

	/**
	 * Updates the list pages to show the correct rows for the requested `top` position.
	 *
	 * @param  {Number} top - Position in pixels from the top.
	 * @private
	 */
	update: function (top) {
		var updated = false;
		// get page info for position
		var pi = this.positionToPageInfo(top);
		// zone line position
		var pos = pi.pos + this.scrollerSize/2;
		// leap-frog zone position
		var k = Math.floor(pos/Math.max(pi.size, this.scrollerSize) + 1/2) + pi.no;
		// which page number for page0 (even number pages)?
		var p = (k % 2 === 0) ? k : k-1;
		if (this.p0 != p && this.isPageInRange(p)) {
			this.removedInitialPage = this.removedInitialPage || (this.draggingRowPage == this.p0);
			this.generatePage(p, this.$.page0);
			this.positionPage(p, this.$.page0);
			this.p0 = p;
			updated = true;
			this.p0RowBounds = this.getPageRowSizes(this.$.page0);
		}
		// which page number for page1 (odd number pages)?
		p = (k % 2 === 0) ? Math.max(1, k-1) : k;
		// position data page 1
		if (this.p1 != p && this.isPageInRange(p)) {
			this.removedInitialPage = this.removedInitialPage || (this.draggingRowPage == this.p1);
			this.generatePage(p, this.$.page1);
			this.positionPage(p, this.$.page1);
			this.p1 = p;
			updated = true;
			this.p1RowBounds = this.getPageRowSizes(this.$.page1);
		}
		if (updated) {
			// reset generator back to 'full-list' values
			this.$.generator.setRowOffset(0);
			this.$.generator.setCount(this.count);
			if (!this.fixedSize) {
				this.adjustBottomPage();
				this.adjustPortSize();
			}
		}
	},

	/**
	* Calculates the height and width of each row for a page.
	*
	* @param {module:enyo/Control~Control} page - Page control.
	* @private
	*/
	getPageRowSizes: function (page) {
		var rows = {};
		var allDivs = page.hasNode().querySelectorAll('div[data-enyo-index]');
		for (var i=0, index, bounds; i < allDivs.length; i++) {
			index = allDivs[i].getAttribute('data-enyo-index');
			if (index !== null) {
				bounds = dom.getBounds(allDivs[i]);
				rows[parseInt(index, 10)] = {height: bounds.height, width: bounds.width};
			}
		}
		return rows;
	},

	/**
	* Updates row bounds when rows are re-rendered.
	*
	* @private
	*/
	updateRowBounds: function (index) {
		if (this.p0RowBounds[index]) {
			this.updateRowBoundsAtIndex(index, this.p0RowBounds, this.$.page0);
		} else if (this.p1RowBounds[index]) {
			this.updateRowBoundsAtIndex(index, this.p1RowBounds, this.$.page1);
		}
	},

	/**
	* @private
	*/
	updateRowBoundsAtIndex: function (index, rows, page) {
		var rowDiv = page.hasNode().querySelector('div[data-enyo-index="' + index + '"]');
		var bounds = dom.getBounds(rowDiv);
		rows[index].height = bounds.height;
		rows[index].width = bounds.width;
	},

	/**
	* Updates the list for the given `position`.
	*
	* @param {Number} position - Position in pixels.
	* @private
	*/
	updateForPosition: function (position) {
		this.update(this.calcPos(position));
	},

	/**
	* Adjusts the position if the list is [bottomUp]{@link module:layout/List~List#bottomUp}.
	*
	* @param {Number} position - Position in pixels.
	* @private
	*/
	calcPos: function (position) {
		return (this.bottomUp ? (this.portSize - this.scrollerSize - position) : position);
	},

	/**
	* Determines which page is on the bottom and positions it appropriately.
	*
	* @private
	*/
	adjustBottomPage: function () {
		var bp = this.p0 >= this.p1 ? this.$.page0 : this.$.page1;
		this.positionPage(bp.pageNo, bp);
	},

	/**
	* Updates the size of the port to be the greater of the size of the scroller or
	* the `portSize`.
	*
	* @private
	*/
	adjustPortSize: function () {
		this.scrollerSize = this.orientV ? this.getBounds().height : this.getBounds().width;
		var s = Math.max(this.scrollerSize, this.portSize);
		this.$.port.applyStyle((this.orientV ? 'height' : 'width'), s + 'px');
		if (!this.orientV) {
			this.$.port.applyStyle('height', this.getBounds().height + 'px');
		}
	},

	/**
	* @private
	*/
	positionPage: function (pageNumber, target) {
		target.pageNo = pageNumber;
		var p = this.pageToPosition(pageNumber);
		target.applyStyle(this.pageBound, p + 'px');
	},

	/**
	* Calculates the position of `page`.
	*
	* @param {Number} page - Page number.
	* @private
	*/
	pageToPosition: function (page) {
		var p = 0;
		while (page > 0) {
			page--;
			p += this.getPageSize(page);
		}
		return p;
	},

	/**
	 * Retrieves the metrics for a page covering `position`.
	 *
	 * @param  {Number} position - Position in pixels.
	 * @return {module:layout/List~List~PageInfo}
	 * @private
	 */
	positionToPageInfo: function (position) {
		var page = -1;
		var p = this.calcPos(position);
		var s = this.defaultPageSize;
		while (p >= 0) {
			page++;
			s = this.getPageSize(page);
			p -= s;
		}
		page = Math.max(page, 0);
		return {
			no: page,
			size: s,
			pos: p + s,
			startRow: (page * this.rowsPerPage),
			endRow: Math.min((page + 1) * this.rowsPerPage - 1, this.count - 1)
		};
	},

	/**
	* Determines if `page` is a valid page number.
	*
	* @param {Number} page - Page number.
	* @private
	*/
	isPageInRange: function (page) {
		return page == Math.max(0, Math.min(this.pageCount-1, page));
	},

	/**
	* Calculates the size of a page. The size is estimated if the page has not
	* yet been rendered.
	*
	* @private
	*/
	getPageSize: function (pageNumber) {
		var size = this.pageSizes[pageNumber];
		// estimate the size based on how many rows are in this page
		if (!size) {
			var firstRow = this.rowsPerPage * pageNumber;
			var numRows = Math.min(this.count - firstRow, this.rowsPerPage);
			size = this.defaultPageSize * (numRows / this.rowsPerPage);
		}
		// can never return size of 0, as that would lead to infinite loops
		return Math.max(1, size);
	},

	/**
	* Resets pages and removes all rendered rows.
	*
	* @private
	*/
	invalidatePages: function () {
		this.p0 = this.p1 = null;
		this.p0RowBounds = {};
		this.p1RowBounds = {};
		// clear the html in our render targets
		this.$.page0.setContent('');
		this.$.page1.setContent('');
	},

	/**
	* Resets page and row sizes.
	*
	* @private
	*/
	invalidateMetrics: function () {
		this.pageSizes = [];
		this.rowSize = 0;
		this.updateMetrics();
	},

	/**
	* When the list is scrolled, ensures that the correct rows are rendered and
	* that the reordering controls are positioned correctly.
	*
	* @see {@link module:enyo/Scroller~Scroller.scroll}
	* @method
	* @private
	*/
	scroll: kind.inherit(function (sup) {
		return function (sender, event) {
			var r = sup.apply(this, arguments);
			var pos = this.orientV ? this.getScrollTop() : this.getScrollLeft();
			if (this.lastPos === pos) {
				return r;
			}
			this.lastPos = pos;
			this.update(pos);
			if (this.pinnedReorderMode) {
				this.reorderScroll(sender, event);
			}
			return r;
		};
	}),

	/**
	* Updates the list rows when the scroll top is set explicitly.
	*
	* @see {@link module:enyo/Scroller~Scroller.setScrollTop}
	* @method
	* @public
	*/
	setScrollTop: kind.inherit(function (sup) {
		return function (scrollTop) {
			this.update(scrollTop);
			sup.apply(this, arguments);
			this.twiddle();
		};
	}),

	/**
	* @private
	*/
	getScrollPosition: function () {
		return this.calcPos(this[(this.orientV ? 'getScrollTop' : 'getScrollLeft')]());
	},

	/**
	* @private
	*/
	setScrollPosition: function (position) {
		this[(this.orientV ? 'setScrollTop' : 'setScrollLeft')](this.calcPos(position));
	},

	/**
	* Scrolls the list so that the last item is visible.
	*
	* @method
	* @public
	*/
	scrollToBottom: kind.inherit(function (sup) {
		return function () {
			this.update(this.getScrollBounds().maxTop);
			sup.apply(this, arguments);
		};
	}),

	/**
	* Scrolls to the specified row.
	*
	* @param {Number} row - The index of the row to scroll to.
	* @public
	*/
	scrollToRow: function (row) {
		var page = this.pageForRow(row);
		var h = this.pageToPosition(page);
		// update the page
		this.updateForPosition(h);
		// call pageToPosition again and this time should return the right pos since the page info is populated
		h = this.pageToPosition(page);
		this.setScrollPosition(h);
		if (page == this.p0 || page == this.p1) {
			var rowNode = this.$.generator.fetchRowNode(row);
			if (rowNode) {
				// calc row offset
				var offset = (this.orientV ? rowNode.offsetTop : rowNode.offsetLeft);
				if (this.bottomUp) {
					offset = this.getPageSize(page) - (this.orientV ? rowNode.offsetHeight : rowNode.offsetWidth) - offset;
				}
				var p = this.getScrollPosition() + offset;
				this.setScrollPosition(p);
			}
		}
	},

	/**
	* Scrolls to the beginning of the list.
	*
	* @public
	*/
	scrollToStart: function () {
		this[this.bottomUp ? (this.orientV ? 'scrollToBottom' : 'scrollToRight') : 'scrollToTop']();
	},

	/**
	* Scrolls to the end of the list.
	*
	* @public
	*/
	scrollToEnd: function () {
		this[this.bottomUp ? (this.orientV ? 'scrollToTop' : 'scrollToLeft') : (this.orientV ? 'scrollToBottom' : 'scrollToRight')]();
	},

	/**
	* Re-renders the list at the current position.
	*
	* @public
	*/
	refresh: function () {
		this.invalidatePages();
		this.update(this[(this.orientV ? 'getScrollTop' : 'getScrollLeft')]());
		this.stabilize();

		//FIXME: Necessary evil for Android 4.0.4 refresh bug
		if (platform.android === 4) {
			this.twiddle();
		}
	},

	/**
	* Re-renders the list from the beginning.  This is used when changing the
	* data model for the list.  This also clears the selection state.
	*
	* @public
	*/
	reset: function () {
		this.getSelection().clear();
		this.invalidateMetrics();
		this.invalidatePages();
		this.stabilize();
		this.scrollToStart();
	},

	/**
	* Returns the {@link module:enyo/Selection~Selection} component that
	* manages the selection state for this list.
	*
	* @return {module:enyo/Selection~Selection} - The component that manages selection state for this list.
	* @public
	*/
	getSelection: function () {
		return this.$.generator.getSelection();
	},

	/**
	* Sets the selection state for the given row index.
	*
	* Modifying selection will not automatically re-render the row, so call
	* [renderRow()]{@link module:layout/List~List#renderRow} or [refresh()]{@link module:layout/List~List#refresh}
	* to update the view.
	*
	* @param {Number} index - The index of the row whose selection state is to be set.
	* @param {*} [data]     - Data value stored in the selection object.
	* @public
	*/
	select: function (index, data) {
		return this.getSelection().select(index, data);
	},

	/**
	* Clears the selection state for the given row index.
	*
	* Modifying selection will not automatically re-render the row, so call
	* [renderRow()]{@link module:layout/List~List#renderRow} or [refresh()]{@link module:layout/List~List#refresh}
	* to update the view.
	*
	* @param {Number} index - The index of the row whose selection state is to be cleared.
	* @public
	*/
	deselect: function (index) {
		return this.getSelection().deselect(index);
	},

	/**
	* Gets the selection state for the given row index.
	*
	* @param {Number} index - The index of the row whose selection state is
	* to be retrieved.
	* @return {Boolean} `true` if the given row is currently selected; otherwise, `false`.
	* @public
	*/
	isSelected: function (index) {
		return this.$.generator.isSelected(index);
	},

	/**
	* Re-renders the specified row. Call this method after making
	* modifications to a row, to force it to render.
	*
	* @param {Number} index - The index of the row to be re-rendered.
	* @public
    */
    renderRow: function (index) {
		this.$.generator.renderRow(index);
    },

	/**
 	* Handler for `onRenderRow` events. Updates row bounds when rows are re-rendered.
	*
	* @private
	*/
	rowRendered: function (sender, event) {
		this.updateRowBounds(event.rowIndex);
	},

	/**
	* Prepares a row to become interactive.
	*
	* @param {Number} index - The index of the row to be prepared.
	* @public
	*/
	prepareRow: function (index) {
		this.$.generator.prepareRow(index);
	},

	/**
	* Restores the row to being non-interactive.
	*
	* @public
	*/
	lockRow: function () {
		this.$.generator.lockRow();
	},

	/**
	* Performs a set of tasks by running the function `func` on a row (which
	* must be interactive at the time the tasks are performed). Locks the	row
	* when done.
	*
	* @param {Number} index   - The index of the row to be acted upon.
	* @param {function} func  - The function to perform.
	* @param {Object} context - The context to which the function is bound.
	* @public
	*/
	performOnRow: function (index, func, context) {
		this.$.generator.performOnRow(index, func, context);
	},

	/**
	* @private
	*/
	animateFinish: function (sender) {
		this.twiddle();
		return true;
	},
	/**
	* FIXME: Android 4.04 has issues with nested composited elements; for example, a
	* SwipeableItem, can incorrectly generate taps on its content when it has slid off the
	* screen; we address this BUG here by forcing the Scroller to 'twiddle' which corrects the
	* bug by provoking a dom update.
	*
	* @private
	*/
	twiddle: function () {
		var s = this.getStrategy();
		utils.call(s, 'twiddle');
	},

	/**
	* Returns page0 or page1 control depending on pageNumber odd/even status
	*
	* @param {Number} pageNumber  - Index of page.
	* @param {Boolean} checkRange - Whether to force checking `pageNumber` against
	* currently active pages.
	* @return {module:enyo/Control~Control}      - Page control for `pageNumber`.
	* @private
	*/
	pageForPageNumber: function (pageNumber, checkRange) {
		if (pageNumber % 2 === 0) {
			return (!checkRange || (pageNumber === this.p0)) ? this.$.page0 : null;
		}
		else {
			return (!checkRange || (pageNumber === this.p1)) ? this.$.page1 : null;
		}
		return null;
	},
	/**
		---- Reorder functionality ------------
	*/

	/**
	* Determines whether the hold event should be handled as a reorder hold.
	*
	* @private
	*/
	shouldStartReordering: function (sender, event) {
		if (!this.getReorderable() ||
			event.rowIndex == null ||
			event.rowIndex < 0 ||
			this.pinnedReorderMode ||
			event.index == null ||
			event.index < 0) {
			return false;
		}
		return true;
	},

	/**
	* Processes hold event and prepares for reordering.
	*
	* @fires module:layout/List~List#onSetupReorderComponents
	* @private
	*/
	startReordering: function (event) {
		// disable drag to scroll on strategy
		this.$.strategy.listReordering = true;

		this.buildReorderContainer();
		this.doSetupReorderComponents({index: event.index});
		this.styleReorderContainer(event);

		this.draggingRowIndex = this.placeholderRowIndex = event.rowIndex;
		this.draggingRowPage = this.pageForRow(this.draggingRowIndex);
		this.removeDraggingRowNode = event.dispatchTarget.retainNode(event.target);
		this.removedInitialPage = false;
		this.itemMoved = false;
		this.initialPageNumber = this.currentPageNumber = this.pageForRow(event.rowIndex);
		this.prevScrollTop = this.getScrollTop();

		// fill row being reordered with placeholder
		this.replaceNodeWithPlaceholder(event.rowIndex);
	},

	/**
	* Fills reorder container with draggable reorder components defined by the
	* application.
	*
	* @private
	*/
	buildReorderContainer: function () {
		this.$.reorderContainer.destroyClientControls();
		for (var i=0;i<this.reorderComponents.length;i++) {
			this.$.reorderContainer.createComponent(this.reorderComponents[i], {owner:this.owner});
		}
		this.$.reorderContainer.render();
	},

	/**
	* Prepares floating reorder container.
	*
	* @param {Object} e - Event object.
	* @private
	*/
	styleReorderContainer: function (e) {
		this.setItemPosition(this.$.reorderContainer, e.rowIndex);
		this.setItemBounds(this.$.reorderContainer, e.rowIndex);
		this.$.reorderContainer.setShowing(true);
		if (this.centerReorderContainer) {
			this.centerReorderContainerOnPointer(e);
		}
	},

	/**
	* Copies the innerHTML of `node` into a new component inside of
	* `reorderContainer`.
	*
	* @param {Node} node - The source node.
	* @private
	*/
	appendNodeToReorderContainer: function (node) {
		this.$.reorderContainer.createComponent({allowHtml: true, content: node.innerHTML}).render();
	},

	/**
	* Centers the floating reorder container on the user's pointer.
	*
	* @param {Object} e - Event object.
	* @private
	*/
	centerReorderContainerOnPointer: function (e) {
		var containerPosition = dom.calcNodePosition(this.hasNode());
		var bounds = this.$.reorderContainer.getBounds();
		var x = e.pageX - containerPosition.left - parseInt(bounds.width, 10)/2;
		var y = e.pageY - containerPosition.top + this.getScrollTop() - parseInt(bounds.height, 10)/2;
		if (this.getStrategyKind() != 'ScrollStrategy') {
			x -= this.getScrollLeft();
			y -= this.getScrollTop();
		}
		this.positionReorderContainer(x, y);
	},

	/**
	* Moves the reorder container to the specified `x` and `y` coordinates.
	* Animates and kicks off timer to turn off animation.
	*
	* @param {Number} x - The `left` position.
	* @param {Number} y - The `top` position.
	* @private
	*/
	positionReorderContainer: function (x,y) {
		this.$.reorderContainer.addClass('enyo-animatedTopAndLeft');
		this.$.reorderContainer.addStyles('left:'+x+'px;top:'+y+'px;');
		this.setPositionReorderContainerTimeout();
	},

	/**
	* Sets a timeout to remove animation class from reorder container.
	*
	* @private
	*/
	setPositionReorderContainerTimeout: function () {
		this.clearPositionReorderContainerTimeout();
		this.positionReorderContainerTimeout = setTimeout(this.bindSafely(
			function () {
				this.$.reorderContainer.removeClass('enyo-animatedTopAndLeft');
				this.clearPositionReorderContainerTimeout();
			}), 100);
	},

	/**
	* @private
	*/
	clearPositionReorderContainerTimeout: function () {
		if (this.positionReorderContainerTimeout) {
			clearTimeout(this.positionReorderContainerTimeout);
			this.positionReorderContainerTimeout = null;
		}
	},

	/**
	* Determines whether we should handle the drag event.
	*
	* @private
	*/
	shouldDoReorderDrag: function () {
		if (!this.getReorderable() || this.draggingRowIndex < 0 || this.pinnedReorderMode) {
			return false;
		}
		return true;
	},

	/**
	* Handles the drag event as a reorder drag.
	*
	* @private
	*/
	reorderDrag: function (event) {
		// position reorder node under mouse/pointer
		this.positionReorderNode(event);

		// determine if we need to auto-scroll the list
		this.checkForAutoScroll(event);

		// if the current index the user is dragging over has changed, move the placeholder
		this.updatePlaceholderPosition(event.pageY);
	},

	/**
	* Determines the row index at `pageY` (if it exists) and moves the placeholder
	* to that index.
	*
	* @param {Number} pageY - Position from top in pixels.
	* @private
	*/
	updatePlaceholderPosition: function (pageY) {
		var index = this.getRowIndexFromCoordinate(pageY);
		if (index !== -1) {
			// cursor moved over a new row, so determine direction of movement
			if (index >= this.placeholderRowIndex) {
				this.movePlaceholderToIndex(Math.min(this.count, index + 1));
			}
			else {
				this.movePlaceholderToIndex(index);
			}
		}
	},

	/**
	* Positions the reorder node based on the `dx` and `dy` of the drag event.
	*
	* @private
	*/
	positionReorderNode: function (e) {
		var reorderNodeBounds = this.$.reorderContainer.getBounds();
		var left = reorderNodeBounds.left + e.ddx;
		var top = reorderNodeBounds.top + e.ddy;
		top = (this.getStrategyKind() == 'ScrollStrategy') ? top + (this.getScrollTop() - this.prevScrollTop) : top;
		this.$.reorderContainer.addStyles('top: '+top+'px ; left: '+left+'px');
		this.prevScrollTop = this.getScrollTop();
	},

	/**
	* Checks whether the list should scroll when dragging and, if so, starts the
	* scroll timeout timer. Auto-scrolling happens when the user drags an item
	* within the top/bottom boundary percentage defined in
	* [dragToScrollThreshold]{@link module:layout/List~List#dragToScrollThreshold}.
	*
	* @param {Object} event - Drag event.
	* @private
	*/
	checkForAutoScroll: function (event) {
		var position = dom.calcNodePosition(this.hasNode());
		var bounds = this.getBounds();
		var perc;
		this.autoscrollPageY = event.pageY;
		if (event.pageY - position.top < bounds.height * this.dragToScrollThreshold) {
			perc = 100*(1 - ((event.pageY - position.top) / (bounds.height * this.dragToScrollThreshold)));
			this.scrollDistance = -1*perc;
		} else if (event.pageY - position.top > bounds.height * (1 - this.dragToScrollThreshold)) {
			perc = 100*((event.pageY - position.top - bounds.height*(1 - this.dragToScrollThreshold)) / (bounds.height - (bounds.height * (1 - this.dragToScrollThreshold))));
			this.scrollDistance = 1*perc;
		} else {
			this.scrollDistance = 0;
		}
		// stop scrolling if distance is zero (i.e., user isn't scrolling to the edges of
		// the list); otherwise, start it if not already started
		if (this.scrollDistance === 0) {
			this.stopAutoScrolling();
		} else {
			if (!this.autoScrollTimeout) {
				this.startAutoScrolling();
			}
		}
	},

	/**
	* Stops auto-scrolling.
	*
	* @private
	*/
	stopAutoScrolling: function () {
		if (this.autoScrollTimeout) {
			clearTimeout(this.autoScrollTimeout);
			this.autoScrollTimeout = null;
		}
	},

	/**
	* Starts auto-scrolling.
	*
	* @private
	*/
	startAutoScrolling: function () {
		this.autoScrollTimeout = setInterval(this.bindSafely(this.autoScroll), this.autoScrollTimeoutMS);
	},

	/**
	* Scrolls the list by the distance specified in
	* [scrollDistance]{@link module:layout/List~List#scrollDistance}.
	*
	* @private
	*/
	autoScroll: function () {
		if (this.scrollDistance === 0) {
			this.stopAutoScrolling();
		} else {
			if (!this.autoScrollTimeout) {
				this.startAutoScrolling();
			}
		}
		this.setScrollPosition(this.getScrollPosition() + this.scrollDistance);
		this.positionReorderNode({ddx: 0, ddy: 0});

		// if the current index the user is dragging over has changed, move the placeholder
		this.updatePlaceholderPosition(this.autoscrollPageY);
	},

	/**
	* Moves the placeholder (i.e., the gap between rows) to the row currently
	* under the user's pointer. This provides a visual cue, showing the user
	* where the item being dragged will go if it is dropped.
	*
	* @param {Number} index - The row index.
	*/
	movePlaceholderToIndex: function (index) {
		var node, nodeParent;
		if (index < 0) {
			return;
		}
		else if (index >= this.count) {
			node = null;
			nodeParent = this.pageForPageNumber(this.pageForRow(this.count - 1)).hasNode();
		}
		else {
			node = this.$.generator.fetchRowNode(index);
			nodeParent = node.parentNode;
		}
		// figure next page for placeholder
		var nextPageNumber = this.pageForRow(index);

		// don't add pages beyond the original page count
		if (nextPageNumber >= this.pageCount) {
			nextPageNumber = this.currentPageNumber;
		}

		// move the placeholder to just after our 'index' node
		nodeParent.insertBefore(
			this.placeholderNode,
			node);

		if (this.currentPageNumber !== nextPageNumber) {
			// if moving to different page, recalculate page sizes and reposition pages
			this.updatePageSize(this.currentPageNumber);
			this.updatePageSize(nextPageNumber);
			this.updatePagePositions(nextPageNumber);
		}

		// save updated state
		this.placeholderRowIndex = index;
		this.currentPageNumber = nextPageNumber;

		// remember that we moved an item (to prevent pinning at the wrong time)
		this.itemMoved = true;
	},

	/**
	* Turns off reordering. If the user didn't drag the item being reordered
	* outside of its original position, enters pinned reorder mode.
	*
	* @private
	*/
	finishReordering: function (sender, event) {
		if (!this.isReordering() || this.pinnedReorderMode || this.completeReorderTimeout) {
			return;
		}
		this.stopAutoScrolling();
		// enable drag-scrolling on strategy
		this.$.strategy.listReordering = false;
		// animate reorder container to proper position and then complete
		// reordering actions
		this.moveReorderedContainerToDroppedPosition(event);
		this.completeReorderTimeout = setTimeout(
			this.bindSafely(this.completeFinishReordering, event), 100);

		event.preventDefault();
		return true;
	},

	/**
	* @private
	*/
	moveReorderedContainerToDroppedPosition: function () {
		var offset = this.getRelativeOffset(this.placeholderNode, this.hasNode());
		var top = (this.getStrategyKind() == 'ScrollStrategy') ? offset.top : offset.top - this.getScrollTop();
		var left = offset.left - this.getScrollLeft();
		this.positionReorderContainer(left, top);
	},

	/**
	* After the reordered item has been animated to its position, completes
	* the reordering logic.
	*
	* @private
	*/
	completeFinishReordering: function (event) {
		this.completeReorderTimeout = null;
		// adjust placeholderRowIndex to now be the final resting place
		if (this.placeholderRowIndex > this.draggingRowIndex) {
			this.placeholderRowIndex = Math.max(0, this.placeholderRowIndex - 1);
		}
		// if the user dropped the item in the same location where it was picked up, and they
		// didn't move any other items in the process, pin the item and go into pinned reorder mode
		if (this.draggingRowIndex == this.placeholderRowIndex &&
			this.pinnedReorderComponents.length && !this.pinnedReorderMode && !this.itemMoved) {
			this.beginPinnedReorder(event);
			return;
		}
		this.removeDraggingRowNode();
		this.removePlaceholderNode();
		this.emptyAndHideReorderContainer();
		// clear this early to prevent scroller code from using disappeared placeholder
		this.pinnedReorderMode = false;
		this.reorderRows(event);
		this.draggingRowIndex = this.placeholderRowIndex = -1;
		this.refresh();
	},

	/**
	* Enters pinned reorder mode.
	*
	* @fires module:layout/List~List#onSetupPinnedReorderComponents
	* @private
	*/
	beginPinnedReorder: function (event) {
		this.buildPinnedReorderContainer();
		this.doSetupPinnedReorderComponents(utils.mixin(event, {index: this.draggingRowIndex}));
		this.pinnedReorderMode = true;
		this.initialPinPosition = event.pageY;
	},

	/**
	* Clears contents of reorder container, then hides.
	*
	* @private
	*/
	emptyAndHideReorderContainer: function () {
		this.$.reorderContainer.destroyComponents();
		this.$.reorderContainer.setShowing(false);
	},

	/**
	* Fills reorder container with pinned controls.
	*
	* @private
	*/
	buildPinnedReorderContainer: function () {
		this.$.reorderContainer.destroyClientControls();
		for (var i=0;i<this.pinnedReorderComponents.length;i++) {
			this.$.reorderContainer.createComponent(this.pinnedReorderComponents[i], {owner:this.owner});
		}
		this.$.reorderContainer.render();
	},

	/**
	* Swaps the rows that were reordered, and sends up reorder event.
	*
	* @fires module:layout/List~List#onReorder
	* @private
	*/
	reorderRows: function (event) {
		// send reorder event
		this.doReorder(this.makeReorderEvent(event));
		// update display
		this.positionReorderedNode();
		// fix indices for reordered rows
		this.updateListIndices();
	},

	/**
	* Adds `reorderTo` and `reorderFrom` properties to the reorder event.
	*
	* @private
	*/
	makeReorderEvent: function (event) {
		event.reorderFrom = this.draggingRowIndex;
		event.reorderTo = this.placeholderRowIndex;
		return event;
	},

	/**
	* Moves the node being reordered to its new position and shows it.
	*
	* @private
	*/
	positionReorderedNode: function () {
		// only do this if the page with the initial item is still rendered
		if (!this.removedInitialPage) {
			var insertNode = this.$.generator.fetchRowNode(this.placeholderRowIndex);
			if (insertNode) {
				insertNode.parentNode.insertBefore(this.hiddenNode, insertNode);
				this.showNode(this.hiddenNode);
			}
			this.hiddenNode = null;
			if (this.currentPageNumber != this.initialPageNumber) {
				var mover, movee;
				var currentPage = this.pageForPageNumber(this.currentPageNumber);
				var otherPage = this.pageForPageNumber(this.currentPageNumber + 1);
				// if moved down, move current page's firstChild to the end of previous page
				if (this.initialPageNumber < this.currentPageNumber) {
					mover = currentPage.hasNode().firstChild;
					otherPage.hasNode().appendChild(mover);
				// if moved up, move current page's lastChild before previous page's firstChild
				} else {
					mover = currentPage.hasNode().lastChild;
					movee = otherPage.hasNode().firstChild;
					otherPage.hasNode().insertBefore(mover, movee);
				}
				this.correctPageSizes();
				this.updatePagePositions(this.initialPageNumber);
			}
		}
	},

	/**
	* Updates indices of list items as needed to preserve reordering.
	*
	* @private
	*/
	updateListIndices: function () {
		// don't do update if we've moved further than one page, refresh instead
		if (this.shouldDoRefresh()) {
			this.refresh();
			this.correctPageSizes();
			return;
		}

		var from = Math.min(this.draggingRowIndex, this.placeholderRowIndex);
		var to = Math.max(this.draggingRowIndex, this.placeholderRowIndex);
		var direction = (this.draggingRowIndex - this.placeholderRowIndex > 0) ? 1 : -1;
		var node, i, newIndex, currentIndex;

		if (direction === 1) {
			node = this.$.generator.fetchRowNode(this.draggingRowIndex);
			if (node) {
				node.setAttribute('data-enyo-index', 'reordered');
			}
			for (i=(to-1),newIndex=to;i>=from;i--) {
				node = this.$.generator.fetchRowNode(i);
				if (!node) {
					continue;
				}
				currentIndex = parseInt(node.getAttribute('data-enyo-index'), 10);
				newIndex = currentIndex + 1;
				node.setAttribute('data-enyo-index', newIndex);
			}
			node = this.hasNode().querySelector('[data-enyo-index="reordered"]');
			node.setAttribute('data-enyo-index', this.placeholderRowIndex);

		} else {
			node = this.$.generator.fetchRowNode(this.draggingRowIndex);
			if (node) {
				node.setAttribute('data-enyo-index', this.placeholderRowIndex);
			}
			for (i=(from+1), newIndex=from;i<=to;i++) {
				node = this.$.generator.fetchRowNode(i);
				if (!node) {
					continue;
				}
				currentIndex = parseInt(node.getAttribute('data-enyo-index'), 10);
				newIndex = currentIndex - 1;
				node.setAttribute('data-enyo-index', newIndex);
			}
		}
	},

	/**
	* Determines whether an item was reordered far enough that it warrants a refresh.
	*
	* @private
	*/
	shouldDoRefresh: function () {
		return (Math.abs(this.initialPageNumber - this.currentPageNumber) > 1);
	},

	/**
	* Gets node height, width, top, and left values.
	*
	* @private
	*/
	getNodeStyle: function (index) {
		var node = this.$.generator.fetchRowNode(index);
		if (!node) {
			return;
		}
		var offset = this.getRelativeOffset(node, this.hasNode());
		var dimensions = dom.getBounds(node);
		return {h: dimensions.height, w: dimensions.width, left: offset.left, top: offset.top};
	},

	/**
	* Gets offset relative to a positioned ancestor node.
	*
	* @private
	*/
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

	/**
	* Hides the DOM node for the row at `index` and inserts the placeholder node before it.
	*
	* @param {Number} index - The index of the row whose DOM node will be hidden.
	* @private
	*/
	replaceNodeWithPlaceholder: function (index) {
		var node = this.$.generator.fetchRowNode(index);
		if (!node) {
			logger.log('No node - ' + index);
			return;
		}
		// create and style placeholder node
		this.placeholderNode = this.createPlaceholderNode(node);
		// hide existing node
		this.hiddenNode = this.hideNode(node);
		// insert placeholder node where original node was
		var currentPage = this.pageForPageNumber(this.currentPageNumber);
		currentPage.hasNode().insertBefore(this.placeholderNode, this.hiddenNode);
	},

	/**
	* Creates and returns a placeholder node with dimensions matching those of
	* the passed-in node.
	*
	* @param {Node} node - Node on which to base the placeholder dimensions.
	* @private
	*/
	createPlaceholderNode: function (node) {
		var placeholderNode = this.$.placeholder.hasNode().cloneNode(true);
		var nodeDimensions = dom.getBounds(node);
		placeholderNode.style.height = nodeDimensions.height + 'px';
		placeholderNode.style.width = nodeDimensions.width + 'px';
		return placeholderNode;
	},

	/**
	* Removes the placeholder node from the DOM.
	*
	* @private
	*/
	removePlaceholderNode: function () {
		this.removeNode(this.placeholderNode);
		this.placeholderNode = null;
	},

	/**
	* Removes the passed-in node from the DOM.
	*
	* @private
	*/
	removeNode: function (node) {
		if (!node || !node.parentNode) {
			return;
		}
		node.parentNode.removeChild(node);
	},

	/**
	* Updates `this.pageSizes` to support the placeholder node's jumping
	* from one page to the next.
	*
	* @param {Number} pageNumber
	* @private
	*/
	updatePageSize: function (pageNumber) {
		if (pageNumber < 0) {
			return;
		}
		var pageControl = this.pageForPageNumber(pageNumber, true);
		if (pageControl) {
			var s0 = this.pageSizes[pageNumber];
			// FIXME: use height/width depending on orientation
			var pageSize = Math.max(1, pageControl.getBounds().height);
			this.pageSizes[pageNumber] = pageSize;
			this.portSize += pageSize - s0;
		}
	},

	/**
	* Repositions [currentPageNumber]{@link module:layout/List~List#currentPageNumber} and
	* `nextPageNumber` pages to support the placeholder node's jumping from one
	* page to the next.
	*
	* @param {Number} nextPageNumber [description]
	* @private
	*/
	updatePagePositions: function (nextPageNumber) {
		this.positionPage(this.currentPageNumber, this.pageForPageNumber(this.currentPageNumber));
		this.positionPage(nextPageNumber, this.pageForPageNumber(nextPageNumber));
	},

	/**
	* Corrects page sizes array after reorder is complete.
	*
	* @private
	*/
	correctPageSizes: function () {
		var initPageNumber = this.initialPageNumber%2;
		this.updatePageSize(this.currentPageNumber, this.$['page'+this.currentPage]);
		if (initPageNumber != this.currentPageNumber) {
			this.updatePageSize(this.initialPageNumber, this.$['page'+initPageNumber]);
		}
	},

	/**
	* Hides a DOM node.
	*
	* @private
	*/
	hideNode: function (node) {
		node.style.display = 'none';
		return node;
	},

	/**
	* Shows a DOM node.
	*
	* @private
	*/
	showNode: function (node) {
		node.style.display = 'block';
		return node;
	},

	/**
	* Called by client code to finalize a pinned mode reordering, e.g., when the "Drop"
	* button is pressed on the pinned placeholder row.
	*
	* @todo Seems incorrect to have an event on the signature for a public API
	* @param {Object} event - A mouse/touch event.
	* @public
	*/
	dropPinnedRow: function (event) {
		// animate reorder container to proper position and then complete reording actions
		this.moveReorderedContainerToDroppedPosition(event);
		this.completeReorderTimeout = setTimeout(
			this.bindSafely(this.completeFinishReordering, event), 100);
		return;
	},

	/**
	* Called by client code to cancel a pinned mode reordering.
	*
	* @todo Seems incorrect to have an event on the signature for a public API
	* @param {Object} event - A mouse/touch event.
	* @public
	*/
	cancelPinnedMode: function (event) {
		// make it look like we're dropping in original location
		this.placeholderRowIndex = this.draggingRowIndex;
		this.dropPinnedRow(event);
	},

	/**
	* Returns the row index that is under the given `y`-position on the page.  If the
	* position is off the end of the list, `this.count` is returned. If the position
	* is before the start of the list, `-1` is returned.
	*
	* @param {Number} y - `y` position in pixels in relation to the page.
	* @return {Number}  - The index of the row at the specified position.
	* @private
	*/
	getRowIndexFromCoordinate: function (y) {
		// FIXME: this code only works with vertical lists
		var cursorPosition = this.getScrollTop() + y - dom.calcNodePosition(this.hasNode()).top;
		// happens if we try to drag past top of list
		if (cursorPosition < 0) {
			return -1;
		}
		var pageInfo = this.positionToPageInfo(cursorPosition);
		var rows = (pageInfo.no == this.p0) ? this.p0RowBounds : this.p1RowBounds;
		// might have only rendered one page, so catch that here
		if (!rows) {
			return this.count;
		}
		var posOnPage = pageInfo.pos;
		var placeholderHeight = this.placeholderNode ? dom.getBounds(this.placeholderNode).height : 0;
		var totalHeight = 0;
		for (var i=pageInfo.startRow; i <= pageInfo.endRow; ++i) {
			// do extra check for row that has placeholder as we'll return -1 here for no match
			if (i === this.placeholderRowIndex) {
				// for placeholder
				totalHeight += placeholderHeight;
				if (totalHeight >= posOnPage) {
					return -1;
				}
			}
			// originally dragged row is hidden, so don't count it
			if (i !== this.draggingRowIndex) {
				totalHeight += rows[i].height;
				if (totalHeight >= posOnPage) {
					return i;
				}
			}
		}
		return i;
	},

	/**
	* Gets the position of a node (identified via index) on the page.
	*
	* @return {Object} The position of the row node.
	* @private
	*/
	getIndexPosition: function (index) {
		return dom.calcNodePosition(this.$.generator.fetchRowNode(index));
	},

	/**
	* Sets the specified control's position to match that of the list row at `index`.
	*
	* @param {module:enyo/Control~Control} item - The control to reposition.
	* @param {Number} index      - The index of the row whose position is to be matched.
	* @private
	*/
	setItemPosition: function (item, index) {
		var clonedNodeStyle = this.getNodeStyle(index);
		var top = (this.getStrategyKind() == 'ScrollStrategy') ? clonedNodeStyle.top : clonedNodeStyle.top - this.getScrollTop();
		var styleStr = 'top:'+top+'px; left:'+clonedNodeStyle.left+'px;';
		item.addStyles(styleStr);
	},

	/**
	* Sets the specified control's width and height to match those of the list row at `index`.
	*
	* @param {module:enyo/Control~Control} item - The control to reposition.
	* @param {Number} index      - The index of the row whose width and height are to be matched.
	* @private
	*/
	setItemBounds: function (item, index) {
		var clonedNodeStyle = this.getNodeStyle(index);
		var styleStr = 'width:'+clonedNodeStyle.w+'px; height:'+clonedNodeStyle.h+'px;';
		item.addStyles(styleStr);
	},

	/**
	* When in pinned reorder mode, repositions the pinned placeholder when the
	* user has scrolled far enough.
	*
	* @private
	*/
	reorderScroll: function (sender, e) {
		// if we are using the standard scroll strategy, we have to move the pinned row with the scrolling
		if (this.getStrategyKind() == 'ScrollStrategy') {
			this.$.reorderContainer.addStyles('top:'+(this.initialPinPosition+this.getScrollTop()-this.rowSize)+'px;');
		}
		// y coordinate on screen of the pinned item doesn't change as we scroll things
		this.updatePlaceholderPosition(this.initialPinPosition);
	},

	/**
	* @private
	*/
	hideReorderingRow: function () {
		var hiddenNode = this.hasNode().querySelector('[data-enyo-index="' + this.draggingRowIndex + '"]');
		// hide existing node
		if (hiddenNode) {
			this.hiddenNode = this.hideNode(hiddenNode);
		}
	},

	/**
	* @private
	*/
	isReordering: function () {
		return (this.draggingRowIndex > -1);
	},

	/**
		---- Swipeable functionality ------------
	*/

	/**
	* @private
	*/
	isSwiping: function () {
		// we're swiping when the index is set and we're not in the middle of completing or backing out a swipe
		return (this.swipeIndex != null && !this.swipeComplete && this.swipeDirection != null);
	},

	/**
	* When a drag starts, gets the direction of the drag as well as the index
	* of the item being dragged, and resets any pertinent values. Then kicks
	* off the swipe sequence.
	*
	* @private
	*/
	swipeDragStart: function (sender, event) {
		// if we're not on a row or the swipe is vertical or if we're in the middle of reordering, just say no
		if (event.index == null || event.vertical) {
			return true;
		}

		// if we are waiting to complete a swipe, complete it
		if (this.completeSwipeTimeout) {
			this.completeSwipe(event);
		}

		// reset swipe complete flag
		this.swipeComplete = false;

		if (this.swipeIndex != event.index) {
			this.clearSwipeables();
			this.swipeIndex = event.index;
		}
		this.swipeDirection = event.xDirection;

		// start swipe sequence only if we are not currently showing a persistent item
		if (!this.persistentItemVisible) {
			this.startSwipe(event);
		}

		// reset dragged distance (for dragfinish)
		this.draggedXDistance = 0;
		this.draggedYDistance = 0;

		return true;
	},

	/**
	* When a drag is in progress, updates the position of the swipeable
	* container based on the `ddx` of the event.
	*
	* @private
	*/
	swipeDrag: function (sender, event) {
		// if a persistent swipeableItem is still showing, handle it separately
		if (this.persistentItemVisible) {
			this.dragPersistentItem(event);
			return this.preventDragPropagation;
		}
		// early exit if there's no matching dragStart to set item
		if (!this.isSwiping()) {
			return false;
		}
		// apply new position
		this.dragSwipeableComponents(this.calcNewDragPosition(event.ddx));
		// save dragged distance (for dragfinish)
		this.draggedXDistance = event.dx;
		this.draggedYDistance = event.dy;
		// save last meaningful (non-zero) and new direction (for swipeDragFinish)
		if (event.xDirection != this.lastSwipeDirection && event.xDirection) {
			this.lastSwipeDirection = event.xDirection;
		}
		return true;
	},

	/*
	* When the current drag completes, decides whether to complete the swipe
	* based on how far the user pulled the swipeable container.
	*
	* @private
	*/
	swipeDragFinish: function (sender, event) {
		// if a persistent swipeableItem is still showing, complete drag away or bounce
		if (this.persistentItemVisible) {
			this.dragFinishPersistentItem(event);
		// early exit if there's no matching dragStart to set item
		} else if (!this.isSwiping()) {
			return false;
		// otherwise if user dragged more than 20% of the width, complete the swipe. if not, back out.
		} else {
			var percentageDragged = this.calcPercentageDragged(this.draggedXDistance);
			if ((percentageDragged > this.percentageDraggedThreshold) && (this.lastSwipeDirection === this.swipeDirection)) {
				this.swipe(this.fastSwipeSpeedMS);
			} else {
				this.backOutSwipe(event);
			}
		}

		return this.preventDragPropagation;
	},

	/**
	* Reorder takes precedence over swipes, and not having it turned on or swipeable controls
	* defined also disables this.
	*
	* @private
	*/
	isSwipeable: function () {
		return this.enableSwipe && this.$.swipeableComponents.controls.length !== 0 &&
			!this.isReordering() && !this.pinnedReorderMode;
	},

	/**
	* Positions the swipeable components block at the current row.
	*
	* @param {Number} index      - The row index.
	* @param {Number} xDirection - Value of `xDirection` from drag event (`1` = right,
	* `-1` = left).
	* @private
	*/
	positionSwipeableContainer: function (index, xDirection) {
		var node = this.$.generator.fetchRowNode(index);
		if (!node) {
			return;
		}
		var offset = this.getRelativeOffset(node, this.hasNode());
		var dimensions = dom.getBounds(node);
		var x = (xDirection == 1) ? -1*dimensions.width : dimensions.width;
		this.$.swipeableComponents.addStyles('top: '+offset.top+'px; left: '+x+'px; height: '+dimensions.height+'px; width: '+dimensions.width+'px;');
	},

	/**
	* Calculates new position for the swipeable container based on the user's
	* drag action. Don't allow the container to drag beyond either edge.
	*
	* @param {Number} dx - Amount of change in `x` position.
	* @return {Number}
	* @private
	*/
	calcNewDragPosition: function (dx) {
		var parentBounds = this.$.swipeableComponents.getBounds();
		var xPos = parentBounds.left;
		var dimensions = this.$.swipeableComponents.getBounds();
		var xlimit = (this.swipeDirection == 1) ? 0 : -1*dimensions.width;
		var x = (this.swipeDirection == 1)
			? (xPos + dx > xlimit)
				? xlimit
				: xPos + dx
			: (xPos + dx < xlimit)
				? xlimit
				: xPos + dx;
		return x;
	},

	/**
	* Positions the swipeable components.
	*
	* @param {Number} x - New `left` position.
	* @private
	*/
	dragSwipeableComponents: function (x) {
		this.$.swipeableComponents.applyStyle('left',x+'px');
	},

	/**
	* Begins swiping sequence by positioning the swipeable container and
	* bubbling the `setupSwipeItem` event.
	*
	* @param {Object} e - Event
	* @fires module:layout/List~List#onSetupSwipeItem
	* @private
	*/
	startSwipe: function (e) {
		// modify event index to always have this swipeItem value
		e.index = this.swipeIndex;
		this.positionSwipeableContainer(this.swipeIndex, e.xDirection);
		this.$.swipeableComponents.setShowing(true);
		this.setPersistentItemOrigin(e.xDirection);
		this.doSetupSwipeItem(e);
	},

	/**
	* If a persistent swipeableItem is still showing, drags it away or bounces it.
	*
	* @param {Object} e - Event
	* @private
	*/
	dragPersistentItem: function (e) {
		var xPos = 0;
		var x = (this.persistentItemOrigin == 'right')
			? Math.max(xPos, (xPos + e.dx))
			: Math.min(xPos, (xPos + e.dx));
		this.$.swipeableComponents.applyStyle('left',x+'px');
	},

	/**
	* If a persistent swipeableItem is still showing, completes drag away or bounce.
	*
	* @param {Object} e - Event
	* @private
	*/
	dragFinishPersistentItem: function (e) {
		var completeSwipe = (this.calcPercentageDragged(e.dx) > 0.2);
		var dir = (e.dx > 0) ? 'right' : (e.dx < 0) ? 'left' : null;
		if (this.persistentItemOrigin == dir) {
			if (completeSwipe) {
				this.slideAwayItem();
			} else {
				this.bounceItem(e);
			}
		} else {
			this.bounceItem(e);
		}
	},

	/**
	* @private
	*/
	setPersistentItemOrigin: function (xDirection) {
		this.persistentItemOrigin = xDirection == 1 ? 'left' : 'right';
	},

	/**
	* @private
	*/
	calcPercentageDragged: function (dx) {
		return Math.abs(dx/this.$.swipeableComponents.getBounds().width);
	},

	/**
	* Completes a swipe animation in the specified number of milliseconds.
	*
	* @param {Number} speed - Time in milliseconds.
	* @private
	*/
	swipe: function (speed) {
		this.swipeComplete = true;
		this.animateSwipe(0, speed);
	},

	/**
	* @private
	*/
	backOutSwipe: function () {
		var dimensions = this.$.swipeableComponents.getBounds();
		var x = (this.swipeDirection == 1) ? -1*dimensions.width : dimensions.width;
		this.animateSwipe(x, this.fastSwipeSpeedMS);
		this.swipeDirection = null;
	},

	/**
	* Returns persisted swipeable components to being visible if not dragged back
	* beyond threshold.
	*
	* @private
	*/
	bounceItem: function () {
		var bounds = this.$.swipeableComponents.getBounds();
		if (bounds.left != bounds.width) {
			this.animateSwipe(0, this.normalSwipeSpeedMS);
		}
	},

	/**
	* Animates the swipeable components away starting from their current position.
	*
	* @private
	*/
	slideAwayItem: function () {
		var $item = this.$.swipeableComponents;
		var parentWidth = $item.getBounds().width;
		var xPos = (this.persistentItemOrigin == 'left') ? -1*parentWidth : parentWidth;
		this.animateSwipe(xPos, this.normalSwipeSpeedMS);
		this.persistentItemVisible = false;
		this.setPersistSwipeableItem(false);
	},

	/**
	* Hides the swipeable components.
	*
	* @private
	*/
	clearSwipeables: function () {
		this.$.swipeableComponents.setShowing(false);
		this.persistentItemVisible = false;
		this.setPersistSwipeableItem(false);
	},

	/**
	* Completes swipe and hides active swipeable item.
	*
	* @fires module:layout/List~List#onSwipeComplete
	* @private
	*/
	completeSwipe: function () {
		if (this.completeSwipeTimeout) {
			clearTimeout(this.completeSwipeTimeout);
			this.completeSwipeTimeout = null;
		}
		// if this wasn't a persistent item, hide it upon completion and send swipe complete event
		if (!this.getPersistSwipeableItem()) {
			this.$.swipeableComponents.setShowing(false);
			// if the swipe was completed, update the current row and bubble swipeComplete event
			if (this.swipeComplete) {
				this.doSwipeComplete({index: this.swipeIndex, xDirection: this.swipeDirection});
			}
		} else {
			// persistent item will only be visible if the swipe was completed
			if (this.swipeComplete) {
				this.persistentItemVisible = true;
			}
		}
		this.swipeIndex = null;
		this.swipeDirection = null;
	},

	/**
	* Animates a swipe starting from the current position to the specified new
	* position `(targetX)` over the specified length of time `(totalTimeMS)`.
	*
	* @param {Number} targetX     - The target `left` position.
	* @param {Number} totalTimeMS - Time in milliseconds.
	* @private
	*/
	animateSwipe: function (targetX, totalTimeMS) {
		var t0 = utils.now();
		var $item = this.$.swipeableComponents;
		var origX = parseInt($item.getBounds().left, 10);
		var xDelta = targetX - origX;

		this.stopAnimateSwipe();

		var fn = this.bindSafely(function () {
			var t = utils.now() - t0;
			var percTimeElapsed = t/totalTimeMS;
			var currentX = origX + (xDelta)*Math.min(percTimeElapsed,1);

			// set new left
			$item.applyStyle('left', currentX+'px');

			// schedule next frame
			this.job = animation.requestAnimationFrame(fn);

			// potentially override animation TODO

			// go until we've hit our total time
			if (t/totalTimeMS >= 1) {
				this.stopAnimateSwipe();
				this.completeSwipeTimeout = setTimeout(this.bindSafely(function () {
					this.completeSwipe();
				}), this.completeSwipeDelayMS);
			}
		});

		this.job = animation.requestAnimationFrame(fn);
	},

	/**
	* Cancels the active swipe animation.
	*
	* @private
	*/
	stopAnimateSwipe: function () {
		if (this.job) {
			this.job = animation.cancelRequestAnimationFrame(this.job);
		}
	}
};
