'use strict';

// MODULES //

const $ = require( 'jquery' );


// CLEAR SEQUENCE //

/**
* FUNCTION: clearSequence()
*
*
* @returns {Void}
*/
function clearSequence() {
	/* jshint validthis:true */
	var self = this;
	$( '.node' ).remove();
	$( '.area' ).html( '' );
	self.sequence.nodes = [];
} // end FUNCTION clearSequence()


// EXPORTS //

module.exports = clearSequence;
