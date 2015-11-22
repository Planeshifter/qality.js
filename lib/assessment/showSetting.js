/* global renderMathInElement */
'use strict';

// MODULES //

const $ = require( 'jquery' );
const MarkdownIt = require( 'markdown-it' );
var md = new MarkdownIt();
require( 'katex-auto-render' );

// SHOW SETTING //

/**
* FUNCTION showSetting()
*	Displays the Setting DIV element and attach event handlers.
*
* @returns {Void}
*/
function showSetting() {
	/* jshint validthis:true */
	var self = this;
	if ( !self.setting ) {
		$( '.setting' ).remove();
		self.setting = null;
		var s =
			`<div class = "setting">
				<div id = "exit"><img src = "img/exit.svg"/></div>
				<div id = "entries">
					<div class = "label">QUESTION</div>
					<textarea id = "node_question" rows="4" cols="50">${self.question}</textarea>
					<div class = "label">TRANSITION_IN</div>
					<select name = selector id = "Transition_In" onchange="_multiple_choice.set_option(this, 0);">
						<option selected = "selected">static</option>
						<option>dynamic</option>
						<option>top_down</option>
						<option>bottom_up</option>
					</select>
					<div class = "label">TRANSITION_OUT</div>
					<select name = selector id = "Transition_Out" onchange="_multiple_choice.set_option(this, 1);">
						<option selected = "selected">static</option>
						<option>dynamic</option>
						<option>top_down</option>
						<option>bottom_up</option>
					</select>
					'<div class = "label">BACKGROUND IMAGE</div>
					<input id = "node_background" name="vorname" type="text" value="none">
					<div class = "label">DURATION - if bigger than 0, it is timed</div>
					<input id = "node_duration" name="vorname" type="text" value="${self.duration}">
				</div>
				<div id = "submit">SUBMIT</div>
				<div id = "delete">DELETE</div>
			</div>`;
		$( '.area' ).append(s);
		self.selected_options();

		$(".setting #exit").click( function onClick() {
			$(".setting").fadeOut( 200, function() {
				$(".setting").remove();
			});
		});

		$(".setting #delete").click( function onClick() {
			var name = "#node_" + self.id;
			window.editor.active_element = $(name);
			window.editor.delete_element();
			$(".setting").fadeOut();
		});
		$(".setting #node_question").keyup( function() {
			var v = $(this).val();
			$(".question").html(md.render(v) );
			renderMathInElement( document.body, self.mathOptions );
		});
		$(".setting #submit").click( function onClick() {
			self.question = $("#node_question").val();
			self.duration   = parseFloat ( $("#node_duration").val() );
			self.background  = $("#node_background").val();
			$(".question").html(md.render(self.question) );
			renderMathInElement( document.body, self.mathOptions );
			$(".setting").fadeOut();
		});
	} else {
		$(".setting").fadeIn();
	}
} // end FUNCTION showSetting()


// EXPORTS //

module.exports = showSetting;
