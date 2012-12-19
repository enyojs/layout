enyo.kind({
	name: "enyo.sample.ListLanguagesSample",
	kind: "FittableRows",
	classes: "list-sample-language enyo-fit",
	components: [
		{kind: "onyx.MoreToolbar", layoutKind: "FittableColumnsLayout", style: "height: 55px;", components: [
			{kind: "onyx.Button", content: "Randomize", ontap: "populateList"},
		]},
		{kind: "List", classes: "list-sample-language-list enyo-unselectable", fit: true, multiSelect: true, reorderable: true,
			onSetupItem: "setupItem", onReorder: "listReorder", onSetupReorderComponents: "setupReorderComponents", onSetupPinnedReorderComponents: "setupPinnedReorderComponents",
			onSetupSwipeItem: "setupSwipeItem", onSwipeComplete: "swipeComplete",
			components: [
				{name: "item", classes: "list-sample-language-item", components: [
					{name: "text", style: "float:left;font-size:24px;text-transform:capitalize;line-height:80px;padding-left:20px;"}
				]}
			],
			reorderComponents: [
				{name: "reorderContent", style:"background:rgba(0,0,0,0.7);margin:0px;padding:0px;", classes: "enyo-fit", components: [
					{name: "reorderTitle", tag: "h2", style: "text-align:center;color:#fff;font-size:24px;"}
				]}
			], pinnedReorderComponents: [
				{name: "pinnedReorderItem", style:"background-color:rgba(0,160,40,0.8);color:white;", classes: "enyo-fit", components: [
					{name: "pinnedReorderTitle", tag: "h2", style: "text-align:center;color:#fff;font-size:24px;"},
					{name: "dropButton", kind: "onyx.Button", ontap: "dropPinnedRow", content: "Drop", style: "width:100px;height:80px;position:absolute;top:10px;right:20px;"}
				]}
			], swipeableComponents: [
				{name: "swipeItem", style:"background-color:rgba(0,160,40,0.8);color:white;", classes: "enyo-fit", components: [
					{name: "swipeTitle", style: "font-size:30px;font-weight:bold;color:#fff;text-align:center;line-height:80px;padding:0px;margin:0px;text-transform:capitalize;"}
				]}
			]
		}
	],
	rendered: function() {
		this.inherited(arguments);
		this.populateList();
	},
	listReorder: function(inSender, inEvent) {
		var movedItem = enyo.clone(data[inEvent.reorderFrom]);
		data.splice(inEvent.reorderFrom,1);
		data.splice((inEvent.reorderTo),0,movedItem);
	},
	setupItem: function(inSender, inEvent) {
		var i = inEvent.index;
		var currentLanguage = data[i].langs[data[i].currentIndex];
		var val = data[i].val;
		var number = languages[currentLanguage][val];
		this.$.text.setContent(number);
	},
	setupReorderComponents: function(inSender, inEvent) {
		var i = inEvent.index;
		var currentLanguage = data[i].langs[data[i].currentIndex];
		var val = data[i].val;
		var number = languages[currentLanguage][val];
		this.$.reorderTitle.setContent("You are moving - "+number);
	},
	setupPinnedReorderComponents: function(inSender, inEvent) {
		var i = inEvent.index;
		var currentLanguage = data[i].langs[data[i].currentIndex];
		var val = data[i].val;
		var number = languages[currentLanguage][val];
		this.$.pinnedReorderTitle.setContent("You are moving - "+number);
	},
	//* Called when the "Drop" button is pressed on the pinned placeholder row
	dropPinnedRow: function(inSender, inEvent) {
		this.$.list.dropPinnedRow(inEvent);
	},
	setupSwipeItem: function(inSender, inEvent) {
		var i = inEvent.index;
		var newLang = (inEvent.xDirection == 1)
			? this.getNextLang(i)
			: this.getPrevLang(i);
		this.$.swipeTitle.setContent(data[i].langs[newLang]);
	},
	swipeComplete: function(inSender, inEvent) {
		var i = inEvent.index;
		data[i].currentIndex = (inEvent.xDirection == 1)
			? this.getNextLang(i)
			: this.getPrevLang(i);
		this.$.list.renderRow(i);
	},
	getNextLang: function(index) {
		var currentLang = data[index].currentIndex;
		var nextLang = currentLang + 1;
		return (nextLang >= data[index].langs.length) ? 0 : nextLang;
	},
	getPrevLang: function(index) {
		var currentLang = data[index].currentIndex;
		var prevLang = currentLang - 1;
		return (prevLang < 0) ? data[index].langs.length - 1 : prevLang;
	},
	populateList: function() {
		this.createRandomData();
		this.$.list.setCount(10);
		this.$.list.reset();
	},
	createRandomData: function() {
		var languages = this.getLanguages();
		var langs;
		data = [];
		for(var i=0;i<10;i++) {
			langs = enyo.clone(languages);
			langs.sort(function() {return 0.5 - Math.random()});
			data.push({
				langs: langs,
				val: i,
				currentIndex: 0
			});
		}
		data.sort(function() {return 0.5 - Math.random()});
	},
	getLanguages: function() {
		var retarr = [];
		for(var lang in languages) {
			retarr.push(lang);
		}
		return retarr;
	}
});

var data = [];

var languages = {
	english: ["one",  "two",  "three", "four",    "five","six","seven","eight","nine","ten"],
	italian: ["uno",  "due",  "tre",   "quattro", "cinque","sei","sette","otto","nove","dieci"],
	spanish: ["uno",  "dos",  "tres",  "cuatro",  "cinco","seis","siete","ocho","nueve","diez"],
	german:  ["eins", "zwei", "drei",  "vier",    "fünf", "sechs", "sieben", "acht", "neun", "zehn"],
	french:  ["un",   "deux", "trois", "quatre",  "cinq", "six", "sept", "huit", "neuf", "dix"]
};
