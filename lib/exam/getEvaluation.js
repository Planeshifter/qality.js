'use strict';

/**
* FUNCTION: getEvaluation( percentage )
*	Returns evaluation text for given percentage.
*
* @param {Number} percentage - percentage of achieved points
* @returns {String} evaluation string
*/
function getEvaluation( percentage ) {
		/* jshint validthis:true */
		var ranges = this.evaluation.ranges;
		for ( let i = 0; i < ranges.length; i++ ) {
			var r = ranges[ i ];
			if ( percentage > r.start && percentage <= r.end ) {
				return r.text;
			}
		}
		return 'no evaluation';
} // end FUNCTION getEvaluation()


// EXPORTS //

module.exports = getEvaluation;
