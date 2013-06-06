/**
 * enyo.ResponseStrategy kind definition
 * @author: Lex Podgorny
 */

enyo.kind({
	name: 'enyo.ResponseStrategy',
	kind: null,
	
	respond: function() {
		if (this.layout.container.$.block2) { 
			if (this.layout.container.$.block2.flexOrient == 'column') {
				if (document.body.offsetWidth < 1400) {
					this.layout.container.$.block2.flexOrient = 'row';
					enyo.Styles.setStyles(this.layout.container.$.block2, {width: 'auto'});
					this.layout.reflow(true);
				}
			} else {
				if (document.body.offsetWidth > 1400) {
					this.layout.container.$.block2.flexOrient = 'column';
					enyo.Styles.setStyles(this.layout.container.$.block2, {width: 'auto'});
					this.layout.reflow(true);
				}
			}
		}
	}
});