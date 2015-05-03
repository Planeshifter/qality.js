/*jshint nonew: false */
'use strict';

const $ = require( 'jquery' );

var Assessment = require( './assessment.js' );

$( document ).ready( () => {
	new Assessment.Editor();
});
