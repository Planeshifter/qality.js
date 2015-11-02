'use strict';

// MODULES //

const dynamicChange = require( './dynamicChange.js' ),
	topDownChange = require( './topDownChange.js' ),
	bottomUpChange = require( './bottomUpChange' );


// PAGE CHANGE //

/**
* FUNCTION: pageChange( node )
*	Trigger animation between questions in quiz.
*
* @param {Object} node - quiz object
* @returns {Void}
*/
function pageChange( node ) {
	/* jshint validthis:true */
	if ( !node.transition_in ) {
		node.transition_in = 'default';
	}
	switch( node.transition_in ) {
		case 'static':
		break;
		case 'dynamic':
			dynamicChange( node, this.opts.div );
		break;
		case 'top_down':
			topDownChange( node, this.opts.div );
		break;
		case 'bottom_up':
			bottomUpChange( node, this.opts.div );
		break;
		default:
		break;
	}
} // end FUNCTION pageChange()


// EXPORTS //

module.exports = pageChange;
