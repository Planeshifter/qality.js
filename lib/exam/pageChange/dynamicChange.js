'use strict';

// MODULES //

/* global TimelineMax: true */
require( 'gsap-tween-max' );


// DYNAMIC CHANGE //

/**
* FUNCTION: dynamicChange( node, div )
*	Trigger a dynamic change transition.
*
* @param {Object} node - quiz object
* @param {String} div - id of parent div
* @returns {Void}
*/
function dynamicChange( node, div ) {

	var name = div + '_node_item_' + node.id;

	/// Animation //
	var el = document.getElementById( name );
	var tl = new TimelineMax({  });
	tl.pause();
	tl.to(el, 0, {
		left: '-100%',
		opacity: 1,
	}, 'start' );
	if ( node.id > 0 ) {
		var fname = div + '_node_item_' + (node.id - 1);
		var former = document.getElementById( fname );
		tl.to( former, 1, {
			left: '100%',
		}, 'go' );
	}
	tl.to( el, 1, {
		left: '0',
		opacity: 1,
	}, 'go' );
	tl.play();
} // end FUNCTION dynamicChange()


// EXPORTS //

module.exports = dynamicChange;
