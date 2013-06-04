
enyo.kind({
	name       : 'enyo.sample.OmniFlexLayoutSample',
	classes    : 'omniflex-layout-sample enyo-fit',
	layoutKind : 'enyo.OmniFlexLayout',
	spacing    : 10,
	
	components: [
		{name: 'block1', flexOrient: 'column', classes: 'leaf column', content: 'Block 1', flex: true},
		{name: 'block2', flexOrient: 'column', classes: 'leaf', content: 'Block 2'/*, layoutKind: 'ContentLayout'*/},
		{name: 'block3', flexOrient: 'column', classes: 'leaf column', content: 'Block 3', flex: true},
		{name: 'block5', flexOrient: 'column', classes: 'leaf column', content: 'Block 5'},
		{name: 'block6', flexOrient: 'row',    classes: 'leaf column', content: 'Block 6'},
		{name: 'block7', flexOrient: 'column', classes: 'leaf column', content: 'Block 7'},
		{name: 'block8', flexOrient: 'column', classes: 'leaf',        content: 'Block 8', flex: true},
		{name: 'block9', flexOrient: 'row',    classes: 'leaf',        content: 'Block 9', flex: true},
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
	
	people: [
		{name: 'Andrew',      sex:'male'},
		{name: 'Betty',       sex:'female'},
		{name: 'Christopher', sex:'male'},
		{name: 'Donna',       sex:'female'},
		{name: 'Ephraim',     sex:'male'},
		{name: 'Frankie',     sex:'male'},
		{name: 'Gerald',      sex:'male'},
		{name: 'Heather',     sex:'female'},
		{name: 'Ingred',      sex:'female'},
		{name: 'Jack',        sex:'male'},
		{name: 'Kevin',       sex:'male'},
		{name: 'Lucy',        sex:'female'},
		{name: 'Matthew',     sex:'male'},
		{name: 'Noreen',      sex:'female'},
		{name: 'Oscar',       sex:'male'},
		{name: 'Pedro',       sex:'male'},
		{name: 'Quentin',     sex:'male'},
		{name: 'Ralph',       sex:'male'},
		{name: 'Steven',      sex:'male'},
		{name: 'Tracy',       sex:'female'},
		{name: 'Uma',         sex:'female'},
		{name: 'Victor',      sex:'male'},
		{name: 'Wendy',       sex:'female'},
		{name: 'Xin',         sex:'male'},
		{name: 'Yulia',       sex:'female'}
	],
	
	create: function() {
		this.inherited(arguments);
		// this.$.repeater.setCount(this.people.length);
	},
	
	setupItem: function(inSender, inEvent) {
		var index = inEvent.index;
		var item = inEvent.item;
		var person = this.people[index];
		item.$.personNumber.setContent((index+1) + '. ');
		item.$.personName.setContent(person.name);
		return true;
	},

	addContent1: function() {
		this.$.col1.addContent('hello world ');
		this.$.col1.layout.reflow();
		this.$.col2.layout.reflow();
	},

	addContent2: function() {
		this.$.row1.addContent(' asdflkjasdf lkajdsflkjasdflkj ;lkasjdf;lk a;lksdjf klsjdflkjsdflkj lksdjf lksdjf sdfsdfslkj kljsdf');
		this.$.row1.layout.reflow();
		this.$.col1.layout.reflow();
		// this.$.col2.layout.reflow();
	},

	appendContent3: function() {
		this.$.content3.addContent(' Bar Foo Bar Foo Bar Foo');
	},
});