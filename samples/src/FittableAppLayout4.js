var
	kind = require('enyo/kind'),
	Button = require('enyo/Button');

var
	FittableColumns = require('layout/FittableColumns'),
	FittableRows = require('layout/FittableRows');

module.exports = kind({
	name: 'enyo.sample.FittableAppLayout4',
	kind: FittableColumns,
	classes: 'enyo-fit',
	components: [
		{kind: FittableRows, classes: 'fittable-sample-column fittable-sample-shadow4', components: [
			{fit: true},
			{classes: 'layout-sample-toolbar', components: [
				{content: 'Toolbar'}
			]}
		]},
		{kind: FittableRows, fit: true, components: [
			{fit: true, classes: 'fittable-sample-fitting-color'},
			{classes: 'layout-sample-toolbar', components: [
				{kind: Button, content: '2'}
			]}
		]}
	]
});