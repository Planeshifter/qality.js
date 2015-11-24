'use strict';

// MODULES //

const $ = require( 'jquery' );


function Session( qa, opts, callback ) {

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
		self.play_node( self.sequence.nodes[ self.it ] );
	};

	self.init();

}

// METHODS //

Session.prototype.page_change = require( './pageChange' );

Session.prototype.input = require( './input.js' );
Session.prototype.multiple_choice = require( './multipleChoice.js' );

Session.prototype.result = require( './appendResultPage.js' );
Session.prototype.getEvaluation = require( './getEvaluation.js' );
Session.prototype.injectCSS = require( './injectCSS.js' );
Session.prototype.init = require( './init.js' );


// EXPORTS //

module.exports = exports = Session;
