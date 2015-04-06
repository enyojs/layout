var
	kind = require('enyo/kind'),
	Control = require('enyo/Control'),
	Popup = require('enyo/Popup'),
	Repeater = require('enyo/Repeater'),
	Scroller = require('enyo/Scroller');

var
	ContextualLayout = require('layout/ContextualLayout'),
	FittableColumns = require('layout/FittableColumns'),
	FittableRows = require('layout/FittableRows');


/**
	sample.ContextualPopup_ is an example of a popup that uses the ContextualLayout layout strategy.
*/
var ContextualPopup = kind({
	kind: Popup,
	layoutKind: ContextualLayout,
	classes: 'sample-contextual-popup',

	floating: true,
	count: 5,

	//layout parameters
	vertFlushMargin: 60,	//vertical flush layout margin
	horizFlushMargin: 50,	//horizontal flush layout margin
	widePopup: 200,			//popups wider than this value are considered wide (for layout purposes)
	longPopup: 200,			//popups longer than this value are considered long (for layout purposes)
	horizBuffer: 16,		//do not allow horizontal flush popups past spec'd amount of buffer space on left/right screen edge

	handlers: {
		onRequestShowMenu: 'requestShow'
	},

	create: function () {
		Popup.prototype.create.apply(this, arguments);
		this.createComponent({kind: Repeater, count: this.count, onSetupItem: 'setupItem', components: [
			{name: 'item'}
		]});
	},
	setupItem: function (sender, event) {
		event.item.$.item.set('content', 'Item ' + event.index);
	},
	requestShow: function(inSender, inEvent) {
		var n = inEvent.activator.hasNode();
		if (n) {
			this.activatorOffset = this.getPageOffset(n);
		}
		this.show();
		return true;
	},
	getPageOffset: function(inNode) {
		// getBoundingClientRect returns top/left values which are relative to the viewport and not absolute
		var r = inNode.getBoundingClientRect();

		var pageYOffset = (window.pageYOffset === undefined) ? document.documentElement.scrollTop : window.pageYOffset;
		var pageXOffset = (window.pageXOffset === undefined) ? document.documentElement.scrollLeft : window.pageXOffset;
		var rHeight = (r.height === undefined) ? (r.bottom - r.top) : r.height;
		var rWidth = (r.width === undefined) ? (r.right - r.left) : r.width;

		return {top: r.top + pageYOffset, left: r.left + pageXOffset, height: rHeight, width: rWidth};
	}
});


module.exports = kind({
	name: 'layout.sample.ContextualLayoutSample',
	kind: FittableRows,
	classes: 'enyo enyo-fit',
	components: [
		{name: 'topToolbar', style: 'background-color: lightgray', components: [
			{kind: FittableColumns, style: 'width:100%;', components:[
				{components: [
					{kind: Control, classes: 'sample-popup-button icon-button', ontap: 'showPopup', style: 'background-image: url(assets/menu-icon-bookmark.png)'},
					{kind: ContextualPopup, count: 2}
				]},
				{fit:true, style: 'position:absolute;right:0;', components: [
					{kind: Control, classes: 'sample-popup-button icon-button', ontap: 'showPopup', style: 'background-image: url(assets/menu-icon-bookmark.png)'},
					{kind: ContextualPopup, count: 6}
				]}
			]}
		]},
		{kind: Scroller, fit: true, thumb: false, components:[
			{name: 'buttonContainer', kind: FittableRows, classes: 'onyx-contextualpopup-button-container enyo-fit', components:[
				//Top row of buttons
				{components:[
					{style: 'display:inline-block', components: [
						{kind: Control, content: 'Average', classes: 'sample-popup-button', ontap: 'showPopup'},
						{kind: ContextualPopup, count: 5}
					]},

					{style: 'display:inline-block;float:right', components: [
						{kind: Control, content: 'Small', classes: 'sample-popup-button', ontap: 'showPopup'},
						{kind: ContextualPopup, count: 1}
					]}
				]},
				//Center row of buttons
				{fit:true, style: 'padding-top:15%;padding-bottom:15%;', components:[
					{style: 'display:inline-block;', components: [
						{kind: Control, content: 'Wide', classes: 'sample-popup-button', ontap: 'showPopup'},
						{kind: ContextualPopup, style: 'width:300px', count: 0, components: [
							{kind: Scroller, style: 'min-width:150px;', horizontal: 'auto',  touch:true, thumb:false,  components:[
								{content: 'testing 1'},
								{content: 'testing 2'}
							]}
						]}
					]},
					{style: 'display:inline-block;float:right', components: [
						{kind: Control, content: 'Long', classes: 'sample-popup-button', ontap: 'showPopup'},
						{kind: ContextualPopup, count: 30}
					]}
				]},
				//Bottom row of buttons
				{components:[
					{style: 'display:inline-block;', components: [
						{kind: Control, content: 'Press Me', classes: 'sample-popup-button', ontap: 'showPopup'},
						{kind: ContextualPopup, style: 'width:200px', count: 10}
					]},
					{style: 'display:inline-block;float:right', components: [
						{kind: Control, content: 'Try Me', classes: 'sample-popup-button', ontap: 'showPopup'},
						{kind: ContextualPopup, style: 'width:250px', count: 5}
					]}
				]}
			]}
		]},
		{name: 'bottomToolbar', classes: 'onyx-menu-toolbar', style: 'background-color:lightgray', components: [
			{kind: FittableColumns, style: 'width:100%;', components:[
				{components: [
					{kind: Control, classes: 'sample-popup-button icon-button', ontap: 'showPopup', style: 'background-image: url(assets/menu-icon-bookmark.png)'},
					{kind: ContextualPopup, count: 6}
				]},
				{fit: true, style: 'position:absolute;right:0;', components: [
					{kind: Control, classes: 'sample-popup-button icon-button', ontap: 'showPopup', style: 'background-image: url(assets/menu-icon-bookmark.png)'},
					{kind: ContextualPopup, name: 'facebook', count: 6}
				]}
			]}
		]}
	],
	showPopup: function (sender, event) {
		// 
		sender.parent.waterfall('onRequestShowMenu', {
			activator: sender
		});
	}
});