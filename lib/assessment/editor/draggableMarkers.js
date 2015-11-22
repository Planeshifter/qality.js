'use strict';

// MODULES //

const $ = require( 'jquery' );


// DRAGGABLE MARKERS //

/**
* FUNCTION: draggableMarkers()
*	Makes markers in evaluation form draggable.
*
* @returns {Void}
*/
function draggableMarkers() {
	/* jshint validthis:true */
	var self = this;
	$('.seperator').draggable({
		axis : "x",
		start : function start( event, ui ) {

		},
		drag : function drag( event, ui ) {
			var nr = parseInt( $(this).attr("no"), 10 );
			self.act_marker = self.evaluation.seperator[nr]; // the reference to the marker
		},
		stop : function stop( event, ui ) {
			var width = $(".evaluation_form .range").width();
			var number = parseInt( $(this).attr("no"), 10 );
			var pos = $(this).position().left;
			if (pos < 0) {
				$(this).css("left", "1%");  // if it goes into the negative range
			}
			if (pos > width ) {
				$(this).css("left", "99%");
			}
			var perc = pos/width;
			// Update of the text field:
			var p = (perc*100).toFixed(2);
			var div = "#txt_" + number;
			$(div).html(p);
			if ( perc < 0 || perc > 1 ) {
				if (perc < 0) {
					p = '1.00';
				} else {
					p = '99.00';
				}
				div = "#txt_" + number;
				$(div).html( p );
			}
			self.evaluation.update_marker( number, perc );
		}
	});
} // end FUNCTION draggableMarkers()


// EXPORTS //

module.exports = draggableMarkers;
