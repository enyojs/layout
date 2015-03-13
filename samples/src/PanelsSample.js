
var
	kind = require('enyo/kind'),
	ready = require('enyo/ready'),
	utils = require('enyo/utils'),
	drag = require('enyo/drag'),
	Scroller = require('enyo/Scroller'),
	Select = require('enyo/Select'),
	Button = require('enyo/Button'),
	ToolDecorator = require('enyo/ToolDecorator'),
	Input = require('enyo/Input');

var
	CardArranger = require('layout/CardArranger'),
	CardSlideInArranger = require('layout/CardSlideInArranger'),
	CarouselArranger = require('layout/CarouselArranger'),
	CollapsingArranger = require('layout/CollapsingArranger'),
	DockRightArranger = require('layout/DockRightArranger'),
	FittableColumns = require('layout/FittableColumns'),
	FittableRows = require('layout/FittableRows'),
	GridArranger = require('layout/GridArranger'),
	LeftRightArranger = require('layout/LeftRightArranger'),
	Panels = require('layout/Panels'),
	SpiralArranger = require('layout/SpiralArranger'),
	TopBottomArranger = require('layout/TopBottomArranger');

var MyGridArranger = kind({
	kind: GridArranger,
	colHeight: '150',
	colWidth: '150'
});

var PanelsSample = module.exports = kind({
	name: 'enyo.sample.PanelsSample',
	kind: FittableRows,
	classes: 'enyo-sample-panelssample enyo-fit',
	components: [
		{classes: 'toolbar', components: [
			{name: 'arrangerPicker', kind: Select, maxHeight: 360, floating: true, onchange: 'arrangerSelected', components: [
				{content: 'Arranger'}
			]},
			{kind: Button, content: 'Previous', ontap: 'prevPanel'},
			{kind: Button, content: 'Next', ontap: 'nextPanel'},
			{kind: ToolDecorator, components: [
				{kind: Input, value: 0, onchange: 'gotoPanel'}
			]},
			{kind: Button, content: 'Go', ontap: 'gotoPanel'},
			{kind: Button, content: 'Add', ontap: 'addPanel'},
			{kind: Button, content: 'Delete', ontap: 'deletePanel'}
		]},
		{kind: Panels, name: 'samplePanels', fit: true, realtimeFit: true, classes: 'panels-sample-panels enyo-border-box', components: [
			{content: 0, style: 'background:red;'},
			{content: 1, style: 'background:orange;'},
			{content: 2, style: 'background:yellow;'},
			{content: 3, style: 'background:green;'},
			{content: 4, style: 'background:blue;'},
			{content: 5, style: 'background:indigo;'},
			{content: 6, style: 'background:violet;'}
		]}
	],
	panelArrangers: [
		{name: 'CardArranger', arrangerKind: CardArranger},
		{name: 'CardSlideInArranger', arrangerKind: CardSlideInArranger},
		{name: 'CarouselArranger', arrangerKind: CarouselArranger, classes: 'panels-sample-wide'},
		{name: 'CollapsingArranger', arrangerKind: CollapsingArranger, classes: 'panels-sample-collapsible'},
		{name: 'LeftRightArranger', arrangerKind: LeftRightArranger},
		{name: 'TopBottomArranger', arrangerKind: TopBottomArranger, classes: 'panels-sample-topbottom'},
		{name: 'SpiralArranger', arrangerKind: SpiralArranger, classes: 'panels-sample-spiral'},
		{name: 'GridArranger', arrangerKind: MyGridArranger, classes: 'panels-sample-grid'},
		{name: 'DockRightArranger', arrangerKind: DockRightArranger, classes: 'panels-sample-collapsible'}
	],
	bgcolors: ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'],
	create: kind.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			for (var i=0; i<this.panelArrangers.length; i++) {
				this.$.arrangerPicker.createComponent({content:this.panelArrangers[i].name});
			}
			this.panelCount=this.$.samplePanels.getPanels().length;
		};
	}),
	arrangerSelected: function(sender, event) {
		var sp = this.$.samplePanels;
		var p = this.panelArrangers[sender.selected - 1];
		if (this.currentClass) {
			sp.removeClass(this.currentClass);
		}
		if (p) {
			if (p.classes) {
				sp.addClass(p.classes);
				this.currentClass = p.classes;
			}
			sp.setArrangerKind(p.arrangerKind);
			if (Panels.isScreenNarrow()) {
				this.setIndex(1);
			}
		}
	},
	// panels
	prevPanel: function() {
		this.$.samplePanels.previous();
		this.$.input.setValue(this.$.samplePanels.index);
	},
	nextPanel: function() {
		this.$.samplePanels.next();
		this.$.input.setValue(this.$.samplePanels.index);
	},
	gotoPanel: function() {
		this.$.samplePanels.setIndex(this.$.input.getValue());
	},
	panelCount: 0,
	addPanel: function() {
		var sp = this.$.samplePanels;
		var i = this.panelCount++;
		var p = sp.createComponent({
			style: 'background: ' + this.bgcolors[i % this.bgcolors.length],
			content:i
		});
		p.render();
		sp.reflow();
		sp.setIndex(i);
	},
	deletePanel: function() {
		var p = this.$.samplePanels.getActive();
		if (p) {
			p.destroy();
		}
	}
});