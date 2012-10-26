enyo.kind({
	name: "enyo.ImageViewPin",
	kind: "enyo.Control",
	highlightAnchorPoint: true,  // <-- Highlight the anchor point for this pin - useful for debugging
	published: {
		anchor: {
			top: 0,
			left: 0
		},
		position: {
			top: 0,
			left: 0
		}
	},
	style: "position:absolute;z-index:1000;width:0px;height:0px;",
	create: function() {
		this.inherited(arguments);
		this.styleClientControls();
		this.positionClientControls();
		this.reAnchor(1,{width:0, height:0, x:0, y:0});
		this.highlightAnchorPointChanged();
	},
	styleClientControls: function() {
		var controls = this.getClientControls();
		for(var i=0;i<controls.length;i++) {
			controls[i].applyStyle("position","absolute");
		}
	},
	positionClientControls: function() {
		var controls = this.getClientControls();
		for(var i=0;i<controls.length;i++) {
			for(p in this.position) {
				controls[i].applyStyle(p, this.position[p]+"px");
			}
		}
	},
	reAnchor: function(scale, bounds) {
		var left = (this.anchor.right)
			? (bounds.width + bounds.x - this.anchor.right*scale)
			: this.anchor.left*scale + bounds.x;
		var top = (this.anchor.bottom)
			? (bounds.height + bounds.y - this.anchor.bottom*scale)
			: this.anchor.top*scale + bounds.y;
		
		this.applyStyle("left", left+"px");
		this.applyStyle("top", top+"px");
	},
	highlightAnchorPointChanged: function() {
		var bkgnd = (this.highlightAnchorPoint) ? "yellow" : "transparent";
		var border = (this.highlightAnchorPoint) ? "1px solid yellow" : "none";
		this.applyStyle("background",bkgnd);
		this.applyStyle("border",border);
	}
});