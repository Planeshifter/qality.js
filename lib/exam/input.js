/* global renderMathInElement */
'use strict';

// MODULES //

const $ = require( 'jquery' ),
	MarkdownIt = require( 'markdown-it' ),
	md = new MarkdownIt(),
	katex = require( 'katex' );

require('katex-auto-render');

/**
* FUNCTION: input( node )
*	Generate DIV element for input question and append it.
*
* @param {Object} node - quiz node
* @returns {Void}
*/
function input( node ) {
	/* jshint validthis:true */
	var self = this,
		s;

	var name = self.opts.div + "_node_item_" + node.id;
	var ip_name = self.opts.div + "_ip_input_" + node.id;
	// TIMER
	var timer = "timer_" + node.id;
	var timerString = node.duration > 0 ? `<div id = "${timer}" class = "timer"></div>` : ``;

	s =
		`<div id = "${name}" class = "node_area">
			<div class = "mc_question">${md.render( node.question )}</div>
			<input class = "ip_input" name="${ip_name}" type="text" value="TYPE IN YOUR ANSWER - confirm with RETURN">
			${timerString}
		</div>`;

	$( self.div ).append( s );
	renderMathInElement( document.body, self.mathOptions );

	if (node.duration > 0) {
		self.set_timer(node);
	}
	self.page_change(node);

	var ipdiv = "#" + name + " .ip_input";

	$( ipdiv ).click( function onClick() {
		$( this ).val( '' );
	});

	$( ipdiv ).change( function onChange() {
		node.given_answer = $( this ).val();
		if ( node.duration > 0 ) {
			self.deactivate_timer( node );
		}
		self.decision( node );
	});
	
} // end FUNCTION input()


// EXPORTS //

module.exports = input;
