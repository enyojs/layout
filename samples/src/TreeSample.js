var
	kind = require('enyo/kind'),
	Scroller = require('enyo/Scroller'),
	Selection = require('enyo/Selection');

var
	FittableRows = require('layout/FittableRows'),
	TreeNode = require('layout/Node');

module.exports = kind({
	name: 'enyo.sample.TreeSample',
	classes: 'enyo-unselectable enyo-fit',
	kind: FittableRows,
	fit: true,
	components: [
		{kind: Selection, onSelect: 'select', onDeselect: 'deselect'},
		{kind: Scroller, fit: true, components: [
			{kind: TreeNode, icon: 'assets/folder-open.png', content: 'Tree', expandable: true, expanded: true, onExpand: 'nodeExpand', onNodeTap: 'nodeTap', components: [
				{icon: 'assets/file.png', content: 'Alpha'},
				{icon: 'assets/folder-open.png', content: 'Bravo', expandable: true, expanded: true, components: [
					{icon: 'assets/file.png', content: 'Bravo-Alpha'},
					{icon: 'assets/file.png', content: 'Bravo-Bravo'},
					{icon: 'assets/file.png', content: 'Bravo-Charlie'}
				]},
				{icon: 'assets/folder.png', content: 'Charlie', expandable: true, components: [
					{icon: 'assets/file.png', content: 'Charlie-Alpha'},
					{icon: 'assets/file.png', content: 'Charlie-Bravo'},
					{icon: 'assets/file.png', content: 'Charlie-Charlie'}
				]},
				{icon: 'assets/folder-open.png', content: 'Delta', expandable: true, expanded: true, components: [
					{icon: 'assets/file.png', content: 'Delta-Alpha'},
					{icon: 'assets/file.png', content: 'Delta-Bravo'},
					{icon: 'assets/file.png', content: 'Delta-Charlie'}
				]},
				{icon: 'assets/file.png', content: 'Epsilon'}
			]}
		]}
	],
	nodeExpand: function (sender, event) {
		sender.setIcon('assets/' + (sender.expanded ? 'folder-open.png' : 'folder.png'));
	},
	nodeTap: function (sender, event) {
		var node = event.originator;
		this.$.selection.select(node.id, node);
	},
	select: function (sender, event) {
		event.data.$.caption.applyStyle('background-color', 'lightblue');
	},
	deselect: function (sender, event) {
		event.data.$.caption.applyStyle('background-color', null);
	}
});