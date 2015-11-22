'use strict';

// MODULES //

const $ = require( 'jquery' );


// ON KEYDOWN //

/**
* FUNCTION: onKeydown( event)
*
* @param {Object} event - keydown event
* @returns {Boolean} true if keydown event was handled successfully
*/
function onKeydown( evt ) {
	/* jshint validthis:true */
	var self = this;
	if ( !$( evt.target ).is( 'input' ) && !$( evt.target ).is( 'textarea' ) ) {
		switch( evt.keyCode ) {
		case 8:
			if (self.active_element) {
				self.delete_element();
			}
		break;
		case 37:
			if (self.active_sequence) {
				self.previous_node();
			}
		break;
		case 39:
			if (self.active_sequence) {
				self.next_node();
			}
		break;
		}
	}
	return true;
} // end FUNCTION onKeydown()


// EXPORTS //

module.exports = onKeydown;
