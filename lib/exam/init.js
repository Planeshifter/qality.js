'use strict';

// MODULES //

const $ = require( 'jquery' ),
	Examination = require( './index.js' );


// INITIALIZE //

/**
* FUNCTION: init()
*	Initialize an exam instance.
*
* @returns {Void}
*/
function init() {
	/* jshint validthis:true */
	var self = this;
	self.responsive = new Examination.ResponsiveDesign();
	window._exam = this;
	$( document ).ready( function onReady() {
		// Inject exam.css:
		self.injectCSS();
		var s = '<div id = "exam_panel" class="exam_panel"></div>';
		$( "#" + self.opts.div ).append( s );
		self.div =  "#" + self.opts.div + " .exam_panel";
		if ( self.opts.exit === true ) {
			var divExit = '<div id = "exit">&#x274c</div>';
			var divPanel= "#" + self.opts.div + " .exam_panel";
			$(divPanel).append(divExit);
			$(divPanel + " #exit").click(function(){
				$(divPanel).fadeOut(200, function(){
					if (self.opts.div === "qapreview") {
						$("#" + self.opts.div).html("");
						$("#" + self.opts.div).hide();
					} else {
						$(divPanel).remove();
					}
				});
			});
		}
		self.play();
	});
} // end FUNCTION init()


// EXPORTS //

module.exports = init;
