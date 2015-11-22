'use strict';

// MODULES //

/* global TimelineMax: true */
require( 'gsap-tween-max' );


// HIDE EVALUATION FORM //

/**
* FUNCTION: hideEvaluationForm()
*	Triggers GSAP animation which hides the evaluation form.
*
* @returns {Void}
*/
function hideEvaluationForm() {
	var el = document.getElementById( 'evaluation_form' );
	var tl = new TimelineMax({});
	tl.pause();
	tl.to( el, 1, {
		left: '100%',
		opacity: 1,
	}, 'go' );
	tl.play();
} // end FUNCTION hideEvaluationForm()


// EXPORTS //

module.exports = hideEvaluationForm;
