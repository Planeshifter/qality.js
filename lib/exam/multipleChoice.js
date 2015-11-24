/* global renderMathInElement */
'use strict';

// MODULES //

const $ = require( 'jquery' ),
	MarkdownIt = require( 'markdown-it' ),
	md = new MarkdownIt(),
	katex = require( 'katex' );

require('katex-auto-render');


// MULTIPLE CHOICE ELEMENT //

/**
* FUNCTION: multipleChoiceElement( node )
*	Generate multiple choice DIV element and append it.
*
* @param {Object} node - quiz node
* @returns {Void}
*/
function multipleChoiceElement( node ) {
	/* jshint validthis:true */
	var self = this,
		s;

	var name = self.opts.div + "_node_item_" + node.id;
	var form = self.opts.div + "_node_form_" + node.id;
	var timer = "timer_" + node.id;
	var timerString = node.duration > 0 ? `<div id = "${timer}" class = "timer"></div>` : ``;

	s =
		`<div id = "${name}" class = "node_area">
			<div class = "mc_question">${md.render(node.question)}</div>
			<div id = "${self.opts.div}_answers">
				<form id = "${form}" name = "${form}">
				${node.answers.map( (o, i) => {
					return `<div class = "mc_answer">
					<input class = "clicked_answer" type="radio" name="mpanswers" value="${i}">
					<div class = "answer" no = "${i}">${o.text}</div>
					</div>`;
				}).join('')}
				</form>
			</div>
			${timerString}
		</div>`;

	$( self.div ).append( s );
	renderMathInElement( document.body, self.mathOptions );

	if ( node.duration > 0 ) {
		self.set_timer( node );
	}

	self.page_change( node );

	$( '#' + self.opts.div + ' .answer' ).unbind( 'click' );
	$( '#' + self.opts.div + ' .answer' ).click( function onClick() {
		var n = $(this).attr( 'no' );
		node.chosen = parseInt( n, 10 );
		self.deactivate_timer( node );
		self.it++;
		var beta = self.sequence.nodes[ self.it ];
		if  ( self.it < self.sequence.nodes.length ) {
			self.play_node( beta );
		} else {
			self.result();
		}
	});

	$( '#' + self.opts.div + ' .clicked_answer' ).click( function onClick() {
		var actual_form = document.getElementById( form );
		node.chosen = parseInt( actual_form.mpanswers.value );
		self.deactivate_timer( node );
		self.it++;
		var beta = self.sequence.nodes[ self.it ];
		if  ( self.it < self.sequence.nodes.length ) {
			self.play_node( beta );
		} else {
			self.result();
		}
	});
} // end FUNCTION multipleChoiceElement()


// EXPORTS //

module.exports = multipleChoiceElement;
