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
					{name: "text", classes: "itemLabel", allowHtml: true}
				]}
			],
			reorderComponents: [
				{name: "reorderContent", classes: "enyo-fit reorderDragger", components: [
					{name: "reorderTitle", tag: "h2", style: "text-align:center;", allowHtml: true}
				]}
			], pinnedReorderComponents: [
				{name: "pinnedReorderItem", classes: "enyo-fit swipeGreen", components: [
					{name: "pinnedReorderTitle", tag: "h2", allowHtml: true},
					{name: "dropButton", kind: "onyx.Button", ontap: "dropPinnedRow", content: "Drop", classes: "dropButton"}
				]}
			], swipeableComponents: [
				{name: "swipeItem", classes: "enyo-fit swipeGreen", components: [
					{name: "swipeTitle", classes: "swipeTitle"}
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
		if(!data[i]) {
			return;
		}
		var currentLanguage = data[i].langs[data[i].currentIndex];
		var val = data[i].val;
		var number = languages[currentLanguage][val];
		this.$.text.setContent(number);
	},
	setupReorderComponents: function(inSender, inEvent) {
		var i = inEvent.index;
		if(!data[i]) {
			return;
		}
		var currentLanguage = data[i].langs[data[i].currentIndex];
		var val = data[i].val;
		var number = languages[currentLanguage][val];
		this.$.reorderTitle.setContent(number);
	},
	setupPinnedReorderComponents: function(inSender, inEvent) {
		var i = inEvent.index;
		if(!data[i]) {
			return;
		}
		var currentLanguage = data[i].langs[data[i].currentIndex];
		var val = data[i].val;
		var number = languages[currentLanguage][val];
		this.$.pinnedReorderTitle.setContent(number);
	},
	//* Called when the "Drop" button is pressed on the pinned placeholder row
	dropPinnedRow: function(inSender, inEvent) {
		this.$.list.dropPinnedRow(inEvent);
	},
	setupSwipeItem: function(inSender, inEvent) {
		var i = inEvent.index;
		if(!data[i]) {
			return;
		}
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

data = [];

languages = {
	English: ["One",  "Two",  "Three", "Four",    "Five",      "Six",   "Seven",  "Eight", "Nine",  "Ten"],
	Italian: ["Uno",  "Due",  "Tre",   "Quattro", "Cinque",    "Sei",   "Sette",  "Otto",  "Nove",  "Dieci"],
	Spanish: ["Uno",  "Dos",  "Tres",  "Cuatro",  "Cinco",     "Seis",  "Siete",  "Ocho",  "Nueve", "Diez"],
	German:  ["Eins", "Zwei", "Drei",  "Vier",    "F&uuml;nf", "Sechs", "Sieben", "Acht",  "Neun",  "Zehn"],
	French:  ["Un",   "Deux", "Trois", "Quatre",  "Cinq",      "Six",   "Sept",   "Huit",  "Neuf",  "Dix"]
};
