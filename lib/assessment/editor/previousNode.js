'use strict';

// MODULES //

const $ = require( 'jquery' );


// PREVIOUS NODE //

/**
* FUNCTION: prevNode()
*	Re-assigns the active_node class to the previous node in the sequence..
*
* @returns {Void}
*/
function prevNode() {
	/* jshint validthis:true */
	var self = this;
	if (self.activeID > 0) {
		$(".node").removeClass("active_node");
		self.activeID -= 1;
		self.sequence.nodes[self.activeID].paint_node();
		var n = "#node_" + self.activeID;
		$(n).addClass("active_node");
	}
} // end FUNCTION prevNode()


// EXPORTS //

module.exports = prevNode;
