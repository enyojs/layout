enyo.kind({
	name : 'FlexLayoutSample',
	layoutKind: 'HFlexLayout',
	textFields: ['col2', 'col4', 'row1', 'row3', 'row4', 'row5', 'col2_1', 'col2_2', 'col2_3'],
	components: [
		{name: 'col1', content: 'column 1', classes: 'column', components: [
			{name: 'button1', kind: 'Button', content: 'Add row content', ontap: 'appendRowContent'},
			{name: 'button2', kind: 'Button', content: 'Add column content', ontap: 'appendColumnContent'}
		]},
		{name: 'col2', layoutKind: 'VFlexLayout', flex: true, components: [
			{name: 'row1', content: 'row 1'},
			{name: 'row2', flex: true},
			{name: 'row3', layoutKind: 'HFlexLayout', flex: true, components: [
				{name: 'col2_1', content: 'column 2_1', classes: 'column'},
				{name: 'col2_2', content: 'column 2_2', flex: true},
				{name: 'col2_3', content: 'column 2_3', classes: 'column'},
			]},
			{name: 'row4', content: 'row 4', classes: 'row'},
			{name: 'row5', content: 'row 5', classes: 'row'},
		], style: 'padding: 0'},
		{name: 'col3', content: 'column 3', style:"white-space:nowrap;", content:"Foo"},
		{name: 'col4', content: 'column 4', flex: true}
	],

	appendRowContent: function() {
		console.log('appendComponent');
		this.$.row1.createComponent({content:"More content LA LA LA LA LA!"}).render();
	},

	appendColumnContent: function() {
		console.log('appendComponent');
		this.$.col3.addContent(" Bar Foo").render();
	},

	rendered: function() {
		this.inherited(arguments);
		for (var s in this.textFields) {
			this.$[this.textFields[s]].setContent(sLoremIpsum);
		}
	}


});