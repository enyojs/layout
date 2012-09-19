enyo.kind({
	name: "enyo.sample.FlyweightRepeaterSample",
	classes: "list-sample enyo-fit",
	components: [
		{kind:"Scroller", classes:"enyo-fit", style:"height:100%;", components: [
			{name:"repeater", kind:"enyo.FlyweightRepeater", classes:"enyo-fit list-sample-list", count: 26, onSetupItem: "setupItem", components: [
				{name: "item", classes:"list-sample-item enyo-border-box",}
			]},
		]},
		{tag: "br"},
		{tag: "br"},
		{tag: "br"},
		{kind: "onyx.Groupbox", style:"width:240px;", components: [
			{kind: "onyx.GroupboxHeader", style:"margin-left:10px;", content: "FlyweightRepeater Result"},
			{name:"result", style:"margin-left:10px; padding:10px; color:white;", content: "Nothing slected yet."}
		]}
	],
	handlers: {
		onSelect: "itemSelected"
	},
	people: [
		{name: "Andrew"},
		{name: "Betty"},
		{name: "Christopher"},
		{name: "Donna"},
		{name: "Ephraim"},
		{name: "Frankie"},
		{name: "Gerald"},
		{name: "Heather"},
		{name: "Ingred"},
		{name: "Jack"},
		{name: "Kevin"},
		{name: "Lucy"},
		{name: "Matthew"},
		{name: "Noreen"},
		{name: "Oscar"},
		{name: "Pedro"},
		{name: "Quentin"},
		{name: "Ralph"},
		{name: "Steven"},
		{name: "Tracy"},
		{name: "Uma"},
		{name: "Victor"},
		{name: "Wendy"},
		{name: "Xin"},
		{name: "Yulia"},
		{name: "Zoltan"},
	],
	setupItem: function(inSender, inEvent) {
		var index = inEvent.index;
		this.$.item.setContent((index+1) + ". " + this.people[index].name);
		this.$.item.applyStyle("background", (inEvent.selected? "dodgerblue":"lightgray"));
	},
	itemSelected: function(inSender, inEvent) {
		var index = inEvent.index;
		var count = inEvent.flyweight.count;
		if(index>=0 && index<count){
			this.$.result.setContent(" [" + (index+1) + ". " + this.people[index].name + "] is selected");
		}
	}

});