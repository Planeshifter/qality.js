'use strict';

const $ = require( 'jquery' );

if ( !window.hasOwnProperty( '$' ) ) {
	window.$ = $;
}

if ( !window.hasOwnProperty( 'katex' ) ) {
	window.katex = require( 'katex' );
}

if ( !window.hasOwnProperty( 'renderMathInElement' ) ) {
	window.renderMathInElement = require( 'katex-auto-render' );
}

module.exports = require( './exam' ).Session;
