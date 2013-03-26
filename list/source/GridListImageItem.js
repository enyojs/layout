/**
    _enyo.GridList.ImageItem_ is a convenience component that can be used inside a _enyo.GridList_ to display an ImageGrid.

    @author: Surya Vakkalanka
    @date: November 2012

    An ImageGrid that's based on _enyo.GridList_, which in turn extends _enyo.List_ to render items in the List in a Grid layout.
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
        //* Sets the absolute URL path to the image
        source: '',
        //* Sets the primary caption to be displayed along with the image
        caption: '',
        //* Sets the second caption line to be displayed along with the image
        subCaption: '',
        //* set to true to add 'selected' class to the image tile, false to remove the 'selected' class
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