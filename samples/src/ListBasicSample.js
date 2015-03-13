var
	kind = require('enyo/kind');

var
	List = require('layout/List');

var
	names = require('./NameGenerator');

module.exports = kind({
	name: 'enyo.sample.ListBasicSample',
	classes: 'list-sample enyo-fit',
	components: [
		{name: 'list', kind: List, count: 20000, multiSelect: false, classes: 'enyo-fit list-sample-list', onSetupItem: 'setupItem', components: [
			{name: 'item', classes: 'list-sample-item enyo-border-box', components: [
				{name: 'index', classes: 'list-sample-index'},
				{name: 'name'}
			]}
		]}
	],
	names: [],
	setupItem: function(sender, event) {
		// this is the row we're setting up
		var i = event.index;
		// make some mock data if we have none for this row
		if (!this.names[i]) {
			this.names[i] = names.makeName(5, 10, '', '');
		}
		var n = this.names[i];
		var ni = ('00000000' + i).slice(-7);
		// apply selection style if sender (the list) indicates that this row is selected.
		this.$.item.addRemoveClass('list-sample-selected', sender.isSelected(i));
		this.$.name.setContent(n);
		this.$.index.setContent(ni);
		return true;
	}
});