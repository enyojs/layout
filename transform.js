// add some useful static methods to enyo.Layout as statics
enyo.mixin(enyo.Layout, {
	canAccelerate: function() {
		return this.accelerando !== undefined ? this.accelerando: document.body && (this.accelerando = this.calcCanAccelerate());
	},
	calcCanAccelerate: function() {
		var b = document.body;
		var p$ = ["perspective", "msPerspective", "MozPerspective", "WebkitPerspective", "OPerspective"];
		for (var i=0, p; p=p$[i]; i++) {
			if (typeof document.body.style[p] != "undefined") {
				return true;
			}
		}
		return false;
	},
	domTransformProps: ["-webkit-transform", "-moz-transform", "-ms-transform", "-o-transform", "transform"],
	cssTransformProps: ["webkitTransform", "MozTransform", "msTransform", "OTransform", "transform"],
	transform: function(inControl, inTransform, inForceNonAccelerated) {
		var t = inTransform + (this.canAccelerate() && !inForceNonAccelerated ? " translateZ(0)" : "");
		var ds = inControl.domStyles;
		// FIXME: it'd be better to only set the supported property...
		for (var i=0, p; (p=this.domTransformProps[i]); i++) {
			ds[p] = t;
		}
		if (inControl.hasNode()) {
			var s = inControl.node.style;
			for (var i=0, p; (p=this.cssTransformProps[i]); i++) {
				s[p] = t;
			}
		}
	}
});