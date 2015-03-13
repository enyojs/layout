var
	kind = require('enyo/kind'),
	Scroller = require('enyo/Scroller');

var
	FittableRows = require('layout/FittableRows'),
	FlyweightRepeater = require('layout/FlyweightRepeater');

module.exports = kind({
	name: 'enyo.sample.FlyweightRepeaterSample',
	kind: FittableRows,
	classes: 'flyweight-repeater-sample enyo-fit onyx',
	components: [
		{classes: 'layout-sample-toolbar', components: [
			{content: 'FlyweightRepeater Result'}
		]},
		{name:'result', style:'padding:12px; font-size: 20px;', content: 'Nothing selected yet.'},
		{kind: Scroller, fit: true, components: [
			{name:'repeater', kind: FlyweightRepeater, classes:'flyweight-repeater-sample-list', count: 26, onSetupItem: 'setupItem', components: [
				{name: 'item', classes:'flyweight-repeater-sample-item'}
			]}
		]}
	],
	handlers: {
		onSelect: 'itemSelected'
	},
	people: [
		{name: 'Andrew'},
		{name: 'Betty'},
		{name: 'Christopher'},
		{name: 'Donna'},
		{name: 'Ephraim'},
		{name: 'Frankie'},
		{name: 'Gerald'},
		{name: 'Heather'},
		{name: 'Ingred'},
		{name: 'Jack'},
		{name: 'Kevin'},
		{name: 'Lucy'},
		{name: 'Matthew'},
		{name: 'Noreen'},
		{name: 'Oscar'},
		{name: 'Pedro'},
		{name: 'Quentin'},
		{name: 'Ralph'},
		{name: 'Steven'},
		{name: 'Tracy'},
		{name: 'Uma'},
		{name: 'Victor'},
		{name: 'Wendy'},
		{name: 'Xin'},
		{name: 'Yulia'},
		{name: 'Zoltan'}
	],
	setupItem: function(sender, event) {
		var index = event.index;
		this.$.item.setContent((index+1) + '. ' + this.people[index].name);
		this.$.item.applyStyle('background', (event.selected? 'dodgerblue':'lightgray'));
		/* stop propogation */
		return true;
	},
	itemSelected: function(sender, event) {
		var index = event.index;
		var count = event.flyweight.count;
		if(index>=0 && index<count){
			this.$.result.setContent(' [' + (index+1) + '. ' + this.people[index].name + '] is selected');
		}
		return true;
	}
});
