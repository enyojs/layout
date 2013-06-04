
enyo.kind({
	name       : 'enyo.sample.ContentLayoutSample',
	classes    : 'content-layout-sample fit-true',
	components : [
		{
			name       : 'button1',
			kind       : 'Button',
			content    : 'Add content',
			ontap      : 'appendContent'
		},{
			name       : 'contentBox',
			layoutKind : 'ContentLayout',
			minWidth   : 100,
			minHeight  : 100,
			maxWidth   : 300,
			maxHeight  : 300
		}
	],

	appendContent: function() {
		this.$.contentBox.addContent('word1 word2 word3 ');
		// this.$.contentBox.addContent('word1 word2 word3 ');
		this.$.contentBox.layout.reflow();
	},
	
	rendered: function() {
		this.inherited(arguments);
	}
});