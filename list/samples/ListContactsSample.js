enyo.kind({
	name: "enyo.sample.ListContactsSample",
	kind: "FittableRows",
	classes: "list-sample-contacts enyo-fit",
	components: [
		{kind: "onyx.MoreToolbar", layoutKind: "FittableColumnsLayout", style: "height: 55px;", components: [
			{kind: "onyx.Button", content: "setup", ontap: "showSetupPopup"},
			{kind: "onyx.Button", content: "remove selected", ontap: "removeSelected"},
			{kind: "onyx.InputDecorator", components: [
				{name: "newContactInput", kind: "onyx.Input", value: "Frankie Fu"},
			]},
			{kind: "onyx.Button", content: "new contact", ontap: "addItem"},
			{fit: true},
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input", placeholder: "Search...", style: "width: 140px;", oninput: "searchInputChange"},
				{kind: "Image", src: "assets/search-input-search.png", style: "width: 20px;"}
			]}
		]},
		{kind: "List", classes: "list-sample-contacts-list", fit: true, multiSelect: true, onSetupItem: "setupItem", components: [
			{name: "divider", classes: "list-sample-contacts-divider"},
			{name: "item", kind: "ContactItem", classes: "list-sample-contacts-item enyo-border-box", onRemove: "removeTap"}
		]},
		{name: "popup", kind: "onyx.Popup", modal: true, centered: true, classes: "list-sample-contacts-popup", components: [
			{components: [
				{content: "count:", classes: "list-sample-contacts-label"},
				{kind: "onyx.InputDecorator", components: [
					{name: "countInput", kind: "onyx.Input", style: "width: 80px", value: 200}
				]}
			]},
			{components: [
				{content: "rowsPerPage:", classes: "list-sample-contacts-label"},
				{kind: "onyx.InputDecorator", components: [
					{name: "rowsPerPageInput", kind: "onyx.Input", style: "width: 80px", value: 50}
				]}
			]},
			{components: [
				{content: "hide divider:", classes: "list-sample-contacts-label"},
				{name: "hideDividerCheckbox", kind: "onyx.Checkbox"}
			]},
			{components: [
				{kind: "onyx.Button", content: "populate list", classes: "list-sample-contacts-populate-button", ontap: "populateList"}
			]}
		]}
	],
	rendered: function() {
		this.inherited(arguments);
		this.populateList();
	},
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
			this.$.item.applyStyle("border-top", showd ? "none" : null);
		}
	},
	refreshList: function() {
		if (this.filter) {
			this.filtered = this.generateFilteredData(this.filter);
			this.$.list.setCount(this.filtered.length);
		} else {
			this.$.list.setCount(this.db.length);
		}
		//this.$.list.refresh();
		this.$.list.reset();
	},
	addItem: function() {
		var item = this.generateItem(enyo.cap(this.$.newContactInput.getValue()));
		var i = 0;
		for (var di; di=this.db[i]; i++) {
			if (di.name > item.name) {
				this.db.splice(i, 0, item);
				break;
			}
		}
		// if we hit end of for-loop, add to end of list
		if (!di) {
			this.db.push(item);
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
	removeSelected: function() {
		for (var i in this.$.list.getSelection().getSelected()) {
			this._removeItem(i);
		}
		this.$.list.getSelection().clear();
		this.refreshList();
	},
	populateList: function() {
		this.$.popup.hide();
		this.createDb(~~this.$.countInput.getValue());
		this.$.list.setCount(this.db.length);
		this.$.list.setRowsPerPage(~~this.$.rowsPerPageInput.getValue());
		//
		this.hideDivider = this.$.hideDividerCheckbox.getValue();
		this.$.divider.canGenerate = !this.hideDivider;
		//
		this.$.list.reset();
	},
	createDb: function(inCount) {
		this.db = [];
		for (var i=0; i<inCount; i++) {
			this.db.push(this.generateItem(makeName(4, 6) + " " + makeName(5, 10)));
		}
		this.sortDb();
	},
	generateItem: function(inName) {
		return {
			name: inName,
			avatar: "assets/avatars/" + avatars[enyo.irand(avatars.length)],
			title: titles[enyo.irand(titles.length)]
		}
	},
	sortDb: function() {
		this.db.sort(function(a, b) {
			if (a.name < b.name) return -1;
			else if (a.name > b.name) return 1;
			else return 0;
		});
	},
	showSetupPopup: function() {
		this.$.popup.show();
	},
	searchInputChange: function(inSender) {
		enyo.job(this.id + ":search", enyo.bind(this, "filterList", inSender.getValue()), 200);
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
		var re = new RegExp("^" + inFilter, "i");
		var r = [];
		for (var i=0, d; d=this.db[i]; i++) {
			if (d.name.match(re)) {
				d.dbIndex = i;
				r.push(d);
			}
		}
		return r;
	}
});

var avatars = [
	"angel.png",
	"astrologer.png",
	"athlete.png",
	"baby.png",
	"clown.png",
	"devil.png",
	"doctor.png",
	"dude.png",
	"dude2.png",
	"dude3.png",
	"dude4.png",
	"dude5.png",
	"dude6.png"
];
var titles = [
	"Regional Data Producer",
	"Internal Markets Administrator",
	"Central Solutions Producer",
	"Dynamic Program Executive",
	"Direct Configuration Executive",
	"International Marketing Assistant",
	"District Research Consultant",
	"Lead Intranet Coordinator",
	"Central Accountability Director",
	"Product Web Assistant"
];

// It's convenient to create a kind for the item we'll render in the contacts list.
enyo.kind({
	name: "ContactItem",
	events: {
		onRemove: ""
	},
	components: [
		{name: "avatar", kind: "Image", classes: "list-sample-contacts-avatar"},
		{components: [
			{name: "name"},
			{name: "title", classes: "list-sample-contacts-description"},
			{content: "(415) 711-1234", classes: "list-sample-contacts-description"}
		]},
		{name: "remove", kind: "onyx.IconButton", classes: "list-sample-contacts-remove-button", src: "assets/remove-icon.png", ontap: "removeTap"}
	],
	setContact: function(inContact) {
		this.$.name.setContent(inContact.name);
		this.$.avatar.setSrc(inContact.avatar);
		this.$.title.setContent(inContact.title);
	},
	setSelected: function(inSelected) {
		this.addRemoveClass("list-sample-contacts-item-selected", inSelected);
		this.$.remove.applyStyle("display", inSelected ? "inline-block" : "none");
	},
	removeTap: function(inSender, inEvent) {
		this.doRemove(inEvent);
		return true;
	}
});