enyo.kind({
	name : 'FlexLayoutSample',
	layoutKind: 'HFlexLayout',
	textFields: ['col2', 'col3', 'col4', 'row1', 'row3', 'row4', 'row5', 'col2_1', 'col2_2', 'col2_3'],
	components: [
		{name: 'col1', content: 'column 1', classes: 'column', components: [
			{name: 'button1', kind: 'Button', content: 'Add content', ontap: 'appendContent'}
		]},
		{name: 'col2', layoutKind: 'VFlexLayout', flex: true, components: [
			{name: 'row1', content: 'row 1', classes: 'row'},
			{name: 'row2', flex: true},
			{name: 'row3', layoutKind: 'HFlexLayout', flex: true, components: [
				{name: 'col2_1', content: 'column 2_1', classes: 'column'},
				{name: 'col2_2', content: 'column 2_2', flex: true},
				{name: 'col2_3', content: 'column 2_3', classes: 'column'},
			]},
			{name: 'row4', content: 'row 4', classes: 'row'},
			{name: 'row5', content: 'row 5', classes: 'row'},
		], style: 'padding: 0'},
		{name: 'col3', content: 'column 3', classes: 'column'},
		{name: 'col4', content: 'column 4', flex: true}
	],

	appendContent: function() {
		// this.$.row2.addContent('asdf');
		this.$.row2.addComponent(this.createComponent({
			// kind: 'Image', src: 'duck.jpg'
			content: 'Hello'
		}));
	},

	rendered: function() {
		this.inherited(arguments);
		for (var s in this.textFields) {
			this.$[this.textFields[s]].setContent(sLoremIpsum);
		}
	}


});