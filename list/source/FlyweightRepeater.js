enyo.kind({
	name: "enyo.FlyweightRepeater",
	published: {
		//* How many rows to render
		rows: 0,
		//* If true, allow multiple selections
		multiSelect: false,
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
	fetchRowNode: function(inIndex) {
		if (this.hasNode()) {
			var n$ = this.node.querySelectorAll('[index="' + inIndex + '"]');
			return n$ && n$[0];
		}
	},
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