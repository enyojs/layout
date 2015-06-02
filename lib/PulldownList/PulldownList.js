/**
* Contains the declaration for the {@link module:layout/PulldownList~PulldownList} kind.
* @module layout/PulldownList
*/

var
	dom = require('enyo/dom'),
	kind = require('enyo/kind'),
	platform = require('enyo/platform'),
	TouchScrollStrategy = require('enyo/TouchScrollStrategy'),
	TranslateScrollStrategy = require('enyo/TranslateScrollStrategy');

var
	List = require('../List'),
	Puller = require('./Puller');

/**
* Fires when user initiates a pull action. No additional data is included with
* this event.
*
* @event module:layout/PulldownList~PulldownList#onPullStart
* @type {Object}
* @public
*/

/**
* Fires when user cancels a pull action. No additional data is included with
* this event.
*
* @event module:layout/PulldownList~PulldownList#onPullCancel
* @type {Object}
* @public
*/

/**
* Fires while a pull action is in progress. No additional data is included with
* this event.
*
* @event module:layout/PulldownList~PulldownList#onPull
* @type {Object}
* @public
*/

/**
* Fires when the list is released following a pull action, indicating
* that we are ready to retrieve data. No additional data is included with
* this event.
*
* @event module:layout/PulldownList~PulldownList#onPullRelease
* @type {Object}
* @public
*/

/**
* Fires when data retrieval is complete, indicating that the data is
* is ready to be displayed. No additional data is included with
* this event.
*
* @event module:layout/PulldownList~PulldownList#onPullComplete
* @type {Object}
* @public
*/

