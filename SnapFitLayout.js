enyo.kind({
	name: "enyo.SnapFitLayout",
	kind: "SnapLayout",
	calcMeasuredBound: function(inControl) {
		return "100%";
	}
});

enyo.kind({
	name: "enyo.HSnapFitLayout",
	kind: enyo.SnapFitLayout,
	orient: "h"
});

enyo.kind({
	name: "enyo.VSnapFitLayout",
	kind: enyo.SnapFitLayout,
	orient: "v"
});