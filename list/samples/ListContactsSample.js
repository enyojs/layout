enyo.kind({
	name: "enyo.sample.ListContactsSample",
	kind: "FittableRows",
	classes: "list-sample-contacts enyo-fit",
	components: [
		{kind: "onyx.MoreToolbar", layoutKind: "FittableColumnsLayout", style: "height: 55px;", components: [
			{kind: "onyx.Button", content: "setup", ontap: "showSetupPopup"},
			{kind: "onyx.InputDecorator", components: [
				{name: "newContactInput", kind: "onyx.Input", value: "Frankie Fu"}
			]},
			{kind: "onyx.Button", content: "new contact", ontap: "addItem"},
			{fit: true},
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input", placeholder: "Search...", style: "width: 140px;", oninput: "searchInputChange"},
				{kind: "Image", src: "assets/search-input-search.png", style: "width: 20px;"}
			]},
			{kind: "onyx.Button", content: "remove selected", ontap: "removeSelected"}
		]},
		{kind: "List", classes: "list-sample-contacts-list enyo-unselectable", fit: true, multiSelect: true, reorderable: true, onSetupItem: "setupItem",
			onSetupReorderComponents: "setupReorderComponents", onSetupPinnedReorderComponents: "setupPinnedReorderComponents", onReorder: "listReorder",
			onSetupSwipeItem: "setupSwipeItem", onSwipeComplete: "swipeComplete", components: [
				{name: "divider", classes: "list-sample-contacts-divider"},
				{name: "item", kind: "ContactItem", classes: "list-sample-contacts-item enyo-border-box", onRemove: "removeTap"},
				{name: "myIndex", style: "background:#333;"}
			], reorderComponents: [
				{name: "reorderContent", style:"background:rgba(0,0,0,0.7);margin:0px;padding:0px;", classes: "enyo-fit", components: [
					{name: "reorderTitle", tag: "h2", style: "text-align:center;color:#fff;font-size:24px;"}
				]}
			], pinnedReorderComponents: [
				{name: "pinnedReorderContent", style:"background:rgba(150,0,0,0.7);margin:0px;padding:0px;", classes: "enyo-fit", components: [
					{name: "pinnedReorderTitle", tag: "h2", style: "text-align:center;color:#fff;font-size:24px;"},
					{name: "dropButton", kind: "onyx.Button", ontap: "dropPinnedRow", content: "Drop", style: "width:100px;height:80px;position:absolute;top:10px;right:20px;"}
				]}
			], swipeableComponents: [
				{name: "importanceSwipeItem", style:"background:red;color:white;", classes: "enyo-fit", components: [
					{name: "importanceSwipeTitle", content: "Important!", style: "font-size:30px;font-weight:bold;color:#fff;text-align:center;line-height:100px;padding:0px;margin:0px;"}
				]},
				{name: "deleteSwipeItem", style:"background:rgba(200,0,0,0.9);color:white;height:100px;", components: [
					{name:"deleteButton", kind:"onyx.Button", content:"Delete", style:"height:60px;width:200px;display:block;margin:0px auto;position:relative;top:20px;line-height:60px;padding:0px;border:1px solid yellow;", ontap:"clearSwipeables"}
				]},
			]
		},
		{name: "popup", kind: "onyx.Popup", modal: true, centered: true, classes: "list-sample-contacts-popup", components: [
			{components: [
				{style:"display:inline-block", components:[
					{content: "count:", classes: "list-sample-contacts-label"},
					{name:"countOutput", style:"display:inline-block;", content: "200"}
				]},
				{kind: "onyx.Slider", value: 4, onChanging:"countSliderChanging"}
			]},
			{components: [
				{content: "rowsPerPage:", classes: "list-sample-contacts-label"},
				{name:"rowsPerPageOutput", style:"display:inline-block;", content: "50"},
				{kind: "onyx.Slider", value: 10, onChanging:"rowsSliderChanging"}
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
	setupPinnedReorderComponents: function(inSender, inEvent) {
		var i = inEvent.index;
		var data = this.filter ? this.filtered : this.db;
		var item = data[i];
		this.$.pinnedReorderTitle.setContent("Pinned - "+item.name);
	},
	setupReorderComponents: function(inSender, inEvent) {
		var i = inEvent.index;
		var data = this.filter ? this.filtered : this.db;
		var item = data[i];
		this.$.reorderTitle.setContent("You are moving - "+item.name);
	},
	listReorder: function(inSender, inEvent) {
		var data = this.filter ? this.filtered : this.db;
		var movedItem = enyo.clone(data[inEvent.reorderFrom]);
		data.splice(inEvent.reorderFrom,1);
		data.splice((inEvent.reorderTo),0,movedItem);
		enyo.log("from: "+inEvent.reorderFrom+", to: "+inEvent.reorderTo);
	},
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
		// importance
		this.$.item.setImportance(item.importance);
		this.$.item.renderImportance();
		// index
		this.$.myIndex.setContent(i);
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
	//* Called when the "Drop" button is pressed on the pinned placeholder row
	dropPinnedRow: function(inSender, inEvent) {
		this.$.list.dropPinnedRow(inEvent);
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
		var item = this.generateItem(enyo.cap(this.$.newContactInput.getValue()));
		var i = 0;
		for (var di; (di=this.db[i]); i++) {
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
		this.$.list.getSelection().remove(inIndex);
		this.refreshList();
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
		// get selected items, sort numerically in decending order
		var selected = enyo.keys(this.$.list.getSelection().getSelected());
		selected.sort(function(a,b) { return b-a; });
		// remove items one-by-one, starting with last in the list
		for (var i=0; i < selected.length; i++) {
			this._removeItem(selected[i]);
		}
		// clear selection, since all selected items are now gone
		this.$.list.getSelection().clear();
		// re-render list in current position
		this.refreshList();
	},
	populateList: function() {
		this.$.popup.hide();
		this.createDb(~~this.$.countOutput.getContent());
		this.$.list.setCount(this.db.length);
		this.$.list.setRowsPerPage(~~this.$.rowsPerPageOutput.getContent());
		//
		this.hideDivider = this.$.hideDividerCheckbox.getValue();
		//this.$.divider.canGenerate = !this.hideDivider;
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
			title: titles[enyo.irand(titles.length)],
			importance: 0
		};
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
		for (var i=0, d; (d=this.db[i]); i++) {
			if (d.name.match(re)) {
				d.dbIndex = i;
				r.push(d);
			}
		}
		return r;
	},
	countSliderChanging: function(inSender, inEvent){
		this.$.countOutput.setContent(Math.round(inSender.getValue()) * 50);
	},
	rowsSliderChanging: function(inSender, inEvent){
		this.$.rowsPerPageOutput.setContent(Math.round(inSender.getValue()) * 5);
	},
	
	
	//
	// swipeable interface
	//
	setupSwipeItem: function(inSender, inEvent) {
		var i = inEvent.index;
		var data = this.filter ? this.filtered : this.db;
		var item = data[i];

		// if swiped to the right
		if(inEvent.xDirection == 1) {
			this.$.list.setEnableSwipe(true);
			this.$.deleteSwipeItem.setShowing(false);
			this.$.importanceSwipeItem.setShowing(true);
			if(item.importance == 0) {
				this.$.importanceSwipeItem.applyStyle("background-color","rgba(255,140,0,0.8)");
				this.$.importanceSwipeTitle.setContent("Important!");
			}
			else if(item.importance == -1) {
				this.$.importanceSwipeItem.applyStyle("background-color","rgba(0,160,40,0.8)");
				this.$.importanceSwipeTitle.setContent("Very Important!!");
			}
			else if(item.importance == -2) {
				this.$.importanceSwipeItem.applyStyle("background-color","rgba(0,0,255,0.8)");
				this.$.importanceSwipeTitle.setContent("Not Important");
			}
		// if swiped to the left
		} else {
			this.$.list.setEnableSwipe(true);
			if(item.importance < 0) {
				this.$.importanceSwipeItem.applyStyle("background-color","rgba(0,0,255,0.8)");
				this.$.importanceSwipeTitle.setContent("Not Important");
				this.$.deleteSwipeItem.setShowing(false);
				this.$.importanceSwipeItem.setShowing(true);
			} else {
				this.$.importanceSwipeItem.setShowing(false);
				this.$.deleteSwipeItem.setShowing(true);
				this.$.list.setPersistSwipeableItem(true);
			}
		}
	},
	swipeComplete: function(inSender, inEvent) {
		var i = inEvent.index;
		var data = this.filter ? this.filtered : this.db;
		var item = data[i];
		
		// if swiped to the right
		if(inEvent.xDirection == 1) {
			if(item.importance == 0) {
				item.importance = -1;
			}
			else if(item.importance == -1) {
				item.importance = -2;
			}
			else if(item.importance == -2) {
				item.importance = 0;
			}
		// if swiped to the left
		} else {
			if(item.importance < 0) {
				item.importance = 0;
			}
		}
		this.$.list.updateCurrentRow();
	},
	clearSwipeables: function() {
		this.$.list.clearSwipeables();
	}
	//
	// end swipeable interface
	//
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
	published: {
		importance: 0
	},
	components: [
		{name: "avatar", kind: "Image", classes: "list-sample-contacts-avatar"},
		{components: [
			{name: "name"},
			{name: "title", classes: "list-sample-contacts-description"},
			{content: "(415) 711-1234", classes: "list-sample-contacts-description"},
			{name: "importance", content: "not important"}
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
		this.$.remove.applyStyle("display", inSelected ? "inline-block" : "gne");
	},
	renderImportance: function() {
		switch(this.importance) {
			case 0:
				this.$.importance.setContent("not important");
				break;
			case -1:
				this.$.importance.setContent("important");
				break;
			case -2:
				this.$.importance.setContent("very important");
				break;
			default:
				alert(this.importance+" - wowzer");
				break;
		}
	},
	removeTap: function(inSender, inEvent) {
		this.doRemove(inEvent);
		return true;
	}
});
