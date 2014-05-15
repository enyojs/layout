/**
	_enyo.GridLayout_ arranges the container's child components in a left-to-right,
	top-to-bottom grid using inline-block static layout.  The grid maintains fixed
	spacing between items based on the `spacing` container property, and resizes children
	to maintain aspect ratio set by the `minWidth` and `minHeight` container properties
	in order to fill a complete row with no white-space (other than the inter-item spacing),
	determining the number of columns that will fit on a row based on the `minWidth`
	and `spacing` properties.
*/

enyo.kind({
	name: 'enyo.GridLayout',
	kind: 'Layout',
	layoutClass: "enyo-grid-layout",

	//* @public
	/**
		Updates the layout to reflect any changes to contained components or the
		layout container.
	*/
	reflow: function() {
		var bs = this.container.getBounds(),
			bp = enyo.dom.calcPaddingExtents(this.container.hasNode()),
			w  = bs.width - bp.left - bp.right,
			s  = this.container.spacing || 10,
			m  = this.container.minWidth || 200,
			h  = this.container.minHeight || 200,
			c$ = this.container.children;
		// the number of columns is the ratio of the available width minus the spacing
		// by the minimum tile width plus the spacing
		var columns    = Math.max(Math.floor((w-s) / (m+s)), 1);
		// the actual tile width is a ratio of the remaining width after all columns
		// and spacing are accounted for and the number of columns that we know we should have
		var tileWidth  = Math.floor((w-(s*(columns-1)))/columns);
		// the actual tile height is related to the tile width
		var tileHeight = Math.floor(h*(tileWidth/m));

		for (var i=0; i<c$.length; i++) {
			var c = c$[i];
			c.applyStyle("width", tileWidth + "px");
			c.applyStyle("height", tileHeight + "px");
			c.applyStyle("margin-top", i<columns ? "0" : Math.floor(s/2) + "px");
			c.applyStyle("margin-left", (i%columns === 0) ? "0px" : Math.floor(s/2) + "px");
			c.applyStyle("margin-right", (i%columns == (columns-1)) ? "0px" : Math.floor(s/2) + "px");
			c.applyStyle("margin-bottom", i >= Math.floor(c$.length/columns)*columns ? "0px" : Math.floor(s/2) + "px");
		}
	}
});
