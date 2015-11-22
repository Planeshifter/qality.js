'use strict';

// FUNCTIONS //

var Assessment = require( './../index.js' );


// CREATE SEQUENCE //

/**
* FUNCTION: createSequence( qa )
*	Create a sequence of nodes for the supplied qality object.
*
* @param {Object} qa - qality object
* @returns {Void}
*/
function createSequence( qa ) {
	/* jshint validthis:true */
	var self = this,
		temp = qa.sequence,
		no;
	// self.evaluation = qa.evaluation;
	self.evaluation.sorted		= qa.evaluation.sorted;
	self.evaluation.ranges		= qa.evaluation.ranges;
	self.evaluation.seperator = qa.evaluation.seperator;
	self.repaint_evaluation_form();

	for ( var i = 0; i < temp.nodes.length; i++ ) {
		switch( temp.nodes[i].type ) {
		case "multiple_choice":
			no = self.sequence.nodes.length;
			self.sequence.nodes.push( new Assessment.MultipleChoice(self.sequence.nodes.length) );
			self.sequence.nodes[no].right_value     = temp.nodes[i].right_value;
			self.sequence.nodes[no].question        = temp.nodes[i].question;
			self.sequence.nodes[no].transition_in   = temp.nodes[i].transition_in;
			self.sequence.nodes[no].transition_out  = temp.nodes[i].transition_out;
			self.sequence.nodes[no].duration        = temp.nodes[i].duration;
			self.sequence.nodes[no].answers         = temp.nodes[i].answers;
		break;
		case "input":
			no = self.sequence.nodes.length;
			self.sequence.nodes.push( new Assessment.Input(self.sequence.nodes.length) );
			self.sequence.nodes[no].right_answer    = temp.nodes[i].right_answer;
			self.sequence.nodes[no].question        = temp.nodes[i].question;
			self.sequence.nodes[no].transition_in   = temp.nodes[i].transition_in;
			self.sequence.nodes[no].transition_out  = temp.nodes[i].transition_out;
			self.sequence.nodes[no].duration        = temp.nodes[i].duration;
			self.sequence.nodes[no].points           = temp.nodes[i].points;
		break;
		}
	}
} // end FUNCTION createSequence()


// EXPORTS //

module.exports = createSequence;
