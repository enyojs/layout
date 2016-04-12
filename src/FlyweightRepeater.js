/**
* Contains the declaration for the {@link module:layout/FlyweightRepeater~FlyweightRepeater} kind.
* @module layout/FlyweightRepeater
*/

var
	kind = require('enyo/kind'),
	dom = require('enyo/dom'),
	utils = require('enyo/utils'),
	Control = require('enyo/Control'),
	HTMLStringDelegate = require('enyo/HTMLStringDelegate'),
	Selection = require('enyo/Selection');

var FlyweightRepeaterDelegate = Object.create(HTMLStringDelegate);

FlyweightRepeaterDelegate.generateInnerHtml = function (control) {
	var h = '';
	control.index = null;
	// note: can supply a rowOffset
	// and indicate if rows should be rendered top down or bottomUp
	for (var i=0, r=0; i<control.count; i++) {
		r = control.rowOffset + (this.bottomUp ? control.count - i-1 : i);
		control.setupItem(r);
		control.$.client.setAttribute('data-enyo-index', r);
		if (control.orient == 'h') {
			control.$.client.setStyle('display:inline-block;');
		}
		h += HTMLStringDelegate.generateChildHtml(control);
		control.$.client.teardownRender();
	}
	return h;
};

/**
* Fires once per row at render time.
*
* @event module:layout/FlyweightRepeater~FlyweightRepeater#onSetupItem
* @type {Object}
* @property {Number} index     - The index of the row being rendered.
* @property {Boolean} selected - `true` if the row is selected; otherwise, `false`.
* @public
*/

/**
* Fires after an individual row has been rendered.
*
* @event module:layout/FlyweightRepeater~FlyweightRepeater#onRenderRow
* @type {Object}
* @property {Number} rowIndex - The index of the row that was rendered.
* @public
*/

