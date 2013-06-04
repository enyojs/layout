
enyo.kind({
	name    : 'enyo.sample.FlexBoxSample',
	classes : 'flex-box-sample enyo-fit',
	kind    : enyo.FlexBox,
	spacing : 10,
	components: [
		{name: 'child1', flexOrientation: 'row',    classes: 'leaf', content: 'child 1'},
		{name: 'child2', flexOrientation: 'row',    classes: 'leaf', content: 'child 2'},
		{name: 'child3', flexOrientation: 'column', classes: 'leaf', content: 'child 3', flex: true},
		{name: 'child4', flexOrientation: 'column', classes: 'leaf', content: 'child 4', flex: true},
		{name: 'child5', flexOrientation: 'column', classes: 'leaf', content: 'child 5', flex: true},
		{name: 'child6', flexOrientation: 'row',    classes: 'leaf', content: 'child 6'}		
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
		{name: 'Andrew', sex:'male'},
		{name: 'Betty', sex:'female'},
		{name: 'Christopher', sex:'male'},
		{name: 'Donna', sex:'female'},
		{name: 'Ephraim', sex:'male'},
		{name: 'Frankie', sex:'male'},
		{name: 'Gerald', sex:'male'},
		{name: 'Heather', sex:'female'},
		{name: 'Ingred', sex:'female'},
		{name: 'Jack', sex:'male'},
		{name: 'Kevin', sex:'male'},
		{name: 'Lucy', sex:'female'},
		{name: 'Matthew', sex:'male'},
		{name: 'Noreen', sex:'female'},
		{name: 'Oscar', sex:'male'},
		{name: 'Pedro', sex:'male'},
		{name: 'Quentin', sex:'male'},
		{name: 'Ralph', sex:'male'},
		{name: 'Steven', sex:'male'},
		{name: 'Tracy', sex:'female'},
		{name: 'Uma', sex:'female'},
		{name: 'Victor', sex:'male'},
		{name: 'Wendy', sex:'female'},
		{name: 'Xin', sex:'male'},
		{name: 'Yulia', sex:'female'}
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
	}
});