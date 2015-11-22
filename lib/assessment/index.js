/* global renderMathInElement */
'use strict';

// MODULES //

const $ = require( 'jquery' );
const MarkdownIt = require( 'markdown-it' );
var md = new MarkdownIt();
require( 'katex-auto-render' );

var Assessment = {};
Assessment.Alternative = function() {
	var self = this;
	this.type = 'alternative';
	this.question = 'QUESTION';
	this.paint_node = function() {
		alert( 'NEU' );
	};
	this.init = function() {

	};
	self.init();
};

Assessment.Input = function(no) {

	var self 				= this;
	this.id					= no;
	this.type				= "input";

	this.question			= "UNKNOWN QUESTION";
	this.right_answer		= "unknown";

	this.transition_in      = "dynamic";
	this.transition_out     = "dynamic";

	this.points             = 1;
	this.duration           = 0;

	window.Input            = this;

	this.init = require( './input/init.js' );

	this.set_option = function(obj, type) {
		switch(type) {
		case 0:
			self.transition_in = obj.value;
		break;
		case 1:
			self.transition_out = obj.value;
		break;
		}
	};

	this.selected_options = function() {
		$("#Transition_In").val( self.transition_in );
		$("#Transition_Out").val( self.transition_out );
	};

	this.show_setting = require( './showSetting.js' );

	this.paint_node = function() {
		var s =
			`<div class = "input">
				<div class = "toolbar">
					<div title = "setting" class = "tool" id  = "setting"><img src = "img/setting.svg"/></div>
				</div>
				<div class = "question">QUESTION</div>
				<hr>
				<div class = "legend">ANSWER</div>
				<input id = "input_answer" name="vorname" type="text" value="${self.right_answer}">
			</div>`;
		$(".area").html(s);
		$(".question").html( md.render(self.question) );
		renderMathInElement( document.body, self.mathOptions );
		self.interaction();
	};

	this.interaction = function() {
		$(".input .tool").click(function() {
			self.show_setting();
		});
		$(".input #input_answer").change(function() {
			self.right_answer = $(this).val();
		});
	};

	self.init();

};


Assessment.MultipleChoice = function(no) {

	var self 				= this;
	this.id					= no;
	this.type 				= "multiple_choice";
	this.right_value		= 1;
	this.question 			= "QUESTION";
	this.transition_in		= "dynamic";
	this.transition_out		= "dynamic";
	this.answers 			= [];

	this.duration           = 0;

	this.get_value = function() {
		var rates = document.getElementsByName( 'mpanswers' ),
			rate_value;
		for( var i = 0; i < rates.length; i++ ) {
			if ( rates[i].checked ) {
				rate_value = rates[i].value;
			}
		}
		return rate_value;
	};

	this.show_setting = require( './showSetting.js' );

	this.set_option = function(obj, type) {
		switch(type) {
		case 0:
			self.transition_in = obj.value;
		break;
		case 1:
			self.transition_out = obj.value;
		break;
		}
	};

	this.selected_options = function() {
		$("#Transition_In").val( self.transition_in );
		$("#Transition_Out").val( self.transition_out );
	};

	this.answer_prompt = function(text, no) {
		var temp = self.answers[no];
		$(".prompt").remove();
		var s =
				`<div class = "prompt">
					<div id = "exit"><img src = "img/exit.svg"/></div>
					<div class = "label">TEXT</div>
					<input id = "temporal" name="vorname" type="text" value="${temp.text}">
					<div class = "label">ORAL ASSESSMENT</div>
					<input id = "assessment" name="vorname" type="text" value="${temp.assessment}">
					<div class = "label">POINTS</div>
					<input id = "points" name="vorname" type="text" value="${temp.points}">
					<div class = "submit">SUBMIT</div>
					<div class = "delete">DELETE</div>
				</div>`;
		$(".area").append(s);
		self.submit_interaction(no);
	};

	this.submit_interaction = require( './multipleChoice/submitInteraction.js' );
	this.interaction = require( './multipleChoice/interaction.js' );
	this.paint_node = require( './multipleChoice/paintNode.js' );
	this.init = require( './multipleChoice/init.js' );

	self.init();

};

