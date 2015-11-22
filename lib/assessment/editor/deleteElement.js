'use strict';

// MODULES //

const $ = require( 'jquery' );


// DELETE ELEMENT //

/**
* FUNCTION: deleteElement()
*	Deletes a qality node (e.g. multiple-choice or input node).
*
* @returns {Void}
*/
function deleteElement() {
	/* jshint validthis:true */
	var self = this;
	var no = self.activeID;
	var r = confirm( 'Click ok if you want to delete node #' + no );
	if ( r === true ) {
		var list = [];
		for (var i = 0; i < self.sequence.nodes.length; i++) {
			if ( i !== no ) {
				list.push( self.sequence.nodes[i] );
			}
		}
		for (var j = 0; j < list.length; j++) {
			list[j].id = j;
		}
		$( '.sequence-inner' ).html( '' );
		self.sequence.nodes = list;
		self.repaint_nodes();
		if ( self.sequence.nodes.length > 0 ) {
			self.activeID = 0;
			self.sequence.nodes[0].paint_node();
			$( '#node_0' ).addClass( 'active_node' );
		} else {
			$( '.question' ).remove();
			$( '.answers' ).remove();
		}
	}
} // end FUNCTION deleteElement()


// EXPORTS //

module.exports = deleteElement;
