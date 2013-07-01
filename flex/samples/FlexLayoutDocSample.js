enyo.kind({
	name        : 'enyo.sample.FlexLayoutSample',
	classes     : 'flex-container enyo-fit',
	layoutKind  : 'enyo.FlexLayout',
	flexSpacing : 10,
	flexStretch : false,
	components  : [
		{content: 'Block 0', flex: true},
		{content: 'Block 1'},
		{content: 'Block 2', flexOrient: 'column', flex: true},
		{content: 'Block 3', flexOrient: 'column'}
	]}
);