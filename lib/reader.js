'use strict';

const $ = require( 'jquery' );

window.Examination = require( './exam.js' );

if ( !window.hasOwnProperty('$') ) {
	window.$ = $;
}

if ( !window.hasOwnProperty('katex') ) {
	window.katex = require( 'katex' );
}

if ( !window.hasOwnProperty("renderMathInElement") ) {
	window.renderMathInElement = require( 'katex-auto-render' );
}
