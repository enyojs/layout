(function (enyo, scope) {

    /**
    * @ui
    * @class enyo.FlexLayout.ResponseStrategy
    * @extends enyo.Control
    * @private
    */

    enyo.kind({
        name: 'enyo.FlexLayout.ResponseStrategy',

        /**
        * @private
        * @method
        */
        setProperty: function(oControl, sProperty, mValue) {
            if (sProperty == 'flexOrient') {
                enyo.Styles.setStyles(oControl, {width: 'auto', height: 'auto'});
            }

            oControl['__' + sProperty] = (typeof oControl[sProperty] == 'undefined'
                ? null
                : oControl[sProperty]
            );
            oControl[sProperty] = mValue;

            if (oControl.layout) {
                oControl.layout.reflow();
            }
        },

        /**
        * @private
        * @method
        */
        reverseProperty: function(oControl, sProperty) {
            if (sProperty == 'flexOrient') {
                enyo.Styles.setStyles(oControl, {width: 'auto', height: 'auto'});
            }

            var sTempProperty = '__' + sProperty;
            if (typeof oControl[sTempProperty] != 'undefined') {
                if (oControl[sTempProperty] !== null) {
                    oControl[sProperty] = oControl[sTempProperty];
                } else {
                    delete oControl[sProperty];
                }
                delete oControl[sTempProperty];
            }

            if (oControl.layout) {
                oControl.layout.reflow();
            }
        },

        /**
        * @private
        * @method
        */
        respond: function() {}
    });

})(enyo, this);