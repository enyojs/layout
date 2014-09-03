(function (enyo, scope) {

    /**
    * _enyo.FittableRows_ provides a container in which items are laid out in a
    * set	of horizontal rows, with most of the items having natural size, but one
    * expanding to fill the remaining space. The one that expands is labeled with
    * the attribute _fit: true_.
    *
    * For more information, see the documentation on
    * [Fittables](building-apps/layout/fittables.html) in the Enyo Developer Guide.
    *
    * @ui
    * @class  enyo.FittableRows
    * @extends enyo.Control
    * @public
    */

    enyo.kind(/** @lends  enyo.FittableRows.prototype */{

        /**
        * @private
        */
        name: 'enyo.FittableRows',

        /**
        * A [kind]{@link external:kind} used to manage the size and placement of child
        * [components]{@link enyo.Component}.
        *
        * @type {String}
        * @default ''
        * @private
        */
        layoutKind: 'FittableRowsLayout',

        /**
        * By default, items in columns stretch to fit horizontally; set to true to
        * avoid this behavior
        *
        * @type {Boolean}
        * @default 'false'
        * @public
        */
        noStretch: false
    });

})(enyo, this);