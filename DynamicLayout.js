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