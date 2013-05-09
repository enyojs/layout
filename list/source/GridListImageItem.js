/**
	_enyo.GridList.ImageItem_ is a convenience component that may be used inside
	an <a href="#enyo.GridList">enyo.GridList</a> to display an image grid.
*/

enyo.kind({
    name: "enyo.GridList.ImageItem",
    classes: "enyo-gridlist-imageitem",
    components:[
        {name: 'image', kind: 'enyo.Image'},
        {name: "caption", classes: "caption"},
        {name: "subCaption", classes: "sub-caption"}
    ],
    create: function() {
        this.inherited(arguments);
        this.sourceChanged();
    },
    published: {
        //* The absolute URL path to the image
        source: '',
        //* The primary caption to be displayed with the image
        caption: '',
        //* The second caption line to be displayed with the image
        subCaption: '',
        /**
            Set to true to add the _selected_ class to the image tile; set to
            false to remove the _selected_ class
        */
        selected: false
    },
    //* @protected
    sourceChanged: function() {
        if (!this.source) {
            return;
        }
        this.$.image.setAttribute('src', this.source);
    },
    //* @protected
    captionChanged: function() {
        if (!this.caption) {
            this.$.caption.setContent(this.caption);
            this.$.caption.setShowing(false);
            return;
        }
        this.$.caption.setShowing(true);
        this.$.caption.setContent(this.caption);
    },
    //* @protected
    subCaptionChanged: function() {
        if (!this.subCaption) {
            this.$.subCaption.setContent(this.subCaption);
            this.$.subCaption.setShowing(false);
            return;
        }
        this.$.subCaption.setShowing(true);
        this.$.subCaption.setContent(this.subCaption);
    },
    //* @protected
    selectedChanged: function() {
        this.addRemoveClass("selected", this.selected);
    }
});