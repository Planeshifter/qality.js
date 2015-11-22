'use strict';

// MODULES //

const $ = require( 'jquery' );


// SUBMIT INTERACTION //

/**
* FUNCTION: submitInteraction( )
*	Adds submit click handler to the specified answer.
*
* @param {Number} no - answer number
* @returns {Void}
*/
function submitInteraction( no ) {
	/* jshint validthis:true */
	var self = this,
		$submit = $( '.submit' ),
		$delete = $( '.delete' );
	$( '.prompt #exit' ).click( function onClick() {
		$( '.prompt' ).fadeOut();
	});
	$submit.unbind( 'click' );
	$submit.click( function onClick() {
		self.answers[ no ].text = $( '#temporal' ).val();
		self.answers[ no ].points = parseInt ( $( '#points' ).val(), 10 );
		self.answers[ no ].assessment = $( '#assessment' ).val();
		$( self.element ).html( $( '#temporal' ).val() );
		$( '.prompt' ).fadeOut();
	});
	$delete.unbind( 'click' );
	$delete.click( function onClick() {
		self.answers = self.answers.filter( (o, i) => i !== no );
		self.paint_node();
		$( '.prompt' ).fadeOut();
	});
} // end FUNCTION submitInteraction()


// EXPORTS //

module.exports = submitInteraction;
