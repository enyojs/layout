/**
 * Layout OmniFlexLayout Mixin
 * 
 * @author Lex Podgorny <lex.podgorny@lge.com>
 */

enyo.createMixin({
	name: 'LayoutInvalidator',
});

enyo.Control.extend({
	mixins: ['LayoutInvalidator']
});
