'use strict';

// MODULES //

const $ = require( 'jquery' );


// INIT //

/**
* FUNCTION: init()
*	Initializes an input field instance.
*
* @returns {Void}
*/
function init() {
	/* jshint validthis:true */
	var self = this;
	var s =
		`<div class = "input">
			<div class = "toolbar">
				<div title = "setting" class = "tool" id  = "setting"><img src = "img/setting.svg"/></div>
			</div>
			<div class = "question">${self.question}</div>
			<hr>
			<div class = "legend">ANSWER</div>
			<input id = "input_answer" name="vorname" type="text" value="${self.right_answer}">
		</div>`;
	$(".area").html(s);
	self.selected_options();
	self.show_setting();
	$(".input .tool").click( function onClick() {
		self.show_setting();
	});
	$(".input #input_answer").change( function onChange() {
		self.right_answer = $(this).val();
	});
} // end FUNCTION init()


// EXPORTS //

module.exports = init;
