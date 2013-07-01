enyo.kind({
	name        : 'enyo.sample.FlexLayoutInvalidationSample',
	classes     : 'flex-layout-sample enyo-unselectable',
	layoutKind  : 'enyo.FlexLayout',
	flexSpacing : 10,
	
	handlers: {
		onReflow: 'onReflow'
	},
	components: [
		{name: 'uberBlock1', flexOrient: 'column', style: 'width: 200px',  content: 'Block 1', classes: 'left-column', components: [
			{name: 'button1', kind: 'onyx.Button', content: 'Add column content',       ontap: 'addContent1'},
			{name: 'button2', kind: 'onyx.Button', content: 'Add row content',          ontap: 'addContent2'},
			{name: 'button3', kind: 'onyx.Button', content: 'Set flexBias to "column"', ontap: 'toggleBias'},
			{name: 'button4', kind: 'onyx.Button', content: 'Set flexStretch to false', ontap: 'toggleStretch'},
			{name: 'button5', kind: 'onyx.Button', content: 'Set flexSpacing to 0',     ontap: 'toggleSpacing'},
			{name: 'stats'}
		]},
		{
			name              : 'uberBlock2',
			layoutKind        : 'enyo.FlexLayout',
			flexStretch       : true,
			flexOrient        : 'column',
			flex              : true,
			flexSpacing       : 10,
			flexBias          : 'row',
			flexResponseWidth : 1000,
			components: [
				{name: 'block1', allowHtml: true,
					flexOrient   : 'column',
					flex         : true
				},
				{name: 'block2', allowHtml: true,
					flexOrient   : 'column',
					flexResponse : 'RowAfterColumns'
				},
				{name: 'block3', allowHtml: true,
					flexOrient   : 'column',
					flexResponse : 'RowAfterColumns',
					flex         : 'content',
					maxWidth     : 250,
					maxHeight    : 100
				},
				{name: 'block5', allowHtml: true,
					flexOrient   : 'column',
					flex         : true
				},
				{name: 'block6', allowHtml: true,
					flex         : 'content',
					flexOrient   : 'row',
					maxWidth     : 200,
					maxHeight    : 100
				},
				{name: 'block7', allowHtml: true,
					flexOrient   : 'row',
					flex         : true
				},
				{name: 'block8', allowHtml: true,
					flexOrient   : 'column',
					flex         : true
				},
				{name: 'block9',
					layoutKind   : 'enyo.FlexLayout',
					flexBias     : 'column',
					flexOrient   : 'row',
					flexSpacing  : 0,
					flexStretch  : false,
					flex         : true,
					components: [
						{name: 'button10', kind: 'onyx.Button', content: 'Append my content', ontap: 'addContent4'},
						{name: 'spacer1', flex: true},
						{name: 'button11', kind: 'onyx.Button', content: 'Button 11', ontap: 'addContent5'}
					]
				}
			]
		}
	],
	statics: {
		loremIpsum: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, ' +
			'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
			'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut ' +
			'aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in ' +
			'voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint ' +
			'occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit ' +
			'anim id est laborum.',
			
		colors: [
			'#668CFF', '#8C66FF', '#D966FF',
			'#FF66D9', '#FF668C', '#FF8C66',
			'#295EFF', '#003BEB', '#FFC929',
			'#EBB000'
		]
	},

	create: function() {
		this.inherited(arguments);
	},

	rendered: function() {
		this.inherited(arguments);

		var oControl,
			n       = 0;

		for (; n<this.$.uberBlock2.children.length; n++) {
			oControl = this.$.uberBlock2.children[n];
			enyo.Styles.setStyles(oControl, {'background-color' : enyo.sample.FlexLayoutInvalidationSample.colors[n]}, true);
		}
	},

	markBlocks: function() {
		enyo.forEach(this.$.uberBlock2.children, function(oControl) {
			var aContent = oControl.getContent().split('<br />');
			oControl.setContent([
				'flex:&nbsp;'       + (typeof oControl.flex == 'undefined' ? 'false' : oControl.flex),
				'flexOrient:&nbsp;' + oControl.flexOrient
			].join('<br />') + '<br />'+ aContent[aContent.length - 1]);
		});
		// this.$.uberBlock2.layout.reflow();
	},

	setupItem: function(inSender, inEvent) {
		var index = inEvent.index;
		var item = inEvent.item;
		var person = this.people[index];
		item.$.personNumber.setContent((index+1) + '. ');
		item.$.personName.setContent(person.name);
		return true;
	},

	addContent: function(oControl, nLength) {
		oControl.addContent(' ' + enyo.sample.FlexLayoutInvalidationSample.loremIpsum.substr(0, nLength));
	},

	addContent1: function() {
		this.addContent(this.$.block3, 11);
	},

	addContent2: function() {
		this.addContent(this.$.block6, 100);
	},
	
	addContent4: function() {
		this.addContent(this.$.button10, 5);
	},
	
	toggleColor: function() {
		
	},

	reflowUberBlock2: function() {
		this.$.uberBlock2.layout.reflow();
		enyo.forEach(this.$.uberBlock2.children, function(oControl) {
			if (oControl.layout) {
				oControl.layout.reflow();
			}
		});
	},

	toggleBias: function() {
		if (this.$.uberBlock2.flexBias != 'column') {
			this.$.uberBlock2.flexBias = 'column';
			this.$.button3.setContent('Set flexBias to "row"');
		} else {
			this.$.uberBlock2.flexBias = 'row';
			this.$.button3.setContent('Set flexBias to "column"');
		}
		this.reflowUberBlock2();
	},

	toggleStretch: function() {
		if (typeof this.$.uberBlock2.flexStretch == 'undefined' || !this.$.uberBlock2.flexStretch) {
			this.$.uberBlock2.flexStretch = true;
			this.$.button4.setContent('Set flexStretch to false');
		} else {
			this.$.uberBlock2.flexStretch = false;
			this.$.button4.setContent('Set flexStretch to true');
		}
		enyo.forEach(this.$.uberBlock2.children, function(oControl) {
			enyo.Styles.setStyles(oControl, {width: 'auto', height: 'auto'}, false);
		});
		this.reflowUberBlock2();
	},

	toggleSpacing: function() {
		if (typeof this.$.uberBlock2.flexSpacing == 'undefined' || this.$.uberBlock2.flexSpacing == 10) {
			this.$.uberBlock2.flexSpacing = 0;
			this.$.button5.setContent('Set flexSpacing to 10');
		} else {
			this.$.uberBlock2.flexSpacing = 10;
			this.$.button5.setContent('Set flexSpacing to 0');
		}
		this.reflowUberBlock2();
	},

	onReflow: function(oSender, oEvent) {
		if (oEvent.originator == this.$.uberBlock2) {
			// this.markBlocks();
		}
	}
});