/**
* {@link module:layout/FlyweightRepeater~FlyweightRepeater} is a control that displays a repeating list of
* rows, suitable for displaying medium-sized lists (up to ~100 items). A
* flyweight strategy is employed to render one set of row controls, as needed,
* for as many rows as are contained in the repeater.
*
* The FlyweightRepeater's `components` block contains the controls to be used
* for a single row. This set of controls will be rendered for each row. You
* may customize row rendering by handling the
* [onSetupItem]{@link module:layout/FlyweightRepeater~FlyweightRepeater#onSetupItem} event.
*
* The controls inside a FlyweightRepeater are non-interactive. This means that
* calling methods that would normally cause rendering to occur (e.g.,
* `set('content', <value>)`) will not do so. However, you may force a row to
* render by calling [renderRow()]{@link module:layout/FlyweightRepeater~FlyweightRepeater#renderRow}.
*
* In addition, you may force a row to be temporarily interactive by calling
* [prepareRow()]{@link module:layout/FlyweightRepeater~FlyweightRepeater#prepareRow}. Call
* [lockRow()]{@link module:layout/FlyweightRepeater~FlyweightRepeater#lockRow} when the interaction
* is complete.
*
* For more information, see the documentation on
* [Lists]{@linkplain $dev-guide/building-apps/layout/lists.html} in the
* Enyo Developer Guide.
*
* @class FlyweightRepeater
* @extends module:enyo/Control~Control
* @ui
* @public
*/
var FlyweightRepeater = module.exports = kind(
	/** @lends module:layout/FlyweightRepeater~FlyweightRepeater.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.FlyweightRepeater',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @lends module:layout/FlyweightRepeater~FlyweightRepeater.prototype
	* @private
	*/
	published: {
		/**
		 * The number of rows to render.
		 *
		 * @type {Number}
		 * @default 0
		 * @public
		 */
		count: 0,

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
		* Used to specify CSS classes for the repeater's wrapper component (client).
		* Input is identical to that of {@link module:enyo/Control~Control#setClasses}.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		clientClasses: '',

		/**
		* Used to specify custom styling for the repeater's wrapper component
		* (client). Input is identical to that of {@link module:enyo/Control~Control#setStyle}.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		clientStyle: '',

		/**
		* Numerical offset applied to row number during row generation. Allows items
		* to have natural indices instead of `0`-based ones. This value must be
		* positive, as row number `-1` is used to represent undefined rows in the
		* event system.
		*
		* @type {Number}
		* @default 0
		* @public
		*/
		rowOffset: 0,

		/**
		* Direction in which items will be laid out. Valid values are `'v'` for
		* vertical or `'h'` for horizontal.
		*
		* @type {String}
		* @default 'h'
		* @public
		*/
		orient: 'v'
	},

	/**
	* @private
	*/
	events: {
		onSetupItem: '',
		onRenderRow: ''
	},

	/**
	* Setting cachePoint: true ensures that events from the repeater's subtree will
	* always bubble up through the repeater, allowing the events to be decorated with repeater-
	* related metadata and references.
	*
	* @type {Boolean}
	* @default true
	* @private
	*/
	cachePoint: true,

	/**
	* Design-time attribute indicating whether row indices run
	* from `0` to [`count`]{@link module:layout/FlyweightRepeater~FlyweightRepeater#count}`-1` `(false)` or
	* from [`count`]{@link module:layout/FlyweightRepeater~FlyweightRepeater#count}`-1` to `0` `(true)`.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	bottomUp: false,

	/**
	* @private
	*/
	renderDelegate: FlyweightRepeaterDelegate,

	/**
	* @private
	*/
	components: [
		{kind: Selection, onSelect: 'selectDeselect', onDeselect: 'selectDeselect'},
		{name: 'client'}
	],

	/**
	* @method
	* @private
	*/
	create: function () {
		Control.prototype.create.apply(this, arguments);
		this.noSelectChanged();
		this.multiSelectChanged();
		this.clientClassesChanged();
		this.clientStyleChanged();
	},

	/**
	* @private
	*/
	noSelectChanged: function () {
		if (this.noSelect) {
			this.$.selection.clear();
		}
	},

	/**
	* @private
	*/
	multiSelectChanged: function () {
		this.$.selection.setMulti(this.multiSelect);
	},

	/**
	* @private
	*/
	clientClassesChanged: function () {
		this.$.client.setClasses(this.clientClasses);
	},

	/**
	* @private
	*/
	clientStyleChanged: function () {
		this.$.client.setStyle(this.clientStyle);
	},

	/**
	* @fires module:layout/FlyweightRepeater~FlyweightRepeater#onSetupItem
	* @private
	*/
	setupItem: function (index) {
		this.doSetupItem({index: index, selected: this.isSelected(index)});
	},

	/**
	* Renders the list.
	*
	* @private
	*/
	generateChildHtml: function () {
		return this.renderDelegate.generateInnerHtml(this);
	},

	/**
	* @todo add link to preview.js
	* @private
	*/
	previewDomEvent: function (event) {
		var i = this.index = this.rowForEvent(event);
		event.rowIndex = event.index = i;
		event.flyweight = this;
	},

	/**
	* @method
	* @private
	*/
	decorateEvent: function (eventName, event, sender) {
		// decorate event with index found via dom iff event does not already contain an index.
		var i = (event && event.index != null) ? event.index : this.index;
		if (event && i != null) {
			event.index = i;
			event.flyweight = this;
		}
		Control.prototype.decorateEvent.apply(this, arguments);
	},

	/**
	* @private
	*/
	tap: function (sender, event) {
		// ignore taps if selecting is disabled or if they don't target a row
		if (this.noSelect || event.index === -1) {
			return;
		}
		if (this.toggleSelected) {
			this.$.selection.toggle(event.index);
		} else {
			this.$.selection.select(event.index);
		}
	},

	/**
	* Handler for selection and deselection.
	*
	* @private
	*/
	selectDeselect: function (sender, event) {
		this.renderRow(event.key);
	},

	/**
	* Returns the repeater's [selection]{@link module:enyo/Selection~Selection} component.
	*
	* @return {module:enyo/Selection~Selection} The repeater's selection component.
	* @public
	*/
	getSelection: function () {
		return this.$.selection;
	},

	/**
	* Gets the selection state for the given row index.
	*
	* @return {Boolean} `true` if the row is currently selected; otherwise, `false`.
	* @public
	*/
	isSelected: function (index) {
		return this.getSelection().isSelected(index);
	},

	/**
	* Renders the row with the specified index.
	*
	* @param {Number} index - The index of the row to render.
	* @fires module:layout/FlyweightRepeater~FlyweightRepeater#onRenderRow
	* @public
	*/
	renderRow: function (index) {
		// do nothing if index is out-of-range
		if (index < this.rowOffset || index >= this.count + this.rowOffset) {
			return;
		}
		//this.index = null;
		// always call the setupItem callback, as we may rely on the post-render state
		this.setupItem(index);
		var node = this.fetchRowNode(index);
		if (node) {
			// hack to keep this working...
			var delegate = HTMLStringDelegate;

			dom.setInnerHtml(node, delegate.generateChildHtml(this.$.client));
			this.$.client.teardownChildren();
			this.doRenderRow({rowIndex: index});
		}
	},

	/**
	* Fetches the DOM node for the given row index.
	*
	* @param {Number} index - The index of the row whose DOM node is to be fetched.
	* @return {Node} The DOM node for the specified row.
	* @public
	*/
	fetchRowNode: function (index) {
		if (this.hasNode()) {
			return this.node.querySelector('[data-enyo-index="' + index + '"]');
		}
	},

	/**
	* Fetches the row number corresponding to the target of a given event.
	*
	* @param {Object} event - Event object.
	* @return {Number} The index of the row corresponding to the event's target.
	* @public
	*/
	rowForEvent: function (event) {
		if (!this.hasNode()) {
			return -1;
		}
		var n = event.target;
		while (n && n !== this.node) {
			var i = n.getAttribute && n.getAttribute('data-enyo-index');
			if (i !== null) {
				return Number(i);
			}
			n = n.parentNode;
		}
		return -1;
	},

	/**
	* Prepares the specified row such that changes made to the controls inside
	* the repeater will be rendered for the row.
	*
	* @param {Number} index - The index of the row to be prepared.
	* @public
	*/
	prepareRow: function (index) {
		// do nothing if index is out-of-range
		if (index < this.rowOffset || index >= this.count + this.rowOffset) {
			return;
		}
		// update row internals to match model
		this.setupItem(index);
		var n = this.fetchRowNode(index);
		FlyweightRepeater.claimNode(this.$.client, n);
	},

	/**
	* Prevents rendering of changes made to controls inside the repeater.
	*
	* @public
	*/
	lockRow: function () {
		this.$.client.teardownChildren();
	},

	/**
	* Prepares the specified row such that changes made to the controls in the
	* repeater will be rendered in the row; then performs the function `func`
	* and, finally, locks the row.
	*
	* @param {Number} index   - The index of the row to be acted upon.
	* @param {Function} func  - The function to perform.
	* @param {Object} context - The context to which `func` is bound.
	* @private
	*/
	performOnRow: function (index, func, context) {
		// do nothing if index is out-of-range
		if (index < this.rowOffset || index >= this.count + this.rowOffset) {
			return;
		}
		if (func) {
			this.prepareRow(index);
			utils.call(context || null, func);
			this.lockRow();
		}
	},

	/**
	* @lends module:layout/FlyweightRepeater~FlyweightRepeater
	* @private
	*/
	statics: {
		/**
		* Associates a flyweight rendered control (`control`) with a
		* rendering context specified by `node`.
		*
		* @param {module:enyo/Control~Control} control - A flyweight-rendered control.
		* @param {Node} node - The DOM node to be associated with `control`.
		* @public
		*/
		claimNode: function (control, node) {
			var n;
			if (node) {
				if (node.id !== control.id) {
					n = node.querySelector('#' + control.id);
				} else {
					// node is already the right node, so just use it
					n = node;
				}
			}
			// FIXME: consider controls generated if we found a node or tag: null, the later so can teardown render
			control.generated = Boolean(n || !control.tag);
			control.node = n;
			if (control.node) {
				control.rendered();
			} else {
				//enyo.log('Failed to find node for',  control.id, control.generated);
			}
			// update control's class cache based on the node contents
			for (var i=0, c$=control.children, c; (c=c$[i]); i++) {
				this.claimNode(c, node);
			}
		}
	}
});