Assessment.Sequence = function() {
	var self = this;

	this.nodes = [];

	this.init = function() {

	};

	self.init();
};


Assessment.Evaluation = function() {

	this.seperator = [];
	this.sorted    = [];

	this.ranges	   = [];

	var self = this;

	this.update_marker = function(number, perc) {
		for (var i = 0; i < self.seperator.length; i++) {
			if ( self.seperator[i].id === number) {
				self.temporary = self.seperator[i].start;
				self.seperator[i].start = perc.toFixed(2);
			}
		}
		self.set_ranges();
	};

	this.get_range = function(percentage) {
		var p = percentage;
		for (var i = 0; i < self.ranges.length; i++) {
			if ( p > self.ranges[i].start && p < self.ranges[i].end ) {
				return self.ranges[i];
			}
		}
	};


	this.show_form = function(percentage) {
		$(".evaluation_form #evaluation_text").show();
		var r = self.get_range(percentage);

		$(".evaluation_form #evaluation_text").attr("no", r.id);
		$(".evaluation_form #evaluation_text").val( r.text );

		$(".evaluation_form #evaluation_text").keydown( function() {
			var no = parseInt ( $(this).attr("no"), 10 );

			console.log("Nummer" + no);
			self.ranges[no].text = $(this).val();
		});

	};

	this.set_ranges = function() {
		var list = [];
		for (var i = 0; i < self.seperator.length; i++)
			{
			list.push( self.seperator[i].start);
			}

		function sortNumber(a,b) {
    		return a - b;
		}

		list.sort(sortNumber);
		self.sorted = list;
		self.evaluation_ranges(list);
	};

	this.evaluation_ranges = function(list) {
		for (var i = 0; i < self.ranges.length; i++) {
			var r = self.ranges[i];
			if (i === 0) {
				r.end = parseFloat (list[0] );
			} else {
				r.start = parseFloat( list[i-1] );
				if ( !list[i] ) {
					r.end = 1.00;
				} else {
					r.end   = parseFloat ( list[i] );
				}
			}
		}
	};

	this.reset_ranges = function() {
		var fin = self.ranges[self.ranges.length-2];
		fin.end = 0.90;
	};

	this.init = function() {
		self.seperator.push( { start: 0.33, id: 0});
		self.seperator.push({ start: 0.66, id: 1 });

		self.ranges.push( {  id: 0, text: "RANGE 1", start: 0.00, end: 0.33   }  );
		self.ranges.push( {  id: 1, text: "RANGE 2", start: 0.33, end: 0.66   }  );
		self.ranges.push( {  id: 2, text: "RANGE 3", start: 0.66, end: 1.00 }  );
	};

	self.init();
};


Assessment.Editor = function() {
	var self = this;

	window.editor = this;

	this.sequence = null;
	this.activeID = null;

	this.mathOptions = [
		{left: "$$", right: "$$", display: true},
		{left: "\\[", right: "\\]", display: true},
		{left: "\\(", right: "\\)", display: false},
	];

	this.keydown = require( './editor/keydown.js' );
	this.delete_element = require( './editor/deleteElement.js' );
	this.repaint_nodes = require( './editor/repaintNodes.js' );
	this.next_node = require( './editor/nextNode.js' );
	this.previous_node = require( './editor/previousNode.js' );
	this.hide_evaluation_form = require( './editor/hideEvaluationForm.js' );
	this.show_evaluation_form = require( './editor/showEvaluationForm.js' );
	this.draggable_markers = require( './editor/draggableMarkers.js' );
	this.show_json_file = require( './editor/showFile.js' );
	this.load_file = require( './editor/loadFile.js' );
	this.create_sequence = require( './editor/createSequence.js' );
	this.clear_sequence = require( './editor/clearSequence.js' );
	this.repaint_evaluation_form = require( './editor/repaintEvaluationForm.js' );
	this.init = require( './editor/init.js' );

	self.init();
};


// EXPORTS //

module.exports = exports = Assessment;