/**
* {@link module:layout/PulldownList~PulldownList} is a list that provides a pull-to-refresh feature, which
* allows new data to be retrieved and updated in the list.
*
* PulldownList provides the [onPullRelease]{@link module:layout/PulldownList~PulldownList#onPullRelease}
* event to allow an application to start retrieving new data.  The
* [onPullComplete]{@link module:layout/PulldownList~PulldownList#onPullComplete} event indicates that
* the pull is complete and it's time to update the list with the new data.
*
* ```
* {name: 'list', kind: 'PulldownList', onSetupItem: 'setupItem',
* 	onPullRelease: 'pullRelease', onPullComplete: 'pullComplete',
* 	components: [
* 		{name: 'item'}
* 	]
* }
*
* pullRelease: function () {
* 	this.search();
* },
* processSearchResults: function (inRequest, inResponse) {
* 	this.results = inResponse.results;
* 	this.$.list.setCount(this.results.length);
* 	this.$.list.completePull();
* },
* pullComplete: function () {
* 	this.$.list.reset();
* }
* ```
*
* @class PulldownList
* @extends module:layout/List~List
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:layout/PulldownList~PulldownList.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.PulldownList',

	/**
	* @private
	*/
	kind: List,

	/**
	* Sets `touch` to `true` in inherited Scroller kind for touch-based scrolling strategy.
	*
	* @see {@link module:enyo/Scroller~Scroller#touch}
	* @type {Boolean}
	* @default true
	* @public
	*/
	touch: true,

	/**
	* The pull notification area at the top of the list.
	*
	* @type {module:enyo/Control~Control}
	* @default null
	* @private
	*/
	pully: null,

	/**
	* @private
	*/
	pulldownTools: [
		{name: 'pulldown', classes: 'enyo-list-pulldown', components: [
			{name: 'puller', kind: Puller}
		]}
	],

	/**
	* @private
	*/
	events: {
		//* Fires when user initiates a pull action.
		onPullStart: '',
		//* Fires when user cancels a pull action.
		onPullCancel: '',
		//* Fires while a pull action is in progress.
		onPull: '',
		//* Fires when the list is released following a pull action, indicating
		//* that we are ready to retrieve data.
		onPullRelease: '',
		//* Fires when data retrieval is complete, indicating that the data is
		//* is ready to be displayed.
		onPullComplete: ''
	},

	/**
	* @private
	*/
	handlers: {
		onScrollStart: 'scrollStartHandler',
		onScrollStop: 'scrollStopHandler',
		ondragfinish: 'dragfinish'
	},

	/**
	* Message displayed when list is not being pulled.
	*
	* @type {String}
	* @default 'Pull down to refresh...'
	* @public
	*/
	pullingMessage: 'Pull down to refresh...',

	/**
	* Message displayed while a pull action is in progress.
	*
	* @type {String}
	* @default 'Release to refresh...'
	* @public
	*/
	pulledMessage: 'Release to refresh...',

	/**
	* Message displayed while data is being retrieved.
	*
	* @type {String}
	* @default 'Loading...'
	* @public
	*/
	loadingMessage: 'Loading...',

	/**
	* @private
	*/
	pullingIconClass: 'enyo-puller-arrow enyo-puller-arrow-down',

	/**
	* @private
	*/
	pulledIconClass: 'enyo-puller-arrow enyo-puller-arrow-up',

	/**
	* @private
	*/
	loadingIconClass: '',

	/**
	* @method
	* @private
	*/
	create: function () {
		var p = {kind: Puller, showing: false, text: this.loadingMessage, iconClass: this.loadingIconClass, onCreate: 'setPully'};
		this.listTools.splice(0, 0, p);
		List.prototype.create.apply(this, arguments);
		this.setPulling();
	},

	/**
	* @method
	* @private
	*/
	initComponents: function () {
		this.createChrome(this.pulldownTools);
		this.accel = dom.canAccelerate();
		this.translation = this.accel ? 'translate3d' : 'translate';
		this.strategyKind = this.resetStrategyKind();
		List.prototype.initComponents.apply(this, arguments);
	},

	/**
	* Temporarily use TouchScrollStrategy on iOS devices (see ENYO-1714).
	*
	* @private
	*/
	resetStrategyKind: function () {
		return (platform.android >= 3)
			? TranslateScrollStrategy
			: TouchScrollStrategy;
	},

	/**
	* @private
	*/
	setPully: function (sender, event) {
		this.pully = event.originator;
	},

	/**
	* @private
	*/
	scrollStartHandler: function () {
		this.firedPullStart = false;
		this.firedPull = false;
		this.firedPullCancel = false;
	},

	/**
	* Monitors the scroll position to display and position the
	* [pully]{@link module:layout/PulldownList~PulldownList#pully}.
	*
	* @see {@link module:enyo/Scroller~Scroller#scroll}
	* @method
	* @private
	*/
	scroll: function (sender, event) {
		var r = List.prototype.scroll.apply(this, arguments);
		if (this.completingPull) {
			this.pully.setShowing(false);
		}
		var s = this.getStrategy().$.scrollMath || this.getStrategy();
		var over = -1*this.getScrollTop();
		if (s.isInOverScroll() && over > 0) {
			dom.transformValue(this.$.pulldown, this.translation, '0,' + over + 'px' + (this.accel ? ',0' : ''));
			if (!this.firedPullStart) {
				this.firedPullStart = true;
				this.pullStart();
				this.pullHeight = this.$.pulldown.getBounds().height;
			}
			if (over > this.pullHeight && !this.firedPull) {
				this.firedPull = true;
				this.firedPullCancel = false;
				this.pull();
			}
			if (this.firedPull && !this.firedPullCancel && over < this.pullHeight) {
				this.firedPullCancel = true;
				this.firedPull = false;
				this.pullCancel();
			}
		}
		return r;
	},

	/**
	* @private
	*/
	scrollStopHandler: function () {
		if (this.completingPull) {
			this.completingPull = false;
			this.doPullComplete();
		}
	},

	/**
	* If the pull has been fired, offset the scroll top by the height of the
	* [pully]{@link module:layout/PulldownList~PulldownList#pully} until
	* [completePull()]{@link module:layout/PulldownList~PulldownList#completePull} is called.
	*
	* @private
	*/
	dragfinish: function () {
		if (this.firedPull) {
			var s = this.getStrategy().$.scrollMath || this.getStrategy();
			s.setScrollY(-1*this.getScrollTop() - this.pullHeight);
			this.pullRelease();
		}
	},

	/**
	* Signals that the list should execute pull completion. This is usually
	* called after the application has received new data.
	*
	* @public
	*/
	completePull: function () {
		this.completingPull = true;
		var s = this.getStrategy().$.scrollMath || this.getStrategy();
		s.setScrollY(this.pullHeight);
		s.start();
	},

	/**
	* @fires module:layout/PulldownList~PulldownList#onPullStart
	* @private
	*/
	pullStart: function () {
		this.setPulling();
		this.pully.setShowing(false);
		this.$.puller.setShowing(true);
		this.doPullStart();
	},

	/**
	* @fires module:layout/PulldownList~PulldownList#onPull
	* @private
	*/
	pull: function () {
		this.setPulled();
		this.doPull();
	},

	/**
	* @fires module:layout/PulldownList~PulldownList#onPullCancel
	* @private
	*/
	pullCancel: function () {
		this.setPulling();
		this.doPullCancel();
	},

	/**
	* @fires module:layout/PulldownList~PulldownList#onPullRelease
	* @private
	*/
	pullRelease: function () {
		this.$.puller.setShowing(false);
		this.pully.setShowing(true);
		this.doPullRelease();
	},

	/**
	* @private
	*/
	setPulling: function () {
		this.$.puller.setText(this.pullingMessage);
		this.$.puller.setIconClass(this.pullingIconClass);
	},

	/**
	* @private
	*/
	setPulled: function () {
		this.$.puller.setText(this.pulledMessage);
		this.$.puller.setIconClass(this.pulledIconClass);
	}
});

/**
* The {@link module:layout/PulldownList/Puller~Puller} declaration used by the PulldownList.
* @public
*/
module.exports.Puller = Puller;
