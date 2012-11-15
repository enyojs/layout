enyo.kind({
	name: "enyo.sample.GridListSample",
	classes: "enyo-unselectable enyo-fit onyx",
	kind: "FittableRows",
	components: [
		{kind: "onyx.Toolbar", classes: "onyx-toolbar onyx-toolbar-inline", components: [
			{kind: "onyx.InputDecorator", components: [
				{name: "searchInput", kind: "onyx.Input", value: "Hurricane", placeholder: "Enter seach term"},
				{kind: "Image", src: "assets/search-input-search.png", style: "width: 20px;"}
			]},
			{name: "sourceToggle", kind: "onyx.RadioGroup", components: [
                {content: "Twitter", active: true, ontap: "setSourceTwitter"},
               	{content: "Flickr", ontap: "setSourceFlickr"},
	            {content: "Netflix", ontap: "setSourceNetflix"}
            ]},
	        {name:"tileSpacingSlider", kind:"onyx.Slider", onChange: "tileSpacingChanged", style:"width:400px;", value: 40}
		]},
		{
			name: "list", kind: "enyo.GridList", fit:true, onSetupItem: "setupItem", onSizeupItem: "sizeupItem", style: "background:#000;", 
			itemMinWidth: 200, itemSpacing: 5, 
			components: [
				{
					name: "tile",
					style: "height:100%;padding:5px;background:#333;color:#fff;",
					components:[
						{name: "icon", kind: "Image", style: "float: left; width:auto; height: auto; margin: 0 10px 10px 0;z-index:0;"},
						{name: "name", style: "font-weight: bold;margin-top:2px;z-index:10;"},
						{name: "date", style: "font-weight:normal;font-size:12px;"},
						{name: "text", tag: "p", style: "word-wrap: break-word;font-size:12px;font-weight:normal;color:#aaa;", allowHtml: true},
						{name: "caption", style: "font-weight:bold;z-index:10;position:absolute;bottom:10px;opacity:0.7;padding:5px;font-size:14px;background:#000;color:#fff;width:100%;"}
					]
				}
	    	]
	    }
	],
	source: 'twitter',
	rendered: function() {
		this.inherited(arguments);
		this.search();
	},
	setSourceFlickr: function() {
		this.source = 'flickr';
		this.search();
	},
	setSourceNetflix: function() {
		this.source = 'netflix';
		this.search();
	},
	setSourceTwitter: function() {
		this.source = 'twitter';
		this.search();
	},
	search: function() {
		// Capture searchText and strip any whitespace
		var searchText = this.$.searchInput.getValue().replace(/^\s+|\s+$/g, '');
		if (searchText === "") {
			// For whitespace searches, set new content value in order to display placeholder
			this.$.searchInput.setValue(searchText);
			return;
		}
		if (this.source=='flickr') {
			this.searchFlickr(searchText);
		} else if (this.source=='netflix') {
			this.searchNetflix(searchText);
		} else {
			this.searchTwitter(searchText);
		}
	},
	searchTwitter: function(inSearchText) {
		this.$.list.setItemFixedSize(true);
		this.$.list.setItemFluidWidth(false);
		this.$.list.setItemWidth(160);
		this.$.list.setItemMinWidth(160);
		this.$.list.setItemHeight(160);
		this.$.list.setItemMinHeight(160);
		var req = new enyo.JsonpRequest({
			url: "http://search.twitter.com/search.json",
			callbackName: "callback"
		});
		req.response(enyo.bind(this, "processTwitterResults"));
		req.go({q: inSearchText, rpp: 100});
	},
	searchFlickr: function(inSearchText) {
		this.$.list.setItemFixedSize(false);
		this.$.list.setItemFluidWidth(false);
		this.$.list.setItemMinWidth(160);
		var params = {
			method: "flickr.photos.search",
			format: "json",
			api_key: '2a21b46e58d207e4888e1ece0cb149a5',
			per_page: 200,
			page: 0,
			text: inSearchText,
			sort: 'date-posted-desc',
			extras: 'url_m'
		};
		new enyo.JsonpRequest({url: "http://api.flickr.com/services/rest/", callbackName: "jsoncallback"}).response(this, "processFlickrResults").go(params);
	},
	searchNetflix: function(inSearchText) {
		this.$.list.setItemFluidWidth(true);
		this.$.list.setItemFixedSize(false);
		this.$.list.setItemMinWidth(320);
		var req = new enyo.JsonpRequest({
			url: "http://odata.netflix.com/Catalog/Titles?$filter=substringof('" + escape(inSearchText) + "',Name)" + "&$format=json",
			callbackName: "$callback"
		});
		var params = { 
			oauth_consumer_key: 'n7565824mb3yuv2hrgpdhvff'
		}; 
		req.response(enyo.bind(this, "processNetflixResults"));
		req.go(params);
	},
	processTwitterResults: function(inRequest, inResponse) {
		this.results = inResponse.results;
		//console.log(this.results.length);
		this.$.list.show(this.results.length);
	},
	processFlickrResults: function(inRequest, inResponse) {
		this.results = inResponse.photos.photo;
		//console.log(this.results);
		this.$.list.show(this.results.length);
	},
	processNetflixResults: function(inRequest, inResponse) {
		this.results = [];
		var movies = inResponse ? inResponse["d"]["results"] || [] : [];
		for (var i = 0; i < movies.length; i++) {
    		this.results.push(movies[i]);
        }
		this.$.list.show(this.results.length);
	},
	setupItem: function(inSender, inEvent) {
		if (this.source=='flickr') {
			this.setupFlickrItem(inSender, inEvent);
		} else if (this.source=='netflix') {
			this.setupNetflixItem(inSender, inEvent);
		} else {
			this.setupTwitterItem(inSender, inEvent);
		}
	},
	setupNetflixItem: function(inSender, inEvent) {
		var i = inEvent.index;
		var item = this.results[i];
		this.log(item);
		var color = this.generateRandomColor();
		this.$.tile.addStyles("background:" + color['bg'] + ";color:" + color['fg'] + ";");
		this.$.icon.setSrc(item.BoxArt.LargeUrl || "assets/netflix.jpg");
		this.$.name.setContent(item.Name || "Untitled");
		this.$.date.setContent(item.ReleaseYear || "Unknown");
		this.$.text.setContent(item.Synopsis);
		this.$.caption.setContent('');
		this.$.caption.addStyles("display:none;");
	},
	setupTwitterItem: function(inSender, inEvent) {
		//this.log(inEvent.index);
		var i = inEvent.index;
		var item = this.results[i];
		var color = this.generateRandomColor();
		this.$.tile.addStyles("background:" + color['bg'] + ";color:" + color['fg'] + ";");
		this.$.icon.setSrc(item.profile_image_url);
		this.$.date.setContent(this.getRelativeDateString(item.created_at));
		this.$.name.setContent(inEvent.index + ". " + item.from_user_name);
		this.$.text.setContent(item.text);
		this.$.caption.setContent('');
		this.$.caption.addStyles("display:none;");
	},
	setupFlickrItem: function(inSender, inEvent) {
		var i = inEvent.index;
		var item = this.results[i];
		//console.log(item);
		if (!item.url_m || item.url_m == '')
			return;
		this.$.tile.addStyles("background:#000;color:#fff;position:relative;");
		this.$.icon.setSrc(item.url_m);
		this.$.icon.addStyles("width:100%; height: auto;");
		this.$.date.setContent('');
		this.$.name.setContent('');
		this.$.text.setContent('');
		if (item.title == '') {
			this.$.caption.setContent('');
			this.$.caption.addStyles("display:none;");
		} else {
			this.$.caption.setContent(item.title);
			this.$.caption.addStyles("display:block;");	
		}
	},
	sizeupItem: function(inSender, inEvent) {
		if (this.source == 'flickr') {
			var i = inEvent.index;
			this.log("Index = " + i);
			var item = this.results[i];
			this.$.list.setItemWidth(item.width_m);
			this.$.list.setItemHeight(item.height_m);
		} 
	},
	tileSpacingChanged: function() {
		var spacing = Math.round(10 * this.$.tileSpacingSlider.value/100);
		this.$.list.setItemSpacing(spacing);
	},
	getRelativeDateString: function(inDateString) {
		var d = new Date(inDateString);
		var td = new Date();
		var s;
		if (td.toLocaleDateString() == d.toLocaleDateString()) {
			var dh = td.getHours() - d.getHours();
			var dm = td.getMinutes() - d.getMinutes();
			s = dh ? dh + " hour" : (dm ? dm + " minute" : td.getSeconds() - d.getSeconds() + " second");
		} else {
			var dmo = td.getMonth() - d.getMonth();
			s = dmo ? dmo + " month" : td.getDate() - d.getDate() + " day";
		}
		return s.split(" ")[0] > 1 ? s + "s ago" : s + " ago";
	},
	generateRandomColor: function () { 
		var bg = "#" + Math.random().toString(16).slice(2, 8);
		var fg = '#' + (Number('0x'+bg.substr(1)).toString(10) > 0xffffff/2 ? '000000' :  'ffffff');
		return {bg: bg, fg: fg};
	}
});