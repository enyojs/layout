
enyo.kind({
	name : 'enyo.sample.FlexLayoutSample',
	classes: 'flex-layout-sample enyo-fit',
	layoutKind: 'HFlexLayout',
	textFields: ['col1', 'col2', 'col4', 'row1', 'row2', 'row3', 'row4', 'row5', 'col2_1', 'col2_2', 'col2_3'],
	components: [
		{name: 'col1', content: 'column 1', classes: 'column'},
		{name: 'col2', layoutKind: 'VFlexLayout', flex: true, components: [
			{name: 'row1', content: 'row 1', components: [
				{name: 'button1', kind: 'Button', content: 'Add content', ontap: 'appendContent1'},
				{name: 'content1'}
			]},
			{name: 'row2', flex: true},
			{name: 'row3', layoutKind: 'HFlexLayout', flex: true, components: [
				{name: 'col2_1', content: 'column 2_1', classes: 'column'},
				{name: 'col2_2', content: 'column 2_2', flex: true, components: [
					{name: 'button2', kind: 'Button', content: 'Add content', ontap: 'appendContent2'},
					{name: 'content2'}
				]},
				{name: 'col2_3', content: 'column 2_3', classes: 'column'}
			]},
			{name: 'row4', content: 'row 4', classes: 'row'},
			{name: 'row5', content: 'row 5', classes: 'row'}
		], style: 'padding: 0'},
		{name: 'col3', content: 'column 3', style: 'white-space:nowrap;', components: [
			{name: 'button3', kind: 'Button', content: 'Add content', ontap: 'appendContent3'},
			{name: 'content3'}
		]},
		{name: 'col4', content: 'column 4', flex: true}
	],

	statics: {
		sLoremIpsum: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, ' +
		'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
		'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut ' +
		'aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in ' +
		'voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint ' +
		'occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit ' +
		'anim id est laborum.'
	},

	appendContent1: function() {
		this.$.content1.createComponent({content:'More content LA LA LA LA LA!'}).render();
	},

	appendContent2: function() {
		this.$.content2.addContent(enyo.sample.FlexLayoutSample.sLoremIpsum);
	},

	appendContent3: function() {
		this.$.content3.addContent(' Bar Foo Bar Foo Bar Foo');
	},

	rendered: function() {
		this.inherited(arguments);
		for (var s in this.textFields) {
			this.$[this.textFields[s]].setContent(enyo.sample.FlexLayoutSample.sLoremIpsum);
		}
	}
});