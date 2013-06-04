/**
 * enyo.FlexBox kind definition
 * @author: Lex Podgorny
 */

enyo.kind({
	name : 'enyo.FlexBox',
	kind : 'enyo.VFlexBox',
	
	_bDidReflow: false,
	
	_isColumn: function(oControl) {
		return (
			typeof oControl.flexOrientation != 'undefined' && 
			oControl.flexOrientation        == 'column'
		);
	},
	
	reflow: function() {
		if (this._bDidReflow) {                          // Prevent circular calls from render()
			this._bDidReflow = false;
			return this.inherited(arguments);
		}
		
		var n = 0,
			oControl,
			oCurrentHFlexBox,
			bInRow = false,
			aChildren = [];
			
		while (this.children.length > 0) {
			oControl = this.children[0];
			aChildren.push(oControl);
			console.log('Removing child', oControl.name);
			this.removeChild(oControl);
		}

		for (;n<aChildren.length; n++) {
			oControl = aChildren[n];
			if (this._isColumn(oControl)) {
				if (!bInRow) {
					oCurrentHFlexBox = this.createComponent({kind: enyo.HFlexBox, flex: true, spacing: this.spacing}, {owner: this});
					console.log('created', oCurrentHFlexBox.kindName);
					bInRow = true;
				}
				console.log('moving', oControl.name);
				oControl.setOwner(oCurrentHFlexBox);
				oCurrentHFlexBox.addChild(oControl);
				console.log(oCurrentHFlexBox.children.length);
			} else {
				oControl.setOwner(this);
				this.addChild(oControl);
				bInRow = false;
			}
			
		}
		this._bDidReflow = true;
		if (oCurrentHFlexBox) {
			oCurrentHFlexBox.reflow();
		}
		console.log('render');
		this.inherited(arguments);
		this.render();
		this.layout.reflow();
		console.log('The End');
	}
});