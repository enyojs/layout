/**
* Contains the declaration for the {@link module:layout/List~List} kind.
* @module layout/List
*/

var
	kind = require('enyo/kind'),
	utils = require('enyo/utils'),
	Scroller = require('enyo/Scroller');

var
	FlyweightRepeater = require('layout/FlyweightRepeater');

var
	methods = require('./methods');

/**
* A collection of useful metrics about a page.
*
* @typedef {Object} module:layout/List~List~PageInfo
* @property {Number} no       - The page number.
* @property {Number} size     - The page size.
* @property {Number} pos      - The page position.
* @property {Number} startRow - The index of the page's first row.
* @property {Number} endRow   - The index of the page's last row.
*/

/**
* Fires once per row at render time.
*
* @event module:layout/List~List#onSetupItem
* @type {Object}
* @property {Number} index - The current row index.
* @public
*/

/**
* Fires when reordering starts, to setup reordering components. No additional
* data is included with this event.
*
* @event module:layout/List~List#onSetupReorderComponents
* @type {Object}
* @property {Number} index - The current row index.
* @public
*/

/**
* Fires when reordering completes.
*
* @event module:layout/List~List#onReorder
* @type {Object}
* @property {Number} reorderTo   - The index of the destination row.
* @property {Number} reorderFrom - The index of the source row.
* @public
*/

/**
* Fires when pinned reordering starts. No additional data is included with
* this event.
*
* @event module:layout/List~List#onSetupPinnedReorderComponents
* @type {Object}
* @public
*/

/**
* Fires when swiping starts, to set up swipeable components. No additional
* data is included with this event.
*
* @event module:layout/List~List#onSetupSwipeItem
* @type {Object}
* @public
*/

/**
* @todo onSwipeDrag is never fired
* @event module:layout/List~List#onSwipeDrag
* @type {Object}
* @public
*/

/**
* @todo onSwipe is never fired
* @event module:layout/List~List#onSwipe
* @type {Object}
* @public
*/

/**
* Fires when a swipe completes.
*
* @event module:layout/List~List#onSwipeComplete
* @type {Object}
* @property {Number} index      - The index of the row that was swiped.
* @property {Number} xDirection - The direction of the swipe.
* @public
*/

