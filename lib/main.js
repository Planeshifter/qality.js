var $ = require( 'jquery' );

Examination = require( './exam.js' );
Assessment = require( './assessment.js' );

$( document ).ready(function() {
	new Assessment.Editor();
});
