'use strict';

// MODULES //

const $ = require( 'jquery' );


// INJECT CSS //

/**
* FUNCTION: injectCSS()
*	Inject the standard CSS or a user-supplied one.
*
* @returns {Void}
*/
function injectCSS() {
	/* jshint validthis:true */
	var self = this;
	var cssPath, cssExam;
	if ( self.opts.css === undefined || self.opts.css === '' ) {
		cssExam = '<link href="https://cdn.rawgit.com/Planeshifter/qality.js/d02a37d884cd658448ee64a058cd32ceb7df4dfb/css/exam.css" media="screen" rel="stylesheet" type="text/css"/>';
	} else {
		cssPath = self.opts.css;
		cssExam = '<link href="' + cssPath + '" media="screen" rel="stylesheet" type="text/css" />';
	}
	$( 'head' ).append( cssExam );
	var cssKatex = '<link href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.3.0/katex.min.css" media="screen" rel="stylesheet" type="text/css" />';
	$( 'head' ).append( cssKatex );
} // end FUNCTION injectCSS()


// EXPORTS //

module.exports = injectCSS;
