'use strict';

// MODULES //

/* global TimelineMax: true */
require( 'gsap-tween-max' );


// TOP DOWN CHANGE //

/**
* FUNCTION: topDownChange( node, div )
*	Triggers a "Top Down" transition between questions.
*
* @param {Object} node - quiz object
* @param {String} div - id of parent div
* @returns {Void}
*/
function topDownChange( node, div ) {
	var name = div + '_node_item_' + node.id;

	/// Animation //
	var el = document.getElementById(name);
	var tl = new TimelineMax({});
	tl.pause();
	tl.to(el, 0, {
		 top: '-100%',
		 opacity: 0,
	}, "start" );
	if ( node.id > 0 ) {
		var fname = div + '_node_item_' + (node.id - 1);
		var former = document.getElementById(fname);
		tl.to(former, 1, {
			top: '100%',
		}, 'go' );
	}
	tl.to(el, 1, {
		top: '0',
		opacity: 1,
	}, 'go' );
	tl.play();
} // end FUNCTION topDownChange()


// EXPORTS //

module.exports = topDownChange;
