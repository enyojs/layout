var
	kind = require('enyo/kind'),
	Animator = require('enyo/Animator'),
	Button = require('enyo/Button'),
	Select = require('enyo/Select');

var
	easing = require('layout/easing');

module.exports = kind({
	name: 'moon.sample.EasingSample',
	classes: 'enyo-unselectable easing-sample',
	components: [
		{kind: Animator, name: 'animator', onStep: 'animatorStep', onEnd: 'animatorComplete', easingFunction: easing.linear},
		{name: 'container', classes: 'easing-sample-ball-container', components: [
			{name: 'box', classes: 'easing-sample-ball'}
		]},
		{classes: 'easing-sample-control-container', style: 'display:inline-block;', components: [
			{name: 'menu', kind: Select, onchange: 'itemSelected', components: [
				{content: 'Easing Type'}
			]},
			{name: 'btnAnimate', kind: Button, content: 'Animate', ontap: 'play'}
		]}
	],
	duration: 1000,
	create: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.buildMenu();
		};
	}),
	itemSelected: function(sender, event) {
		var item = Object.keys(easing)[sender.selected - 1];
		this.$.animator.setEasingFunction(easing[item] || easing.linear);
		this.play();
	},
	play: function() {
		this.$.btnAnimate.set('disabled', true);
		this.$.animator.play({
			startValue: 0,
			endValue: 150,
			node: this.$.box.hasNode(),
			duration: this.duration
		});
	},
	animatorStep: function(sender) {
		this.$.box.applyStyle('top', sender.value + 'px');
		return true;
	},
	animatorComplete: function(sender) {
		this.$.btnAnimate.set('disabled', false);
		return true;
	},
	buildMenu: function() {
		for (var k in easing){
			this.$.menu.createComponent({content: k});
		}
	}
});
