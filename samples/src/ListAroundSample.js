var
	kind = require('enyo/kind'),
	job = require('enyo/job'),
	utils = require('enyo/utils'),
	Button = require('enyo/Button'),
	Checkbox = require('enyo/Checkbox'),
	Image = require('enyo/Image'),
	Input = require('enyo/Input'),
	Popup = require('enyo/Popup');

var
	FittableColumns = require('layout/FittableColumns'),
	FittableRows = require('layout/FittableRows'),
	AroundList = require('layout/AroundList');

var
	names = require('./NameGenerator');

// It's convenient to create a kind for the item we'll render in the contacts list.
var AroundListContactItem = kind({
	events: {
		onRemove: ''
	},
	components: [
		{name: 'avatar', kind: Image, classes: 'list-sample-around-avatar'},
		{components: [
			{name: 'name', classes: 'list-sample-around-name'},
			{name: 'title', classes: 'list-sample-around-description'},
			{content: '(415) 711-1234', classes: 'list-sample-around-description'}
		]},
		{name: 'remove', kind: Image, classes: 'list-sample-around-remove-button', src: 'assets/remove-icon.png', ontap: 'removeTap'}
	],
	setContact: function (contact) {
		this.$.name.setContent(contact.name);
		this.$.avatar.setSrc(contact.avatar);
		this.$.title.setContent(contact.title);
	},
	setSelected: function (selected) {
		this.addRemoveClass('list-sample-around-item-selected', selected);
		this.$.remove.applyStyle('display', selected ? 'inline-block' : 'none');
	},
	removeTap: function (sender, event) {
		this.doRemove({index: event.index});
		return true;
	}
});

