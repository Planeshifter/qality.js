'use strict';

// MODULES //

const $ = require( 'jquery' );


// INIT //

/**
* FUNCTION: init()
*	Initializes a multiple choice instance and appends DIV element.
*
* @returns {Void}
*/
function init() {
	/* jshint validthis:true */
	window._multiple_choice = this;
	var pt1, pt2,
		dec = Math.random(),
		self = this;
	if ( dec >= 0.5 ) {
		pt1 = 0;
		pt2 = 1;
		self.right_value = 1;
	} else {
		pt1 = 1;
		pt2 = 0;
		self.right_value = 0;
	}
	var x = {
		text: "A_0",
		points: pt1,
		assessment: 'ASSESSMENT'
	};
	self.answers.push( x );
	var y = {
		text: "A_1",
		points: pt2,
		assessment: "ASSESSMENT"
	};
	self.answers.push( y );
	var s =
		`<div class = "multiple_choice">
			<div class = "toolbar">
				<div title = "add option" class = "tool" id  = "plus"><img src = "img/plus.svg"/></div>
				<div title = "setting" class = "tool" id  = "setting"><img src = "img/setting.svg"/></div>
			</div>
			<div class = "question">QUESTION</div>
			<div class = "answers">
				<form name = "PossibleAnswers" id = "PossibleAnswers">
					<input class = "mpanswer" type="radio" name="mpanswers" value="0"><span class = "label" no = "0">A_0</span><br>
					<input class = "mpanswer" type="radio" name="mpanswers" value="1"><span class = "label" no = "1">A_1</span><br>
				</form>
			</div>
		</div>`;
	$( '.area' ).html(s);

	document.PossibleAnswers.mpanswers[ self.right_value ].checked = true;
	self.interaction();
	self.get_value();
	self.show_setting();
	$("#setting").click( function onClick() {
		self.show_setting();
	});
	$(".question").click( function onClick() {
		self.show_setting();
	});
	$(".mpanswer").click( function onClick() {
		self.right_value = parseInt( this.value, 10 );
	});
	$("#plus").click( function onClick() {
		var no = document.getElementsByName( 'mpanswers' ).length;
		var name = "A_" + no;
		var x = {
			text: name,
			points: 0,
			assessment: 'ASSESSMENT'
		};
		self.answers.push( x );
		var s =
			`<input class = "mpanswer" type="radio" name="mpanswers" value="${no}">
			<span class = "label" no="${no}">${name}</span><br>`;
		$( '#PossibleAnswers' ).append( s );
		self.interaction();
	});
} // end FUNCTION init()


// EXPORTS //

module.exports = init;
