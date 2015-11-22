'use strict';

/**
* FUNCTION: randomColor( param1, param2 )
*	Generates a random color with the given specifications.
*
* @param {Number} min_lightness - description
* @param {Number} opacity - description
* @returns {String} color string of the format `rgba(r,g,b,a)`
*/
function randomColor( min_lightness, opacity ) {
	var range = 255 - min_lightness;
	var col = {};
	col.r = parseInt( parseInt(Math.random() * range) + min_lightness, 10 );
	col.g = parseInt (parseInt(Math.random() * range)  + min_lightness, 10 );
	col.b = parseInt (parseInt(Math.random() * range)  + min_lightness, 10 );
	col.a = opacity;
	var s = "rgba(" + col.r + "," + col.g + "," + col.b + "," + col.a + ")";
	return s;
} // end FUNCTION randomColor()


// EXPORTS //

module.exports = randomColor;
