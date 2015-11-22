'use strict';

// MODULES //

const $ = require( 'jquery' );


// REPAINT EVALUATION FORM //

/**
* FUNCTION: repaintEvaluationForm()
*	Recreates the evaluation form and appends it to the DOM.
*
* @returns {Void}
*/
function repaintEvaluationForm() {
	/* jshint validthis:true */
	var self = this;
	$(".seperator").remove();
	var k = self.evaluation.ranges.length;
	var offset = 100/k;
	var s = ``;
	for (var n = 0; n < k-1; n++) {
		var off = offset * n;
		var pzt = self.evaluation.ranges[n].end * 100;
		var id = "txt_" + n;
		s +=
			`<div no = "${n}" class = "seperator" style="left:${pzt}%" >
				<div id = "${id}" textfield= "${n}" class = "textfield">${pzt.toFixed(2)}</div>
			</div>`;
	}
	$(".range").append(s);
	self.draggable_markers();
} // end FUNCTION repaintEvaluationForm()


// EXPORTS //

module.exports = repaintEvaluationForm
