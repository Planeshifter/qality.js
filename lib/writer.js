/*jshint nonew: false */
'use strict';

const $ = require( 'jquery' );

var Assessment = require( './assessment.js' );

if ( !window.hasOwnProperty('katex') ) {
	window.katex = require( 'katex' );
}

if ( !window.hasOwnProperty("renderMathInElement") ) {
	window.renderMathInElement = require( 'katex-auto-render' );
}

$( document ).ready( () => {
	new Assessment.Editor();
});
