enyo.kind({
	name: 'enyo.sample.GridLayoutDrawerSample',
	classes: 'grid-layout-drawer-sample enyo-fit',
	layoutKind: 'HGridLayout',
	spacing: 0,
	components: [
		{name: 'column1', content: 'Open', classes: 'column', ontap: 'openDrawer'},
		{name: 'drawer', orient: 'h', kind: 'enyo.Drawer', classes: 'drawer', open: false, components: [
			{name: 'shuflyatka', content: 'H-Drawer', classes: 'drawer-sample-box drawer-sample-mlr'}
		]},
		{name: 'column2', content: 'Column2', flex: true},
	],
	openDrawer: function() {
		this.$.drawer.setOpen(!this.$.drawer.open);
		return true;
	},
	rendered: function() {
		this.layout.reflow();
	}
});
