/* global renderMathInElement */
'use strict';

// MODULES //

const $ = require( 'jquery' );
const MarkdownIt = require( 'markdown-it' );
var md = new MarkdownIt();
require( 'katex-auto-render' );


// PAINT NODE //

/**
* FUNCTION: paintNode()
*	Display main page in the middle of the screen for any qality input node.
*
* @returns {Void}
*/
function paintNode() {
	/* jshint validthis:true */
	var self = this;
	self.setting = null;
	$( '.setting' ).remove();
	var s =
		`<div class = "multiple_choice">
			<div class = "toolbar">
				<div title = "add option" class = "tool" id  = "plus"><img src = "img/plus.svg"/></div>
				<div title = "setting" class = "tool" id  = "setting"><img src = "img/setting.svg"/></div>
			</div>
			<div class = "question">QUESTION</div>
			<div class = "answers">
			<form name = "PossibleAnswers" id = "PossibleAnswers">
			${self.answers.map( (o, i) => {
				return `<input class = "mpanswer" type="radio" name="mpanswers" value="${i}">
				<span class = "label" no = "${i}">${o.text}</span></br>`;
			}).join('')}
			</form>
			</div>
		</div>`;
		$( '.area' ).html( s );
	if ( self.right_value !== -1 ) {
		document.PossibleAnswers.mpanswers[self.right_value].checked = true;
	}
	$( '.question' ).html( md.render(self.question) );
	renderMathInElement( document.body, self.mathOptions );
	self.interaction();
	$( '#setting' ).unbind( 'click' );
	$( '#setting' ).click( function onClick() {
		self.show_setting();
	});
	$( '#plus' ).unbind( 'click' );
	$( '#plus' ).click( function onClick() {
		var no = document.getElementsByName('mpanswers').length;
		var name = "A_" + no;
		var x = {
			text: name,
			points: 0,
			assessment: "ASSESSMENT"
		};
		self.answers.push(x);
		var s =
				`<input type="radio" name="mpanswers" value="${no}">
				<span class = "label" no="${no}">${name}</span><br>`;
			$( '#PossibleAnswers' ).append(s);
		self.interaction();
	});
} // end FUNCTION paintNode()


// EXPORTS //

module.exports = paintNode;
