'use strict';

/**
* FUNCTION: getMaxPoints( nodes )
*	Calculates the maximum number of points that can be achieved in the quiz.
*
* @param {Object} nodes - quiz object
* @returns {Number} maximum number of points
*/
function getMaxPoints( nodes ) {
	var maximal = 0;
	for ( let i = 0; i < nodes.length; i++ ) {
		var actual = nodes[ i ];
		switch( actual.type ) {
		case "multiple_choice":
			var tmax = 0;
			for ( let j = 0; j < actual.answers.length; j++ ) {
				if ( actual.answers[ j ].points > tmax ) {
					tmax = actual.answers[ j ].points;
				}
			}
			maximal += tmax;
		break;
		case "input":
			maximal += actual.points;
		break;
		}
	}
	return maximal;
} // end FUNCTION getMaxPoints()


// EXPORTS //

module.exports = getMaxPoints;
