'use strict';

// MODULES //

/* global TimelineMax: true */
require( 'gsap-tween-max' );


// SHOW EVALUATION FORM //

/**
* FUNCTION: showEvaluationForm()
*	Triggers GSAP animation which displays the evaluation form.
*
* @returns {Void}
*/
function showEvaluationForm() {
	var el = document.getElementById( 'evaluation_form' );
	var tl = new TimelineMax({});
	tl.pause();
	tl.to(el, 0, {
		left: '-100%',
		opacity: 1,
	}, 'start' );
	tl.to(el, 1, {
		left: '0',
		opacity: 1,
	}, 'go' );
	tl.play();
} // end FUNCTION showEvaluationForm()


// EXPORTS //

module.exports = showEvaluationForm;
