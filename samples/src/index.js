var
	kind = require('enyo/kind'),
	ready = require('enyo/ready'),
	Anchor = require('enyo/Anchor'),
	Collection = require('enyo/Collection'),
	Control = require('enyo/Control'),
	DataRepeater = require('enyo/DataRepeater');

var
	samples = {
		ContextualLayout			: require('./ContextualLayoutSample'),
		Easing						: require('./EasingSample'),
		FittableAppLayout1			: require('./FittableAppLayout1'),
		FittableAppLayout2			: require('./FittableAppLayout2'),
		FittableAppLayout3			: require('./FittableAppLayout3'),
		FittableAppLayout4			: require('./FittableAppLayout4'),
		FittableDescription			: require('./FittableDescription'),
		FittableTests				: require('./FittableTests'),
		Fittable					: require('./FittableSample'),
		FlyweightRepeater			: require('./FlyweightRepeaterSample'),
		ImageCarousel				: require('./ImageCarouselSample'),
		ImageView					: require('./ImageViewSample'),
		ListAround					: require('./ListAroundSample'),
		ListBasic					: require('./ListBasicSample'),
		ListContacts				: require('./ListContactsSample'),
		ListHorizontalFlickr		: require('./ListHorizontalFlickrSample'),
		ListLanguages				: require('./ListLanguagesSample'),
		ListNoSelect				: require('./ListNoSelectSample'),
		ListPulldown				: require('./ListPulldownSample'),
		PersistentSwipeableItem		: require('./PersistentSwipeableItemSample'),
		Panels						: require('./PanelsSample'),
		PanelsFlickr				: require('./PanelsFlickrSample'),		
		PanelsSliding				: require('./PanelsSlidingSample'),
		PanZoomView1				: require('./PanZoomViewSample'),
		PanZoomView2				: require('./PanZoomViewSample2'),
		PanZoomView3				: require('./PanZoomViewSample3'),
		Slideable					: require('./SlideableSample'),
		Tree						: require('./TreeSample')
	};

var List = kind({
	kind: Control,
	components: [
		{name: 'list', kind: DataRepeater, components: [
			{style: 'margin: 10px;', components: [
				{name: 'a', kind: Anchor}
			], bindings: [
				{from: 'model.name', to: '$.a.href', transform: function (v) { return '?' + v; }},
				{from: 'model.name', to: '$.a.content', transform: function (v) { return v + ' Sample'; }}
			]}
		]}
	],
	create: function () {
		Control.prototype.create.apply(this, arguments);
		this.$.list.set('collection', new Collection(Object.keys(samples).map(function (key) {
			return {name: key};
		})));
	}
});

ready(function () {
	var name = window.document.location.search.substring(1),
		Sample = samples[name] || List;

	new Sample({samples: samples}).renderInto(document.body);
});