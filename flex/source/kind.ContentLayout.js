/**
 * Content Layout
 * Provides a container with fixed widht and/or height that resizes to reveal it's content
 * Supports Webkit, Mozilla, IE8
 * @author Lex Podgorny <lex.podgorny@lge.com>
 */

enyo.kind({
	name        : 'enyo.ContentLayout',
	layoutClass : 'enyo-content-layout',
	kind        : 'Layout',

	minWidth    : 0,
	minHeigh    : 0,
	maxWidth    : 0,
	maxHeight   : 0,
	
	_updateBoundValues: function() {
		this.minWidth  = this.container.minWidth;
		this.minHeight = this.container.minHeight;
		this.maxWidth  = this.container.maxWidth;
		this.maxHeight = this.container.maxHeight;
	},
	
	_resize: function() {
		this._updateBoundValues();
		
		var oStyles = new enyo.Styles(this.container);

		// If empty container, return min sizes
		/************************************************************************/
		if (this.container.children.length == 0 && this.container.content.length == 0) {
			oStyles.setBoxWidth(this.minWidth);
			oStyles.setBoxHeight(this.minHeight);
			oStyles.commit();
			return;
		}
		
		// If at max size, simply return max sizes
		/************************************************************************/
		if (oStyles.content.width >= this.maxWidth && oStyles.content.height >= this.maxHeight) {
			oStyles.setBoxWidth(this.maxWidth);
			oStyles.setBoxHeight(this.maxHeight);
			oStyles.commit();
			return;
		}
		
		// Otherwise
		/************************************************************************/
		
		var oElement = document.createElement(this.container.node.nodeName),
			nWidth,
			nHeight = this.minHeight;
			
		// Get width
		/************************************************************************/
			
		oElement.innerHTML     = this.container.node.innerHTML;
		oElement.className     = this.container.node.className;
		oElement.id            = this.container.node.id;
		oElement.style.display = 'inline';
		
		this.container.node.parentNode.appendChild(oElement);
		nWidth = oElement.offsetWidth;// - oStyles.h.border - oStyles.h.padding;
		
		// Constrain to maxWidth
		
		if (nWidth < this.minWidth)   { nWidth = this.minWidth; }
		if (nWidth > this.maxWidth)   { nWidth = this.maxWidth; }
		
		// Get height
		/************************************************************************/
		
		oElement.height = 'auto';
		oElement.style.display   = 'block';
		oElement.style.width     = nWidth + 'px';
		nHeight                  = oElement.offsetHeight - oStyles.v.outerOffset;
			
		this.container.node.parentNode.removeChild(oElement);
		
		// Constrain to maxHeight
		
		if (nHeight < this.minHeight) { nHeight = this.minHeight; }
		if (nHeight > this.maxHeight) { nHeight = this.maxHeight; }
		
		/************************************************************************/
		
		oStyles.setContentWidth(nWidth);
		oStyles.setContentHeight(nHeight);
		oStyles.set('overflow', 'auto');
		
		oStyles.commit();
	},
	
	reflow : function() {
		var oSize = this._resize();
		
		if (this.container.parent.layout instanceof enyo.FlexLayout) {
			this.container.parent.layout.reflow();
		}
	}
});
