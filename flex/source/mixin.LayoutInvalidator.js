(function (enyo, scope) {

    /**
    * Layout Invalidator Mixin for IE
    * Triggers FlexLayout reflow whenever content or class is changed
    *
    * @ui
    * @class enyo.LayoutInvalidator
    * @extends enyo.Control
    * @private
    */
    enyo.LayoutInvalidator = {

        /**
        * @private
        */
        name: 'LayoutInvalidator',

        handlers: {
            onInvalidateLayout: 'onInvalidateLayout'
        },

        /**
        * @method
        * @private
        */
        onInvalidateLayout: function() {
            if (!this.layoutKind) { return false; }
            if (this.layout.kindName == 'enyo.ContentLayout') {
                this.layout.reflow();
            }
        },


        /**
        * @method
        * @private
        */
        rendered: enyo.inherit(function (sup) {
            return function() {
                sup.apply(this, arguments);
                this.invalidateLayout();
            };
        }),

        /**
        * @method
        * @private
        */
        invalidateLayout: function() {
            if (!this.hasNode()) { return; }
            this.bubble('onInvalidateLayout', {}, this);
        },

        /**
        * @method
        * @private
        */
        contentChanged: enyo.inherit(function (sup) {
            return function() {
                sup.apply(this, arguments);
                this.invalidateLayout();
            };
        }),


        /**
        * @method
        * @private
        */
        classesChanged: enyo.inherit(function (sup) {
            return function() {
                sup.apply(this, arguments);
                this.invalidateLayout();
            };
        })

        // Causes stack overflow
        // domStylesChanged: function() {
        //    sup.apply(this, arguments);
        //    this.invalidateLayout();
        // }
    };

    enyo.Control.extend({
        mixins: ['enyo.LayoutInvalidator']
    });


})(enyo, this);