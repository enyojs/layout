/**
A control that displays a repeating list of rows. It is suitable for displaying medium-sized
lists (maximum of ~100 items). A flyweight strategy is employed to render one 
set of row controls as needed for as many rows as are contained in the repeater.

##Basic Use

A FlyweightRepeater's components block contains the controls to be used for a single row.
This set of controls will be rendered for each row.

The onSetupRow event allows for customization of row rendering. Here's a simple example:

	components: [
		{kind: "FlyweightRepeater", rows: 100, onSetupRow: "setupRow", components: [
			{name: "item"}
		]}
	],
	setupRow: function(inSender, inEvent) {
		this.$.item.setContent("I am row: " + inEvent.index);
	}
	
##Modifying Rows

Controls inside a FlyweightRepeater are non-interactive. This means that outside the onSetupRow event, 
calling methods that would otherwise cause rendering to occur will not do so (e.g. setContent).
A row can be forced to render by calling the renderRow(inRow) method. In addition, a row can be 
temporarily made interactive by calling the prepareRow(inRow) method. When interaction is complete, the
lockRow method should be called.

*/
enyo.kind({
	name: "enyo.FlyweightRepeater",
	published: {
		//* How many rows to render
		rows: 0,
		//* If true, allow multiple selections
		multiSelect: false,
		//* If true, the selected item will toggle
		toggleSelected: false
	},
	events: {
		//* Fired once per row at render-time, with event object: {index: <index of row>}
		onSetupRow: ""
	},
	components: [
		{kind: "Selection", onSelect: "selectDeselect", onDeselect: "selectDeselect"},
		{name: "client"}
	],
	rowOffset: 0,
	bottomUp: false,
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.multiSelectChanged();
	},
	multiSelectChanged: function() {
		this.$.selection.setMulti(this.multiSelect);
	},
	//* Render the list
	generateChildHtml: function() {
		var h = "";
		// note: can supply a rowOffset 
		// and indicate if rows should be rendered top down or bottomUp
		for (var i=0, r=0; i<this.rows; i++) {
			r = this.rowOffset + (this.bottomUp ? this.rows - i-1 : i);
			this.doSetupRow({index: r});
			this.$.client.setAttribute("index", r);
			h += this.inherited(arguments);
			this.$.client.teardownRender();
		}
		return h;
	},
	previewDomEvent: function(inEvent) {
		inEvent.rowIndex = inEvent.index = this.rowForEvent(inEvent);
		inEvent.repeater = this;
	},
	tap: function(inSender, inEvent) {
		if (this.toggleSelected) {
			this.$.selection.toggle(inEvent.index);
		} else {
			this.$.selection.select(inEvent.index);
		}
	},
	selectDeselect: function(inSender, inEvent) {
		this.renderRow(inEvent.key);
	},
	//* @public
	// return the repeater's <a href="#enyo.Selection">selection</a> component
	getSelection: function() {
		return this.$.selection;
	},
	//* Get the selection state for the given row index.
	isSelected: function(inIndex) {
		return this.getSelection().isSelected(inIndex);
	},
	//* Render the row specified by inIndex.
	renderRow: function(inIndex) {
		var node = this.fetchRowNode(inIndex);
		if (node) {
			this.doSetupRow({index: inIndex});
			node.innerHTML = this.$.client.generateChildHtml();
			this.$.client.teardownChildren();
		}
	},
	//* Fetch the dom node for the given row index.
	fetchRowNode: function(inIndex) {
		if (this.hasNode()) {
			var n$ = this.node.querySelectorAll('[index="' + inIndex + '"]');
			return n$ && n$[0];
		}
	},
	//* Fetch the dom node for the given event.
	rowForEvent: function(inEvent) {
		var n = inEvent.target;
		while (n && n.parentNode && n.id != this.id) {
			n = n.parentNode;
			var i = n.getAttribute("index");
			if (i !== null) {
				return Number(i);
			}
		}
		return -1;
	},
	//* Prepare the row specified by inIndex such that changes effected on the 
	//* controls inside the repeater will be rendered for the given row.
	prepareRow: function(inIndex) {
		var n = this.fetchRowNode(inIndex);
		enyo.FlyweightRepeater.claimNode(this.$.client, n);
	},
	//* Prevent changes to the controls inside the repeater from being rendered
	lockRow: function() {
		this.$.client.teardownChildren();
	},
	//* Prepare the row specified by inIndex such that changes effected on the 
	//* controls in the row will be rendered in the given row; then perform
	//* the function inFunc; finally lock the row.
	performOnRow: function(inIndex, inFunc, inContext) {
		if (inFunc) {
			this.prepareRow(inIndex);
			enyo.call(inContext || null, inFunc);
			this.lockRow();
		}
	},
	statics: {
		//* Associate a flyweight rendered control (inControl) with a rendering context specified by inNode
		claimNode: function(inControl, inNode) {
			var n = inNode && inNode.querySelectorAll("#" + inControl.id);
			n = n && n[0];
			// FIXME: consider controls generated if we found a node or tag: null, the later so can teardown render
			inControl.generated = Boolean(n || !inControl.tag);
			inControl.node = n;
			if (inControl.node) {
				inControl.rendered();
			} else {
				//enyo.log("Failed to find node for",  inControl.id, inControl.generated);
			}
			for (var i=0, c$=inControl.children, c; c=c$[i]; i++) {
				this.claimNode(c, inNode);
			}
		}
	}
});