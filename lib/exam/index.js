'use strict';

// MODULES //

const $ = require( 'jquery' );


var Examination = {};
Examination.ResponsiveDesign = function() {
	var self = this;

	// horizontal ranges
	this.hrs = [ 600, 800, 1024, 1280, 1400, 1900 ];

	this.horizontal_setting = function() {
		self.HR = 0;
		for ( var i = 0; i < self.hrs.length; i++ ) {
			if ( self.width > self.hrs[i] ) {
				self.HR = i;
			}
		}
		switch( self.HR ) {
		case 0:
		break;
		case 1:
		break;
		case 2:
		break;
		case 3:
		break;
		case 4:
		break;
		case 5:
		break;
		}
	};

	this.vertical_setting = function() {
		console.log("VERTICAL");
	};

	this.init = function() {
		self.width = window.innerWidth;
		self.height = window.innerHeight;
		if ( self.width > self.height ) {
			self.horizontal_setting();
		} else {
			self.vertical_setting();
		}
	};

	self.init();
};

Examination.Session = function( qa, opts, callback ) {

	this.evaluation = qa.evaluation;
	this.sequence = qa.sequence;

	if ( opts === undefined ) {
		opts = {};
	}
	this.opts = opts;

	if ( !opts.math ) {
		this.mathOptions = [
			{left: "$$", right: "$$", display: true},
			{left: "\\[", right: "\\]", display: true},
			{left: "\\(", right: "\\)", display: false},
		];
	} else {
		if ( !Array.isArray(opts.math) ) {
			throw new TypeError( `Math option has to be an array of delimiters. Value: ${opts.math} `);
		}
		opts.math.forEach( rule => {
			if ( !('left' in rule && 'right' in rule && 'display' in rule) ) {
				throw new TypeError( `Each delimiter has to have properties left, right and display. Value: ${rule} `);
			}
		});
		this.mathOptions = opts.math;
	}

	var self = this;
	this.it   = 0;

	this.page_change = require( './pageChange' );

	this.input = require( './input.js' );

	this.multiple_choice = require( './multipleChoice.js' );

	this.result = require( './appendResultPage.js' );

	this.getEvaluation = require( './getEvaluation.js' );

	this.deactivate_timer = function() {
		window.clearInterval(self.interval);
	};

	this.refresh_time = function() {
		var t = "#timer_" + self.timed_node.id;
		self.timed_node.actual_time -= 50;
		var sec  = parseInt( self.timed_node.actual_time / 1000);
		var msec = (self.timed_node.actual_time % 1000)/10;
		if (sec < 10) {
			sec = "0" + sec;
		}
		if (msec < 10) {
			msec = "0" + msec;
		}
		var s = sec + ":" + msec;
		// ENDE Bedingung = 0
		if ( self.timed_node.actual_time <= 0 ) {
			window.clearInterval( self.interval );
			self.decision( self.timed_node );
		}
		$(t).html(s);
	};

	self.decision = function( node ) {
		node.chosen = -1;
		self.it++;
		var beta = self.sequence.nodes[ self.it ];
		if  ( self.it < self.sequence.nodes.length ) {
			self.play_node( beta );
		} else {
			self.result();
		}
	};

	this.set_timer = function( node ) {
		var t = "#timer_" + node.id;
		node.actual_time = node.duration * 1000;
		$(t).html("20:00");
		self.timed_node = node;
		self.interval = window.setInterval( self.refresh_time, 100 );
	};

	this.play_node = function( node ) {
		switch( node.type ) {
		case "multiple_choice":
			self.multiple_choice(node);
		break;
		case "input":
			self.input(node);
		break;
		}
	};

	this.play = function() {
		self.play_node ( self.sequence.nodes[ self.it ] );
	};

	this.injectCSS = function() {
		var cssPath, cssExam;
		if ( self.opts.css === undefined || self.opts.css === '' ) {
			cssExam = '<link href="https://cdn.rawgit.com/Planeshifter/qality.js/master/css/exam.css" media="screen" rel="stylesheet" type="text/css"/>';
		} else {
			cssPath = './css/exam.css';
			cssExam = '<link href="' + cssPath + '" media="screen" rel="stylesheet" type="text/css" />';
		}
		$('head').append(cssExam);
		var cssKatex = '<link href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.3.0/katex.min.css" media="screen" rel="stylesheet" type="text/css" />';
		$('head').append(cssKatex);
	};

	this.init = function() {
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
	};

	self.init();

};


// EXPORTS //

module.exports = exports = Examination;
