/**
 * Basic Layout
 * Allows for masic multiple columns and rows.
 * @author Kunmyon Choi <kunmyon.choi@lge.com>
 */

/** Vertical layout needs always height in container */
enyo.kind({
    name        : 'enyo.VCenter',
    kind        : enyo.Control,
    classes     : 'enyo-vcenter', 
    create: function() {
        this.inherited(arguments);
        this.contentChanged();
    },
    components: [{
        classes: 'enyo-fill enyo-table enyo-children-middle',
        components: [{
            name: 'client',
            classes: 'enyo-table-cell'
        }]
    }],
    resize: function() {
        this.inherited(arguments);
        this.applyStyle("height", this.container.getComputedStyleValue("height"));
    },
    contentChanged: function(inOld) {
        this.$.client.setContent(this.content);
    }
});

enyo.kind({
    name        : 'enyo.HLayout',
    kind        : enyo.Control,
    /**
        Align child controls in horizontal layout
    */
    classes     : 'enyo-h-layout'
});

enyo.kind({
    name        : 'enyo.VLayout',
    kind        : enyo.Control,
    /**
        Align child controls in vertical layout
    */
    classes     : 'enyo-v-layout'
});

enyo.kind({
	name        : 'enyo.HBox',
	kind        : enyo.Control,
    /**
        Define this controls as a horizontal box
    */
	classes     : 'enyo-h-box'
});

enyo.kind({
	name        : 'enyo.VBox',
	kind        : enyo.Control,
    /**
        Define this controls as a vertical box
    */
	classes     : 'enyo-v-box'
});
