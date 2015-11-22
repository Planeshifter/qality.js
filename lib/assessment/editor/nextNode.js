'use strict';

// MODULES //

const $ = require( 'jquery' );


// NEXT NODE //

/**
* FUNCTION: nextNode()
*	Re-assigns the active_node class to the next node in the sequence.
*
* @returns {Void}
*/
function nextNode() {
	/* jshint validthis:true */
	var self = this;
	if ( self.sequence.nodes.length > self.activeID ) {
		$(".node").removeClass("active_node");
		self.activeID += 1;
		self.sequence.nodes[self.activeID].paint_node();
		var n = "#node_" + self.activeID;
		$( n ).addClass("active_node");
	}
} // end FUNCTION nextNode()


// EXPORTS //

module.exports = nextNode;