module.exports = kind({
	name: 'enyo.sample.ListAroundSample',
	kind: FittableRows,
	classes: 'enyo-fit enyo-unselectable',
	components: [
		{name: 'list', kind: AroundList, classes: 'list-sample-around', fit: true, multiSelect: true, onSetupItem: 'setupItem', aboveComponents: [
			{kind: FittableColumns, classes: 'layout-sample-toolbar', components: [
				{kind: FittableColumns, tag: 'label', fit: true, noStretch: true, components: [
					{kind: Input, placeholder: 'Search...', fit: true, oninput: 'searchInputChange'},
					{kind: Image, src: 'assets/search-input-search.png', style: 'height: 20px; width: 20px;'}
				]}
			]}
		], components: [
			{name: 'divider', classes: 'list-sample-around-divider'},
			{name: 'item', kind: AroundListContactItem, classes: 'list-sample-around-item enyo-border-box', onRemove: 'removeTap'}
		]},
		{name: 'popup', kind: Popup, modal: true, centered: true, classes: 'list-sample-around-popup', components: [
			{components: [
				{content: 'count:', classes: 'list-sample-around-label'},
				{tag: 'label', components: [
					{name: 'countInput', kind: Input, style: 'width: 80px', value: 100}
				]}
			]},
			{components: [
				{content: 'rowsPerPage:', classes: 'list-sample-around-label'},
				{tag: 'label', components: [
					{name: 'rowsPerPageInput', kind: Input, style: 'width: 80px', value: 50}
				]}
			]},
			{components: [
				{content: 'hide divider:', classes: 'list-sample-around-label'},
				{name: 'hideDividerCheckbox', kind: Checkbox}
			]},
			{components: [
				{kind: Button, content: 'populate list', classes: 'list-sample-around-populate-button', ontap: 'populateList'}
			]}
		]}
	],
	rendered: kind.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.populateList();
		};
	}),
	setupItem: function(inSender, inEvent) {
		var i = inEvent.index;
		var data = this.filter ? this.filtered : this.db;
		var item = data[i];
		// content
		this.$.item.setContact(item);
		// selection
		this.$.item.setSelected(inSender.isSelected(i));
		// divider
		if (!this.hideDivider) {
			var d = item.name[0];
			var prev = data[i-1];
			var showd = d != (prev && prev.name[0]);
			this.$.divider.setContent(d);
			this.$.divider.canGenerate = showd;
			this.$.item.applyStyle('border-top', showd ? 'none' : null);
		}
		return true;
	},
	refreshList: function() {
		if (this.filter) {
			this.filtered = this.generateFilteredData(this.filter);
			this.$.list.setCount(this.filtered.length);
		} else {
			this.$.list.setCount(this.db.length);
		}
		this.$.list.refresh();
	},
	addItem: function() {
		var item = this.generateItem(utils.cap(this.$.newContactInput.getValue()));
		var i = 0;
		for (var di; (di=this.db[i]); i++) {
			if (di.name > item.name) {
				this.db.splice(i, 0, item);
				break;
			}
		}
		this.refreshList();
		this.$.list.scrollToRow(i);
	},
	removeItem: function(inIndex) {
		this._removeItem(inIndex);
		this.refreshList();
		this.$.list.getSelection().deselect(inIndex);
	},
	_removeItem: function(inIndex) {
		var i = this.filter ? this.filtered[inIndex].dbIndex : inIndex;
		this.db.splice(i, 1);
	},
	removeTap: function(inSender, inEvent) {
		this.removeItem(inEvent.index);
		return true;
	},
	populateList: function() {
		this.$.popup.hide();
		this.createDb(this.$.countInput.getValue());
		this.$.list.setCount(this.db.length);
		this.$.list.setRowsPerPage(this.$.rowsPerPageInput.getValue());
		//
		this.hideDivider = this.$.hideDividerCheckbox.getValue();
		this.$.divider.canGenerate = !this.hideDivider;
		//
		this.$.list.reset();
		this.$.list.scrollToContentStart();
	},
	createDb: function(inCount) {
		/* global makeName */
		this.db = [];
		for (var i=0; i<inCount; i++) {
			this.db.push(this.generateItem(names.makeName(4, 6) + ' ' + names.makeName(5, 10)));
		}
		this.sortDb();
	},
	generateItem: function(inName) {
		return {
			name: inName,
			avatar: 'assets/avatars/' + avatars[utils.irand(avatars.length)],
			title: titles[utils.irand(titles.length)]
		};
	},
	sortDb: function() {
		this.db.sort(function(a, b) {
			if (a.name < b.name) {
				return -1;
			}
			else if (a.name > b.name) {
				return 1;
			}
			else {
				return 0;
			}
		});
	},
	showSetupPopup: function() {
		this.$.popup.show();
	},
	searchInputChange: function(inSender) {
		job(this.id + ':search', this.bindSafely('filterList', inSender.getValue()), 200);
		return true;
	},
	filterList: function(inFilter) {
		if (inFilter != this.filter) {
			this.filter = inFilter;
			this.filtered = this.generateFilteredData(inFilter);
			this.$.list.setCount(this.filtered.length);
			this.$.list.reset();
		}
	},
	generateFilteredData: function(inFilter) {
		var re = new RegExp('^' + inFilter, 'i');
		var r = [];
		for (var i=0, d; (d=this.db[i]); i++) {
			if (d.name.match(re)) {
				d.dbIndex = i;
				r.push(d);
			}
		}
		return r;
	}
});

var avatars = [
	'angel.png',
	'astrologer.png',
	'athlete.png',
	'baby.png',
	'clown.png',
	'devil.png',
	'doctor.png',
	'dude.png',
	'dude2.png',
	'dude3.png',
	'dude4.png',
	'dude5.png',
	'dude6.png'
];
var titles = [
	'Regional Data Producer',
	'Internal Markets Administrator',
	'Central Solutions Producer',
	'Dynamic Program Executive',
	'Direct Configuration Executive',
	'International Marketing Assistant',
	'District Research Consultant',
	'Lead Intranet Coordinator',
	'Central Accountability Director',
	'Product Web Assistant'
];