/**
* {@link module:layout/List~List} is a control that displays a scrolling list of rows,
* suitable for displaying very large lists. It is optimized such that only a
* small portion of the list is rendered at a given time. A flyweight pattern
* is employed, in which controls placed inside the list are created once, but
* rendered for each list item. For this reason, it's best to use only simple
* controls in	a List, such as {@link module:enyo/Control~Control} and {@link module:enyo/Image~Image}.
*
* A List's `components` block contains the controls to be used for a single
* row. This set of controls will be rendered for each row. You may customize
* row rendering by handling the [onSetupItem]{@link module:layout/List~List#onSetupItem}
* event.
*
* Events fired from within list rows contain the `index` property, which may
* be used to identify the row from which the event originated.
*
* Beginning with Enyo 2.2, lists have built-in support for swipeable and
* reorderable list items.  Individual list items are swipeable by default; to
* enable reorderability, set the [reorderable]{@link module:layout/List~List#reorderable}
* property to `true`.
*
* For more information, see the documentation on
* [Lists]{@linkplain $dev-guide/building-apps/layout/lists.html} in the
* Enyo Developer Guide.
*
* @class List
* @extends module:enyo/Scroller~Scroller
* @ui
* @public
*/
module.exports = kind(utils.mixin(methods,
	/** @lends module:layout/List~List.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.List',

	/**
	* @private
	*/
	kind: Scroller,

	/**
	* @private
	*/
	classes: 'enyo-list',

	/**
	* @lends module:layout/List~List.prototype
	* @private
	*/
	published: {
		/**
		* The number of rows contained in the list. Note that as the amount of
		* list data changes, `setRows()` may be called to adjust the number of
		* rows. To re-render the list at the current position when the count has
		* changed, call the [refresh()]{@link module:layout/List~List#refresh} method.  If the
		* whole data model of the list has changed and you want to redisplay it
		* from the top, call [reset()]{@link module:layout/List~List#reset}.
		*
		* @type {Number}
		* @default 0
		* @public
		*/
		count: 0,
		/**
		* The number of rows to be shown in a given list page segment. There is
		* generally no need to adjust this value.
		*
		* @type {Number}
		* @default 50
		* @public
		*/
		rowsPerPage: 50,
		/**
		* Direction in which the list will be rendered and in which it will be
		* scrollable. Valid values are `'v'` for vertical or `'h'` for horizontal.
		*
		* @type {String}
		* @default 'v'
		* @public
		*/
		orient: 'v',
		/**
		* If `true`, the list is rendered such that row `0` is at the bottom of
		* the viewport and the beginning position of the list is scrolled to the
		* bottom.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		bottomUp: false,
		/**
		* If `true`, the selection mechanism is disabled. Tap events are still
		* sent, but items won't be automatically re-rendered when tapped.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		noSelect: false,

		/**
		 * If `true`, multiple selection is allowed.
		 *
		 * @type {Boolean}
		 * @default false
		 * @public
		 */
		multiSelect: false,

		/**
		* If `true`, the selected item will toggle.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		toggleSelected: false,

		/**
		* If `true`, the list will assume that all rows have the same size to
		* optimize performance.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		fixedSize: false,

		/**
		* If `true`, the list will allow the user to reorder list items.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		reorderable: false,

		/**
		* If `true` and `reorderable` is true, a reorderable item will be centered
		* on finger when created. If `false`, it will be created over the old item
		* and will then track finger.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		centerReorderContainer: true,

		/**
		* An array containing components to be shown as a placeholder when
		* reordering list items.
		*
		* @type {module:enyo/Control~Control[]}
		* @public
		*/
		reorderComponents: [],

		/**
		* An array containing components for the pinned version of a row. If not
		* specified, reordering will not support pinned mode.
		*
		* @type {module:enyo/Control~Control[]}
		* @public
		*/
		pinnedReorderComponents: [],

		/**
		* An array containing any swipeable components that will be used.
		*
		* @type {module:enyo/Control~Control[]}
		* @public
		*/
		swipeableComponents: [],

		/**
		* If `true`, swipe functionality is enabled.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		enableSwipe: false,

		/**
		* If `true`, the list will persist the current swipeable item.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		persistSwipeableItem: false
	},

	/**
	* @private
	*/
	events: {
		onSetupItem: '',
		onSetupReorderComponents: '',
		onSetupPinnedReorderComponents: '',
		onReorder: '',
		onSetupSwipeItem: '',
		onSwipeDrag: '',
		onSwipe: '',
		onSwipeComplete: ''
	},

	/**
	* @private
	*/
	handlers: {
		onAnimateFinish: 'animateFinish',
		onRenderRow: 'rowRendered',
		ondragstart: 'dragstart',
		ondrag: 'drag',
		ondragfinish: 'dragfinish',
		onup: 'up',
		onholdpulse: 'holdpulse',
		onflick: 'flick'
	},

	/**
	* Average row size (in pixels), calculated as `(page size / number of rows per page)`.
	*
	* @private
	*/
	rowSize: 0,

	/**
	* @private
	*/
	listTools: [
		{name: 'port', classes: 'enyo-list-port enyo-border-box', components: [
			{name: 'generator', kind: FlyweightRepeater, canGenerate: false, components: [
				{tag: null, name: 'client'}
			]},
			{name: 'holdingarea', allowHtml: true, classes: 'enyo-list-holdingarea'},
			{name: 'page0', allowHtml: true, classes: 'enyo-list-page'},
			{name: 'page1', allowHtml: true, classes: 'enyo-list-page'},
			{name: 'placeholder', classes: 'enyo-list-placeholder'},
			{name: 'swipeableComponents', style: 'position:absolute; display:block; top:-1000px; left:0;'}
		]}
	],

	//* Reorder vars

	/**
	* Length of time, in milliseconds, to wait for to active reordering.
	*
	* @type {Number}
	* @default 600
	* @private
	*/
	reorderHoldTimeMS: 600,

	/**
	* Index of the row that we're moving.
	*
	* @type {Number}
	* @default -1
	* @private
	*/
	draggingRowIndex: -1,

	/**
	* @todo Seems to be cruft ... can't find any references to it in layout.
	* @private
	*/
	initHoldCounter: 3,

	/**
	* @todo Seems to be cruft ... can't find any references to it in layout.
	* @private
	*/
	holdCounter: 3,

	/**
	* @todo Seems to be cruft ... can't find any references to it in layout.
	* @private
	*/
	holding: false,

	/**
	* Index of the row before which the placeholder item will be shown. If the
	* placeholder is at the end of the list, this value will be one larger than
	* the row count.
	*
	* @type {Number}
	* @private
	*/
	placeholderRowIndex: -1,

	/**
	* Determines scroll height at top/bottom of list where dragging will cause scroll.
	*
	* @type {Number}
	* @default 0.1
	* @private
	*/
	dragToScrollThreshold: 0.1,

	/**
	 * Amount to scroll during autoscroll.
	 *
	 * @type {Number}
	 * @default 0
	 * @private
	 */
	scrollDistance: 0,

	/**
	* Used to determine direction of scrolling during reordering.
	*
	* @private
	*/
	prevScrollTop: 0,

	/**
	* Number of milliseconds between scroll events when autoscrolling.
	*
	* @type {Number}
	* @default 20
	* @private
	*/
	autoScrollTimeoutMS: 20,

	/**
	* Holds timeout ID for autoscroll.
	*
	* @private
	*/
	autoScrollTimeout: null,

	/**
	* Keep last event Y coordinate to update placeholder position during autoscroll.
	*
	* @type {Number}
	* @private
	*/
	autoscrollPageY: 0,

	/**
	* Set to `true` to indicate that we're in pinned reordering mode.
	*
	* @type {Boolean}
	* @default false
	* @private
	*/
	pinnedReorderMode: false,

	/**
	* y-coordinate of the original location of the pinned row.
	*
	* @type {Number}
	* @private
	*/
	initialPinPosition: -1,

	/**
	* Set to `true` after drag-and-drop has moved the item to reorder at least
	* one space. Used to activate pin mode if item is dropped immediately.
	*
	* @type {Boolean}
	* @default false
	* @private
	*/
	itemMoved: false,

	/**
	* Tracks the page where the item being dragged is, so we can detect when we
	* switch pages and need to adjust rendering.
	*
	* @type {Number}
	* @private
	*/
	currentPageNumber: -1,

	/**
	* Timeout for completing reorder operation.
	*
	* @private
	*/
	completeReorderTimeout: null,

	//* Swipeable vars

	/**
	* Index of swiped item.
	*
	* @type {Number}
	* @private
	*/
	swipeIndex: null,

	/**
	* Direction of swipe.
	*
	* @type {Number}
	* @private
	*/
	swipeDirection: null,

	/**
	* `true` if a persistent item is currently persisting.
	*
	* @type {Boolean}
	* @default false
	* @private
	*/
	persistentItemVisible: false,

	/**
	* Side from which the persisting item came.
	*
	* @type {String}
	* @private
	*/
	persistentItemOrigin: null,

	/**
	* `true` if swipe was completed.
	*
	* @type {Boolean}
	* @private
	*/
	swipeComplete: false,

	/**
	* Timeout when waiting for swipe action to complete.
	*
	* @private
	*/
	completeSwipeTimeout: null,

	/**
	* Length of time (in milliseconds) to wait before completing swipe action.
	*
	* @type {Number}
	* @default 500
	* @private
	*/
	completeSwipeDelayMS: 500,

	/**
	* Duration (in milliseconds) of normal swipe animation.
	*
	* @type {Number}
	* @default 200
	* @private
	*/
	normalSwipeSpeedMS: 200,

	/**
	* Duration (in milliseconds) of fast swipe animation.
	*
	* @type {Number}
	* @default 100
	* @private
	*/
	fastSwipeSpeedMS: 100,

	/**
	* Percentage of a swipe needed to force completion of the swipe.
	*
	* @type {Number}
	* @default 0.2
	* @private
	*/
	percentageDraggedThreshold: 0.2
}));
