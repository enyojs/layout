var
	kind = require('enyo/kind'),
	Button = require('enyo/Button');

var
	FittableColumns = require('layout/FittableColumns'),
	FittableRows = require('layout/FittableRows');

module.exports = kind({
	name: 'enyo.sample.FittableAppLayout2',
	kind: FittableColumns,
	classes: 'enyo-fit',
	components: [
		{kind: FittableRows, classes: 'fittable-sample-column', components: [
			{fit: true},
			{classes: 'layout-sample-toolbar', components: [
				{kind: Button, content: '1'}
			]}
		]},
		{kind: FittableRows, classes: 'fittable-sample-column fittable-sample-shadow', components: [
			{fit: true, style: ''},
			{classes: 'layout-sample-toolbar', components: [
				{kind: Button, content: '2'}
			]}
		]},
		{kind: FittableRows, fit: true, classes: 'fittable-sample-shadow', components: [
			{fit: true, classes: 'fittable-sample-fitting-color'},
			{classes: 'layout-sample-toolbar', components: [
				{kind: Button, content: '3'}
			]}
		]}
	]
});