'use strict';

// MODULES //

const $ = require( 'jquery' );


// INTERACTION //

/**
* FUNCTION: interaction()
*	Adds interactions to multiple choice setting window.
*
* @returns {Void}
*/
function interaction() {
	/* jshint validthis:true */
	var self = this;
	$( '.mpanswer' ).unbind( 'click' );
	$( '.mpanswer' ).click( function onClick() {
		self.answers[ self.right_value ].points -= 1;
		self.right_value = parseInt( this.value, 10 );
		self.answers[ self.right_value ].points += 1;
	});
	$( '.label' ).unbind( 'click' );
	$( '.label' ).click( function onClick() {
		var val = parseInt( $(this).attr( 'no' ), 10 );
		self.element = this;
		var x = $(this).html();
		self.answer_prompt( x, val );
	});
} // end FUNCTION interaction()


// EXPORTS //

module.exports = interaction;
