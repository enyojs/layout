enyo.kind({
	name: "enyo.DynamicLayout",
	kind: "Layout",
	strategyKind: "Layout",
	//* @protected
	destroy: function() {
		this.destroyStrategy();
		this.inherited(arguments);
	},
	destroyStrategy: function() {
		if (this.strategy) {
			this.strategy.destroy();
		}
	},
	calcStrategy: function() {
		var m = this.container.minLayout;
		if (m) {
			var w = this.container.getBounds().width;
			if (w < m && this.minStrategyKind) {
				return this.minStrategyKind;
			}
		}
		return this.strategyKind;
	},
	createStrategy: function(inKind) {
		return enyo.createFromKind(inKind, this.container);
	},
	validateStrategy: function() {
		var s = this.calcStrategy();
		if (s != this.currentStrategy) {
			this.destroyStrategy();
			this.currentStrategy = s;
			this.strategy = this.createStrategy(s);
			this.strategy.flow();
		}
	},
	flow: function() {
		this.validateStrategy();
		this.strategy.flow();
	},
	reflow: function() {
		this.validateStrategy();
		this.strategy.reflow();
	}
});


enyo.kind({
	name: "BoxFitLayout",
	kind: "DynamicLayout",
	strategyKind: "MeasuredBoxLayout",
	minStrategyKind: "FitLayout",
	createStrategy: function(inKind) {
		var r =  enyo.createFromKind(inKind, this.container);
		r.orient = this.container.orient || "v";
		return r;
	}
});

enyo.kind({
	name: "enyo.SnappyLayout",
	kind: "DynamicLayout",
	strategyKind: "SnapLayout",
	minStrategyKind: "SnapFitLayout",
	orient: "h",
	createStrategy: function() {
		var r = this.inherited(arguments);
		r.setOrient(this.orient);
		return r;
	},
	measureControl: function(inControl) {
		return this.strategy.measureControl(inControl);
	}
});
