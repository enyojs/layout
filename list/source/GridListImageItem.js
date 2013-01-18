/*
 * enyo.ImageGrid extends enyo.GridList
 * 
 * @author: Surya Vakkalanka
 * @date: November 2012 
 * 
 * An Image Grid that's based on enyo.GridList, which in turn extends List to use a GridFlyweightRepeater to render items in the List. 
 * 
*/

enyo.kind({
    name: "enyo.GridList.ImageItem",
    classes: "enyo-gridlist-imageitem",
    onload: 'imgLoaded', 
    components:[
        {name: 'image', kind: 'enyo.Image'},
        {name: "caption", classes: "caption"}
    ],
    create: function() {
        this.inherited(arguments);
        this.sourceChanged();
    },
    published: {
        source: '',
        caption: '',
        selected: false
    },
    sourceChanged: function() {
        if (!this.source || this.source == '') {
            return;
        }
        this.$.image.setAttribute('src', this.source);
    },
    captionChanged: function() {
        if (!this.caption || this.caption == '') {
            this.$.caption.setContent(this.caption);
            this.$.caption.setShowing(false);
            return;
        }
        this.$.caption.setShowing(true);
        this.$.caption.setContent(this.caption);
    },
    selectedChanged: function() {
        this.log(this.isSelected);
        this.addRemoveClass("selected", this.selected);
    }
});