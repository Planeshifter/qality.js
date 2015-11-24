(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/* global renderMathInElement */
'use strict';

// MODULES //

var getMaxPoints = require('./getMaxPoints.js'),
    $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null),
    sum = require('compute-sum'),
    MarkdownIt = require('markdown-it'),
    md = new MarkdownIt(),
    katex = require('katex');

// APPEND RESULT PAGE //

/**
* FUNCTION: appendResultPage()
*	Generate result page after quiz is finished and append to DIV.
*
* @returns {Void}
*/
function appendResultPage() {
	/* jshint validthis:true */
	var self = this;
	var nodes = this.sequence.nodes;
	var res = {
		points: 0,
		text: '',
		right_answers: 0,
		questions: nodes.length
	};
	for (var i = 0; i < nodes.length; i++) {
		var actual = nodes[i];
		res.text += '<h3>Question ' + i + ':</h3> ' + md.render(actual.question);
		switch (actual.type) {
			case 'multiple_choice':
				var maxPoints = sum(actual.answers, {
					accessor: function accessor(x) {
						return x.points;
					}
				});
				res.text += '<ul>\n\t\t\t\t\t' + actual.answers.map(function (o, i) {
					var color;
					if (actual.chosen === i) {
						if (actual.chosen === actual.right_value) {
							color = 'green';
						} else {
							color = 'darkred';
						}
						return '<li style="color:' + color + ';">' + o.text + ' (' + o.points + '/' + maxPoints + ' points)</li>';
					}
					return '<li>' + o.text + '</li>';
				}).join('') + '\n\t\t\t\t</ul>';
				if (actual.chosen === actual.right_value) {
					res.right_answers += 1;
				}
				var answer = actual.answers[actual.chosen];
				if (answer) {
					res.points += parseInt(answer.points);
					if (answer.assessment !== 'ASSESSMENT') {
						res.text += '<p>' + answer.assessment + '</p>';
					}
				} else {
					res.points += 0;
				}
				break;
			case 'input':
				if (actual.given_answer === actual.right_answer) {
					res.points += actual.points;
					res.right_answers += 1;
				}
				break;
		}
	}
	res.max = getMaxPoints(nodes);
	res.percentage = res.points / res.max;
	var s = '<div class = "result"><h1>RESULT</h1>\n\t\t\t<div id = "assessment">\n\t\t\t<h3>You have answered <span class = "phigh">' + res.right_answers + '</span> of <span class = "phigh">' + res.questions + '</span> questions correctly</h3>\n\t\t\t\t<h3>You have reached <span class = "phigh">' + res.points + '</span> of <span class = "phigh">' + res.max + '</span> points</h3>\n\t\t\t\t<h3>Percentage: <span class = "phigh">' + (res.percentage * 100).toFixed(2) + '%</span></h3>';
	if (self.opts.evaluation === true) {
		s += '<h3><span class = "pcaps">Evaluation</span></h3><h3>' + this.getEvaluation(res.percentage) + '</h3>';
	}
	s += '<h3><span class = "pcaps">Assessment</span></h3><div class = "Assessment">' + res.text + '</div>\n\t\t\t</div>\n\t\t</div>';
	$(this.div).append(s);
	renderMathInElement(document.body, self.mathOptions);
} // end FUNCTION appendResultPage()

// EXPORTS //

module.exports = appendResultPage;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./getMaxPoints.js":3,"compute-sum":18,"katex":83,"markdown-it":106}],2:[function(require,module,exports){
'use strict';

/**
* FUNCTION: getEvaluation( percentage )
*	Returns evaluation text for given percentage.
*
* @param {Number} percentage - percentage of achieved points
* @returns {String} evaluation string
*/
function getEvaluation(percentage) {
	/* jshint validthis:true */
	var ranges = this.evaluation.ranges;
	for (var i = 0; i < ranges.length; i++) {
		var r = ranges[i];
		if (percentage > r.start && percentage <= r.end) {
			return r.text;
		}
	}
	return 'no evaluation';
} // end FUNCTION getEvaluation()

// EXPORTS //

module.exports = getEvaluation;

},{}],3:[function(require,module,exports){
"use strict";

/**
* FUNCTION: getMaxPoints( nodes )
*	Calculates the maximum number of points that can be achieved in the quiz.
*
* @param {Object} nodes - quiz object
* @returns {Number} maximum number of points
*/
function getMaxPoints(nodes) {
	var maximal = 0;
	for (var i = 0; i < nodes.length; i++) {
		var actual = nodes[i];
		switch (actual.type) {
			case "multiple_choice":
				var tmax = 0;
				for (var j = 0; j < actual.answers.length; j++) {
					if (actual.answers[j].points > tmax) {
						tmax = actual.answers[j].points;
					}
				}
				maximal += tmax;
				break;
			case "input":
				maximal += actual.points;
				break;
		}
	}
	return maximal;
} // end FUNCTION getMaxPoints()

// EXPORTS //

module.exports = getMaxPoints;

},{}],4:[function(require,module,exports){
(function (global){
'use strict';

// MODULES //

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

function Session(qa, opts, callback) {

	this.evaluation = qa.evaluation;
	this.sequence = qa.sequence;

	if (opts === undefined) {
		opts = {};
	}
	this.opts = opts;

	if (!opts.math) {
		this.mathOptions = [{ left: '$$', right: '$$', display: true }, { left: '\\[', right: '\\]', display: true }, { left: '\\(', right: '\\)', display: false }];
	} else {
		if (!Array.isArray(opts.math)) {
			throw new TypeError('Math option has to be an array of delimiters. Value: ' + opts.math + ' ');
		}
		opts.math.forEach(function (rule) {
			if (!('left' in rule && 'right' in rule && 'display' in rule)) {
				throw new TypeError('Each delimiter has to have properties left, right and display. Value: ' + rule + ' ');
			}
		});
		this.mathOptions = opts.math;
	}

	var self = this;
	this.it = 0;

	this.deactivate_timer = function () {
		window.clearInterval(self.interval);
	};

	this.refresh_time = function () {
		var t = '#timer_' + self.timed_node.id;
		self.timed_node.actual_time -= 50;
		var sec = parseInt(self.timed_node.actual_time / 1000);
		var msec = self.timed_node.actual_time % 1000 / 10;
		if (sec < 10) {
			sec = '0' + sec;
		}
		if (msec < 10) {
			msec = '0' + msec;
		}
		var s = sec + ':' + msec;
		// ENDE Bedingung = 0
		if (self.timed_node.actual_time <= 0) {
			window.clearInterval(self.interval);
			self.decision(self.timed_node);
		}
		$(t).html(s);
	};

	self.decision = function (node) {
		node.chosen = -1;
		self.it++;
		var beta = self.sequence.nodes[self.it];
		if (self.it < self.sequence.nodes.length) {
			self.play_node(beta);
		} else {
			self.result();
		}
	};

	this.set_timer = function (node) {
		var t = '#timer_' + node.id;
		node.actual_time = node.duration * 1000;
		$(t).html('20:00');
		self.timed_node = node;
		self.interval = window.setInterval(self.refresh_time, 100);
	};

	this.play_node = function (node) {
		switch (node.type) {
			case 'multiple_choice':
				self.multiple_choice(node);
				break;
			case 'input':
				self.input(node);
				break;
		}
	};

	this.play = function () {
		self.play_node(self.sequence.nodes[self.it]);
	};

	self.init();
}

// METHODS //

Session.prototype.page_change = require('./pageChange');

Session.prototype.input = require('./input.js');
Session.prototype.multiple_choice = require('./multipleChoice.js');

Session.prototype.result = require('./appendResultPage.js');
Session.prototype.getEvaluation = require('./getEvaluation.js');
Session.prototype.injectCSS = require('./injectCSS.js');
Session.prototype.init = require('./init.js');

// EXPORTS //

module.exports = exports = Session;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./appendResultPage.js":1,"./getEvaluation.js":2,"./init.js":5,"./injectCSS.js":6,"./input.js":7,"./multipleChoice.js":8,"./pageChange":11}],5:[function(require,module,exports){
(function (global){
'use strict';

// MODULES //

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null),
    ResponsiveDesign = require('./responsiveDesign.js');

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
	self.responsive = new ResponsiveDesign();
	$(document).ready(function onReady() {
		// Inject exam.css:
		self.injectCSS();
		var s = '<div id = "exam_panel" class="exam_panel"></div>';
		$('#' + self.opts.div).append(s);
		self.div = '#' + self.opts.div + ' .exam_panel';
		if (self.opts.exit === true) {
			var divExit = '<div id = "exit">&#x274c</div>';
			var divPanel = '#' + self.opts.div + ' .exam_panel';
			$(divPanel).append(divExit);
			$(divPanel + ' #exit').click(function onClick() {
				$(divPanel).fadeOut(200, function () {
					if (self.opts.div === 'qapreview') {
						$('#' + self.opts.div).html('');
						$('#' + self.opts.div).hide();
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./responsiveDesign.js":13}],6:[function(require,module,exports){
(function (global){
'use strict';

// MODULES //

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

// INJECT CSS //

/**
* FUNCTION: injectCSS()
*	Inject the standard CSS or a user-supplied one.
*
* @returns {Void}
*/
function injectCSS() {
	/* jshint validthis:true */
	var self = this;
	var cssPath, cssExam;
	if (self.opts.css === undefined || self.opts.css === '') {
		cssExam = '<link href="https://cdn.rawgit.com/Planeshifter/qality.js/d02a37d884cd658448ee64a058cd32ceb7df4dfb/css/exam.css" media="screen" rel="stylesheet" type="text/css"/>';
	} else {
		cssPath = self.opts.css;
		cssExam = '<link href="' + cssPath + '" media="screen" rel="stylesheet" type="text/css" />';
	}
	$('head').append(cssExam);
	var cssKatex = '<link href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.3.0/katex.min.css" media="screen" rel="stylesheet" type="text/css" />';
	$('head').append(cssKatex);
} // end FUNCTION injectCSS()

// EXPORTS //

module.exports = injectCSS;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
(function (global){
/* global renderMathInElement */
'use strict';

// MODULES //

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null),
    MarkdownIt = require('markdown-it'),
    md = new MarkdownIt(),
    katex = require('katex');

require('katex-auto-render');

/**
* FUNCTION: input( node )
*	Generate DIV element for input question and append it.
*
* @param {Object} node - quiz node
* @returns {Void}
*/
function input(node) {
	/* jshint validthis:true */
	var self = this,
	    s;

	var name = self.opts.div + '_node_item_' + node.id;
	var ip_name = self.opts.div + '_ip_input_' + node.id;
	// TIMER
	var timer = 'timer_' + node.id;
	var timerString = node.duration > 0 ? '<div id = "' + timer + '" class = "timer"></div>' : '';

	s = '<div id = "' + name + '" class = "node_area">\n\t\t\t<div class = "mc_question">' + md.render(node.question) + '</div>\n\t\t\t<input class = "ip_input" name="' + ip_name + '" type="text" value="TYPE IN YOUR ANSWER - confirm with RETURN">\n\t\t\t' + timerString + '\n\t\t</div>';

	$(self.div).append(s);
	renderMathInElement(document.body, self.mathOptions);

	if (node.duration > 0) {
		self.set_timer(node);
	}
	self.page_change(node);

	var ipdiv = '#' + name + ' .ip_input';

	$(ipdiv).click(function onClick() {
		$(this).val('');
	});

	$(ipdiv).change(function onChange() {
		node.given_answer = $(this).val();
		if (node.duration > 0) {
			self.deactivate_timer(node);
		}
		self.decision(node);
	});
} // end FUNCTION input()

// EXPORTS //

module.exports = input;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"katex":83,"katex-auto-render":173,"markdown-it":106}],8:[function(require,module,exports){
(function (global){
/* global renderMathInElement */
'use strict';

// MODULES //

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null),
    MarkdownIt = require('markdown-it'),
    md = new MarkdownIt(),
    katex = require('katex');

require('katex-auto-render');

// MULTIPLE CHOICE ELEMENT //

/**
* FUNCTION: multipleChoiceElement( node )
*	Generate multiple choice DIV element and append it.
*
* @param {Object} node - quiz node
* @returns {Void}
*/
function multipleChoiceElement(node) {
	/* jshint validthis:true */
	var self = this,
	    s;

	var name = self.opts.div + '_node_item_' + node.id;
	var form = self.opts.div + '_node_form_' + node.id;
	var timer = 'timer_' + node.id;
	var timerString = node.duration > 0 ? '<div id = "' + timer + '" class = "timer"></div>' : '';

	s = '<div id = "' + name + '" class = "node_area">\n\t\t\t<div class = "mc_question">' + md.render(node.question) + '</div>\n\t\t\t<div id = "' + self.opts.div + '_answers">\n\t\t\t\t<form id = "' + form + '" name = "' + form + '">\n\t\t\t\t' + node.answers.map(function (o, i) {
		return '<div class = "mc_answer">\n\t\t\t\t\t<input class = "clicked_answer" type="radio" name="mpanswers" value="' + i + '">\n\t\t\t\t\t<div class = "answer" no = "' + i + '">' + o.text + '</div>\n\t\t\t\t\t</div>';
	}).join('') + '\n\t\t\t\t</form>\n\t\t\t</div>\n\t\t\t' + timerString + '\n\t\t</div>';

	$(self.div).append(s);
	renderMathInElement(document.body, self.mathOptions);

	if (node.duration > 0) {
		self.set_timer(node);
	}

	self.page_change(node);

	$('#' + self.opts.div + ' .answer').unbind('click');
	$('#' + self.opts.div + ' .answer').click(function onClick() {
		var n = $(this).attr('no');
		node.chosen = parseInt(n, 10);
		self.deactivate_timer(node);
		self.it++;
		var beta = self.sequence.nodes[self.it];
		if (self.it < self.sequence.nodes.length) {
			self.play_node(beta);
		} else {
			self.result();
		}
	});

	$('#' + self.opts.div + ' .clicked_answer').click(function onClick() {
		var actual_form = document.getElementById(form);
		node.chosen = parseInt(actual_form.mpanswers.value);
		self.deactivate_timer(node);
		self.it++;
		var beta = self.sequence.nodes[self.it];
		if (self.it < self.sequence.nodes.length) {
			self.play_node(beta);
		} else {
			self.result();
		}
	});
} // end FUNCTION multipleChoiceElement()

// EXPORTS //

module.exports = multipleChoiceElement;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"katex":83,"katex-auto-render":173,"markdown-it":106}],9:[function(require,module,exports){
'use strict';

// MODULES //

/* global TimelineMax: true */
require('gsap-tween-max');

// BOTTOM UP CHANGE //

/**
* FUNCTION: bottomUpChange( node, div )
*	Triggers a "Bottom Up" transition between questions.
*
* @param {Object} node - quiz object
* @param {String} div - id of parent div
* @returns {Void}
*/
function bottomUpChange(node, div) {
	var name = div + '_node_item_' + node.id;

	/// Animation //
	var el = document.getElementById(name);
	var tl = new TimelineMax({});
	tl.pause();
	tl.to(el, 0, {
		top: '100%',
		opacity: 0 }, 'start');
	if (node.id > 0) {
		var fname = div + '_node_item_' + (node.id - 1);
		var former = document.getElementById(fname);
		tl.to(former, 1, {
			top: '-100%' }, 'go');
	}
	tl.to(el, 1, {
		top: '0',
		opacity: 1 }, 'go');
	tl.play();
} // end FUNCTION bottomUpChange()

// EXPORTS //

module.exports = bottomUpChange;

},{"gsap-tween-max":82}],10:[function(require,module,exports){
'use strict';

// MODULES //

/* global TimelineMax: true */
require('gsap-tween-max');

// DYNAMIC CHANGE //

/**
* FUNCTION: dynamicChange( node, div )
*	Trigger a dynamic change transition.
*
* @param {Object} node - quiz object
* @param {String} div - id of parent div
* @returns {Void}
*/
function dynamicChange(node, div) {

	var name = div + '_node_item_' + node.id;

	/// Animation //
	var el = document.getElementById(name);
	var tl = new TimelineMax({});
	tl.pause();
	tl.to(el, 0, {
		left: '-100%',
		opacity: 1 }, 'start');
	if (node.id > 0) {
		var fname = div + '_node_item_' + (node.id - 1);
		var former = document.getElementById(fname);
		tl.to(former, 1, {
			left: '100%' }, 'go');
	}
	tl.to(el, 1, {
		left: '0',
		opacity: 1 }, 'go');
	tl.play();
} // end FUNCTION dynamicChange()

// EXPORTS //

module.exports = dynamicChange;

},{"gsap-tween-max":82}],11:[function(require,module,exports){
'use strict';

// MODULES //

var dynamicChange = require('./dynamicChange.js'),
    topDownChange = require('./topDownChange.js'),
    bottomUpChange = require('./bottomUpChange');

// PAGE CHANGE //

/**
* FUNCTION: pageChange( node )
*	Trigger animation between questions in quiz.
*
* @param {Object} node - quiz object
* @returns {Void}
*/
function pageChange(node) {
	/* jshint validthis:true */
	if (!node.transition_in) {
		node.transition_in = 'default';
	}
	switch (node.transition_in) {
		case 'static':
			break;
		case 'dynamic':
			dynamicChange(node, this.opts.div);
			break;
		case 'top_down':
			topDownChange(node, this.opts.div);
			break;
		case 'bottom_up':
			bottomUpChange(node, this.opts.div);
			break;
		default:
			break;
	}
} // end FUNCTION pageChange()

// EXPORTS //

module.exports = pageChange;

},{"./bottomUpChange":9,"./dynamicChange.js":10,"./topDownChange.js":12}],12:[function(require,module,exports){
'use strict';

// MODULES //

/* global TimelineMax: true */
require('gsap-tween-max');

// TOP DOWN CHANGE //

/**
* FUNCTION: topDownChange( node, div )
*	Triggers a "Top Down" transition between questions.
*
* @param {Object} node - quiz object
* @param {String} div - id of parent div
* @returns {Void}
*/
function topDownChange(node, div) {
	var name = div + '_node_item_' + node.id;

	/// Animation //
	var el = document.getElementById(name);
	var tl = new TimelineMax({});
	tl.pause();
	tl.to(el, 0, {
		top: '-100%',
		opacity: 0 }, 'start');
	if (node.id > 0) {
		var fname = div + '_node_item_' + (node.id - 1);
		var former = document.getElementById(fname);
		tl.to(former, 1, {
			top: '100%' }, 'go');
	}
	tl.to(el, 1, {
		top: '0',
		opacity: 1 }, 'go');
	tl.play();
} // end FUNCTION topDownChange()

// EXPORTS //

module.exports = topDownChange;

},{"gsap-tween-max":82}],13:[function(require,module,exports){
"use strict";

function ResponsiveDesign() {
	var self = this;

	// horizontal ranges
	this.hrs = [600, 800, 1024, 1280, 1400, 1900];

	this.horizontal_setting = function () {
		self.HR = 0;
		for (var i = 0; i < self.hrs.length; i++) {
			if (self.width > self.hrs[i]) {
				self.HR = i;
			}
		}
		switch (self.HR) {
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

	this.vertical_setting = function () {
		console.log("VERTICAL");
	};

	this.init = function () {
		self.width = window.innerWidth;
		self.height = window.innerHeight;
		if (self.width > self.height) {
			self.horizontal_setting();
		} else {
			self.vertical_setting();
		}
	};

	self.init();
}

// EXPORTS //

module.exports = ResponsiveDesign;

},{}],14:[function(require,module,exports){
(function (global){
'use strict';

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

window.QAlity = require('./exam');

if (!window.hasOwnProperty('$')) {
	window.$ = $;
}

if (!window.hasOwnProperty('katex')) {
	window.katex = require('katex');
}

if (!window.hasOwnProperty('renderMathInElement')) {
	window.renderMathInElement = require('katex-auto-render');
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./exam":4,"katex":83,"katex-auto-render":173}],15:[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.4 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.4',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],16:[function(require,module,exports){
'use strict';

/**
* FUNCTION: sum( arr, clbk )
*	Computes a sum using an accessor.
*
* @param {Array} arr - input array
* @param {Function} accessor - accessor function for accessing array values
* @returns {Number} sum
*/
function sum( arr, clbk ) {
	var len = arr.length,
		s = 0,
		i;
	for ( i = 0; i < len; i++ ) {
		s += clbk( arr[ i ], i );
	}
	return s;
} // end FUNCTION sum()


// EXPORTS //

module.exports = sum;

},{}],17:[function(require,module,exports){
'use strict';

/**
* FUNCTION: sum( arr )
*	Computes the sum.
*
* @param {Array} arr - input array
* @returns {Number} sum
*/
function sum( arr ) {
	var len = arr.length,
		s = 0,
		i;
	for ( i = 0; i < len; i++ ) {
		s += arr[ i ];
	}
	return s;
} // end FUNCTION sum()


// EXPORTS //

module.exports = sum;

},{}],18:[function(require,module,exports){
'use strict';

// MODULES //

var isArrayLike = require( 'validate.io-array-like' ),
	isMatrixLike = require( 'validate.io-matrix-like' ),
	ctors = require( 'compute-array-constructors' ),
	matrix = require( 'dstructs-matrix' ).raw,
	validate = require( './validate.js' );


// FUNCTIONS //

var sum1 = require( './array.js' ),
	sum2 = require( './accessor.js' ),
	sum3 = require( './matrix.js' );


// SUM //

/*
* FUNCTION: sum( x[, options] )
*	Computes the sum of elements in x.
*
* @param {Number[]|Array|Int8Array|Uint8Array|Uint8ClampedArray|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array|Float64Array|Matrix} x - input value
* @param {Object} [options] - function options
* @param {Function} [options.accessor] - accessor function for accessing array values
* @param {Number} [options.dim=2] - dimension along which to compute the sum
* @param {String} [options.dtype="float64"] - output data type
* @returns {Number|Matrix} sum(s)
*/
function sum( x, options ) {
	/* jshint newcap:false */
	var opts = {},
		shape,
		ctor,
		err,
		len,
		dim,
		dt,
		d,
		m;

	if ( arguments.length > 1 ) {
		err = validate( opts, options );
		if ( err ) {
			throw err;
		}
	}
	if ( isMatrixLike( x ) ) {
		dt = opts.dtype || 'float64';
		dim = opts.dim;

		// Determine if provided a vector...
		if ( x.shape[ 0 ] === 1 || x.shape[ 1 ] === 1 ) {
			// Treat as an array-like object:
			return sum1( x.data );
		}
		if ( dim > 2 ) {
			throw new RangeError( 'sum()::invalid option. Dimension option exceeds number of matrix dimensions. Option: `' + dim + '`.' );
		}
		if ( dim === void 0 || dim === 2 ) {
			len = x.shape[ 0 ];
			shape = [ len, 1 ];
		} else {
			len = x.shape[ 1 ];
			shape = [ 1, len ];
		}
		ctor = ctors( dt );
		if ( ctor === null ) {
			throw new Error( 'sum()::invalid option. Data type option does not have a corresponding array constructor. Option: `' + dt + '`.' );
		}
		// Create an output matrix and calculate the sums:
		d = new ctor( len );
		m = matrix( d, shape, dt );
		return sum3( m, x, dim );
	}
	if ( isArrayLike( x ) ) {
		if ( opts.accessor ) {
			return sum2( x, opts.accessor );
		}
		return sum1( x );
	}
	throw new TypeError( 'sum()::invalid input argument. First argument must be either an array or a matrix. Value: `' + x + '`.' );
} // end FUNCTION sum()


// EXPORTS //

module.exports = sum;

},{"./accessor.js":16,"./array.js":17,"./matrix.js":19,"./validate.js":20,"compute-array-constructors":22,"dstructs-matrix":31,"validate.io-array-like":70,"validate.io-matrix-like":75}],19:[function(require,module,exports){
'use strict';

/**
* FUNCTION: sum( out, mat[, dim] )
*	Computes the sum along a matrix dimension.
*
* @param {Matrix} out - output matrix
* @param {Matrix} mat - input matrix
* @param {Number} [dim=2] - matrix dimension along which to compute the sum. If `dim=1`, compute along matrix rows. If `dim=2`, compute along matrix columns.
* @returns {Matrix|Number} sums or 0
*/
function sum( out, mat, dim ) {
	var s,
		M, N,
		s0, s1,
		o,
		i, j, k;

	if ( dim === 1 ) {
		// Compute along the rows...
		M = mat.shape[ 1 ];
		N = mat.shape[ 0 ];
		s0 = mat.strides[ 1 ];
		s1 = mat.strides[ 0 ];
	} else {
		// Compute along the columns...
		M = mat.shape[ 0 ];
		N = mat.shape[ 1 ];
		s0 = mat.strides[ 0 ];
		s1 = mat.strides[ 1 ];
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	o = mat.offset;
	for ( i = 0; i < M; i++ ) {
		k = o + i*s0;
		s = 0;
		for ( j = 0; j < N; j++ ) {
			s += mat.data[ k + j*s1 ];
		}
		out.data[ i ] = s;
	}
	return out;
} // end FUNCTION sum()


// EXPORTS //

module.exports = sum;

},{}],20:[function(require,module,exports){
'use strict';

// MODULES //

var isObject = require( 'validate.io-object' ),
	isFunction = require( 'validate.io-function' ),
	isString = require( 'validate.io-string-primitive' ),
	isPositiveInteger = require( 'validate.io-positive-integer' );


// VALIDATE //

/**
* FUNCTION: validate( opts, options )
*	Validates function options.
*
* @param {Object} opts - destination for validated options
* @param {Object} options - function options
* @param {Function} [options.accessor] - accessor function for accessing array values
* @param {Number} [options.dim] - dimension
* @returns {Null|Error} null or an error
*/
function validate( opts, options ) {
	if ( !isObject( options ) ) {
		return new TypeError( 'sum()::invalid input argument. Options argument must be an object. Value: `' + options + '`.' );
	}
	if ( options.hasOwnProperty( 'accessor' ) ) {
		opts.accessor = options.accessor;
		if ( !isFunction( opts.accessor ) ) {
			return new TypeError( 'sum()::invalid option. Accessor must be a function. Option: `' + opts.accessor + '`.' );
		}
	}
	if ( options.hasOwnProperty( 'dim' ) ) {
		opts.dim = options.dim;
		if ( !isPositiveInteger( opts.dim ) ) {
			return new TypeError( 'sum()::invalid option. Dimension option must be a positive integer. Option: `' + opts.dim + '`.' );
		}
	}
	if ( options.hasOwnProperty( 'dtype' ) ) {
		opts.dtype = options.dtype;
		if ( !isString( opts.dtype ) ) {
			return new TypeError( 'sum()::invalid option. Data type option must be a string primitive. Option: `' + opts.dtype + '`.' );
		}
	}
	return null;
} // end FUNCTION validate()


// EXPORTS //

module.exports = validate;

},{"validate.io-function":74,"validate.io-object":76,"validate.io-positive-integer":78,"validate.io-string-primitive":81}],21:[function(require,module,exports){
'use strict';

var CTORS = {
	'int8': Int8Array,
	'uint8': Uint8Array,
	'uint8_clamped': Uint8ClampedArray,
	'int16': Int16Array,
	'uint16': Uint16Array,
	'int32': Int32Array,
	'uint32': Uint32Array,
	'float32': Float32Array,
	'float64': Float64Array,
	'generic': Array
};


// EXPORTS //

module.exports = CTORS;

},{}],22:[function(require,module,exports){
'use strict';

// CTORS //

var CTORS = require( './ctors.js' );


// GET CTOR //

/**
* FUNCTION: getCtor( dtype )
*	Returns an array constructor corresponding to an input data type.
*
* @param {String} dtype - data type
* @returns {Function|Null} array constructor or null
*/
function getCtor( dtype ) {
	return CTORS[ dtype ] || null;
} // end FUNCTION getCtor()


// EXPORTS //

module.exports = getCtor;

},{"./ctors.js":21}],23:[function(require,module,exports){
'use strict';

// BASE TYPES //

var BTYPES = {
	'int8': Int8Array,
	'uint8': Uint8Array,
	'uint8_clamped': Uint8ClampedArray,
	'int16': Int16Array,
	'uint16': Uint16Array,
	'int32': Int32Array,
	'uint32': Uint32Array,
	'float32': Float32Array,
	'float64': Float64Array
};


// EXPORTS //

module.exports = BTYPES;

},{}],24:[function(require,module,exports){
'use strict';

// MATRIX //

/**
* FUNCTION: Matrix( data, shape, dtype )
*	Matrix constructor.
*
* @constructor
* @param {Int8Array|Uint8Array|Uint8ClampedArray|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array|Float64Array} data - input typed array
* @param {String} dtype - matrix data type
* @param {Number[]} shape - matrix dimensions/shape
* @param {Number} offset - matrix offset
* @param {Number[]} strides - matrix strides
* @returns {Matrix} Matrix instance
*/
function Matrix( data, dtype, shape, offset, strides ) {
	if ( !( this instanceof Matrix ) ) {
		return new Matrix( data, dtype, shape, offset, strides );
	}
	// Underlying data type:
	Object.defineProperty( this, 'dtype', {
		'value': dtype,
		'configurable': false,
		'enumerable': true,
		'writable': false
	});

	// Matrix dimensions:
	Object.defineProperty( this, 'shape', {
		'value': shape,
		'configurable': false,
		'enumerable': true,
		'writable': false
	});

	// Matrix strides:
	Object.defineProperty( this, 'strides', {
		'value': strides,
		'configurable': false,
		'enumerable': true,
		'writable': false
	});

	// Matrix offset:
	Object.defineProperty( this, 'offset', {
		'value': offset,
		'configurable': false,
		'enumerable': true,
		'writable': true
	});

	// Number of matrix dimensions:
	Object.defineProperty( this, 'ndims', {
		'value': shape.length,
		'configurable': false,
		'enumerable': true,
		'writable': false
	});

	// Matrix length:
	Object.defineProperty( this, 'length', {
		'value': data.length,
		'configurable': false,
		'enumerable': true,
		'writable': false
	});

	// Number of bytes used by the matrix elements:
	Object.defineProperty( this, 'nbytes', {
		'value': data.byteLength,
		'configurable': false,
		'enumerable': true,
		'writable': false
	});

	// Matrix data store:
	Object.defineProperty( this, 'data', {
		'value': data,
		'configurable': false,
		'enumerable': true,
		'writable': false
	});

	return this;
} // end FUNCTION Matrix()


// METHODS //

Matrix.prototype.set = require( './set.js' );
Matrix.prototype.iset = require( './iset.js' );
Matrix.prototype.mset = require( './mset.js' );
Matrix.prototype.sset = require( './sset.js' );

Matrix.prototype.get = require( './get.js' );
Matrix.prototype.iget = require( './iget.js' );
Matrix.prototype.mget = require( './mget.js' );
Matrix.prototype.sget = require( './sget.js' );

Matrix.prototype.toString = require( './toString.js' );


// EXPORTS //

module.exports = Matrix;

},{"./get.js":27,"./iget.js":29,"./iset.js":32,"./mget.js":36,"./mset.js":38,"./set.js":46,"./sget.js":48,"./sset.js":50,"./toString.js":52}],25:[function(require,module,exports){
'use strict';

// MATRIX //

/**
* FUNCTION: Matrix( data, shape, dtype )
*	Matrix constructor.
*
* @constructor
* @param {Int8Array|Uint8Array|Uint8ClampedArray|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array|Float64Array} data - input typed array
* @param {String} dtype - matrix data type
* @param {Number[]} shape - matrix dimensions/shape
* @param {Number} offset - matrix offset
* @param {Number[]} strides - matrix strides
* @returns {Matrix} Matrix instance
*/
function Matrix( data, dtype, shape, offset, strides ) {
	if ( !( this instanceof Matrix ) ) {
		return new Matrix( data, dtype, shape, offset, strides );
	}
	this.dtype = dtype;
	this.shape = shape;
	this.strides = strides;
	this.offset = offset;
	this.ndims = shape.length;
	this.length = data.length;
	this.nbytes = data.byteLength;
	this.data = data;
	return this;
} // end FUNCTION Matrix()


// METHODS //

Matrix.prototype.set = require( './set.raw.js' );
Matrix.prototype.iset = require( './iset.raw.js' );
Matrix.prototype.mset = require( './mset.raw.js' );
Matrix.prototype.sset = require( './sset.raw.js' );

Matrix.prototype.get = require( './get.raw.js' );
Matrix.prototype.iget = require( './iget.raw.js' );
Matrix.prototype.mget = require( './mget.raw.js' );
Matrix.prototype.sget = require( './sget.raw.js' );

Matrix.prototype.toString = require( './toString.js' );


// EXPORTS //

module.exports = Matrix;

},{"./get.raw.js":28,"./iget.raw.js":30,"./iset.raw.js":33,"./mget.raw.js":37,"./mset.raw.js":39,"./set.raw.js":47,"./sget.raw.js":49,"./sset.raw.js":51,"./toString.js":52}],26:[function(require,module,exports){
'use strict';

// DATA TYPES //

var DTYPES = [
	'int8',
	'uint8',
	'uint8_clamped',
	'int16',
	'uint16',
	'int32',
	'uint32',
	'float32',
	'float64'
];


// EXPORTS //

module.exports = DTYPES;

},{}],27:[function(require,module,exports){
'use strict';

// MODULES //

var isNonNegativeInteger = require( 'validate.io-nonnegative-integer' );


// GET //

/**
* FUNCTION: get( i, j )
*	Returns a matrix element based on the provided row and column indices.
*
* @param {Number} i - row index
* @param {Number} j - column index
* @returns {Number|Undefined} matrix element
*/
function get( i, j ) {
	/*jshint validthis:true */
	if ( !isNonNegativeInteger( i ) || !isNonNegativeInteger( j ) ) {
		throw new TypeError( 'get()::invalid input argument. Indices must be nonnegative integers. Values: `[' + i + ','+ j + ']`.' );
	}
	return this.data[ this.offset + i*this.strides[0] + j*this.strides[1] ];
} // end FUNCTION get()


// EXPORTS //

module.exports = get;

},{"validate.io-nonnegative-integer":66}],28:[function(require,module,exports){
'use strict';

/**
* FUNCTION: get( i, j )
*	Returns a matrix element based on the provided row and column indices.
*
* @param {Number} i - row index
* @param {Number} j - column index
* @returns {Number|Undefined} matrix element
*/
function get( i, j ) {
	/*jshint validthis:true */
	return this.data[ this.offset + i*this.strides[0] + j*this.strides[1] ];
} // end FUNCTION get()


// EXPORTS //

module.exports = get;

},{}],29:[function(require,module,exports){
'use strict';

// MODULES //

var isInteger = require( 'validate.io-integer-primitive' );


// IGET //

/**
* FUNCTION: iget( idx )
*	Returns a matrix element located at a specified index.
*
* @param {Number} idx - linear index
* @returns {Number|Undefined} matrix element
*/
function iget( idx ) {
	/*jshint validthis:true */
	var r, j;
	if ( !isInteger( idx ) ) {
		throw new TypeError( 'iget()::invalid input argument. Must provide a integer. Value: `' + idx + '`.' );
	}
	if ( idx < 0 ) {
		idx += this.length;
		if ( idx < 0 ) {
			return;
		}
	}
	j = idx % this.strides[ 0 ];
	r = idx - j;
	if ( this.strides[ 0 ] < 0 ) {
		r = -r;
	}
	return this.data[ this.offset + r + j*this.strides[1] ];
} // end FUNCTION iget()


// EXPORTS //

module.exports = iget;

},{"validate.io-integer-primitive":64}],30:[function(require,module,exports){
'use strict';

/**
* FUNCTION: iget( idx )
*	Returns a matrix element located at a specified index.
*
* @param {Number} idx - linear index
* @returns {Number|Undefined} matrix element
*/
function iget( idx ) {
	/*jshint validthis:true */
	var r, j;
	if ( idx < 0 ) {
		idx += this.length;
		if ( idx < 0 ) {
			return;
		}
	}
	j = idx % this.strides[ 0 ];
	r = idx - j;
	if ( this.strides[ 0 ] < 0 ) {
		r = -r;
	}
	return this.data[ this.offset + r + j*this.strides[1] ];
} // end FUNCTION iget()


// EXPORTS //

module.exports = iget;

},{}],31:[function(require,module,exports){
'use strict';

// EXPORTS //

module.exports = require( './matrix.js' );
module.exports.raw = require( './matrix.raw.js' );

},{"./matrix.js":34,"./matrix.raw.js":35}],32:[function(require,module,exports){
'use strict';

// MODULES //

var isInteger = require( 'validate.io-integer-primitive' ),
	isNumber = require( 'validate.io-number-primitive' );


// ISET //

/**
* FUNCTION: iset( idx, value )
*	Sets a matrix element located at a specified index.
*
* @param {Number} idx - linear index
* @param {Number} value - value to set
* @returns {Matrix} Matrix instance
*/
function iset( idx, v ) {
	/* jshint validthis: true */
	var r, j;
	if ( !isInteger( idx ) ) {
		throw new TypeError( 'iset()::invalid input argument. An index must be an integer. Value: `' + idx + '`.' );
	}
	if ( !isNumber( v ) ) {
		throw new TypeError( 'iset()::invalid input argument. An input value must be a number primitive. Value: `' + v + '`.' );
	}
	if ( idx < 0 ) {
		idx += this.length;
		if ( idx < 0 ) {
			return this;
		}
	}
	j = idx % this.strides[ 0 ];
	r = idx - j;
	if ( this.strides[ 0 ] < 0 ) {
		r = -r;
	}
	this.data[ this.offset + r + j*this.strides[1] ] = v;
	return this;
} // end FUNCTION iset()


// EXPORTS //

module.exports = iset;

},{"validate.io-integer-primitive":64,"validate.io-number-primitive":69}],33:[function(require,module,exports){
'use strict';

/**
* FUNCTION: iset( idx, value )
*	Sets a matrix element located at a specified index.
*
* @param {Number} idx - linear index
* @param {Number} value - value to set
* @returns {Matrix} Matrix instance
*/
function iset( idx, v ) {
	/* jshint validthis: true */
	var r, j;
	if ( idx < 0 ) {
		idx += this.length;
		if ( idx < 0 ) {
			return this;
		}
	}
	j = idx % this.strides[ 0 ];
	r = idx - j;
	if ( this.strides[ 0 ] < 0 ) {
		r = -r;
	}
	this.data[ this.offset + r + j*this.strides[1] ] = v;
	return this;
} // end FUNCTION iset()


// EXPORTS //

module.exports = iset;

},{}],34:[function(require,module,exports){
'use strict';

// MODULES //

var isString = require( 'validate.io-string-primitive' ),
	isNonNegativeIntegerArray = require( 'validate.io-nonnegative-integer-array' ),
	contains = require( 'validate.io-contains' ),
	isArray = require( 'validate.io-array' ),
	cast = require( 'compute-cast-arrays' ),
	getType = require( 'compute-dtype' ),
	Matrix = require( './ctor.js' );


// VARIABLES //

var BTYPES = require( './btypes.js' ),
	DTYPES = require( './dtypes.js' );


// CREATE MATRIX //

/**
* FUNCTION: matrix( [data,] shape[, dtype] )
*	Returns a Matrix instance.
*
* @constructor
* @param {Int8Array|Uint8Array|Uint8ClampedArray|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array|Float64Array} [data] - input typed array
* @param {Number[]} shape - matrix dimensions/shape
* @param {String} [dtype="float64"] - matrix data type
* @returns {Matrix} Matrix instance
*/
function matrix() {
	var dtype,
		ndims,
		shape,
		data,
		vFLG,
		len,
		dt,
		i;

	// Parse the input arguments (polymorphic interface)...
	if ( arguments.length === 1 ) {
		shape = arguments[ 0 ];
		vFLG = 2; // arg #s
	}
	else if ( arguments.length === 2 ) {
		if ( isString( arguments[ 1 ] ) ) {
			shape = arguments[ 0 ];
			dtype = arguments[ 1 ];
			vFLG = 23; // arg #s
		} else {
			data = arguments[ 0 ];
			shape = arguments[ 1 ];
			vFLG = 12; // arg #s
		}
	}
	else {
		data = arguments[ 0 ];
		shape = arguments[ 1 ];
		dtype = arguments[ 2 ];
		vFLG = 123; // arg #s
	}

	// Input argument validation...
	if ( !isNonNegativeIntegerArray( shape ) ) {
		throw new TypeError( 'matrix()::invalid input argument. A matrix shape must be an array of nonnegative integers. Value: `' + shape + '`.' );
	}
	ndims = shape.length;
	if ( ndims !== 2 ) {
		throw new Error( 'matrix()::invalid input argument. Shape must be a 2-element array. Value: `' + shape + '`.' );
	}
	// If a `dtype` has been provided, validate...
	if ( vFLG === 123 || vFLG === 23 ) {
		if ( !contains( DTYPES, dtype ) ) {
			throw new TypeError( 'matrix()::invalid input argument. Unrecognized/unsupported data type. Value: `' + dtype + '`.' );
		}
	} else {
		dtype = 'float64';
	}
	len = 1;
	for ( i = 0; i < ndims; i++ ) {
		len *= shape[ i ];
	}
	// If a `data` argument has been provided, validate...
	if ( vFLG === 123 || vFLG === 12 ) {
		dt = getType( data );
		if ( !contains( DTYPES, dt ) && !isArray( data ) ) {
			throw new TypeError( 'matrix()::invalid input argument. Input data must be a valid type. Consult the documentation for a list of valid data types. Value: `' + data + '`.' );
		}
		if ( len !== data.length ) {
			throw new Error( 'matrix()::invalid input argument. Matrix shape does not match the input data length.' );
		}
		// Only cast if either 1) both a `data` and `dtype` argument have been provided and they do not agree or 2) when provided a plain Array...
		if ( ( vFLG === 123 && dt !== dtype ) || dt === 'generic' ) {
			data = cast( data, dtype );
		}
	} else {
		// Initialize a zero-filled typed array:
		data = new BTYPES[ dtype ]( len );
	}
	// Return a new Matrix instance:
	return new Matrix( data, dtype, shape, 0, [shape[1],1] );
} // end FUNCTION matrix()


// EXPORTS //

module.exports = matrix;

},{"./btypes.js":23,"./ctor.js":24,"./dtypes.js":26,"compute-cast-arrays":53,"compute-dtype":56,"validate.io-array":61,"validate.io-contains":62,"validate.io-nonnegative-integer-array":65,"validate.io-string-primitive":81}],35:[function(require,module,exports){
'use strict';

// MODULES //

var isString = require( 'validate.io-string-primitive' ),
	contains = require( 'validate.io-contains' ),
	getType = require( 'compute-dtype' ),
	Matrix = require( './ctor.raw.js' );


// VARIABLES //

var BTYPES = require( './btypes.js' ),
	DTYPES = require( './dtypes.js' );


// CREATE MATRIX //

/**
* FUNCTION: matrix( [data,] shape[, dtype] )
*	Returns a Matrix instance.
*
* @constructor
* @param {Int8Array|Uint8Array|Uint8ClampedArray|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array|Float64Array} [data] - input typed array
* @param {Number[]} shape - matrix dimensions/shape
* @param {String} [dtype="float64"] - matrix data type
* @returns {Matrix} Matrix instance
*/
function matrix() {
	var dtype,
		ndims,
		shape,
		data,
		len,
		i;

	if ( arguments.length === 1 ) {
		shape = arguments[ 0 ];
	}
	else if ( arguments.length === 2 ) {
		if ( isString( arguments[ 1 ] ) ) {
			shape = arguments[ 0 ];
			dtype = arguments[ 1 ];
		} else {
			data = arguments[ 0 ];
			shape = arguments[ 1 ];
		}
	}
	else {
		data = arguments[ 0 ];
		shape = arguments[ 1 ];
		dtype = arguments[ 2 ];
	}
	ndims = shape.length;
	if ( ndims !== 2 ) {
		throw new Error( 'matrix()::invalid input argument. Shape must be a 2-element array. Value: `' + shape + '`.' );
	}
	len = 1;
	for ( i = 0; i < ndims; i++ ) {
		len *= shape[ i ];
	}
	if ( data ) {
		if ( !dtype ) {
			dtype = getType( data );
			if ( !contains( DTYPES, dtype ) ) {
				throw new TypeError( 'matrix()::invalid input argument. Input data must be a valid type. Consult the documentation for a list of valid data types. Value: `' + data + '`.' );
			}
		}
		if ( len !== data.length ) {
			throw new Error( 'matrix()::invalid input argument. Matrix shape does not match the input data length.' );
		}
	} else {
		// Initialize a zero-filled typed array...
		if ( !dtype ) {
			dtype = 'float64';
		}
		data = new BTYPES[ dtype ]( len );
	}
	// Return a new Matrix instance:
	return new Matrix( data, dtype, shape, 0, [shape[1],1] );
} // end FUNCTION matrix()


// EXPORTS //

module.exports = matrix;

},{"./btypes.js":23,"./ctor.raw.js":25,"./dtypes.js":26,"compute-dtype":56,"validate.io-contains":62,"validate.io-string-primitive":81}],36:[function(require,module,exports){
'use strict';

// MODULES //

var isNonNegativeIntegerArray = require( 'validate.io-nonnegative-integer-array' );


// VARIABLES //

var BTYPES = require( './btypes.js' );


// MGET //

/**
* FUNCTION: mget( i[, j] )
*	Returns multiple matrix elements. If provided a single argument, `i` is treated as an array of linear indices.
*
* @param {Number[]|Null} i - linear/row indices
* @param {Number[]|Null} [j] - column indices
* @returns {Matrix} a new Matrix instance
*/
function mget( rows, cols ) {
	/*jshint validthis:true */
	var nRows,
		nCols,
		out,
		sgn,
		d,
		s0, s1, s2, s3,
		o,
		r, dr,
		i, j, m, n;

	s0 = this.strides[ 0 ];
	s1 = this.strides[ 1 ];
	o = this.offset;

	if ( arguments.length < 2 ) {
		if ( !isNonNegativeIntegerArray( rows ) ) {
			throw new TypeError( 'mget()::invalid input argument. Linear indices must be specified as a nonnegative integer array. Value: `' + rows + '`.' );
		}
		// Filter the input indices to ensure within bounds...
		i = [];
		for ( n = 0; n < rows.length; n++ ) {
			if ( rows[ n ] < this.length ) {
				i.push( rows[ n ] );
			}
		}
		m = i.length;

		// Create a row vector (matrix):
		d = new BTYPES[ this.dtype ]( m );
		out = new this.constructor( d, this.dtype, [1,m], 0, [m,1] );

		sgn = ( s0 < 0 ) ? -1 : 1;
		for ( n = 0; n < m; n++ ) {
			j = i[ n ] % s0;
			r = sgn * ( i[n] - j );
			d[ n ] = this.data[ o + r + j*s1 ];
		}
	} else {
		nRows = this.shape[ 0 ];
		if ( rows === null ) {
			i = new Array( nRows );
			for ( n = 0; n < nRows; n++ ) {
				i[ n ] = n;
			}
		}
		else if ( isNonNegativeIntegerArray( rows ) ) {
			i = [];
			for ( n = 0; n < rows.length; n++ ) {
				if ( rows[ n ] < nRows ) {
					i.push( rows[ n ] );
				}
			}
		}
		else {
			throw new TypeError( 'mget()::invalid input argument. Row indices must be specified as a nonnegative integer array. Value: `' + rows + '`.' );
		}

		nCols = this.shape[ 1 ];
		if ( cols === null ) {
			j = new Array( nCols );
			for ( n = 0; n < nCols; n++ ) {
				j[ n ] = n;
			}
		}
		else if ( isNonNegativeIntegerArray( cols ) ) {
			j = [];
			for ( n = 0; n < cols.length; n++ ) {
				if ( cols[ n ] < nCols ) {
					j.push( cols[ n ] );
				}
			}
		}
		else {
			throw new TypeError( 'mget()::invalid input argument. Column indices must be specified as a nonnegative integer array. Value: `' + cols + '`.' );
		}
		nRows = i.length;
		nCols = j.length;

		d = new BTYPES[ this.dtype ]( nRows*nCols );
		out = new this.constructor( d, this.dtype, [nRows,nCols], 0, [nCols,1]);

		s2 = out.strides[ 0 ];
		s3 = out.strides[ 1 ];
		for ( m = 0; m < nRows; m++ ) {
			r = o + i[m]*s0;
			dr = m * s2;
			for ( n = 0; n < nCols; n++ ) {
				d[ dr + n*s3 ] = this.data[ r + j[n]*s1 ];
			}
		}
	}
	return out;
} // end FUNCTION mget()


// EXPORTS //

module.exports = mget;

},{"./btypes.js":23,"validate.io-nonnegative-integer-array":65}],37:[function(require,module,exports){
'use strict';

// VARIABLES //

var BTYPES = require( './btypes.js' );


// MGET //

/**
* FUNCTION: mget( i[, j] )
*	Returns multiple matrix elements. If provided a single argument, `i` is treated as an array of linear indices.
*
* @param {Number[]|Null} i - linear/row indices
* @param {Number[]|Null} [j] - column indices
* @returns {Matrix} a new Matrix instance
*/
function mget( rows, cols ) {
	/*jshint validthis:true */
	var nRows,
		nCols,
		out,
		sgn,
		d,
		s0, s1, s2, s3,
		o,
		r, dr,
		i, j, m, n;

	s0 = this.strides[ 0 ];
	s1 = this.strides[ 1 ];
	o = this.offset;

	if ( arguments.length < 2 ) {
		i = rows;
		m = i.length;

		// Create a row vector (matrix):
		d = new BTYPES[ this.dtype ]( m );
		out = new this.constructor( d, this.dtype, [1,m], 0, [m,1] );

		sgn = ( s0 < 0 ) ? -1 : 1;
		for ( n = 0; n < m; n++ ) {
			j = i[ n ] % s0;
			r = sgn * ( i[n] - j );
			d[ n ] = this.data[ o + r + j*s1 ];
		}
	} else {
		if ( rows === null ) {
			nRows = this.shape[ 0 ];
			i = new Array( nRows );
			for ( n = 0; n < nRows; n++ ) {
				i[ n ] = n;
			}
		} else {
			nRows = rows.length;
			i = rows;
		}

		if ( cols === null ) {
			nCols = this.shape[ 1 ];
			j = new Array( nCols );
			for ( n = 0; n < nCols; n++ ) {
				j[ n ] = n;
			}
		} else {
			nCols = cols.length;
			j = cols;
		}

		d = new BTYPES[ this.dtype ]( nRows*nCols );
		out = new this.constructor( d, this.dtype, [nRows,nCols], 0, [nCols,1] );

		s2 = out.strides[ 0 ];
		s3 = out.strides[ 1 ];
		for ( m = 0; m < nRows; m++ ) {
			r = o + i[m]*s0;
			dr = m * s2;
			for ( n = 0; n < nCols; n++ ) {
				d[ dr + n*s3 ] = this.data[ r + j[n]*s1 ];
			}
		}
	}
	return out;
} // end FUNCTION mget()


// EXPORTS //

module.exports = mget;

},{"./btypes.js":23}],38:[function(require,module,exports){
'use strict';

// MODULES //

var isFunction = require( 'validate.io-function' ),
	isNumber = require( 'validate.io-number-primitive' ),
	isNonNegativeIntegerArray = require( 'validate.io-nonnegative-integer-array' );


// FUNCTIONS //

var mset1 = require( './mset1.js' ),
	mset2 = require( './mset2.js' ),
	mset3 = require( './mset3.js' ),
	mset4 = require( './mset4.js' ),
	mset5 = require( './mset5.js' ),
	mset6 = require( './mset6.js' );

/**
* FUNCTION: getIndices( idx, len )
*	Validates and returns an array of indices.
*
* @private
* @param {Number[]|Null} idx - indices
* @param {Number} len - max index
* @returns {Number[]} indices
*/
function getIndices( idx, len ) {
	var out,
		i;
	if ( idx === null ) {
		out = new Array( len );
		for ( i = 0; i < len; i++ ) {
			out[ i ] = i;
		}
	}
	else if ( isNonNegativeIntegerArray( idx ) ) {
		out = [];
		for ( i = 0; i < idx.length; i++ ) {
			if ( idx[ i ] < len ) {
				out.push( idx[ i ] );
			}
		}
	}
	else {
		throw new TypeError( 'mset()::invalid input argument. Row and column indices must be arrays of nonnegative integers. Value: `' + idx + '`.' );
	}
	return out;
} // end FUNCTION getIndices()


// MSET //

/**
* FUNCTION: mset( i[, j], value[, thisArg] )
*	Sets multiple matrix elements. If provided a single array, `i` is treated as an array of linear indices.
*
* @param {Number[]|Null} i - linear/row indices
* @param {Number[]|Null} [j] - column indices
* @param {Number|Matrix|Function} value - either a single numeric value, a matrix containing the values to set, or a function which returns a numeric value
* @returns {Matrix} Matrix instance
*/
function mset() {
	/*jshint validthis:true */
	var nargs = arguments.length,
		args,
		rows,
		cols,
		i;

	args = new Array( nargs );
	for ( i = 0; i < nargs; i++ ) {
		args[ i ] = arguments[ i ];
	}

	// 2 input arguments...
	if ( nargs < 3 ) {
		if ( !isNonNegativeIntegerArray( args[ 0 ] ) ) {
			throw new TypeError( 'mset()::invalid input argument. First argument must be an array of nonnegative integers. Value: `' + args[ 0 ] + '`.' );
		}
		// indices, clbk
		if ( isFunction( args[ 1 ] ) ) {
			mset2( this, args[ 0 ], args[ 1 ] );
		}
		// indices, number
		else if ( isNumber( args[ 1 ] ) ) {
			mset1( this, args[ 0 ], args[ 1 ] );
		}
		// indices, matrix
		else {
			// NOTE: no validation for Matrix instance.
			mset3( this, args[ 0 ], args[ 1 ] );
		}
	}
	// 3 input arguments...
	else if ( nargs === 3 ) {
		// indices, clbk, context
		if ( isFunction( args[ 1 ] ) ) {
			if ( !isNonNegativeIntegerArray( args[ 0 ] ) ) {
				throw new TypeError( 'mset()::invalid input argument. First argument must be an array of nonnegative integers. Value: `' + args[ 0 ] + '`.' );
			}
			mset2( this, args[ 0 ], args[ 1 ], args[ 2 ] );
		}
		// rows, cols, function
		else if ( isFunction( args[ 2 ] ) ) {
			rows = getIndices( args[ 0 ], this.shape[ 0 ] );
			cols = getIndices( args[ 1 ], this.shape[ 1 ] );
			mset4( this, rows, cols, args[ 2 ], this );
		}
		// rows, cols, number
		else if ( isNumber( args[ 2 ] ) ) {
			rows = getIndices( args[ 0 ], this.shape[ 0 ] );
			cols = getIndices( args[ 1 ], this.shape[ 1 ] );
			mset5( this, rows, cols, args[ 2 ] );
		}
		// rows, cols, matrix
		else {
			rows = getIndices( args[ 0 ], this.shape[ 0 ] );
			cols = getIndices( args[ 1 ], this.shape[ 1 ] );

			// NOTE: no validation for Matrix instance.
			mset6( this, rows, cols, args[ 2 ] );
		}
	}
	// 4 input arguments...
	else {
		// rows, cols, function, context
		if ( !isFunction( args[ 2 ] ) ) {
			throw new TypeError( 'mset()::invalid input argument. Callback argument must be a function. Value: `' + args[ 2 ] + '`.' );
		}
		rows = getIndices( args[ 0 ], this.shape[ 0 ] );
		cols = getIndices( args[ 1 ], this.shape[ 1 ] );
		mset4( this, rows, cols, args[ 2 ], args[ 3 ] );
	}
	return this;
} // end FUNCTION mset()


// EXPORTS //

module.exports = mset;

},{"./mset1.js":40,"./mset2.js":41,"./mset3.js":42,"./mset4.js":43,"./mset5.js":44,"./mset6.js":45,"validate.io-function":74,"validate.io-nonnegative-integer-array":65,"validate.io-number-primitive":69}],39:[function(require,module,exports){
'use strict';

// FUNCTIONS //

var mset1 = require( './mset1.js' ),
	mset2 = require( './mset2.js' ),
	mset3 = require( './mset3.js' ),
	mset4 = require( './mset4.js' ),
	mset5 = require( './mset5.js' ),
	mset6 = require( './mset6.js' );

/**
* FUNCTION: getIndices( idx, len )
*	Returns an array of indices.
*
* @private
* @param {Number[]|Null} idx - indices
* @param {Number} len - max index
* @returns {Number[]} indices
*/
function getIndices( idx, len ) {
	var out,
		i;
	if ( idx === null ) {
		out = new Array( len );
		for ( i = 0; i < len; i++ ) {
			out[ i ] = i;
		}
	} else {
		out = idx;
	}
	return out;
} // end FUNCTION getIndices()


// MSET //

/**
* FUNCTION: mset( i[, j], value[, thisArg] )
*	Sets multiple matrix elements. If provided a single array, `i` is treated as an array of linear indices.
*
* @param {Number[]|Null} i - linear/row indices
* @param {Number[]|Null} [j] - column indices
* @param {Number|Matrix|Function} value - either a single numeric value, a matrix containing the values to set, or a function which returns a numeric value
* @returns {Matrix} Matrix instance
*/
function mset() {
	/*jshint validthis:true */
	var nargs = arguments.length,
		args,
		rows,
		cols,
		i;

	args = new Array( nargs );
	for ( i = 0; i < nargs; i++ ) {
		args[ i ] = arguments[ i ];
	}

	// 2 input arguments...
	if ( nargs < 3 ) {
		// indices, clbk
		if ( typeof args[ 1 ] === 'function' ) {
			mset2( this, args[ 0 ], args[ 1 ] );
		}
		// indices, number
		else if ( typeof args[ 1 ] === 'number' ) {
			mset1( this, args[ 0 ], args[ 1 ] );
		}
		// indices, matrix
		else {
			mset3( this, args[ 0 ], args[ 1 ] );
		}
	}
	// 3 input arguments...
	else if ( nargs === 3 ) {
		// indices, clbk, context
		if ( typeof args[ 1 ] === 'function' ) {
			mset2( this, args[ 0 ], args[ 1 ], args[ 2 ] );
		}
		// rows, cols, function
		else if ( typeof args[ 2 ] === 'function' ) {
			rows = getIndices( args[ 0 ], this.shape[ 0 ] );
			cols = getIndices( args[ 1 ], this.shape[ 1 ] );
			mset4( this, rows, cols, args[ 2 ], this );
		}
		// rows, cols, number
		else if ( typeof args[ 2 ] === 'number' ) {
			rows = getIndices( args[ 0 ], this.shape[ 0 ] );
			cols = getIndices( args[ 1 ], this.shape[ 1 ] );
			mset5( this, rows, cols, args[ 2 ] );
		}
		// rows, cols, matrix
		else {
			rows = getIndices( args[ 0 ], this.shape[ 0 ] );
			cols = getIndices( args[ 1 ], this.shape[ 1 ] );
			mset6( this, rows, cols, args[ 2 ] );
		}
	}
	// 4 input arguments...
	else {
		rows = getIndices( args[ 0 ], this.shape[ 0 ] );
		cols = getIndices( args[ 1 ], this.shape[ 1 ] );
		mset4( this, rows, cols, args[ 2 ], args[ 3 ] );
	}
	return this;
} // end FUNCTION mset()


// EXPORTS //

module.exports = mset;

},{"./mset1.js":40,"./mset2.js":41,"./mset3.js":42,"./mset4.js":43,"./mset5.js":44,"./mset6.js":45}],40:[function(require,module,exports){
'use strict';

/**
* FUNCTION: mset1( mat, idx, v )
*	Sets multiple matrix elements to a numeric value `v`.
*
* @private
* @param {Matrix} mat - Matrix instance
* @param {Number[]} idx - linear indices
* @param {Number} v - numeric value
*/
function mset1( mat, idx, v ) {
	var s0 = mat.strides[ 0 ],
		s1 = mat.strides[ 1 ],
		len = idx.length,
		o = mat.offset,
		sgn,
		r, j, n;

	sgn = ( s0 < 0 ) ? -1 : 1;
	for ( n = 0; n < len; n++ ) {
		j = idx[ n ] % s0;
		r = sgn * ( idx[n] - j );
		mat.data[ o + r + j*s1 ] = v;
	}
} // end FUNCTION mset1()


// EXPORTS //

module.exports = mset1;

},{}],41:[function(require,module,exports){
'use strict';

/**
* FUNCTION: mset2( mat, idx, clbk, ctx )
*	Sets multiple matrix elements using a callback function.
*
* @private
* @param {Matrix} mat - Matrix instance
* @param {Number[]} idx - linear indices
* @param {Function} clbk - callback function
* @param {Object} ctx - `this` context when invoking the provided callback
*/
function mset2( mat, idx, clbk, ctx ) {
	var s0 = mat.strides[ 0 ],
		s1 = mat.strides[ 1 ],
		len = idx.length,
		o = mat.offset,
		sgn,
		r, c,
		i, k, n;

	sgn = ( s0 < 0 ) ? -1 : 1;
	for ( n = 0; n < len; n++ ) {
		// Get the column number:
		c = idx[ n ] % s0;

		// Determine the row offset:
		i = sgn * ( idx[n] - c );

		// Get the row number:
		r = i / s0;

		// Calculate the index:
		k = o + i + c*s1;

		// Set the value:
		mat.data[ k ] = clbk.call( ctx, mat.data[ k ], r, c, k );
	}
} // end FUNCTION mset2()


// EXPORTS //

module.exports = mset2;

},{}],42:[function(require,module,exports){
'use strict';

/**
* FUNCTION: mset3( mat, idx, m )
*	Sets multiple matrix elements using elements from another matrix.
*
* @private
* @param {Matrix} mat - Matrix instance
* @param {Number[]} idx - linear indices
* @param {Matrix} m - Matrix instance
*/
function mset3( mat, idx, m ) {
	var s0 = mat.strides[ 0 ],
		s1 = mat.strides[ 1 ],
		s2 = m.strides[ 0 ],
		s3 = m.strides[ 1 ],
		len = idx.length,
		o0 = mat.offset,
		o1 = m.offset,
		sgn0, sgn1,
		r0, r1,
		j0, j1,
		n;

	if ( m.length !== len ) {
		throw new Error( 'mset()::invalid input argument. Number of indices does not match the number of elements in the value matrix.' );
	}
	sgn0 = ( s0 < 0 ) ? -1 : 1;
	sgn1 = ( s2 < 0 ) ? -1 : 1;
	for ( n = 0; n < len; n++ ) {
		// Get the column number and row offset for the first matrix:
		j0 = idx[ n ] % s0;
		r0 = sgn0 * ( idx[n] - j0 );

		// Get the column number and row offset for the value matrix:
		j1 = n % s2;
		r1 = sgn1 * ( n - j1 );

		mat.data[ o0 + r0 + j0*s1 ] = m.data[ o1 + r1 + j1*s3  ];
	}
} // end FUNCTION mset3()


// EXPORTS //

module.exports = mset3;

},{}],43:[function(require,module,exports){
'use strict';

/**
* FUNCTION: mset4( mat, rows, cols, clbk, ctx )
*	Sets multiple matrix elements using a callback function.
*
* @private
* @param {Matrix} mat - Matrix instance
* @param {Number[]} rows - row indices
* @param {Number[]} cols - column indices
* @param {Function} clbk - callback function
* @param {Object} ctx - `this` context when invoking the provided callback
*/
function mset4( mat, rows, cols, clbk, ctx ) {
	var s0 = mat.strides[ 0 ],
		s1 = mat.strides[ 1 ],
		nRows = rows.length,
		nCols = cols.length,
		o = mat.offset,
		r,
		i, j, k;

	for ( i = 0; i < nRows; i++ ) {
		r = o + rows[i]*s0;
		for ( j = 0; j < nCols; j++ ) {
			k = r + cols[j]*s1;
			mat.data[ k ] = clbk.call( ctx, mat.data[ k ], rows[ i ], cols[ j ], k );
		}
	}
} // end FUNCTION mset4()


// EXPORTS //

module.exports = mset4;

},{}],44:[function(require,module,exports){
'use strict';

/**
* FUNCTION: mset5( mat, rows, cols, v )
*	Sets multiple matrix elements to a numeric value `v`.
*
* @private
* @param {Matrix} mat - Matrix instance
* @param {Number[]} rows - row indices
* @param {Number[]} cols - column indices
* @param {Number} v - numeric value
*/
function mset5( mat, rows, cols, v ) {
	var s0 = mat.strides[ 0 ],
		s1 = mat.strides[ 1 ],
		nRows = rows.length,
		nCols = cols.length,
		o = mat.offset,
		r,
		i, j;

	for ( i = 0; i < nRows; i++ ) {
		r = o + rows[i]*s0;
		for ( j = 0; j < nCols; j++ ) {
			mat.data[ r + cols[j]*s1 ] = v;
		}
	}
} // end FUNCTION mset5()


// EXPORTS //

module.exports = mset5;

},{}],45:[function(require,module,exports){
'use strict';

/**
* FUNCTION: mset6( mat, rows, cols, m )
*	Sets multiple matrix elements using elements from another matrix.
*
* @private
* @param {Matrix} mat - Matrix instance
* @param {Number[]} rows - row indices
* @param {Number[]} cols - column indices
* @param {Matrix} m - Matrix instance
*/
function mset6( mat, rows, cols, m ) {
	var s0 = mat.strides[ 0 ],
		s1 = mat.strides[ 1 ],
		s2 = m.strides[ 0 ],
		s3 = m.strides[ 1 ],
		nRows = rows.length,
		nCols = cols.length,
		o0 = mat.offset,
		o1 = m.offset,
		r0, r1,
		i, j;

	if ( m.shape[ 0 ] !== nRows || m.shape[ 1 ] !== nCols ) {
		throw new Error( 'mset()::invalid input argument. The dimensions given by the row and column indices do not match the value matrix dimensions.' );
	}
	for ( i = 0; i < nRows; i++ ) {
		r0 = o0 + rows[i]*s0;
		r1 = o1 + i*s2;
		for ( j = 0; j < nCols; j++ ) {
			mat.data[ r0 + cols[j]*s1 ] = m.data[ r1 + j*s3 ];
		}
	}
} // end FUNCTION mset6()


// EXPORTS //

module.exports = mset6;

},{}],46:[function(require,module,exports){
'use strict';

// MODULES //

var isNonNegativeInteger = require( 'validate.io-nonnegative-integer' ),
	isNumber = require( 'validate.io-number-primitive' );


// SET //

/**
* FUNCTION: set( i, j, value )
*	Sets a matrix element based on the provided row and column indices.
*
* @param {Number} i - row index
* @param {Number} j - column index
* @param {Number} value - value to set
* @returns {Matrix} Matrix instance
*/
function set( i, j, v ) {
	/* jshint validthis: true */
	if ( !isNonNegativeInteger( i ) || !isNonNegativeInteger( j ) ) {
		throw new TypeError( 'set()::invalid input argument. Row and column indices must be nonnegative integers. Values: `[' + i + ',' + j + ']`.' );
	}
	if ( !isNumber( v ) ) {
		throw new TypeError( 'set()::invalid input argument. An input value must be a number primitive. Value: `' + v + '`.' );
	}
	i = this.offset + i*this.strides[0] + j*this.strides[1];
	if ( i >= 0 ) {
		this.data[ i ] = v;
	}
	return this;
} // end FUNCTION set()


// EXPORTS //

module.exports = set;

},{"validate.io-nonnegative-integer":66,"validate.io-number-primitive":69}],47:[function(require,module,exports){
'use strict';

/**
* FUNCTION: set( i, j, value )
*	Sets a matrix element based on the provided row and column indices.
*
* @param {Number} i - row index
* @param {Number} j - column index
* @param {Number} value - value to set
* @returns {Matrix} Matrix instance
*/
function set( i, j, v ) {
	/* jshint validthis: true */
	i = this.offset + i*this.strides[0] + j*this.strides[1];
	if ( i >= 0 ) {
		this.data[ i ] = v;
	}
	return this;
} // end FUNCTION set()


// EXPORTS //

module.exports = set;

},{}],48:[function(require,module,exports){
'use strict';

// MODULES //

var isString = require( 'validate.io-string-primitive' ),
	ispace = require( 'compute-indexspace' );


// VARIABLES //

var BTYPES = require( './btypes.js' );


// SUBSEQUENCE GET //

/**
* FUNCTION: sget( subsequence )
*	Returns matrix elements according to a specified subsequence.
*
* @param {String} subsequence - subsequence string
* @returns {Matrix} Matrix instance
*/
function sget( seq ) {
	/*jshint validthis:true */
	var nRows,
		nCols,
		rows,
		cols,
		seqs,
		mat,
		len,
		s0, s1,
		o,
		d,
		r, dr,
		i, j;

	if ( !isString( seq ) ) {
		throw new TypeError( 'sget()::invalid input argument. Must provide a string primitive. Value: `' + seq + '`.' );
	}
	seqs = seq.split( ',' );
	if ( seqs.length !== 2 ) {
		throw new Error( 'sget()::invalid input argument. Subsequence string must specify row and column subsequences. Value: `' + seq + '`.' );
	}
	rows = ispace( seqs[ 0 ], this.shape[ 0 ] );
	cols = ispace( seqs[ 1 ], this.shape[ 1 ] );

	nRows = rows.length;
	nCols = cols.length;
	len = nRows * nCols;

	d = new BTYPES[ this.dtype ]( len );
	mat = new this.constructor( d, this.dtype, [nRows,nCols], 0, [nCols,1] );

	if ( len ) {
		s0 = this.strides[ 0 ];
		s1 = this.strides[ 1 ];
		o = this.offset;
		for ( i = 0; i < nRows; i++ ) {
			r = o + rows[i]*s0;
			dr = i * nCols;
			for ( j = 0; j < nCols; j++ ) {
				d[ dr + j ] = this.data[ r + cols[j]*s1 ];
			}
		}
	}
	return mat;
} // end FUNCTION sget()


// EXPORTS //

module.exports = sget;

},{"./btypes.js":23,"compute-indexspace":60,"validate.io-string-primitive":81}],49:[function(require,module,exports){
'use strict';

// MODULES //

var ispace = require( 'compute-indexspace' );


// VARIABLES //

var BTYPES = require( './btypes.js' );


// SUBSEQUENCE GET //

/**
* FUNCTION: sget( subsequence )
*	Returns matrix elements according to a specified subsequence.
*
* @param {String} subsequence - subsequence string
* @returns {Matrix} Matrix instance
*/
function sget( seq ) {
	/*jshint validthis:true */
	var nRows,
		nCols,
		rows,
		cols,
		seqs,
		mat,
		len,
		s0, s1,
		o,
		d,
		r, dr,
		i, j;

	seqs = seq.split( ',' );
	rows = ispace( seqs[ 0 ], this.shape[ 0 ] );
	cols = ispace( seqs[ 1 ], this.shape[ 1 ] );

	nRows = rows.length;
	nCols = cols.length;
	len = nRows * nCols;

	d = new BTYPES[ this.dtype ]( len );
	mat = new this.constructor( d, this.dtype, [nRows,nCols], 0, [nCols,1] );

	if ( len ) {
		s0 = this.strides[ 0 ];
		s1 = this.strides[ 1 ];
		o = this.offset;
		for ( i = 0; i < nRows; i++ ) {
			r = o + rows[i]*s0;
			dr = i * nCols;
			for ( j = 0; j < nCols; j++ ) {
				d[ dr + j ] = this.data[ r + cols[j]*s1 ];
			}
		}
	}
	return mat;
} // end FUNCTION sget()


// EXPORTS //

module.exports = sget;

},{"./btypes.js":23,"compute-indexspace":60}],50:[function(require,module,exports){
'use strict';

// MODULES //

var isString = require( 'validate.io-string-primitive' ),
	isNumber = require( 'validate.io-number-primitive' ),
	isFunction = require( 'validate.io-function' ),
	ispace = require( 'compute-indexspace' );


// SUBSEQUENCE SET //

/**
* FUNCTION: sset( subsequence, value[, thisArg] )
*	Sets matrix elements according to a specified subsequence.
*
* @param {String} subsequence - subsequence string
* @param {Number|Matrix|Function} value - either a single numeric value, a matrix containing the values to set, or a function which returns a numeric value
* @param {Object} [thisArg] - `this` context when executing a callback
* @returns {Matrix} Matrix instance
*/
function sset( seq, val, thisArg ) {
	/* jshint validthis: true */
	var nRows,
		nCols,
		clbk,
		rows,
		cols,
		seqs,
		mat,
		ctx,
		s0, s1, s2, s3,
		o0, o1,
		r0, r1,
		i, j, k;

	if ( !isString( seq ) ) {
		throw new TypeError( 'sset()::invalid input argument. Must provide a string primitive. Value: `' + seq + '`.' );
	}
	seqs = seq.split( ',' );
	if ( seqs.length !== 2 ) {
		throw new Error( 'sset()::invalid input argument. Subsequence string must specify row and column subsequences. Value: `' + seq + '`.' );
	}
	if ( isFunction( val ) ) {
		clbk = val;
	}
	else if ( !isNumber( val ) ) {
		mat = val;
	}
	rows = ispace( seqs[ 0 ], this.shape[ 0 ] );
	cols = ispace( seqs[ 1 ], this.shape[ 1 ] );

	nRows = rows.length;
	nCols = cols.length;

	if ( !( nRows && nCols ) ) {
		return this;
	}
	s0 = this.strides[ 0 ];
	s1 = this.strides[ 1 ];
	o0 = this.offset;

	// Callback...
	if ( clbk ) {
		if ( arguments.length > 2 ) {
			ctx = thisArg;
		} else {
			ctx = this;
		}
		for ( i = 0; i < nRows; i++ ) {
			r0 = o0 + rows[i]*s0;
			for ( j = 0; j < nCols; j++ ) {
				k = r0 + cols[j]*s1;
				this.data[ k ] = clbk.call( ctx, this.data[ k ], rows[i], cols[j], k );
			}
		}
	}
	// Input matrix...
	else if ( mat ) {
		if ( nRows !== mat.shape[ 0 ] ) {
			throw new Error( 'sset()::invalid input arguments. Row subsequence does not match input matrix dimensions. Expected a [' + nRows + ',' + nCols + '] matrix and instead received a [' + mat.shape.join( ',' ) + '] matrix.' );
		}
		if ( nCols !== mat.shape[ 1 ] ) {
			throw new Error( 'sset()::invalid input arguments. Column subsequence does not match input matrix dimensions. Expected a [' + nRows + ',' + nCols + '] matrix and instead received a [' + mat.shape.join( ',' ) + '] matrix.' );
		}
		s2 = mat.strides[ 0 ];
		s3 = mat.strides[ 1 ];
		o1 = mat.offset;
		for ( i = 0; i < nRows; i++ ) {
			r0 = o0 + rows[i]*s0;
			r1 = o1 + i*s2;
			for ( j = 0; j < nCols; j++ ) {
				this.data[ r0 + cols[j]*s1 ] = mat.data[ r1 + j*s3 ];
			}
		}
	}
	// Single numeric value...
	else {
		for ( i = 0; i < nRows; i++ ) {
			r0 = o0 + rows[i]*s0;
			for ( j = 0; j < nCols; j++ ) {
				this.data[ r0 + cols[j]*s1 ] = val;
			}
		}
	}
	return this;
} // end FUNCTION sset()


// EXPORTS //

module.exports = sset;

},{"compute-indexspace":60,"validate.io-function":74,"validate.io-number-primitive":69,"validate.io-string-primitive":81}],51:[function(require,module,exports){
'use strict';

// MODULES //

var ispace = require( 'compute-indexspace' );


// SUBSEQUENCE SET //

/**
* FUNCTION: sset( subsequence, value[, thisArg] )
*	Sets matrix elements according to a specified subsequence.
*
* @param {String} subsequence - subsequence string
* @param {Number|Matrix|Function} value - either a single numeric value, a matrix containing the values to set, or a function which returns a numeric value
* @param {Object} [thisArg] - `this` context when executing a callback
* @returns {Matrix} Matrix instance
*/
function sset( seq, val, thisArg ) {
	/* jshint validthis: true */
	var nRows,
		nCols,
		clbk,
		rows,
		cols,
		seqs,
		mat,
		ctx,
		s0, s1, s2, s3,
		o0, o1,
		r0, r1,
		i, j, k;

	seqs = seq.split( ',' );
	if ( typeof val === 'function' ) {
		clbk = val;
	}
	else if ( typeof val !== 'number' ) {
		mat = val;
	}
	rows = ispace( seqs[ 0 ], this.shape[ 0 ] );
	cols = ispace( seqs[ 1 ], this.shape[ 1 ] );

	nRows = rows.length;
	nCols = cols.length;

	if ( !( nRows && nCols ) ) {
		return this;
	}
	s0 = this.strides[ 0 ];
	s1 = this.strides[ 1 ];
	o0 = this.offset;

	// Callback...
	if ( clbk ) {
		if ( arguments.length > 2 ) {
			ctx = thisArg;
		} else {
			ctx = this;
		}
		for ( i = 0; i < nRows; i++ ) {
			r0 = o0 + rows[i]*s0;
			for ( j = 0; j < nCols; j++ ) {
				k = r0 + cols[j]*s1;
				this.data[ k ] = clbk.call( ctx, this.data[ k ], rows[i], cols[j], k );
			}
		}
	}
	// Input matrix...
	else if ( mat ) {
		if ( nRows !== mat.shape[ 0 ] ) {
			throw new Error( 'sset()::invalid input arguments. Row subsequence does not match input matrix dimensions. Expected a [' + nRows + ',' + nCols + '] matrix and instead received a [' + mat.shape.join( ',' ) + '] matrix.' );
		}
		if ( nCols !== mat.shape[ 1 ] ) {
			throw new Error( 'sset()::invalid input arguments. Column subsequence does not match input matrix dimensions. Expected a [' + nRows + ',' + nCols + '] matrix and instead received a [' + mat.shape.join( ',' ) + '] matrix.' );
		}
		s2 = mat.strides[ 0 ];
		s3 = mat.strides[ 1 ];
		o1 = mat.offset;
		for ( i = 0; i < nRows; i++ ) {
			r0 = o0 + rows[i]*s0;
			r1 = o1 + i*s2;
			for ( j = 0; j < nCols; j++ ) {
				this.data[ r0 + cols[j]*s1 ] = mat.data[ r1 + j*s3 ];
			}
		}
	}
	// Single numeric value...
	else {
		for ( i = 0; i < nRows; i++ ) {
			r0 = o0 + rows[i]*s0;
			for ( j = 0; j < nCols; j++ ) {
				this.data[ r0 + cols[j]*s1 ] = val;
			}
		}
	}
	return this;
} // end FUNCTION sset()


// EXPORTS //

module.exports = sset;

},{"compute-indexspace":60}],52:[function(require,module,exports){
'use strict';

/**
* FUNCTION: toString()
*	Returns a string representation of Matrix elements. Rows are delineated by semicolons. Column values are comma-delimited.
*
* @returns {String} string representation
*/
function toString() {
	/* jshint validthis: true */
	var nRows = this.shape[ 0 ],
		nCols = this.shape[ 1 ],
		s0 = this.strides[ 0 ],
		s1 = this.strides[ 1 ],
		m = nRows - 1,
		n = nCols - 1,
		str = '',
		o,
		i, j;

	for ( i = 0; i < nRows; i++ ) {
		o = this.offset + i*s0;
		for ( j = 0; j < nCols; j++ ) {
			str += this.data[ o + j*s1 ];
			if ( j < n ) {
				str += ',';
			}
		}
		if ( i < m ) {
			str += ';';
		}
	}
	return str;
} // end FUNCTION toString()


// EXPORTS //

module.exports = toString;

},{}],53:[function(require,module,exports){
'use strict';

// MODULES //

var arrayLike = require( 'validate.io-array-like' ),
	typeName = require( 'type-name' );


// VARIABLES //

var DTYPES = require( 'compute-array-dtype/lib/dtypes' ),
	CTORS = require( 'compute-array-constructors/lib/ctors' );


// CAST //

/**
* FUNCTION: cast( x, type )
*	Casts an input array or array-like object to a specified type.
*
* @param {Object|Array|Int8Array|Uint8Array|Uint8ClampedArray|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array|Float64Array} x - value to cast
* @param {String|Array|Int8Array|Uint8Array|Uint8ClampedArray|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array|Float64Array} type - type to which to cast or a value from which the desired type should be inferred
* @returns {Array|Int8Array|Uint8Array|Uint8ClampedArray|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array|Float64Array} casted value
*/
function cast( x, type ) {
	/* jshint newcap:false */
	var ctor,
		len,
		d,
		i;

	if ( !arrayLike( x ) ) {
		throw new TypeError( 'cast()::invalid input argument. First argument must be an array-like object. Value: `' + x + '`.' );
	}
	if ( typeof type === 'string' ) {
		ctor = CTORS[ type ];
	} else {
		ctor = CTORS[ DTYPES[ typeName( type ) ] ];
	}
	if ( ctor === void 0 ) {
		throw new Error( 'cast()::invalid input argument. Unrecognized/unsupported type to which to cast. Value: `' + type + '`.' );
	}
	len = x.length;
	d = new ctor( len );
	for ( i = 0; i < len; i++ ) {
		d[ i ] = x[ i ];
	}
	return d;
} // end FUNCTION cast()


// EXPORTS //

module.exports = cast;

},{"compute-array-constructors/lib/ctors":21,"compute-array-dtype/lib/dtypes":54,"type-name":55,"validate.io-array-like":70}],54:[function(require,module,exports){
'use strict';

var DTYPES = {
	'Int8Array': 'int8',
	'Uint8Array': 'uint8',
	'Uint8ClampedArray': 'uint8_clamped',
	'Int16Array': 'int16',
	'Uint16Array': 'uint16',
	'Int32Array': 'int32',
	'Uint32Array': 'uint32',
	'Float32Array': 'float32',
	'Float64Array': 'float64',
	'Array': 'generic'
};


// EXPORTS //

module.exports = DTYPES;

},{}],55:[function(require,module,exports){
/**
 * type-name - Just a reasonable typeof
 * 
 * https://github.com/twada/type-name
 *
 * Copyright (c) 2014-2015 Takuto Wada
 * Licensed under the MIT license.
 *   http://twada.mit-license.org/2014-2015
 */
'use strict';

var toStr = Object.prototype.toString;

function funcName (f) {
    return f.name ? f.name : /^\s*function\s*([^\(]*)/im.exec(f.toString())[1];
}

function ctorName (obj) {
    var strName = toStr.call(obj).slice(8, -1);
    if (strName === 'Object' && obj.constructor) {
        return funcName(obj.constructor);
    }
    return strName;
}

function typeName (val) {
    var type;
    if (val === null) {
        return 'null';
    }
    type = typeof(val);
    if (type === 'object') {
        return ctorName(val);
    }
    return type;
}

module.exports = typeName;

},{}],56:[function(require,module,exports){
'use strict';

// MODULES //

var typeName = require( 'type-name' ),
	getType = require( 'compute-array-dtype' );


// DTYPE //

/**
* FUNCTION: dtype( value )
*	Determines the data type of an input value.
*
* @param {*} value - input value
* @returns {String} data type
*/
function dtype( value ) {
	var type,
		dt;
	if ( value === null ) {
		return 'null';
	}
	// Check for base types:
	type = typeof value;
	switch ( type ) {
		case 'undefined':
		case 'boolean':
		case 'number':
		case 'string':
		case 'function':
		case 'symbol':
			return type;
	}
	// Resort to slower look-up:
	type = typeName( value );

	// Is value a known array type?
	dt = getType( type );
	if ( dt ) {
		return dt;
	}
	// Is value a buffer object?
	if ( type === 'Buffer' || type === 'ArrayBuffer' ) {
		return 'binary';
	}
	// Assume the value is a generic object (Object|Class instance) which could contain any or multiple data types...
	return 'generic';
} // end FUNCTION dtype()


// EXPORTS //

module.exports = dtype;

},{"compute-array-dtype":58,"type-name":59}],57:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"dup":54}],58:[function(require,module,exports){
'use strict';

// DTYPES //

var DTYPES = require( './dtypes.js' );


// GET DTYPE //

/**
* FUNCTION: getType( name )
*	Returns an array data type corresponding to an array constructor name.
*
* @param {String} name - constructor name
* @returns {String|Null} array data type or null
*/
function getType( name ) {
	return DTYPES[ name ] || null;
} // end FUNCTION getType()


// EXPORTS //

module.exports = getType;

},{"./dtypes.js":57}],59:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],60:[function(require,module,exports){
/**
*
*	COMPUTE: indexspace
*
*
*	DESCRIPTION:
*		- Generates a linearly spaced index array from a subsequence string.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2015. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2015.
*
*/

'use strict';

// MODULES //

var isString = require( 'validate.io-string-primitive' ),
	isNonNegativeInteger = require( 'validate.io-nonnegative-integer' );


// VARIABLES //

var re = /^(?:(?:-(?=\d+))?\d*|end(?:-\d+|\/\d+)?):(?:(?:-(?=\d+))?\d*|end(?:-\d+|\/\d+)?)(?:\:(?=-?\d*)(?:-?\d+)?)?$/;

/**
*	^(...)
*	=> require that the string begin with either a digit (+ or -), an `end` keyword, or a colon
*
*	(?:(?:-(?=\d+))?\d*|end(?:-?\d+|/\\d+)?)
*	=> match but do not capture
*		(?:-(?=\d+))?
*		=> match but do not capture a minus sign but only if followed by one or more digits
*		\d*
*		=> 0 or more digits
*		|
*		=> OR
*		end(?:-\d+|/\d+)?
*		=> the word `end` exactly, which may be followed by either a minus sign and 1 or more digits or a division sign and 1 or more digits
*
*	:
*	=> match a colon exactly
*
*	(?:(?:-(?=\d+))?\d*|end(?:-\d+|/\\d+)?)
*	=> same as above
*
*	(?:\:(?=-?\d*)(?:-?\d+)?)?
*	=> match but do not capture
*		\:(?=-?\d*)
*		=> a colon but only if followed by either a possible minus sign and 0 or more digits
*		(?:-?\d+)?
*		=> match but do not capture a possible minus sign and 1 or more digits
*
*	$
*	=> require that the string end with either a digit, `end` keyword, or a colon.
*
*
* Examples:
*	-	:
*	-	::
*	-	4:
*	-	:4
*	-	::-1
*	-	3::-1
*	-	:10:2
*	-	1:3:1
*	-	9:1:-3
*	-	1:-1
*	-	:-1
*	-	-5:
*	-	1:-5:2
*	-	-9:10:1
*	-	-9:-4:2
*	-	-4:-9:-2
*	-	1:end:2
*	-	:end/2
*	-	end/2:end:5
*/

var reEnd = /^end/,
	reMatch = /(-|\/)(?=\d+)(\d+)?$/;


// INDEXSPACE

/**
* FUNCTION: indexspace( str, len )
*	Generates a linearly spaced index array from a subsequence string.
*
* @param {String} str - subsequence string
* @param {Number} len - reference array length
* @returns {Number[]} array of indices
*/
function indexspace( str, len ) {
	var x1,
		x2,
		tmp,
		inc,
		arr;
	if ( !isString( str ) || !re.test( str ) ) {
		throw new Error( 'indexspace()::invalid input argument. Invalid subsequence syntax. Please consult documentation. Value: `' + str + '`.' );
	}
	if ( !isNonNegativeInteger( len ) ) {
		throw new TypeError( 'indexspace()::invalid input argument. Reference array length must be a nonnegative integer. Value: `' + len + '`.' );
	}
	if ( !len ) {
		return [];
	}
	str = str.split( ':' );
	x1 = str[ 0 ];
	x2 = str[ 1 ];

	if ( str.length === 2 ) {
		inc = 1;
	} else {
		inc = parseInt( str[ 2 ], 10 );
	}
	// Handle zero increment...
	if ( inc === 0 ) {
		throw new Error( 'indexspace()::invalid syntax. Increment must be an integer not equal to 0. Value: `' + inc + '`.' );
	}

	// START //

	// Handle use of 'end' keyword...
	if ( reEnd.test( x1 ) ) {
		tmp = x1.match( reMatch );
		if ( tmp ) {
			if ( tmp[ 1 ] === '-' ) {
				x1 = len - 1 - parseInt( tmp[ 2 ], 10 );
				if ( x1 < 0 ) {
					// WARNING: forgive the user for exceeding the range bounds...
					x1 = 0;
				}
			} else {
				x1 = (len-1) / parseInt( tmp[ 2 ], 10 );
				x1 = Math.ceil( x1 );
			}
		} else {
			x1 = len - 1;
		}
	} else {
		x1 = parseInt( x1, 10 );

		// Handle empty index...
		if ( x1 !== x1 ) {
			// :-?\d*:-?\d+
			if ( inc < 0 ) {
				// Max index:
				x1 = len - 1;
			} else {
				// Min index:
				x1 = 0;
			}
		}
		// Handle negative index...
		else if ( x1 < 0 ) {
			x1 = len + x1; // len-x1
			if ( x1 < 0 ) {
				// WARNING: forgive the user for exceeding index bounds...
				x1 = 0;
			}
		}
		// Handle exceeding bounds...
		else if ( x1 >= len ) {
			return [];
		}
	}

	// END //

	// NOTE: here, we determine an inclusive `end` value; i.e., the last acceptable index value.

	// Handle use of 'end' keyword...
	if ( reEnd.test( x2 ) ) {
		tmp = x2.match( reMatch );
		if ( tmp ) {
			if ( tmp[ 1 ] === '-' ) {
				x2 = len - 1 - parseInt( tmp[ 2 ], 10 );
				if ( x2 < 0 ) {
					// WARNING: forgive the user for exceeding the range bounds...
					x2 = 0;
				}
			} else {
				x2 = (len-1) / parseInt( tmp[ 2 ], 10 );
				x2 = Math.ceil( x2 ) - 1;
			}
		} else {
			x2 = len - 1;
		}
	} else {
		x2 = parseInt( x2, 10 );

		// Handle empty index...
		if ( x2 !== x2 ) {
			// -?\d*::-?\d+
			if ( inc < 0 ) {
				// Min index:
				x2 = 0;
			} else {
				// Max index:
				x2 = len - 1;
			}
		}
		// Handle negative index...
		else if ( x2 < 0 ) {
			x2 = len + x2; // len-x2
			if ( x2 < 0 ) {
				// WARNING: forgive the user for exceeding index bounds...
				x2 = 0;
			}
			if ( inc > 0 ) {
				x2 = x2 - 1;
			}
		}
		// Handle positive index...
		else {
			if ( inc < 0 ) {
				x2 = x2 + 1;
			}
			else if ( x2 >= len ) {
				x2 = len - 1;
			}
			else {
				x2 = x2 - 1;
			}
		}
	}

	// INDICES //

	arr = [];
	if ( inc < 0 ) {
		if ( x2 > x1 ) {
			return arr;
		}
		while ( x1 >= x2 ) {
			arr.push( x1 );
			x1 += inc;
		}
	} else {
		if ( x1 > x2 ) {
			return arr;
		}
		while ( x1 <= x2 ) {
			arr.push( x1 );
			x1 += inc;
		}
	}
	return arr;
} // end FUNCTION indexspace()


// EXPORTS //

module.exports = indexspace;

},{"validate.io-nonnegative-integer":66,"validate.io-string-primitive":81}],61:[function(require,module,exports){
'use strict';

/**
* FUNCTION: isArray( value )
*	Validates if a value is an array.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether value is an array
*/
function isArray( value ) {
	return Object.prototype.toString.call( value ) === '[object Array]';
} // end FUNCTION isArray()

// EXPORTS //

module.exports = Array.isArray || isArray;

},{}],62:[function(require,module,exports){
/**
*
*	VALIDATE: contains
*
*
*	DESCRIPTION:
*		- Validates if an array contains an input value.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2015. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2015.
*
*/

'use strict';

// MODULES //

var isArray = require( 'validate.io-array' ),
	isnan = require( 'validate.io-nan-primitive' );


// CONTAINS //

/**
* FUNCTION: contains( arr, value )
*	Validates if an array contains an input value.
*
* @param {Array} arr - search array
* @param {*} value - search value
* @returns {Boolean} boolean indicating if an array contains an input value
*/
function contains( arr, value ) {
	var len, i;
	if ( !isArray( arr ) ) {
		throw new TypeError( 'contains()::invalid input argument. First argument must be an array. Value: `' + arr + '`.' );
	}
	len = arr.length;
	if ( isnan( value ) ) {
		for ( i = 0; i < len; i++ ) {
			if ( isnan( arr[ i ] ) ) {
				return true;
			}
		}
		return false;
	}
	for ( i = 0; i < len; i++ ) {
		if ( arr[ i ] === value ) {
			return true;
		}
	}
	return false;
} // end FUNCTION contains()


// EXPORTS //

module.exports = contains;

},{"validate.io-array":61,"validate.io-nan-primitive":63}],63:[function(require,module,exports){
/**
*
*	VALIDATE: nan-primitive
*
*
*	DESCRIPTION:
*		- Validates if a value is a NaN primitive.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2015. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2015.
*
*/

'use strict';

/**
* FUNCTION: nan( value )
*	Validates if a value is a NaN primitive.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether the value is a NaN primitive
*/
function nan( value ) {
	return typeof value === 'number' && value !== value;
} // end FUNCTION nan()


// EXPORTS //

module.exports = nan;

},{}],64:[function(require,module,exports){
'use strict';

// MODULES //

var isNumber = require( 'validate.io-number-primitive' );


// IS INTEGER //

/**
* FUNCTION: isInteger( value )
*	Validates if a value is a number primitive, excluding `NaN`, and an integer.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating if a value is a integer primitive
*/
function isInteger( value ) {
	return isNumber( value ) && value%1 === 0;
} // end FUNCTION isInteger()


// EXPORTS //

module.exports = isInteger;

},{"validate.io-number-primitive":69}],65:[function(require,module,exports){
/**
*
*	VALIDATE: nonnegative-integer-array
*
*
*	DESCRIPTION:
*		- Validates if a value is a nonnegative integer array.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2015. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2015.
*
*/

'use strict';

// MODULES //

var isArray = require( 'validate.io-array' ),
	isNonNegativeInteger = require( 'validate.io-nonnegative-integer' );


// IS NONNEGATIVE INTEGER ARRAY //

/**
* FUNCTION: isNonNegativeIntegerArray( value )
*	Validates if a value is a nonnegative integer array.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating if a value is a nonnegative integer array
*/
function isNonNegativeIntegerArray( value ) {
	var len;
	if ( !isArray( value ) ) {
		return false;
	}
	len = value.length;
	if ( !len ) {
		return false;
	}
	for ( var i = 0; i < len; i++ ) {
		if ( !isNonNegativeInteger( value[i] ) ) {
			return false;
		}
	}
	return true;
} // end FUNCTION isNonNegativeIntegerArray()


// EXPORTS //

module.exports = isNonNegativeIntegerArray;

},{"validate.io-array":61,"validate.io-nonnegative-integer":66}],66:[function(require,module,exports){
/**
*
*	VALIDATE: nonnegative-integer
*
*
*	DESCRIPTION:
*		- Validates if a value is a nonnegative integer.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2015. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2015.
*
*/

'use strict';

// MODULES //

var isInteger = require( 'validate.io-integer' );


// IS NONNEGATIVE INTEGER //

/**
* FUNCTION: isNonNegativeInteger( value )
*	Validates if a value is a nonnegative integer.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating if a value is a nonnegative integer
*/
function isNonNegativeInteger( value ) {
	return isInteger( value ) && value >= 0;
} // end FUNCTION isNonNegativeInteger()


// EXPORTS //

module.exports = isNonNegativeInteger;

},{"validate.io-integer":67}],67:[function(require,module,exports){
/**
*
*	VALIDATE: integer
*
*
*	DESCRIPTION:
*		- Validates if a value is an integer.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2014.
*
*/

'use strict';

// MODULES //

var isNumber = require( 'validate.io-number' );


// ISINTEGER //

/**
* FUNCTION: isInteger( value )
*	Validates if a value is an integer.
*
* @param {Number} value - value to be validated
* @returns {Boolean} boolean indicating whether value is an integer
*/
function isInteger( value ) {
	return isNumber( value ) && value%1 === 0;
} // end FUNCTION isInteger()


// EXPORTS //

module.exports = isInteger;

},{"validate.io-number":68}],68:[function(require,module,exports){
/**
*
*	VALIDATE: number
*
*
*	DESCRIPTION:
*		- Validates if a value is a number.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2014.
*
*/

'use strict';

/**
* FUNCTION: isNumber( value )
*	Validates if a value is a number.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether value is a number
*/
function isNumber( value ) {
	return ( typeof value === 'number' || Object.prototype.toString.call( value ) === '[object Number]' ) && value.valueOf() === value.valueOf();
} // end FUNCTION isNumber()


// EXPORTS //

module.exports = isNumber;

},{}],69:[function(require,module,exports){
/**
*
*	VALIDATE: number-primitive
*
*
*	DESCRIPTION:
*		- Validates if a value is a number primitive.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2015. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2015.
*
*/

'use strict';

/**
* FUNCTION: isNumber( value )
*	Validates if a value is a number primitive, excluding `NaN`.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating if a value is a number primitive
*/
function isNumber( value ) {
	return (typeof value === 'number') && (value === value);
} // end FUNCTION isNumber()


// EXPORTS //

module.exports = isNumber;

},{}],70:[function(require,module,exports){
'use strict';

// MODULES //

var isInteger = require( 'validate.io-integer-primitive' );


// CONSTANTS //

var MAX = require( 'compute-const-max-safe-integer' );


// IS ARRAY-LIKE //

/**
* FUNCTION: isArrayLike( value )
*	Validates if a value is array-like.
*
* @param {*} value - value to validate
* @param {Boolean} boolean indicating if a value is array-like
*/
function isArrayLike( value ) {
	return value !== void 0 && value !== null && typeof value !== 'function' && isInteger( value.length ) && value.length >= 0 && value.length <= MAX;
} // end FUNCTION isArrayLike()


// EXPORTS //

module.exports = isArrayLike;

},{"compute-const-max-safe-integer":71,"validate.io-integer-primitive":72}],71:[function(require,module,exports){
'use strict';

// EXPORTS //

module.exports = 9007199254740991; // Math.pow( 2, 53 ) - 1

},{}],72:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"dup":64,"validate.io-number-primitive":73}],73:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"dup":69}],74:[function(require,module,exports){
/**
*
*	VALIDATE: function
*
*
*	DESCRIPTION:
*		- Validates if a value is a function.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2014.
*
*/

'use strict';

/**
* FUNCTION: isFunction( value )
*	Validates if a value is a function.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether value is a function
*/
function isFunction( value ) {
	return ( typeof value === 'function' );
} // end FUNCTION isFunction()


// EXPORTS //

module.exports = isFunction;

},{}],75:[function(require,module,exports){
'use strict';

/**
* FUNCTION: matrixLike( value )
*	Validates if a value is matrix-like.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating if a value is matrix-like
*/
function matrixLike( v ) {
	return v !== null &&
		typeof v === 'object' &&
		typeof v.data === 'object' &&
		typeof v.shape === 'object' &&
		typeof v.offset === 'number' &&
		typeof v.strides === 'object' &&
		typeof v.dtype === 'string' &&
		typeof v.length === 'number';
} // end FUNCTION matrixLike()


// EXPORTS //

module.exports = matrixLike;

},{}],76:[function(require,module,exports){
'use strict';

// MODULES //

var isArray = require( 'validate.io-array' );


// ISOBJECT //

/**
* FUNCTION: isObject( value )
*	Validates if a value is a object; e.g., {}.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether value is a object
*/
function isObject( value ) {
	return ( typeof value === 'object' && value !== null && !isArray( value ) );
} // end FUNCTION isObject()


// EXPORTS //

module.exports = isObject;

},{"validate.io-array":77}],77:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"dup":61}],78:[function(require,module,exports){
/**
*
*	VALIDATE: positive-integer
*
*
*	DESCRIPTION:
*		- Validates if a value is a positive integer.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2015. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2015.
*
*/

'use strict';

// MODULES //

var isInteger = require( 'validate.io-integer' );


// IS POSITIVE INTEGER //

/**
* FUNCTION: isPositiveInteger( value )
*	Validates if a value is a positive integer.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating if a value is a positive integer
*/
function isPositiveInteger( value ) {
	return isInteger( value ) && value > 0;
} // end FUNCTION isPositiveInteger()


// EXPORTS //

module.exports = isPositiveInteger;

},{"validate.io-integer":79}],79:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"dup":67,"validate.io-number":80}],80:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"dup":68}],81:[function(require,module,exports){
/**
*
*	VALIDATE: string-primitive
*
*
*	DESCRIPTION:
*		- Validates if a value is a string primitive.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2015. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2015.
*
*/

'use strict';

/**
* FUNCTION: isString( value )
*	Validates if a value is a string primitive.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating if a value is a string primitive
*/
function isString( value ) {
	return typeof value === 'string';
} // end FUNCTION isString()


// EXPORTS //

module.exports = isString;

},{}],82:[function(require,module,exports){
(function (global){
"use strict";var _gsScope="undefined" != typeof module && module.exports && "undefined" != typeof global?global:undefined || window;(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function(){"use strict";_gsScope._gsDefine("TweenMax", ["core.Animation", "core.SimpleTimeline", "TweenLite"], function(t, e, i){var s=function s(t){var e, i=[], s=t.length;for(e = 0; e !== s; i.push(t[e++]));return i;}, r=(function(_r){function r(_x, _x2, _x3){return _r.apply(this, arguments);}r.toString = function(){return _r.toString();};return r;})(function(t, e, s){i.call(this, t, e, s), this._cycle = 0, this._yoyo = this.vars.yoyo === !0, this._repeat = this.vars.repeat || 0, this._repeatDelay = this.vars.repeatDelay || 0, this._dirty = !0, this.render = r.prototype.render;}), n=1e-10, a=i._internals, o=a.isSelector, h=a.isArray, l=r.prototype = i.to({}, 0.1, {}), _=[];r.version = "1.16.1", l.constructor = r, l.kill()._gc = !1, r.killTweensOf = r.killDelayedCallsTo = i.killTweensOf, r.getTweensOf = i.getTweensOf, r.lagSmoothing = i.lagSmoothing, r.ticker = i.ticker, r.render = i.render, l.invalidate = function(){return (this._yoyo = this.vars.yoyo === !0, this._repeat = this.vars.repeat || 0, this._repeatDelay = this.vars.repeatDelay || 0, this._uncache(!0), i.prototype.invalidate.call(this));}, l.updateTo = function(t, e){var s, r=this.ratio, n=this.vars.immediateRender || t.immediateRender;e && this._startTime < this._timeline._time && (this._startTime = this._timeline._time, this._uncache(!1), this._gc?this._enabled(!0, !1):this._timeline.insert(this, this._startTime - this._delay));for(s in t) this.vars[s] = t[s];if(this._initted || n)if(e)this._initted = !1, n && this.render(0, !0, !0);else if((this._gc && this._enabled(!0, !1), this._notifyPluginsOfEnabled && this._firstPT && i._onPluginEvent("_onDisable", this), this._time / this._duration > 0.998)){var a=this._time;this.render(0, !0, !1), this._initted = !1, this.render(a, !0, !1);}else if(this._time > 0 || n){this._initted = !1, this._init();for(var o, h=1 / (1 - r), l=this._firstPT; l;) o = l.s + l.c, l.c *= h, l.s = o - l.c, l = l._next;}return this;}, l.render = function(t, e, i){this._initted || 0 === this._duration && this.vars.repeat && this.invalidate();var s, r, o, h, l, u, p, f, c=this._dirty?this.totalDuration():this._totalDuration, m=this._time, d=this._totalTime, g=this._cycle, v=this._duration, y=this._rawPrevTime;if((t >= c?(this._totalTime = c, this._cycle = this._repeat, this._yoyo && 0 !== (1 & this._cycle)?(this._time = 0, this.ratio = this._ease._calcEnd?this._ease.getRatio(0):0):(this._time = v, this.ratio = this._ease._calcEnd?this._ease.getRatio(1):1), this._reversed || (s = !0, r = "onComplete", i = i || this._timeline.autoRemoveChildren), 0 === v && (this._initted || !this.vars.lazy || i) && (this._startTime === this._timeline._duration && (t = 0), (0 === t || 0 > y || y === n) && y !== t && (i = !0, y > n && (r = "onReverseComplete")), this._rawPrevTime = f = !e || t || y === t?t:n)):1e-7 > t?(this._totalTime = this._time = this._cycle = 0, this.ratio = this._ease._calcEnd?this._ease.getRatio(0):0, (0 !== d || 0 === v && y > 0) && (r = "onReverseComplete", s = this._reversed), 0 > t && (this._active = !1, 0 === v && (this._initted || !this.vars.lazy || i) && (y >= 0 && (i = !0), this._rawPrevTime = f = !e || t || y === t?t:n)), this._initted || (i = !0)):(this._totalTime = this._time = t, 0 !== this._repeat && (h = v + this._repeatDelay, this._cycle = this._totalTime / h >> 0, 0 !== this._cycle && this._cycle === this._totalTime / h && this._cycle--, this._time = this._totalTime - this._cycle * h, this._yoyo && 0 !== (1 & this._cycle) && (this._time = v - this._time), this._time > v?this._time = v:0 > this._time && (this._time = 0)), this._easeType?(l = this._time / v, u = this._easeType, p = this._easePower, (1 === u || 3 === u && l >= 0.5) && (l = 1 - l), 3 === u && (l *= 2), 1 === p?l *= l:2 === p?l *= l * l:3 === p?l *= l * l * l:4 === p && (l *= l * l * l * l), this.ratio = 1 === u?1 - l:2 === u?l:0.5 > this._time / v?l / 2:1 - l / 2):this.ratio = this._ease.getRatio(this._time / v)), m === this._time && !i && g === this._cycle))return (d !== this._totalTime && this._onUpdate && (e || this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || _)), void 0);if(!this._initted){if((this._init(), !this._initted || this._gc))return;if(!i && this._firstPT && (this.vars.lazy !== !1 && this._duration || this.vars.lazy && !this._duration))return (this._time = m, this._totalTime = d, this._rawPrevTime = y, this._cycle = g, a.lazyTweens.push(this), this._lazy = [t, e], void 0);this._time && !s?this.ratio = this._ease.getRatio(this._time / v):s && this._ease._calcEnd && (this.ratio = this._ease.getRatio(0 === this._time?0:1));}for(this._lazy !== !1 && (this._lazy = !1), this._active || !this._paused && this._time !== m && t >= 0 && (this._active = !0), 0 === d && (2 === this._initted && t > 0 && this._init(), this._startAt && (t >= 0?this._startAt.render(t, e, i):r || (r = "_dummyGS")), this.vars.onStart && (0 !== this._totalTime || 0 === v) && (e || this.vars.onStart.apply(this.vars.onStartScope || this, this.vars.onStartParams || _))), o = this._firstPT; o;) o.f?o.t[o.p](o.c * this.ratio + o.s):o.t[o.p] = o.c * this.ratio + o.s, o = o._next;this._onUpdate && (0 > t && this._startAt && this._startTime && this._startAt.render(t, e, i), e || (this._totalTime !== d || s) && this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || _)), this._cycle !== g && (e || this._gc || this.vars.onRepeat && this.vars.onRepeat.apply(this.vars.onRepeatScope || this, this.vars.onRepeatParams || _)), r && (!this._gc || i) && (0 > t && this._startAt && !this._onUpdate && this._startTime && this._startAt.render(t, e, i), s && (this._timeline.autoRemoveChildren && this._enabled(!1, !1), this._active = !1), !e && this.vars[r] && this.vars[r].apply(this.vars[r + "Scope"] || this, this.vars[r + "Params"] || _), 0 === v && this._rawPrevTime === n && f !== n && (this._rawPrevTime = 0));}, r.to = function(t, e, i){return new r(t, e, i);}, r.from = function(t, e, i){return (i.runBackwards = !0, i.immediateRender = 0 != i.immediateRender, new r(t, e, i));}, r.fromTo = function(t, e, i, s){return (s.startAt = i, s.immediateRender = 0 != s.immediateRender && 0 != i.immediateRender, new r(t, e, s));}, r.staggerTo = r.allTo = function(t, e, n, a, l, u, p){a = a || 0;var f, c, m, d, g=n.delay || 0, v=[], y=function y(){n.onComplete && n.onComplete.apply(n.onCompleteScope || this, arguments), l.apply(p || this, u || _);};for(h(t) || ("string" == typeof t && (t = i.selector(t) || t), o(t) && (t = s(t))), t = t || [], 0 > a && (t = s(t), t.reverse(), a *= -1), f = t.length - 1, m = 0; f >= m; m++) {c = {};for(d in n) c[d] = n[d];c.delay = g, m === f && l && (c.onComplete = y), v[m] = new r(t[m], e, c), g += a;}return v;}, r.staggerFrom = r.allFrom = function(t, e, i, s, n, a, o){return (i.runBackwards = !0, i.immediateRender = 0 != i.immediateRender, r.staggerTo(t, e, i, s, n, a, o));}, r.staggerFromTo = r.allFromTo = function(t, e, i, s, n, a, o, h){return (s.startAt = i, s.immediateRender = 0 != s.immediateRender && 0 != i.immediateRender, r.staggerTo(t, e, s, n, a, o, h));}, r.delayedCall = function(t, e, i, s, n){return new r(e, 0, {delay:t, onComplete:e, onCompleteParams:i, onCompleteScope:s, onReverseComplete:e, onReverseCompleteParams:i, onReverseCompleteScope:s, immediateRender:!1, useFrames:n, overwrite:0});}, r.set = function(t, e){return new r(t, 0, e);}, r.isTweening = function(t){return i.getTweensOf(t, !0).length > 0;};var u=(function(_u){function u(_x4, _x5){return _u.apply(this, arguments);}u.toString = function(){return _u.toString();};return u;})(function(t, e){for(var s=[], r=0, n=t._first; n;) n instanceof i?s[r++] = n:(e && (s[r++] = n), s = s.concat(u(n, e)), r = s.length), n = n._next;return s;}), p=r.getAllTweens = function(e){return u(t._rootTimeline, e).concat(u(t._rootFramesTimeline, e));};r.killAll = function(t, i, s, r){null == i && (i = !0), null == s && (s = !0);var n, a, o, h=p(0 != r), l=h.length, _=i && s && r;for(o = 0; l > o; o++) a = h[o], (_ || a instanceof e || (n = a.target === a.vars.onComplete) && s || i && !n) && (t?a.totalTime(a._reversed?0:a.totalDuration()):a._enabled(!1, !1));}, r.killChildTweensOf = function(t, e){if(null != t){var n, l, _, u, p, f=a.tweenLookup;if(("string" == typeof t && (t = i.selector(t) || t), o(t) && (t = s(t)), h(t)))for(u = t.length; --u > -1;) r.killChildTweensOf(t[u], e);else {n = [];for(_ in f) for(l = f[_].target.parentNode; l;) l === t && (n = n.concat(f[_].tweens)), l = l.parentNode;for(p = n.length, u = 0; p > u; u++) e && n[u].totalTime(n[u].totalDuration()), n[u]._enabled(!1, !1);}}};var f=function f(t, i, s, r){i = i !== !1, s = s !== !1, r = r !== !1;for(var n, a, o=p(r), h=i && s && r, l=o.length; --l > -1;) a = o[l], (h || a instanceof e || (n = a.target === a.vars.onComplete) && s || i && !n) && a.paused(t);};return (r.pauseAll = function(t, e, i){f(!0, t, e, i);}, r.resumeAll = function(t, e, i){f(!1, t, e, i);}, r.globalTimeScale = function(e){var s=t._rootTimeline, r=i.ticker.time;return arguments.length?(e = e || n, s._startTime = r - (r - s._startTime) * s._timeScale / e, s = t._rootFramesTimeline, r = i.ticker.frame, s._startTime = r - (r - s._startTime) * s._timeScale / e, s._timeScale = t._rootTimeline._timeScale = e, e):s._timeScale;}, l.progress = function(t){return arguments.length?this.totalTime(this.duration() * (this._yoyo && 0 !== (1 & this._cycle)?1 - t:t) + this._cycle * (this._duration + this._repeatDelay), !1):this._time / this.duration();}, l.totalProgress = function(t){return arguments.length?this.totalTime(this.totalDuration() * t, !1):this._totalTime / this.totalDuration();}, l.time = function(t, e){return arguments.length?(this._dirty && this.totalDuration(), t > this._duration && (t = this._duration), this._yoyo && 0 !== (1 & this._cycle)?t = this._duration - t + this._cycle * (this._duration + this._repeatDelay):0 !== this._repeat && (t += this._cycle * (this._duration + this._repeatDelay)), this.totalTime(t, e)):this._time;}, l.duration = function(e){return arguments.length?t.prototype.duration.call(this, e):this._duration;}, l.totalDuration = function(t){return arguments.length?-1 === this._repeat?this:this.duration((t - this._repeat * this._repeatDelay) / (this._repeat + 1)):(this._dirty && (this._totalDuration = -1 === this._repeat?999999999999:this._duration * (this._repeat + 1) + this._repeatDelay * this._repeat, this._dirty = !1), this._totalDuration);}, l.repeat = function(t){return arguments.length?(this._repeat = t, this._uncache(!0)):this._repeat;}, l.repeatDelay = function(t){return arguments.length?(this._repeatDelay = t, this._uncache(!0)):this._repeatDelay;}, l.yoyo = function(t){return arguments.length?(this._yoyo = t, this):this._yoyo;}, r);}, !0), _gsScope._gsDefine("TimelineLite", ["core.Animation", "core.SimpleTimeline", "TweenLite"], function(t, e, i){var s=function s(t){e.call(this, t), this._labels = {}, this.autoRemoveChildren = this.vars.autoRemoveChildren === !0, this.smoothChildTiming = this.vars.smoothChildTiming === !0, this._sortChildren = !0, this._onUpdate = this.vars.onUpdate;var i, s, r=this.vars;for(s in r) i = r[s], h(i) && -1 !== i.join("").indexOf("{self}") && (r[s] = this._swapSelfInParams(i));h(r.tweens) && this.add(r.tweens, 0, r.align, r.stagger);}, r=1e-10, n=i._internals, a=s._internals = {}, o=n.isSelector, h=n.isArray, l=n.lazyTweens, _=n.lazyRender, u=[], p=_gsScope._gsDefine.globals, f=function f(t){var e, i={};for(e in t) i[e] = t[e];return i;}, c=a.pauseCallback = function(t, e, i, s){var n, a=t._timeline, o=a._totalTime, h=t._startTime, l=0 > t._rawPrevTime || 0 === t._rawPrevTime && a._reversed, _=l?0:r, p=l?r:0;if(e || !this._forcingPlayhead){for(a.pause(h), n = t._prev; n && n._startTime === h;) n._rawPrevTime = p, n = n._prev;for(n = t._next; n && n._startTime === h;) n._rawPrevTime = _, n = n._next;e && e.apply(s || a, i || u), (this._forcingPlayhead || !a._paused) && a.seek(o);}}, m=function m(t){var e, i=[], s=t.length;for(e = 0; e !== s; i.push(t[e++]));return i;}, d=s.prototype = new e();return (s.version = "1.16.1", d.constructor = s, d.kill()._gc = d._forcingPlayhead = !1, d.to = function(t, e, s, r){var n=s.repeat && p.TweenMax || i;return e?this.add(new n(t, e, s), r):this.set(t, s, r);}, d.from = function(t, e, s, r){return this.add((s.repeat && p.TweenMax || i).from(t, e, s), r);}, d.fromTo = function(t, e, s, r, n){var a=r.repeat && p.TweenMax || i;return e?this.add(a.fromTo(t, e, s, r), n):this.set(t, r, n);}, d.staggerTo = function(t, e, r, n, a, h, l, _){var u, p=new s({onComplete:h, onCompleteParams:l, onCompleteScope:_, smoothChildTiming:this.smoothChildTiming});for("string" == typeof t && (t = i.selector(t) || t), t = t || [], o(t) && (t = m(t)), n = n || 0, 0 > n && (t = m(t), t.reverse(), n *= -1), u = 0; t.length > u; u++) r.startAt && (r.startAt = f(r.startAt)), p.to(t[u], e, f(r), u * n);return this.add(p, a);}, d.staggerFrom = function(t, e, i, s, r, n, a, o){return (i.immediateRender = 0 != i.immediateRender, i.runBackwards = !0, this.staggerTo(t, e, i, s, r, n, a, o));}, d.staggerFromTo = function(t, e, i, s, r, n, a, o, h){return (s.startAt = i, s.immediateRender = 0 != s.immediateRender && 0 != i.immediateRender, this.staggerTo(t, e, s, r, n, a, o, h));}, d.call = function(t, e, s, r){return this.add(i.delayedCall(0, t, e, s), r);}, d.set = function(t, e, s){return (s = this._parseTimeOrLabel(s, 0, !0), null == e.immediateRender && (e.immediateRender = s === this._time && !this._paused), this.add(new i(t, 0, e), s));}, s.exportRoot = function(t, e){t = t || {}, null == t.smoothChildTiming && (t.smoothChildTiming = !0);var r, n, a=new s(t), o=a._timeline;for(null == e && (e = !0), o._remove(a, !0), a._startTime = 0, a._rawPrevTime = a._time = a._totalTime = o._time, r = o._first; r;) n = r._next, e && r instanceof i && r.target === r.vars.onComplete || a.add(r, r._startTime - r._delay), r = n;return (o.add(a, 0), a);}, d.add = function(r, n, a, o){var l, _, u, p, f, c;if(("number" != typeof n && (n = this._parseTimeOrLabel(n, 0, !0, r)), !(r instanceof t))){if(r instanceof Array || r && r.push && h(r)){for(a = a || "normal", o = o || 0, l = n, _ = r.length, u = 0; _ > u; u++) h(p = r[u]) && (p = new s({tweens:p})), this.add(p, l), "string" != typeof p && "function" != typeof p && ("sequence" === a?l = p._startTime + p.totalDuration() / p._timeScale:"start" === a && (p._startTime -= p.delay())), l += o;return this._uncache(!0);}if("string" == typeof r)return this.addLabel(r, n);if("function" != typeof r)throw "Cannot add " + r + " into the timeline; it is not a tween, timeline, function, or string.";r = i.delayedCall(0, r);}if((e.prototype.add.call(this, r, n), (this._gc || this._time === this._duration) && !this._paused && this._duration < this.duration()))for(f = this, c = f.rawTime() > r._startTime; f._timeline;) c && f._timeline.smoothChildTiming?f.totalTime(f._totalTime, !0):f._gc && f._enabled(!0, !1), f = f._timeline;return this;}, d.remove = function(e){if(e instanceof t)return this._remove(e, !1);if(e instanceof Array || e && e.push && h(e)){for(var i=e.length; --i > -1;) this.remove(e[i]);return this;}return "string" == typeof e?this.removeLabel(e):this.kill(null, e);}, d._remove = function(t, i){e.prototype._remove.call(this, t, i);var s=this._last;return (s?this._time > s._startTime + s._totalDuration / s._timeScale && (this._time = this.duration(), this._totalTime = this._totalDuration):this._time = this._totalTime = this._duration = this._totalDuration = 0, this);}, d.append = function(t, e){return this.add(t, this._parseTimeOrLabel(null, e, !0, t));}, d.insert = d.insertMultiple = function(t, e, i, s){return this.add(t, e || 0, i, s);}, d.appendMultiple = function(t, e, i, s){return this.add(t, this._parseTimeOrLabel(null, e, !0, t), i, s);}, d.addLabel = function(t, e){return (this._labels[t] = this._parseTimeOrLabel(e), this);}, d.addPause = function(t, e, s, r){var n=i.delayedCall(0, c, ["{self}", e, s, r], this);return (n.data = "isPause", this.add(n, t));}, d.removeLabel = function(t){return (delete this._labels[t], this);}, d.getLabelTime = function(t){return null != this._labels[t]?this._labels[t]:-1;}, d._parseTimeOrLabel = function(e, i, s, r){var n;if(r instanceof t && r.timeline === this)this.remove(r);else if(r && (r instanceof Array || r.push && h(r)))for(n = r.length; --n > -1;) r[n] instanceof t && r[n].timeline === this && this.remove(r[n]);if("string" == typeof i)return this._parseTimeOrLabel(i, s && "number" == typeof e && null == this._labels[i]?e - this.duration():0, s);if((i = i || 0, "string" != typeof e || !isNaN(e) && null == this._labels[e]))null == e && (e = this.duration());else {if((n = e.indexOf("="), -1 === n))return null == this._labels[e]?s?this._labels[e] = this.duration() + i:i:this._labels[e] + i;i = parseInt(e.charAt(n - 1) + "1", 10) * Number(e.substr(n + 1)), e = n > 1?this._parseTimeOrLabel(e.substr(0, n - 1), 0, s):this.duration();}return Number(e) + i;}, d.seek = function(t, e){return this.totalTime("number" == typeof t?t:this._parseTimeOrLabel(t), e !== !1);}, d.stop = function(){return this.paused(!0);}, d.gotoAndPlay = function(t, e){return this.play(t, e);}, d.gotoAndStop = function(t, e){return this.pause(t, e);}, d.render = function(t, e, i){this._gc && this._enabled(!0, !1);var s, n, a, o, h, p=this._dirty?this.totalDuration():this._totalDuration, f=this._time, c=this._startTime, m=this._timeScale, d=this._paused;if(t >= p)this._totalTime = this._time = p, this._reversed || this._hasPausedChild() || (n = !0, o = "onComplete", h = !!this._timeline.autoRemoveChildren, 0 === this._duration && (0 === t || 0 > this._rawPrevTime || this._rawPrevTime === r) && this._rawPrevTime !== t && this._first && (h = !0, this._rawPrevTime > r && (o = "onReverseComplete"))), this._rawPrevTime = this._duration || !e || t || this._rawPrevTime === t?t:r, t = p + 0.0001;else if(1e-7 > t)if((this._totalTime = this._time = 0, (0 !== f || 0 === this._duration && this._rawPrevTime !== r && (this._rawPrevTime > 0 || 0 > t && this._rawPrevTime >= 0)) && (o = "onReverseComplete", n = this._reversed), 0 > t))this._active = !1, this._timeline.autoRemoveChildren && this._reversed?(h = n = !0, o = "onReverseComplete"):this._rawPrevTime >= 0 && this._first && (h = !0), this._rawPrevTime = t;else {if((this._rawPrevTime = this._duration || !e || t || this._rawPrevTime === t?t:r, 0 === t && n))for(s = this._first; s && 0 === s._startTime;) s._duration || (n = !1), s = s._next;t = 0, this._initted || (h = !0);}else this._totalTime = this._time = this._rawPrevTime = t;if(this._time !== f && this._first || i || h){if((this._initted || (this._initted = !0), this._active || !this._paused && this._time !== f && t > 0 && (this._active = !0), 0 === f && this.vars.onStart && 0 !== this._time && (e || this.vars.onStart.apply(this.vars.onStartScope || this, this.vars.onStartParams || u)), this._time >= f))for(s = this._first; s && (a = s._next, !this._paused || d);) (s._active || s._startTime <= this._time && !s._paused && !s._gc) && (s._reversed?s.render((s._dirty?s.totalDuration():s._totalDuration) - (t - s._startTime) * s._timeScale, e, i):s.render((t - s._startTime) * s._timeScale, e, i)), s = a;else for(s = this._last; s && (a = s._prev, !this._paused || d);) (s._active || f >= s._startTime && !s._paused && !s._gc) && (s._reversed?s.render((s._dirty?s.totalDuration():s._totalDuration) - (t - s._startTime) * s._timeScale, e, i):s.render((t - s._startTime) * s._timeScale, e, i)), s = a;this._onUpdate && (e || (l.length && _(), this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || u))), o && (this._gc || (c === this._startTime || m !== this._timeScale) && (0 === this._time || p >= this.totalDuration()) && (n && (l.length && _(), this._timeline.autoRemoveChildren && this._enabled(!1, !1), this._active = !1), !e && this.vars[o] && this.vars[o].apply(this.vars[o + "Scope"] || this, this.vars[o + "Params"] || u)));}}, d._hasPausedChild = function(){for(var t=this._first; t;) {if(t._paused || t instanceof s && t._hasPausedChild())return !0;t = t._next;}return !1;}, d.getChildren = function(t, e, s, r){r = r || -9999999999;for(var n=[], a=this._first, o=0; a;) r > a._startTime || (a instanceof i?e !== !1 && (n[o++] = a):(s !== !1 && (n[o++] = a), t !== !1 && (n = n.concat(a.getChildren(!0, e, s)), o = n.length))), a = a._next;return n;}, d.getTweensOf = function(t, e){var s, r, n=this._gc, a=[], o=0;for(n && this._enabled(!0, !0), s = i.getTweensOf(t), r = s.length; --r > -1;) (s[r].timeline === this || e && this._contains(s[r])) && (a[o++] = s[r]);return (n && this._enabled(!1, !0), a);}, d.recent = function(){return this._recent;}, d._contains = function(t){for(var e=t.timeline; e;) {if(e === this)return !0;e = e.timeline;}return !1;}, d.shiftChildren = function(t, e, i){i = i || 0;for(var s, r=this._first, n=this._labels; r;) r._startTime >= i && (r._startTime += t), r = r._next;if(e)for(s in n) n[s] >= i && (n[s] += t);return this._uncache(!0);}, d._kill = function(t, e){if(!t && !e)return this._enabled(!1, !1);for(var i=e?this.getTweensOf(e):this.getChildren(!0, !0, !1), s=i.length, r=!1; --s > -1;) i[s]._kill(t, e) && (r = !0);return r;}, d.clear = function(t){var e=this.getChildren(!1, !0, !0), i=e.length;for(this._time = this._totalTime = 0; --i > -1;) e[i]._enabled(!1, !1);return (t !== !1 && (this._labels = {}), this._uncache(!0));}, d.invalidate = function(){for(var e=this._first; e;) e.invalidate(), e = e._next;return t.prototype.invalidate.call(this);}, d._enabled = function(t, i){if(t === this._gc)for(var s=this._first; s;) s._enabled(t, !0), s = s._next;return e.prototype._enabled.call(this, t, i);}, d.totalTime = function(){this._forcingPlayhead = !0;var e=t.prototype.totalTime.apply(this, arguments);return (this._forcingPlayhead = !1, e);}, d.duration = function(t){return arguments.length?(0 !== this.duration() && 0 !== t && this.timeScale(this._duration / t), this):(this._dirty && this.totalDuration(), this._duration);}, d.totalDuration = function(t){if(!arguments.length){if(this._dirty){for(var e, i, s=0, r=this._last, n=999999999999; r;) e = r._prev, r._dirty && r.totalDuration(), r._startTime > n && this._sortChildren && !r._paused?this.add(r, r._startTime - r._delay):n = r._startTime, 0 > r._startTime && !r._paused && (s -= r._startTime, this._timeline.smoothChildTiming && (this._startTime += r._startTime / this._timeScale), this.shiftChildren(-r._startTime, !1, -9999999999), n = 0), i = r._startTime + r._totalDuration / r._timeScale, i > s && (s = i), r = e;this._duration = this._totalDuration = s, this._dirty = !1;}return this._totalDuration;}return (0 !== this.totalDuration() && 0 !== t && this.timeScale(this._totalDuration / t), this);}, d.paused = function(e){if(!e)for(var i=this._first, s=this._time; i;) i._startTime === s && "isPause" === i.data && (i._rawPrevTime = 0), i = i._next;return t.prototype.paused.apply(this, arguments);}, d.usesFrames = function(){for(var e=this._timeline; e._timeline;) e = e._timeline;return e === t._rootFramesTimeline;}, d.rawTime = function(){return this._paused?this._totalTime:(this._timeline.rawTime() - this._startTime) * this._timeScale;}, s);}, !0), _gsScope._gsDefine("TimelineMax", ["TimelineLite", "TweenLite", "easing.Ease"], function(t, e, i){var s=function s(e){t.call(this, e), this._repeat = this.vars.repeat || 0, this._repeatDelay = this.vars.repeatDelay || 0, this._cycle = 0, this._yoyo = this.vars.yoyo === !0, this._dirty = !0;}, r=1e-10, n=[], a=e._internals, o=a.lazyTweens, h=a.lazyRender, l=new i(null, null, 1, 0), _=s.prototype = new t();return (_.constructor = s, _.kill()._gc = !1, s.version = "1.16.1", _.invalidate = function(){return (this._yoyo = this.vars.yoyo === !0, this._repeat = this.vars.repeat || 0, this._repeatDelay = this.vars.repeatDelay || 0, this._uncache(!0), t.prototype.invalidate.call(this));}, _.addCallback = function(t, i, s, r){return this.add(e.delayedCall(0, t, s, r), i);}, _.removeCallback = function(t, e){if(t)if(null == e)this._kill(null, t);else for(var i=this.getTweensOf(t, !1), s=i.length, r=this._parseTimeOrLabel(e); --s > -1;) i[s]._startTime === r && i[s]._enabled(!1, !1);return this;}, _.removePause = function(e){return this.removeCallback(t._internals.pauseCallback, e);}, _.tweenTo = function(t, i){i = i || {};var s, r, a, o={ease:l, useFrames:this.usesFrames(), immediateRender:!1};for(r in i) o[r] = i[r];return (o.time = this._parseTimeOrLabel(t), s = Math.abs(Number(o.time) - this._time) / this._timeScale || 0.001, a = new e(this, s, o), o.onStart = function(){a.target.paused(!0), a.vars.time !== a.target.time() && s === a.duration() && a.duration(Math.abs(a.vars.time - a.target.time()) / a.target._timeScale), i.onStart && i.onStart.apply(i.onStartScope || a, i.onStartParams || n);}, a);}, _.tweenFromTo = function(t, e, i){i = i || {}, t = this._parseTimeOrLabel(t), i.startAt = {onComplete:this.seek, onCompleteParams:[t], onCompleteScope:this}, i.immediateRender = i.immediateRender !== !1;var s=this.tweenTo(e, i);return s.duration(Math.abs(s.vars.time - t) / this._timeScale || 0.001);}, _.render = function(t, e, i){this._gc && this._enabled(!0, !1);var s, a, l, _, u, p, f=this._dirty?this.totalDuration():this._totalDuration, c=this._duration, m=this._time, d=this._totalTime, g=this._startTime, v=this._timeScale, y=this._rawPrevTime, T=this._paused, w=this._cycle;if(t >= f)this._locked || (this._totalTime = f, this._cycle = this._repeat), this._reversed || this._hasPausedChild() || (a = !0, _ = "onComplete", u = !!this._timeline.autoRemoveChildren, 0 === this._duration && (0 === t || 0 > y || y === r) && y !== t && this._first && (u = !0, y > r && (_ = "onReverseComplete"))), this._rawPrevTime = this._duration || !e || t || this._rawPrevTime === t?t:r, this._yoyo && 0 !== (1 & this._cycle)?this._time = t = 0:(this._time = c, t = c + 0.0001);else if(1e-7 > t)if((this._locked || (this._totalTime = this._cycle = 0), this._time = 0, (0 !== m || 0 === c && y !== r && (y > 0 || 0 > t && y >= 0) && !this._locked) && (_ = "onReverseComplete", a = this._reversed), 0 > t))this._active = !1, this._timeline.autoRemoveChildren && this._reversed?(u = a = !0, _ = "onReverseComplete"):y >= 0 && this._first && (u = !0), this._rawPrevTime = t;else {if((this._rawPrevTime = c || !e || t || this._rawPrevTime === t?t:r, 0 === t && a))for(s = this._first; s && 0 === s._startTime;) s._duration || (a = !1), s = s._next;t = 0, this._initted || (u = !0);}else 0 === c && 0 > y && (u = !0), this._time = this._rawPrevTime = t, this._locked || (this._totalTime = t, 0 !== this._repeat && (p = c + this._repeatDelay, this._cycle = this._totalTime / p >> 0, 0 !== this._cycle && this._cycle === this._totalTime / p && this._cycle--, this._time = this._totalTime - this._cycle * p, this._yoyo && 0 !== (1 & this._cycle) && (this._time = c - this._time), this._time > c?(this._time = c, t = c + 0.0001):0 > this._time?this._time = t = 0:t = this._time));if(this._cycle !== w && !this._locked){var x=this._yoyo && 0 !== (1 & w), b=x === (this._yoyo && 0 !== (1 & this._cycle)), P=this._totalTime, S=this._cycle, k=this._rawPrevTime, R=this._time;if((this._totalTime = w * c, w > this._cycle?x = !x:this._totalTime += c, this._time = m, this._rawPrevTime = 0 === c?y - 0.0001:y, this._cycle = w, this._locked = !0, m = x?0:c, this.render(m, e, 0 === c), e || this._gc || this.vars.onRepeat && this.vars.onRepeat.apply(this.vars.onRepeatScope || this, this.vars.onRepeatParams || n), b && (m = x?c + 0.0001:-0.0001, this.render(m, !0, !1)), this._locked = !1, this._paused && !T))return;this._time = R, this._totalTime = P, this._cycle = S, this._rawPrevTime = k;}if(!(this._time !== m && this._first || i || u))return (d !== this._totalTime && this._onUpdate && (e || this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || n)), void 0);if((this._initted || (this._initted = !0), this._active || !this._paused && this._totalTime !== d && t > 0 && (this._active = !0), 0 === d && this.vars.onStart && 0 !== this._totalTime && (e || this.vars.onStart.apply(this.vars.onStartScope || this, this.vars.onStartParams || n)), this._time >= m))for(s = this._first; s && (l = s._next, !this._paused || T);) (s._active || s._startTime <= this._time && !s._paused && !s._gc) && (s._reversed?s.render((s._dirty?s.totalDuration():s._totalDuration) - (t - s._startTime) * s._timeScale, e, i):s.render((t - s._startTime) * s._timeScale, e, i)), s = l;else for(s = this._last; s && (l = s._prev, !this._paused || T);) (s._active || m >= s._startTime && !s._paused && !s._gc) && (s._reversed?s.render((s._dirty?s.totalDuration():s._totalDuration) - (t - s._startTime) * s._timeScale, e, i):s.render((t - s._startTime) * s._timeScale, e, i)), s = l;this._onUpdate && (e || (o.length && h(), this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || n))), _ && (this._locked || this._gc || (g === this._startTime || v !== this._timeScale) && (0 === this._time || f >= this.totalDuration()) && (a && (o.length && h(), this._timeline.autoRemoveChildren && this._enabled(!1, !1), this._active = !1), !e && this.vars[_] && this.vars[_].apply(this.vars[_ + "Scope"] || this, this.vars[_ + "Params"] || n)));}, _.getActive = function(t, e, i){null == t && (t = !0), null == e && (e = !0), null == i && (i = !1);var s, r, n=[], a=this.getChildren(t, e, i), o=0, h=a.length;for(s = 0; h > s; s++) r = a[s], r.isActive() && (n[o++] = r);return n;}, _.getLabelAfter = function(t){t || 0 !== t && (t = this._time);var e, i=this.getLabelsArray(), s=i.length;for(e = 0; s > e; e++) if(i[e].time > t)return i[e].name;return null;}, _.getLabelBefore = function(t){null == t && (t = this._time);for(var e=this.getLabelsArray(), i=e.length; --i > -1;) if(t > e[i].time)return e[i].name;return null;}, _.getLabelsArray = function(){var t, e=[], i=0;for(t in this._labels) e[i++] = {time:this._labels[t], name:t};return (e.sort(function(t, e){return t.time - e.time;}), e);}, _.progress = function(t, e){return arguments.length?this.totalTime(this.duration() * (this._yoyo && 0 !== (1 & this._cycle)?1 - t:t) + this._cycle * (this._duration + this._repeatDelay), e):this._time / this.duration();}, _.totalProgress = function(t, e){return arguments.length?this.totalTime(this.totalDuration() * t, e):this._totalTime / this.totalDuration();}, _.totalDuration = function(e){return arguments.length?-1 === this._repeat?this:this.duration((e - this._repeat * this._repeatDelay) / (this._repeat + 1)):(this._dirty && (t.prototype.totalDuration.call(this), this._totalDuration = -1 === this._repeat?999999999999:this._duration * (this._repeat + 1) + this._repeatDelay * this._repeat), this._totalDuration);}, _.time = function(t, e){return arguments.length?(this._dirty && this.totalDuration(), t > this._duration && (t = this._duration), this._yoyo && 0 !== (1 & this._cycle)?t = this._duration - t + this._cycle * (this._duration + this._repeatDelay):0 !== this._repeat && (t += this._cycle * (this._duration + this._repeatDelay)), this.totalTime(t, e)):this._time;}, _.repeat = function(t){return arguments.length?(this._repeat = t, this._uncache(!0)):this._repeat;}, _.repeatDelay = function(t){return arguments.length?(this._repeatDelay = t, this._uncache(!0)):this._repeatDelay;}, _.yoyo = function(t){return arguments.length?(this._yoyo = t, this):this._yoyo;}, _.currentLabel = function(t){return arguments.length?this.seek(t, !0):this.getLabelBefore(this._time + 1e-8);}, s);}, !0), (function(){var t=180 / Math.PI, e=[], i=[], s=[], r={}, n=_gsScope._gsDefine.globals, a=function a(t, e, i, s){this.a = t, this.b = e, this.c = i, this.d = s, this.da = s - t, this.ca = i - t, this.ba = e - t;}, o=",x,y,z,left,top,right,bottom,marginTop,marginLeft,marginRight,marginBottom,paddingLeft,paddingTop,paddingRight,paddingBottom,backgroundPosition,backgroundPosition_y,", h=function h(t, e, i, s){var r={a:t}, n={}, a={}, o={c:s}, h=(t + e) / 2, l=(e + i) / 2, _=(i + s) / 2, u=(h + l) / 2, p=(l + _) / 2, f=(p - u) / 8;return (r.b = h + (t - h) / 4, n.b = u + f, r.c = n.a = (r.b + n.b) / 2, n.c = a.a = (u + p) / 2, a.b = p - f, o.b = _ + (s - _) / 4, a.c = o.a = (a.b + o.b) / 2, [r, n, a, o]);}, l=function l(t, r, n, a, o){var l, _, u, p, f, c, m, d, g, v, y, T, w, x=t.length - 1, b=0, P=t[0].a;for(l = 0; x > l; l++) f = t[b], _ = f.a, u = f.d, p = t[b + 1].d, o?(y = e[l], T = i[l], w = 0.25 * (T + y) * r / (a?0.5:s[l] || 0.5), c = u - (u - _) * (a?0.5 * r:0 !== y?w / y:0), m = u + (p - u) * (a?0.5 * r:0 !== T?w / T:0), d = u - (c + ((m - c) * (3 * y / (y + T) + 0.5) / 4 || 0))):(c = u - 0.5 * (u - _) * r, m = u + 0.5 * (p - u) * r, d = u - (c + m) / 2), c += d, m += d, f.c = g = c, f.b = 0 !== l?P:P = f.a + 0.6 * (f.c - f.a), f.da = u - _, f.ca = g - _, f.ba = P - _, n?(v = h(_, P, g, u), t.splice(b, 1, v[0], v[1], v[2], v[3]), b += 4):b++, P = m;f = t[b], f.b = P, f.c = P + 0.4 * (f.d - P), f.da = f.d - f.a, f.ca = f.c - f.a, f.ba = P - f.a, n && (v = h(f.a, P, f.c, f.d), t.splice(b, 1, v[0], v[1], v[2], v[3]));}, _=function _(t, s, r, n){var o, h, l, _, u, p, f=[];if(n)for(t = [n].concat(t), h = t.length; --h > -1;) "string" == typeof (p = t[h][s]) && "=" === p.charAt(1) && (t[h][s] = n[s] + Number(p.charAt(0) + p.substr(2)));if((o = t.length - 2, 0 > o)){return (f[0] = new a(t[0][s], 0, 0, t[-1 > o?0:1][s]), f);}for(h = 0; o > h; h++) l = t[h][s], _ = t[h + 1][s], f[h] = new a(l, 0, 0, _), r && (u = t[h + 2][s], e[h] = (e[h] || 0) + (_ - l) * (_ - l), i[h] = (i[h] || 0) + (u - _) * (u - _));return (f[h] = new a(t[h][s], 0, 0, t[h + 1][s]), f);}, u=(function(_u2){function u(_x6, _x7, _x8, _x9, _x10, _x11){return _u2.apply(this, arguments);}u.toString = function(){return _u2.toString();};return u;})(function(t, n, a, h, u, p){var f, c, m, d, g, v, y, T, w={}, x=[], b=p || t[0];u = "string" == typeof u?"," + u + ",":o, null == n && (n = 1);for(c in t[0]) x.push(c);if(t.length > 1){for(T = t[t.length - 1], y = !0, f = x.length; --f > -1;) if((c = x[f], Math.abs(b[c] - T[c]) > 0.05)){y = !1;break;}y && (t = t.concat(), p && t.unshift(p), t.push(t[1]), p = t[t.length - 3]);}for(e.length = i.length = s.length = 0, f = x.length; --f > -1;) c = x[f], r[c] = -1 !== u.indexOf("," + c + ","), w[c] = _(t, c, r[c], p);for(f = e.length; --f > -1;) e[f] = Math.sqrt(e[f]), i[f] = Math.sqrt(i[f]);if(!h){for(f = x.length; --f > -1;) if(r[c])for(m = w[x[f]], v = m.length - 1, d = 0; v > d; d++) g = m[d + 1].da / i[d] + m[d].da / e[d], s[d] = (s[d] || 0) + g * g;for(f = s.length; --f > -1;) s[f] = Math.sqrt(s[f]);}for(f = x.length, d = a?4:1; --f > -1;) c = x[f], m = w[c], l(m, n, a, h, r[c]), y && (m.splice(0, d), m.splice(m.length - d, d));return w;}), p=function p(t, e, i){e = e || "soft";var s, r, n, o, h, l, _, u, p, f, c, m={}, d="cubic" === e?3:2, g="soft" === e, v=[];if((g && i && (t = [i].concat(t)), null == t || d + 1 > t.length))throw "invalid Bezier data";for(p in t[0]) v.push(p);for(l = v.length; --l > -1;) {for(p = v[l], m[p] = h = [], f = 0, u = t.length, _ = 0; u > _; _++) s = null == i?t[_][p]:"string" == typeof (c = t[_][p]) && "=" === c.charAt(1)?i[p] + Number(c.charAt(0) + c.substr(2)):Number(c), g && _ > 1 && u - 1 > _ && (h[f++] = (s + h[f - 2]) / 2), h[f++] = s;for(u = f - d + 1, f = 0, _ = 0; u > _; _ += d) s = h[_], r = h[_ + 1], n = h[_ + 2], o = 2 === d?0:h[_ + 3], h[f++] = c = 3 === d?new a(s, r, n, o):new a(s, (2 * r + s) / 3, (2 * r + n) / 3, n);h.length = f;}return m;}, f=function f(t, e, i){for(var s, r, n, a, o, h, l, _, u, p, f, c=1 / i, m=t.length; --m > -1;) for(p = t[m], n = p.a, a = p.d - n, o = p.c - n, h = p.b - n, s = r = 0, _ = 1; i >= _; _++) l = c * _, u = 1 - l, s = r - (r = (l * l * a + 3 * u * (l * o + u * h)) * l), f = m * i + _ - 1, e[f] = (e[f] || 0) + s * s;}, c=function c(t, e){e = e >> 0 || 6;var i, s, r, n, a=[], o=[], h=0, l=0, _=e - 1, u=[], p=[];for(i in t) f(t[i], a, e);for(r = a.length, s = 0; r > s; s++) h += Math.sqrt(a[s]), n = s % e, p[n] = h, n === _ && (l += h, n = s / e >> 0, u[n] = p, o[n] = l, h = 0, p = []);return {length:l, lengths:o, segments:u};}, m=_gsScope._gsDefine.plugin({propName:"bezier", priority:-1, version:"1.3.4", API:2, global:!0, init:function init(t, e, i){this._target = t, e instanceof Array && (e = {values:e}), this._func = {}, this._round = {}, this._props = [], this._timeRes = null == e.timeResolution?6:parseInt(e.timeResolution, 10);var s, r, n, a, o, h=e.values || [], l={}, _=h[0], f=e.autoRotate || i.vars.orientToBezier;this._autoRotate = f?f instanceof Array?f:[["x", "y", "rotation", f === !0?0:Number(f) || 0]]:null;for(s in _) this._props.push(s);for(n = this._props.length; --n > -1;) s = this._props[n], this._overwriteProps.push(s), r = this._func[s] = "function" == typeof t[s], l[s] = r?t[s.indexOf("set") || "function" != typeof t["get" + s.substr(3)]?s:"get" + s.substr(3)]():parseFloat(t[s]), o || l[s] !== h[0][s] && (o = l);if((this._beziers = "cubic" !== e.type && "quadratic" !== e.type && "soft" !== e.type?u(h, isNaN(e.curviness)?1:e.curviness, !1, "thruBasic" === e.type, e.correlate, o):p(h, e.type, l), this._segCount = this._beziers[s].length, this._timeRes)){var m=c(this._beziers, this._timeRes);this._length = m.length, this._lengths = m.lengths, this._segments = m.segments, this._l1 = this._li = this._s1 = this._si = 0, this._l2 = this._lengths[0], this._curSeg = this._segments[0], this._s2 = this._curSeg[0], this._prec = 1 / this._curSeg.length;}if(f = this._autoRotate)for(this._initialRotations = [], f[0] instanceof Array || (this._autoRotate = f = [f]), n = f.length; --n > -1;) {for(a = 0; 3 > a; a++) s = f[n][a], this._func[s] = "function" == typeof t[s]?t[s.indexOf("set") || "function" != typeof t["get" + s.substr(3)]?s:"get" + s.substr(3)]:!1;s = f[n][2], this._initialRotations[n] = this._func[s]?this._func[s].call(this._target):this._target[s];}return (this._startRatio = i.vars.runBackwards?1:0, !0);}, set:function set(e){var i, s, r, n, a, o, h, l, _, u, p=this._segCount, f=this._func, c=this._target, m=e !== this._startRatio;if(this._timeRes){if((_ = this._lengths, u = this._curSeg, e *= this._length, r = this._li, e > this._l2 && p - 1 > r)){for(l = p - 1; l > r && e >= (this._l2 = _[++r]););this._l1 = _[r - 1], this._li = r, this._curSeg = u = this._segments[r], this._s2 = u[this._s1 = this._si = 0];}else if(this._l1 > e && r > 0){for(; r > 0 && (this._l1 = _[--r]) >= e;);0 === r && this._l1 > e?this._l1 = 0:r++, this._l2 = _[r], this._li = r, this._curSeg = u = this._segments[r], this._s1 = u[(this._si = u.length - 1) - 1] || 0, this._s2 = u[this._si];}if((i = r, e -= this._l1, r = this._si, e > this._s2 && u.length - 1 > r)){for(l = u.length - 1; l > r && e >= (this._s2 = u[++r]););this._s1 = u[r - 1], this._si = r;}else if(this._s1 > e && r > 0){for(; r > 0 && (this._s1 = u[--r]) >= e;);0 === r && this._s1 > e?this._s1 = 0:r++, this._s2 = u[r], this._si = r;}o = (r + (e - this._s1) / (this._s2 - this._s1)) * this._prec;}else i = 0 > e?0:e >= 1?p - 1:p * e >> 0, o = (e - i * (1 / p)) * p;for(s = 1 - o, r = this._props.length; --r > -1;) n = this._props[r], a = this._beziers[n][i], h = (o * o * a.da + 3 * s * (o * a.ca + s * a.ba)) * o + a.a, this._round[n] && (h = Math.round(h)), f[n]?c[n](h):c[n] = h;if(this._autoRotate){var d, g, v, y, T, w, x, b=this._autoRotate;for(r = b.length; --r > -1;) n = b[r][2], w = b[r][3] || 0, x = b[r][4] === !0?1:t, a = this._beziers[b[r][0]], d = this._beziers[b[r][1]], a && d && (a = a[i], d = d[i], g = a.a + (a.b - a.a) * o, y = a.b + (a.c - a.b) * o, g += (y - g) * o, y += (a.c + (a.d - a.c) * o - y) * o, v = d.a + (d.b - d.a) * o, T = d.b + (d.c - d.b) * o, v += (T - v) * o, T += (d.c + (d.d - d.c) * o - T) * o, h = m?Math.atan2(T - v, y - g) * x + w:this._initialRotations[r], f[n]?c[n](h):c[n] = h);}}}), d=m.prototype;m.bezierThrough = u, m.cubicToQuadratic = h, m._autoCSS = !0, m.quadraticToCubic = function(t, e, i){return new a(t, (2 * e + t) / 3, (2 * e + i) / 3, i);}, m._cssRegister = function(){var t=n.CSSPlugin;if(t){var e=t._internals, i=e._parseToProxy, s=e._setPluginRatio, r=e.CSSPropTween;e._registerComplexSpecialProp("bezier", {parser:function parser(t, e, n, a, o, h){e instanceof Array && (e = {values:e}), h = new m();var l, _, u, p=e.values, f=p.length - 1, c=[], d={};if(0 > f){return o;}for(l = 0; f >= l; l++) u = i(t, p[l], a, o, h, f !== l), c[l] = u.end;for(_ in e) d[_] = e[_];return (d.values = c, o = new r(t, "bezier", 0, 0, u.pt, 2), o.data = u, o.plugin = h, o.setRatio = s, 0 === d.autoRotate && (d.autoRotate = !0), !d.autoRotate || d.autoRotate instanceof Array || (l = d.autoRotate === !0?0:Number(d.autoRotate), d.autoRotate = null != u.end.left?[["left", "top", "rotation", l, !1]]:null != u.end.x?[["x", "y", "rotation", l, !1]]:!1), d.autoRotate && (a._transform || a._enableTransforms(!1), u.autoRotate = a._target._gsTransform), h._onInitTween(u.proxy, d, a._tween), o);}});}}, d._roundProps = function(t, e){for(var i=this._overwriteProps, s=i.length; --s > -1;) (t[i[s]] || t.bezier || t.bezierThrough) && (this._round[i[s]] = e);}, d._kill = function(t){var e, i, s=this._props;for(e in this._beziers) if(e in t)for(delete this._beziers[e], delete this._func[e], i = s.length; --i > -1;) s[i] === e && s.splice(i, 1);return this._super._kill.call(this, t);};})(), _gsScope._gsDefine("plugins.CSSPlugin", ["plugins.TweenPlugin", "TweenLite"], function(t, e){var i, s, r, n, a=(function(_a){function a(){return _a.apply(this, arguments);}a.toString = function(){return _a.toString();};return a;})(function(){t.call(this, "css"), this._overwriteProps.length = 0, this.setRatio = a.prototype.setRatio;}), o=_gsScope._gsDefine.globals, h={}, l=a.prototype = new t("css");l.constructor = a, a.version = "1.16.1", a.API = 2, a.defaultTransformPerspective = 0, a.defaultSkewType = "compensated", l = "px", a.suffixMap = {top:l, right:l, bottom:l, left:l, width:l, height:l, fontSize:l, padding:l, margin:l, perspective:l, lineHeight:""};var _, u, p, f, c, m, d=/(?:\d|\-\d|\.\d|\-\.\d)+/g, g=/(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g, v=/(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi, y=/(?![+-]?\d*\.?\d+|[+-]|e[+-]\d+)[^0-9]/g, T=/(?:\d|\-|\+|=|#|\.)*/g, w=/opacity *= *([^)]*)/i, x=/opacity:([^;]*)/i, b=/alpha\(opacity *=.+?\)/i, P=/^(rgb|hsl)/, S=/([A-Z])/g, k=/-([a-z])/gi, R=/(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi, A=function A(t, e){return e.toUpperCase();}, O=/(?:Left|Right|Width)/i, C=/(M11|M12|M21|M22)=[\d\-\.e]+/gi, D=/progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i, M=/,(?=[^\)]*(?:\(|$))/gi, z=Math.PI / 180, I=180 / Math.PI, F={}, E=document, N=function N(t){return E.createElementNS?E.createElementNS("http://www.w3.org/1999/xhtml", t):E.createElement(t);}, L=N("div"), X=N("img"), U=a._internals = {_specialProps:h}, Y=navigator.userAgent, j=(function(){var t=Y.indexOf("Android"), e=N("a");return (p = -1 !== Y.indexOf("Safari") && -1 === Y.indexOf("Chrome") && (-1 === t || Number(Y.substr(t + 8, 1)) > 3), c = p && 6 > Number(Y.substr(Y.indexOf("Version/") + 8, 1)), f = -1 !== Y.indexOf("Firefox"), (/MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(Y) || /Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/.exec(Y)) && (m = parseFloat(RegExp.$1)), e?(e.style.cssText = "top:1px;opacity:.55;", /^0.55/.test(e.style.opacity)):!1);})(), B=function B(t){return w.test("string" == typeof t?t:(t.currentStyle?t.currentStyle.filter:t.style.filter) || "")?parseFloat(RegExp.$1) / 100:1;}, q=function q(t){window.console && console.log(t);}, V="", G="", W=function W(t, e){e = e || L;var i, s, r=e.style;if(void 0 !== r[t]){return t;}for(t = t.charAt(0).toUpperCase() + t.substr(1), i = ["O", "Moz", "ms", "Ms", "Webkit"], s = 5; --s > -1 && void 0 === r[i[s] + t];);return s >= 0?(G = 3 === s?"ms":i[s], V = "-" + G.toLowerCase() + "-", G + t):null;}, Z=E.defaultView?E.defaultView.getComputedStyle:function(){}, Q=a.getStyle = function(t, e, i, s, r){var n;return j || "opacity" !== e?(!s && t.style[e]?n = t.style[e]:(i = i || Z(t))?n = i[e] || i.getPropertyValue(e) || i.getPropertyValue(e.replace(S, "-$1").toLowerCase()):t.currentStyle && (n = t.currentStyle[e]), null == r || n && "none" !== n && "auto" !== n && "auto auto" !== n?n:r):B(t);}, $=U.convertToPixels = function(t, i, s, r, n){if("px" === r || !r)return s;if("auto" === r || !s)return 0;var o, h, l, _=O.test(i), u=t, p=L.style, f=0 > s;if((f && (s = -s), "%" === r && -1 !== i.indexOf("border")))o = s / 100 * (_?t.clientWidth:t.clientHeight);else {if((p.cssText = "border:0 solid red;position:" + Q(t, "position") + ";line-height:0;", "%" !== r && u.appendChild))p[_?"borderLeftWidth":"borderTopWidth"] = s + r;else {if((u = t.parentNode || E.body, h = u._gsCache, l = e.ticker.frame, h && _ && h.time === l))return h.width * s / 100;p[_?"width":"height"] = s + r;}u.appendChild(L), o = parseFloat(L[_?"offsetWidth":"offsetHeight"]), u.removeChild(L), _ && "%" === r && a.cacheWidths !== !1 && (h = u._gsCache = u._gsCache || {}, h.time = l, h.width = 100 * (o / s)), 0 !== o || n || (o = $(t, i, s, r, !0));}return f?-o:o;}, H=U.calculateOffset = function(t, e, i){if("absolute" !== Q(t, "position", i))return 0;var s="left" === e?"Left":"Top", r=Q(t, "margin" + s, i);return t["offset" + s] - ($(t, e, parseFloat(r), r.replace(T, "")) || 0);}, K=function K(t, e){var i, s, r, n={};if(e = e || Z(t, null))if(i = e.length)for(; --i > -1;) r = e[i], (-1 === r.indexOf("-transform") || be === r) && (n[r.replace(k, A)] = e.getPropertyValue(r));else for(i in e) (-1 === i.indexOf("Transform") || xe === i) && (n[i] = e[i]);else if(e = t.currentStyle || t.style)for(i in e) "string" == typeof i && void 0 === n[i] && (n[i.replace(k, A)] = e[i]);return (j || (n.opacity = B(t)), s = Me(t, e, !1), n.rotation = s.rotation, n.skewX = s.skewX, n.scaleX = s.scaleX, n.scaleY = s.scaleY, n.x = s.x, n.y = s.y, Se && (n.z = s.z, n.rotationX = s.rotationX, n.rotationY = s.rotationY, n.scaleZ = s.scaleZ), n.filters && delete n.filters, n);}, J=function J(t, e, i, s, r){var n, a, o, h={}, l=t.style;for(a in i) "cssText" !== a && "length" !== a && isNaN(a) && (e[a] !== (n = i[a]) || r && r[a]) && -1 === a.indexOf("Origin") && ("number" == typeof n || "string" == typeof n) && (h[a] = "auto" !== n || "left" !== a && "top" !== a?"" !== n && "auto" !== n && "none" !== n || "string" != typeof e[a] || "" === e[a].replace(y, "")?n:0:H(t, a), void 0 !== l[a] && (o = new fe(l, a, l[a], o)));if(s)for(a in s) "className" !== a && (h[a] = s[a]);return {difs:h, firstMPT:o};}, te={width:["Left", "Right"], height:["Top", "Bottom"]}, ee=["marginLeft", "marginRight", "marginTop", "marginBottom"], ie=function ie(t, e, i){var s=parseFloat("width" === e?t.offsetWidth:t.offsetHeight), r=te[e], n=r.length;for(i = i || Z(t, null); --n > -1;) s -= parseFloat(Q(t, "padding" + r[n], i, !0)) || 0, s -= parseFloat(Q(t, "border" + r[n] + "Width", i, !0)) || 0;return s;}, se=function se(t, e){(null == t || "" === t || "auto" === t || "auto auto" === t) && (t = "0 0");var i=t.split(" "), s=-1 !== t.indexOf("left")?"0%":-1 !== t.indexOf("right")?"100%":i[0], r=-1 !== t.indexOf("top")?"0%":-1 !== t.indexOf("bottom")?"100%":i[1];return (null == r?r = "center" === s?"50%":"0":"center" === r && (r = "50%"), ("center" === s || isNaN(parseFloat(s)) && -1 === (s + "").indexOf("=")) && (s = "50%"), t = s + " " + r + (i.length > 2?" " + i[2]:""), e && (e.oxp = -1 !== s.indexOf("%"), e.oyp = -1 !== r.indexOf("%"), e.oxr = "=" === s.charAt(1), e.oyr = "=" === r.charAt(1), e.ox = parseFloat(s.replace(y, "")), e.oy = parseFloat(r.replace(y, "")), e.v = t), e || t);}, re=function re(t, e){return "string" == typeof t && "=" === t.charAt(1)?parseInt(t.charAt(0) + "1", 10) * parseFloat(t.substr(2)):parseFloat(t) - parseFloat(e);}, ne=function ne(t, e){return null == t?e:"string" == typeof t && "=" === t.charAt(1)?parseInt(t.charAt(0) + "1", 10) * parseFloat(t.substr(2)) + e:parseFloat(t);}, ae=function ae(t, e, i, s){var r, n, a, o, h, l=0.000001;return (null == t?o = e:"number" == typeof t?o = t:(r = 360, n = t.split("_"), h = "=" === t.charAt(1), a = (h?parseInt(t.charAt(0) + "1", 10) * parseFloat(n[0].substr(2)):parseFloat(n[0])) * (-1 === t.indexOf("rad")?1:I) - (h?0:e), n.length && (s && (s[i] = e + a), -1 !== t.indexOf("short") && (a %= r, a !== a % (r / 2) && (a = 0 > a?a + r:a - r)), -1 !== t.indexOf("_cw") && 0 > a?a = (a + 9999999999 * r) % r - (0 | a / r) * r:-1 !== t.indexOf("ccw") && a > 0 && (a = (a - 9999999999 * r) % r - (0 | a / r) * r)), o = e + a), l > o && o > -l && (o = 0), o);}, oe={aqua:[0, 255, 255], lime:[0, 255, 0], silver:[192, 192, 192], black:[0, 0, 0], maroon:[128, 0, 0], teal:[0, 128, 128], blue:[0, 0, 255], navy:[0, 0, 128], white:[255, 255, 255], fuchsia:[255, 0, 255], olive:[128, 128, 0], yellow:[255, 255, 0], orange:[255, 165, 0], gray:[128, 128, 128], purple:[128, 0, 128], green:[0, 128, 0], red:[255, 0, 0], pink:[255, 192, 203], cyan:[0, 255, 255], transparent:[255, 255, 255, 0]}, he=function he(t, e, i){return (t = 0 > t?t + 1:t > 1?t - 1:t, 0 | 255 * (1 > 6 * t?e + 6 * (i - e) * t:0.5 > t?i:2 > 3 * t?e + 6 * (i - e) * (2 / 3 - t):e) + 0.5);}, le=a.parseColor = function(t){var e, i, s, r, n, a;return t && "" !== t?"number" == typeof t?[t >> 16, 255 & t >> 8, 255 & t]:("," === t.charAt(t.length - 1) && (t = t.substr(0, t.length - 1)), oe[t]?oe[t]:"#" === t.charAt(0)?(4 === t.length && (e = t.charAt(1), i = t.charAt(2), s = t.charAt(3), t = "#" + e + e + i + i + s + s), t = parseInt(t.substr(1), 16), [t >> 16, 255 & t >> 8, 255 & t]):"hsl" === t.substr(0, 3)?(t = t.match(d), r = Number(t[0]) % 360 / 360, n = Number(t[1]) / 100, a = Number(t[2]) / 100, i = 0.5 >= a?a * (n + 1):a + n - a * n, e = 2 * a - i, t.length > 3 && (t[3] = Number(t[3])), t[0] = he(r + 1 / 3, e, i), t[1] = he(r, e, i), t[2] = he(r - 1 / 3, e, i), t):(t = t.match(d) || oe.transparent, t[0] = Number(t[0]), t[1] = Number(t[1]), t[2] = Number(t[2]), t.length > 3 && (t[3] = Number(t[3])), t)):oe.black;}, _e="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#.+?\\b";for(l in oe) _e += "|" + l + "\\b";_e = RegExp(_e + ")", "gi");var ue=function ue(t, e, i, s){if(null == t){return function(t){return t;};}var r, n=e?(t.match(_e) || [""])[0]:"", a=t.split(n).join("").match(v) || [], o=t.substr(0, t.indexOf(a[0])), h=")" === t.charAt(t.length - 1)?")":"", l=-1 !== t.indexOf(" ")?" ":",", _=a.length, u=_ > 0?a[0].replace(d, ""):"";return _?r = e?function(t){var e, p, f, c;if("number" == typeof t)t += u;else if(s && M.test(t)){for(c = t.replace(M, "|").split("|"), f = 0; c.length > f; f++) c[f] = r(c[f]);return c.join(",");}if((e = (t.match(_e) || [n])[0], p = t.split(e).join("").match(v) || [], f = p.length, _ > f--))for(; _ > ++f;) p[f] = i?p[0 | (f - 1) / 2]:a[f];return o + p.join(l) + l + e + h + (-1 !== t.indexOf("inset")?" inset":"");}:function(t){var e, n, p;if("number" == typeof t)t += u;else if(s && M.test(t)){for(n = t.replace(M, "|").split("|"), p = 0; n.length > p; p++) n[p] = r(n[p]);return n.join(",");}if((e = t.match(v) || [], p = e.length, _ > p--))for(; _ > ++p;) e[p] = i?e[0 | (p - 1) / 2]:a[p];return o + e.join(l) + h;}:function(t){return t;};}, pe=function pe(t){return (t = t.split(","), function(e, i, s, r, n, a, o){var h, l=(i + "").split(" ");for(o = {}, h = 0; 4 > h; h++) o[t[h]] = l[h] = l[h] || l[(h - 1) / 2 >> 0];return r.parse(e, o, n, a);});}, fe=(U._setPluginRatio = function(t){this.plugin.setRatio(t);for(var e, i, s, r, n=this.data, a=n.proxy, o=n.firstMPT, h=0.000001; o;) e = a[o.v], o.r?e = Math.round(e):h > e && e > -h && (e = 0), o.t[o.p] = e, o = o._next;if((n.autoRotate && (n.autoRotate.rotation = a.rotation), 1 === t))for(o = n.firstMPT; o;) {if((i = o.t, i.type)){if(1 === i.type){for(r = i.xs0 + i.s + i.xs1, s = 1; i.l > s; s++) r += i["xn" + s] + i["xs" + (s + 1)];i.e = r;}}else i.e = i.s + i.xs0;o = o._next;}}, function(t, e, i, s, r){this.t = t, this.p = e, this.v = i, this.r = r, s && (s._prev = this, this._next = s);}), ce=(U._parseToProxy = function(t, e, i, s, r, n){var a, o, h, l, _, u=s, p={}, f={}, c=i._transform, m=F;for(i._transform = null, F = e, s = _ = i.parse(t, e, s, r), F = m, n && (i._transform = c, u && (u._prev = null, u._prev && (u._prev._next = null))); s && s !== u;) {if(1 >= s.type && (o = s.p, f[o] = s.s + s.c, p[o] = s.s, n || (l = new fe(s, "s", o, l, s.r), s.c = 0), 1 === s.type))for(a = s.l; --a > 0;) h = "xn" + a, o = s.p + "_" + h, f[o] = s.data[h], p[o] = s[h], n || (l = new fe(s, h, o, l, s.rxp[h]));s = s._next;}return {proxy:p, end:f, firstMPT:l, pt:_};}, U.CSSPropTween = function(t, e, s, r, a, o, h, l, _, u, p){this.t = t, this.p = e, this.s = s, this.c = r, this.n = h || e, t instanceof ce || n.push(this.n), this.r = l, this.type = o || 0, _ && (this.pr = _, i = !0), this.b = void 0 === u?s:u, this.e = void 0 === p?s + r:p, a && (this._next = a, a._prev = this);}), me=a.parseComplex = function(t, e, i, s, r, n, a, o, h, l){i = i || n || "", a = new ce(t, e, 0, 0, a, l?2:1, null, !1, o, i, s), s += "";var u, p, f, c, m, v, y, T, w, x, b, S, k=i.split(", ").join(",").split(" "), R=s.split(", ").join(",").split(" "), A=k.length, O=_ !== !1;for((-1 !== s.indexOf(",") || -1 !== i.indexOf(",")) && (k = k.join(" ").replace(M, ", ").split(" "), R = R.join(" ").replace(M, ", ").split(" "), A = k.length), A !== R.length && (k = (n || "").split(" "), A = k.length), a.plugin = h, a.setRatio = l, u = 0; A > u; u++) if((c = k[u], m = R[u], T = parseFloat(c), T || 0 === T))a.appendXtra("", T, re(m, T), m.replace(g, ""), O && -1 !== m.indexOf("px"), !0);else if(r && ("#" === c.charAt(0) || oe[c] || P.test(c)))S = "," === m.charAt(m.length - 1)?"),":")", c = le(c), m = le(m), w = c.length + m.length > 6, w && !j && 0 === m[3]?(a["xs" + a.l] += a.l?" transparent":"transparent", a.e = a.e.split(R[u]).join("transparent")):(j || (w = !1), a.appendXtra(w?"rgba(":"rgb(", c[0], m[0] - c[0], ",", !0, !0).appendXtra("", c[1], m[1] - c[1], ",", !0).appendXtra("", c[2], m[2] - c[2], w?",":S, !0), w && (c = 4 > c.length?1:c[3], a.appendXtra("", c, (4 > m.length?1:m[3]) - c, S, !1)));else if(v = c.match(d)){if((y = m.match(g), !y || y.length !== v.length))return a;for(f = 0, p = 0; v.length > p; p++) b = v[p], x = c.indexOf(b, f), a.appendXtra(c.substr(f, x - f), Number(b), re(y[p], b), "", O && "px" === c.substr(x + b.length, 2), 0 === p), f = x + b.length;a["xs" + a.l] += c.substr(f);}else a["xs" + a.l] += a.l?" " + c:c;if(-1 !== s.indexOf("=") && a.data){for(S = a.xs0 + a.data.s, u = 1; a.l > u; u++) S += a["xs" + u] + a.data["xn" + u];a.e = S + a["xs" + u];}return (a.l || (a.type = -1, a.xs0 = a.e), a.xfirst || a);}, de=9;for(l = ce.prototype, l.l = l.pr = 0; --de > 0;) l["xn" + de] = 0, l["xs" + de] = "";l.xs0 = "", l._next = l._prev = l.xfirst = l.data = l.plugin = l.setRatio = l.rxp = null, l.appendXtra = function(t, e, i, s, r, n){var a=this, o=a.l;return (a["xs" + o] += n && o?" " + t:t || "", i || 0 === o || a.plugin?(a.l++, a.type = a.setRatio?2:1, a["xs" + a.l] = s || "", o > 0?(a.data["xn" + o] = e + i, a.rxp["xn" + o] = r, a["xn" + o] = e, a.plugin || (a.xfirst = new ce(a, "xn" + o, e, i, a.xfirst || a, 0, a.n, r, a.pr), a.xfirst.xs0 = 0), a):(a.data = {s:e + i}, a.rxp = {}, a.s = e, a.c = i, a.r = r, a)):(a["xs" + o] += e + (s || ""), a));};var ge=function ge(t, e){e = e || {}, this.p = e.prefix?W(t) || t:t, h[t] = h[this.p] = this, this.format = e.formatter || ue(e.defaultValue, e.color, e.collapsible, e.multi), e.parser && (this.parse = e.parser), this.clrs = e.color, this.multi = e.multi, this.keyword = e.keyword, this.dflt = e.defaultValue, this.pr = e.priority || 0;}, ve=U._registerComplexSpecialProp = function(t, e, i){"object" != typeof e && (e = {parser:i});var s, r, n=t.split(","), a=e.defaultValue;for(i = i || [a], s = 0; n.length > s; s++) e.prefix = 0 === s && e.prefix, e.defaultValue = i[s] || a, r = new ge(n[s], e);}, ye=function ye(t){if(!h[t]){var e=t.charAt(0).toUpperCase() + t.substr(1) + "Plugin";ve(t, {parser:function parser(t, i, s, r, n, a, l){var _=o.com.greensock.plugins[e];return _?(_._cssRegister(), h[s].parse(t, i, s, r, n, a, l)):(q("Error: " + e + " js file not loaded."), n);}});}};l = ge.prototype, l.parseComplex = function(t, e, i, s, r, n){var a, o, h, l, _, u, p=this.keyword;if((this.multi && (M.test(i) || M.test(e)?(o = e.replace(M, "|").split("|"), h = i.replace(M, "|").split("|")):p && (o = [e], h = [i])), h)){for(l = h.length > o.length?h.length:o.length, a = 0; l > a; a++) e = o[a] = o[a] || this.dflt, i = h[a] = h[a] || this.dflt, p && (_ = e.indexOf(p), u = i.indexOf(p), _ !== u && (-1 === u?o[a] = o[a].split(p).join(""):-1 === _ && (o[a] += " " + p)));e = o.join(", "), i = h.join(", ");}return me(t, this.p, e, i, this.clrs, this.dflt, s, this.pr, r, n);}, l.parse = function(t, e, i, s, n, a){return this.parseComplex(t.style, this.format(Q(t, this.p, r, !1, this.dflt)), this.format(e), n, a);}, a.registerSpecialProp = function(t, e, i){ve(t, {parser:function parser(t, s, r, n, a, o){var h=new ce(t, r, 0, 0, a, 2, r, !1, i);return (h.plugin = o, h.setRatio = e(t, s, n._tween, r), h);}, priority:i});}, a.useSVGTransformAttr = p;var Te, we="scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent".split(","), xe=W("transform"), be=V + "transform", Pe=W("transformOrigin"), Se=null !== W("perspective"), ke=U.Transform = function(){this.perspective = parseFloat(a.defaultTransformPerspective) || 0, this.force3D = a.defaultForce3D !== !1 && Se?a.defaultForce3D || "auto":!1;}, Re=window.SVGElement, Ae=function Ae(t, e, i){var s, r=E.createElementNS("http://www.w3.org/2000/svg", t), n=/([a-z])([A-Z])/g;for(s in i) r.setAttributeNS(null, s.replace(n, "$1-$2").toLowerCase(), i[s]);return (e.appendChild(r), r);}, Oe=E.documentElement, Ce=(function(){var t, e, i, s=m || /Android/i.test(Y) && !window.chrome;return (E.createElementNS && !s && (t = Ae("svg", Oe), e = Ae("rect", t, {width:100, height:50, x:100}), i = e.getBoundingClientRect().width, e.style[Pe] = "50% 50%", e.style[xe] = "scaleX(0.5)", s = i === e.getBoundingClientRect().width && !(f && Se), Oe.removeChild(t)), s);})(), De=function De(t, e, i, s){var r, n;s && (n = s.split(" ")).length || (r = t.getBBox(), e = se(e).split(" "), n = [(-1 !== e[0].indexOf("%")?parseFloat(e[0]) / 100 * r.width:parseFloat(e[0])) + r.x, (-1 !== e[1].indexOf("%")?parseFloat(e[1]) / 100 * r.height:parseFloat(e[1])) + r.y]), i.xOrigin = parseFloat(n[0]), i.yOrigin = parseFloat(n[1]), t.setAttribute("data-svg-origin", n.join(" "));}, Me=U.getTransform = function(t, e, i, s){if(t._gsTransform && i && !s)return t._gsTransform;var n, o, h, l, _, u, p, f, c, m, d=i?t._gsTransform || new ke():new ke(), g=0 > d.scaleX, v=0.00002, y=100000, T=Se?parseFloat(Q(t, Pe, e, !1, "0 0 0").split(" ")[2]) || d.zOrigin || 0:0, w=parseFloat(a.defaultTransformPerspective) || 0;if((xe?o = Q(t, be, e, !0):t.currentStyle && (o = t.currentStyle.filter.match(C), o = o && 4 === o.length?[o[0].substr(4), Number(o[2].substr(4)), Number(o[1].substr(4)), o[3].substr(4), d.x || 0, d.y || 0].join(","):""), n = !o || "none" === o || "matrix(1, 0, 0, 1, 0, 0)" === o, d.svg = !!(Re && "function" == typeof t.getBBox && t.getCTM && (!t.parentNode || t.parentNode.getBBox && t.parentNode.getCTM)), d.svg && (n && -1 !== (t.style[xe] + "").indexOf("matrix") && (o = t.style[xe], n = !1), De(t, Q(t, Pe, r, !1, "50% 50%") + "", d, t.getAttribute("data-svg-origin")), Te = a.useSVGTransformAttr || Ce, h = t.getAttribute("transform"), n && h && -1 !== h.indexOf("matrix") && (o = h, n = 0)), !n)){for(h = (o || "").match(/(?:\-|\b)[\d\-\.e]+\b/gi) || [], l = h.length; --l > -1;) _ = Number(h[l]), h[l] = (u = _ - (_ |= 0))?(0 | u * y + (0 > u?-0.5:0.5)) / y + _:_;if(16 === h.length){var x, b, P, S, k, R=h[0], A=h[1], O=h[2], D=h[3], M=h[4], z=h[5], F=h[6], E=h[7], N=h[8], L=h[9], X=h[10], U=h[12], Y=h[13], j=h[14], B=h[11], q=Math.atan2(F, X);d.zOrigin && (j = -d.zOrigin, U = N * j - h[12], Y = L * j - h[13], j = X * j + d.zOrigin - h[14]), d.rotationX = q * I, q && (S = Math.cos(-q), k = Math.sin(-q), x = M * S + N * k, b = z * S + L * k, P = F * S + X * k, N = M * -k + N * S, L = z * -k + L * S, X = F * -k + X * S, B = E * -k + B * S, M = x, z = b, F = P), q = Math.atan2(N, X), d.rotationY = q * I, q && (S = Math.cos(-q), k = Math.sin(-q), x = R * S - N * k, b = A * S - L * k, P = O * S - X * k, L = A * k + L * S, X = O * k + X * S, B = D * k + B * S, R = x, A = b, O = P), q = Math.atan2(A, R), d.rotation = q * I, q && (S = Math.cos(-q), k = Math.sin(-q), R = R * S + M * k, b = A * S + z * k, z = A * -k + z * S, F = O * -k + F * S, A = b), d.rotationX && Math.abs(d.rotationX) + Math.abs(d.rotation) > 359.9 && (d.rotationX = d.rotation = 0, d.rotationY += 180), d.scaleX = (0 | Math.sqrt(R * R + A * A) * y + 0.5) / y, d.scaleY = (0 | Math.sqrt(z * z + L * L) * y + 0.5) / y, d.scaleZ = (0 | Math.sqrt(F * F + X * X) * y + 0.5) / y, d.skewX = 0, d.perspective = B?1 / (0 > B?-B:B):0, d.x = U, d.y = Y, d.z = j, d.svg && (d.x -= d.xOrigin - (d.xOrigin * R - d.yOrigin * M), d.y -= d.yOrigin - (d.yOrigin * A - d.xOrigin * z));}else if(!(Se && !s && h.length && d.x === h[4] && d.y === h[5] && (d.rotationX || d.rotationY) || void 0 !== d.x && "none" === Q(t, "display", e))){var V=h.length >= 6, G=V?h[0]:1, W=h[1] || 0, Z=h[2] || 0, $=V?h[3]:1;d.x = h[4] || 0, d.y = h[5] || 0, p = Math.sqrt(G * G + W * W), f = Math.sqrt($ * $ + Z * Z), c = G || W?Math.atan2(W, G) * I:d.rotation || 0, m = Z || $?Math.atan2(Z, $) * I + c:d.skewX || 0, Math.abs(m) > 90 && 270 > Math.abs(m) && (g?(p *= -1, m += 0 >= c?180:-180, c += 0 >= c?180:-180):(f *= -1, m += 0 >= m?180:-180)), d.scaleX = p, d.scaleY = f, d.rotation = c, d.skewX = m, Se && (d.rotationX = d.rotationY = d.z = 0, d.perspective = w, d.scaleZ = 1), d.svg && (d.x -= d.xOrigin - (d.xOrigin * G - d.yOrigin * W), d.y -= d.yOrigin - (d.yOrigin * $ - d.xOrigin * Z));}d.zOrigin = T;for(l in d) v > d[l] && d[l] > -v && (d[l] = 0);}return (i && (t._gsTransform = d, d.svg && (Te && t.style[xe]?Ee(t.style, xe):!Te && t.getAttribute("transform") && t.removeAttribute("transform"))), d);}, ze=function ze(t){var e, i, s=this.data, r=-s.rotation * z, n=r + s.skewX * z, a=100000, o=(0 | Math.cos(r) * s.scaleX * a) / a, h=(0 | Math.sin(r) * s.scaleX * a) / a, l=(0 | Math.sin(n) * -s.scaleY * a) / a, _=(0 | Math.cos(n) * s.scaleY * a) / a, u=this.t.style, p=this.t.currentStyle;if(p){i = h, h = -l, l = -i, e = p.filter, u.filter = "";var f, c, d=this.t.offsetWidth, g=this.t.offsetHeight, v="absolute" !== p.position, y="progid:DXImageTransform.Microsoft.Matrix(M11=" + o + ", M12=" + h + ", M21=" + l + ", M22=" + _, x=s.x + d * s.xPercent / 100, b=s.y + g * s.yPercent / 100;if((null != s.ox && (f = (s.oxp?0.01 * d * s.ox:s.ox) - d / 2, c = (s.oyp?0.01 * g * s.oy:s.oy) - g / 2, x += f - (f * o + c * h), b += c - (f * l + c * _)), v?(f = d / 2, c = g / 2, y += ", Dx=" + (f - (f * o + c * h) + x) + ", Dy=" + (c - (f * l + c * _) + b) + ")"):y += ", sizingMethod='auto expand')", u.filter = -1 !== e.indexOf("DXImageTransform.Microsoft.Matrix(")?e.replace(D, y):y + " " + e, (0 === t || 1 === t) && 1 === o && 0 === h && 0 === l && 1 === _ && (v && -1 === y.indexOf("Dx=0, Dy=0") || w.test(e) && 100 !== parseFloat(RegExp.$1) || -1 === e.indexOf("gradient(" && e.indexOf("Alpha")) && u.removeAttribute("filter")), !v)){var P, S, k, R=8 > m?1:-1;for(f = s.ieOffsetX || 0, c = s.ieOffsetY || 0, s.ieOffsetX = Math.round((d - ((0 > o?-o:o) * d + (0 > h?-h:h) * g)) / 2 + x), s.ieOffsetY = Math.round((g - ((0 > _?-_:_) * g + (0 > l?-l:l) * d)) / 2 + b), de = 0; 4 > de; de++) S = ee[de], P = p[S], i = -1 !== P.indexOf("px")?parseFloat(P):$(this.t, S, parseFloat(P), P.replace(T, "")) || 0, k = i !== s[S]?2 > de?-s.ieOffsetX:-s.ieOffsetY:2 > de?f - s.ieOffsetX:c - s.ieOffsetY, u[S] = (s[S] = Math.round(i - k * (0 === de || 2 === de?1:R))) + "px";}}}, Ie=U.set3DTransformRatio = U.setTransformRatio = function(t){var e, i, s, r, n, a, o, h, l, _, u, p, c, m, d, g, v, y, T, w, x, b, P, S=this.data, k=this.t.style, R=S.rotation, A=S.rotationX, O=S.rotationY, C=S.scaleX, D=S.scaleY, M=S.scaleZ, I=S.x, F=S.y, E=S.z, N=S.svg, L=S.perspective, X=S.force3D;if(!(((1 !== t && 0 !== t || "auto" !== X || this.tween._totalTime !== this.tween._totalDuration && this.tween._totalTime) && X || E || L || O || A) && (!Te || !N) && Se))return (R || S.skewX || N?(R *= z, b = S.skewX * z, P = 100000, e = Math.cos(R) * C, r = Math.sin(R) * C, i = Math.sin(R - b) * -D, n = Math.cos(R - b) * D, b && "simple" === S.skewType && (v = Math.tan(b), v = Math.sqrt(1 + v * v), i *= v, n *= v, S.skewY && (e *= v, r *= v)), N && (I += S.xOrigin - (S.xOrigin * e + S.yOrigin * i), F += S.yOrigin - (S.xOrigin * r + S.yOrigin * n), m = 0.000001, m > I && I > -m && (I = 0), m > F && F > -m && (F = 0)), T = (0 | e * P) / P + "," + (0 | r * P) / P + "," + (0 | i * P) / P + "," + (0 | n * P) / P + "," + I + "," + F + ")", N && Te?this.t.setAttribute("transform", "matrix(" + T):k[xe] = (S.xPercent || S.yPercent?"translate(" + S.xPercent + "%," + S.yPercent + "%) matrix(":"matrix(") + T):k[xe] = (S.xPercent || S.yPercent?"translate(" + S.xPercent + "%," + S.yPercent + "%) matrix(":"matrix(") + C + ",0,0," + D + "," + I + "," + F + ")", void 0);if((f && (m = 0.0001, m > C && C > -m && (C = M = 0.00002), m > D && D > -m && (D = M = 0.00002), !L || S.z || S.rotationX || S.rotationY || (L = 0)), R || S.skewX))R *= z, d = e = Math.cos(R), g = r = Math.sin(R), S.skewX && (R -= S.skewX * z, d = Math.cos(R), g = Math.sin(R), "simple" === S.skewType && (v = Math.tan(S.skewX * z), v = Math.sqrt(1 + v * v), d *= v, g *= v, S.skewY && (e *= v, r *= v))), i = -g, n = d;else {if(!(O || A || 1 !== M || L || N))return (k[xe] = (S.xPercent || S.yPercent?"translate(" + S.xPercent + "%," + S.yPercent + "%) translate3d(":"translate3d(") + I + "px," + F + "px," + E + "px)" + (1 !== C || 1 !== D?" scale(" + C + "," + D + ")":""), void 0);e = n = 1, i = r = 0;}l = 1, s = a = o = h = _ = u = 0, p = L?-1 / L:0, c = S.zOrigin, m = 0.000001, w = ",", x = "0", R = O * z, R && (d = Math.cos(R), g = Math.sin(R), o = -g, _ = p * -g, s = e * g, a = r * g, l = d, p *= d, e *= d, r *= d), R = A * z, R && (d = Math.cos(R), g = Math.sin(R), v = i * d + s * g, y = n * d + a * g, h = l * g, u = p * g, s = i * -g + s * d, a = n * -g + a * d, l *= d, p *= d, i = v, n = y), 1 !== M && (s *= M, a *= M, l *= M, p *= M), 1 !== D && (i *= D, n *= D, h *= D, u *= D), 1 !== C && (e *= C, r *= C, o *= C, _ *= C), (c || N) && (c && (I += s * -c, F += a * -c, E += l * -c + c), N && (I += S.xOrigin - (S.xOrigin * e + S.yOrigin * i), F += S.yOrigin - (S.xOrigin * r + S.yOrigin * n)), m > I && I > -m && (I = x), m > F && F > -m && (F = x), m > E && E > -m && (E = 0)), T = S.xPercent || S.yPercent?"translate(" + S.xPercent + "%," + S.yPercent + "%) matrix3d(":"matrix3d(", T += (m > e && e > -m?x:e) + w + (m > r && r > -m?x:r) + w + (m > o && o > -m?x:o), T += w + (m > _ && _ > -m?x:_) + w + (m > i && i > -m?x:i) + w + (m > n && n > -m?x:n), A || O?(T += w + (m > h && h > -m?x:h) + w + (m > u && u > -m?x:u) + w + (m > s && s > -m?x:s), T += w + (m > a && a > -m?x:a) + w + (m > l && l > -m?x:l) + w + (m > p && p > -m?x:p) + w):T += ",0,0,0,0,1,0,", T += I + w + F + w + E + w + (L?1 + -E / L:1) + ")", k[xe] = T;};l = ke.prototype, l.x = l.y = l.z = l.skewX = l.skewY = l.rotation = l.rotationX = l.rotationY = l.zOrigin = l.xPercent = l.yPercent = 0, l.scaleX = l.scaleY = l.scaleZ = 1, ve("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,svgOrigin,transformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent", {parser:function parser(t, e, i, s, n, o, h){if(s._lastParsedTransform === h){return n;}s._lastParsedTransform = h;var l, _, u, p, f, c, m, d=s._transform = Me(t, r, !0, h.parseTransform), g=t.style, v=0.000001, y=we.length, T=h, w={};if("string" == typeof T.transform && xe)u = L.style, u[xe] = T.transform, u.display = "block", u.position = "absolute", E.body.appendChild(L), l = Me(L, null, !1), E.body.removeChild(L);else if("object" == typeof T){if((l = {scaleX:ne(null != T.scaleX?T.scaleX:T.scale, d.scaleX), scaleY:ne(null != T.scaleY?T.scaleY:T.scale, d.scaleY), scaleZ:ne(T.scaleZ, d.scaleZ), x:ne(T.x, d.x), y:ne(T.y, d.y), z:ne(T.z, d.z), xPercent:ne(T.xPercent, d.xPercent), yPercent:ne(T.yPercent, d.yPercent), perspective:ne(T.transformPerspective, d.perspective)}, m = T.directionalRotation, null != m))if("object" == typeof m)for(u in m) T[u] = m[u];else T.rotation = m;"string" == typeof T.x && -1 !== T.x.indexOf("%") && (l.x = 0, l.xPercent = ne(T.x, d.xPercent)), "string" == typeof T.y && -1 !== T.y.indexOf("%") && (l.y = 0, l.yPercent = ne(T.y, d.yPercent)), l.rotation = ae("rotation" in T?T.rotation:"shortRotation" in T?T.shortRotation + "_short":"rotationZ" in T?T.rotationZ:d.rotation, d.rotation, "rotation", w), Se && (l.rotationX = ae("rotationX" in T?T.rotationX:"shortRotationX" in T?T.shortRotationX + "_short":d.rotationX || 0, d.rotationX, "rotationX", w), l.rotationY = ae("rotationY" in T?T.rotationY:"shortRotationY" in T?T.shortRotationY + "_short":d.rotationY || 0, d.rotationY, "rotationY", w)), l.skewX = null == T.skewX?d.skewX:ae(T.skewX, d.skewX), l.skewY = null == T.skewY?d.skewY:ae(T.skewY, d.skewY), (_ = l.skewY - d.skewY) && (l.skewX += _, l.rotation += _);}for(Se && null != T.force3D && (d.force3D = T.force3D, c = !0), d.skewType = T.skewType || d.skewType || a.defaultSkewType, f = d.force3D || d.z || d.rotationX || d.rotationY || l.z || l.rotationX || l.rotationY || l.perspective, f || null == T.scale || (l.scaleZ = 1); --y > -1;) i = we[y], p = l[i] - d[i], (p > v || -v > p || null != T[i] || null != F[i]) && (c = !0, n = new ce(d, i, d[i], p, n), i in w && (n.e = w[i]), n.xs0 = 0, n.plugin = o, s._overwriteProps.push(n.n));return (p = T.transformOrigin, d.svg && (p || T.svgOrigin) && (De(t, se(p), l, T.svgOrigin), n = new ce(d, "xOrigin", d.xOrigin, l.xOrigin - d.xOrigin, n, -1, "transformOrigin"), n.b = d.xOrigin, n.e = n.xs0 = l.xOrigin, n = new ce(d, "yOrigin", d.yOrigin, l.yOrigin - d.yOrigin, n, -1, "transformOrigin"), n.b = d.yOrigin, n.e = n.xs0 = l.yOrigin, p = Te?null:"0px 0px"), (p || Se && f && d.zOrigin) && (xe?(c = !0, i = Pe, p = (p || Q(t, i, r, !1, "50% 50%")) + "", n = new ce(g, i, 0, 0, n, -1, "transformOrigin"), n.b = g[i], n.plugin = o, Se?(u = d.zOrigin, p = p.split(" "), d.zOrigin = (p.length > 2 && (0 === u || "0px" !== p[2])?parseFloat(p[2]):u) || 0, n.xs0 = n.e = p[0] + " " + (p[1] || "50%") + " 0px", n = new ce(d, "zOrigin", 0, 0, n, -1, n.n), n.b = u, n.xs0 = n.e = d.zOrigin):n.xs0 = n.e = p):se(p + "", d)), c && (s._transformType = d.svg && Te || !f && 3 !== this._transformType?2:3), n);}, prefix:!0}), ve("boxShadow", {defaultValue:"0px 0px 0px 0px #999", prefix:!0, color:!0, multi:!0, keyword:"inset"}), ve("borderRadius", {defaultValue:"0px", parser:function parser(t, e, i, n, a){e = this.format(e);var o, h, l, _, u, p, f, c, m, d, g, v, y, T, w, x, b=["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"], P=t.style;for(m = parseFloat(t.offsetWidth), d = parseFloat(t.offsetHeight), o = e.split(" "), h = 0; b.length > h; h++) this.p.indexOf("border") && (b[h] = W(b[h])), u = _ = Q(t, b[h], r, !1, "0px"), -1 !== u.indexOf(" ") && (_ = u.split(" "), u = _[0], _ = _[1]), p = l = o[h], f = parseFloat(u), v = u.substr((f + "").length), y = "=" === p.charAt(1), y?(c = parseInt(p.charAt(0) + "1", 10), p = p.substr(2), c *= parseFloat(p), g = p.substr((c + "").length - (0 > c?1:0)) || ""):(c = parseFloat(p), g = p.substr((c + "").length)), "" === g && (g = s[i] || v), g !== v && (T = $(t, "borderLeft", f, v), w = $(t, "borderTop", f, v), "%" === g?(u = 100 * (T / m) + "%", _ = 100 * (w / d) + "%"):"em" === g?(x = $(t, "borderLeft", 1, "em"), u = T / x + "em", _ = w / x + "em"):(u = T + "px", _ = w + "px"), y && (p = parseFloat(u) + c + g, l = parseFloat(_) + c + g)), a = me(P, b[h], u + " " + _, p + " " + l, !1, "0px", a);return a;}, prefix:!0, formatter:ue("0px 0px 0px 0px", !1, !0)}), ve("backgroundPosition", {defaultValue:"0 0", parser:function parser(t, e, i, s, n, a){var o, h, l, _, u, p, f="background-position", c=r || Z(t, null), d=this.format((c?m?c.getPropertyValue(f + "-x") + " " + c.getPropertyValue(f + "-y"):c.getPropertyValue(f):t.currentStyle.backgroundPositionX + " " + t.currentStyle.backgroundPositionY) || "0 0"), g=this.format(e);if(-1 !== d.indexOf("%") != (-1 !== g.indexOf("%")) && (p = Q(t, "backgroundImage").replace(R, ""), p && "none" !== p)){for(o = d.split(" "), h = g.split(" "), X.setAttribute("src", p), l = 2; --l > -1;) d = o[l], _ = -1 !== d.indexOf("%"), _ !== (-1 !== h[l].indexOf("%")) && (u = 0 === l?t.offsetWidth - X.width:t.offsetHeight - X.height, o[l] = _?parseFloat(d) / 100 * u + "px":100 * (parseFloat(d) / u) + "%");d = o.join(" ");}return this.parseComplex(t.style, d, g, n, a);}, formatter:se}), ve("backgroundSize", {defaultValue:"0 0", formatter:se}), ve("perspective", {defaultValue:"0px", prefix:!0}), ve("perspectiveOrigin", {defaultValue:"50% 50%", prefix:!0}), ve("transformStyle", {prefix:!0}), ve("backfaceVisibility", {prefix:!0}), ve("userSelect", {prefix:!0}), ve("margin", {parser:pe("marginTop,marginRight,marginBottom,marginLeft")}), ve("padding", {parser:pe("paddingTop,paddingRight,paddingBottom,paddingLeft")}), ve("clip", {defaultValue:"rect(0px,0px,0px,0px)", parser:function parser(t, e, i, s, n, a){var o, h, l;return (9 > m?(h = t.currentStyle, l = 8 > m?" ":",", o = "rect(" + h.clipTop + l + h.clipRight + l + h.clipBottom + l + h.clipLeft + ")", e = this.format(e).split(",").join(l)):(o = this.format(Q(t, this.p, r, !1, this.dflt)), e = this.format(e)), this.parseComplex(t.style, o, e, n, a));}}), ve("textShadow", {defaultValue:"0px 0px 0px #999", color:!0, multi:!0}), ve("autoRound,strictUnits", {parser:function parser(t, e, i, s, r){return r;}}), ve("border", {defaultValue:"0px solid #000", parser:function parser(t, e, i, s, n, a){return this.parseComplex(t.style, this.format(Q(t, "borderTopWidth", r, !1, "0px") + " " + Q(t, "borderTopStyle", r, !1, "solid") + " " + Q(t, "borderTopColor", r, !1, "#000")), this.format(e), n, a);}, color:!0, formatter:function formatter(t){var e=t.split(" ");return e[0] + " " + (e[1] || "solid") + " " + (t.match(_e) || ["#000"])[0];}}), ve("borderWidth", {parser:pe("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth")}), ve("float,cssFloat,styleFloat", {parser:function parser(t, e, i, s, r){var n=t.style, a="cssFloat" in n?"cssFloat":"styleFloat";return new ce(n, a, 0, 0, r, -1, i, !1, 0, n[a], e);}});var Fe=function Fe(t){var e, i=this.t, s=i.filter || Q(this.data, "filter") || "", r=0 | this.s + this.c * t;100 === r && (-1 === s.indexOf("atrix(") && -1 === s.indexOf("radient(") && -1 === s.indexOf("oader(")?(i.removeAttribute("filter"), e = !Q(this.data, "filter")):(i.filter = s.replace(b, ""), e = !0)), e || (this.xn1 && (i.filter = s = s || "alpha(opacity=" + r + ")"), -1 === s.indexOf("pacity")?0 === r && this.xn1 || (i.filter = s + " alpha(opacity=" + r + ")"):i.filter = s.replace(w, "opacity=" + r));};ve("opacity,alpha,autoAlpha", {defaultValue:"1", parser:function parser(t, e, i, s, n, a){var o=parseFloat(Q(t, "opacity", r, !1, "1")), h=t.style, l="autoAlpha" === i;return ("string" == typeof e && "=" === e.charAt(1) && (e = ("-" === e.charAt(0)?-1:1) * parseFloat(e.substr(2)) + o), l && 1 === o && "hidden" === Q(t, "visibility", r) && 0 !== e && (o = 0), j?n = new ce(h, "opacity", o, e - o, n):(n = new ce(h, "opacity", 100 * o, 100 * (e - o), n), n.xn1 = l?1:0, h.zoom = 1, n.type = 2, n.b = "alpha(opacity=" + n.s + ")", n.e = "alpha(opacity=" + (n.s + n.c) + ")", n.data = t, n.plugin = a, n.setRatio = Fe), l && (n = new ce(h, "visibility", 0, 0, n, -1, null, !1, 0, 0 !== o?"inherit":"hidden", 0 === e?"hidden":"inherit"), n.xs0 = "inherit", s._overwriteProps.push(n.n), s._overwriteProps.push(i)), n);}});var Ee=function Ee(t, e){e && (t.removeProperty?(("ms" === e.substr(0, 2) || "webkit" === e.substr(0, 6)) && (e = "-" + e), t.removeProperty(e.replace(S, "-$1").toLowerCase())):t.removeAttribute(e));}, Ne=function Ne(t){if((this.t._gsClassPT = this, 1 === t || 0 === t)){this.t.setAttribute("class", 0 === t?this.b:this.e);for(var e=this.data, i=this.t.style; e;) e.v?i[e.p] = e.v:Ee(i, e.p), e = e._next;1 === t && this.t._gsClassPT === this && (this.t._gsClassPT = null);}else this.t.getAttribute("class") !== this.e && this.t.setAttribute("class", this.e);};ve("className", {parser:function parser(t, e, s, n, a, o, h){var l, _, u, p, f, c=t.getAttribute("class") || "", m=t.style.cssText;if((a = n._classNamePT = new ce(t, s, 0, 0, a, 2), a.setRatio = Ne, a.pr = -11, i = !0, a.b = c, _ = K(t, r), u = t._gsClassPT)){for(p = {}, f = u.data; f;) p[f.p] = 1, f = f._next;u.setRatio(1);}return (t._gsClassPT = a, a.e = "=" !== e.charAt(1)?e:c.replace(RegExp("\\s*\\b" + e.substr(2) + "\\b"), "") + ("+" === e.charAt(0)?" " + e.substr(2):""), t.setAttribute("class", a.e), l = J(t, _, K(t), h, p), t.setAttribute("class", c), a.data = l.firstMPT, t.style.cssText = m, a = a.xfirst = n.parse(t, l.difs, a, o));}});var Le=function Le(t){if((1 === t || 0 === t) && this.data._totalTime === this.data._totalDuration && "isFromStart" !== this.data.data){var e, i, s, r, n, a=this.t.style, o=h.transform.parse;if("all" === this.e)a.cssText = "", r = !0;else for(e = this.e.split(" ").join("").split(","), s = e.length; --s > -1;) i = e[s], h[i] && (h[i].parse === o?r = !0:i = "transformOrigin" === i?Pe:h[i].p), Ee(a, i);r && (Ee(a, xe), n = this.t._gsTransform, n && (n.svg && this.t.removeAttribute("data-svg-origin"), delete this.t._gsTransform));}};for(ve("clearProps", {parser:function parser(t, e, s, r, n){return (n = new ce(t, s, 0, 0, n, 2), n.setRatio = Le, n.e = e, n.pr = -10, n.data = r._tween, i = !0, n);}}), l = "bezier,throwProps,physicsProps,physics2D".split(","), de = l.length; de--;) ye(l[de]);l = a.prototype, l._firstPT = l._lastParsedTransform = l._transform = null, l._onInitTween = function(t, e, o){if(!t.nodeType)return !1;this._target = t, this._tween = o, this._vars = e, _ = e.autoRound, i = !1, s = e.suffixMap || a.suffixMap, r = Z(t, ""), n = this._overwriteProps;var l, f, m, d, g, v, y, T, w, b=t.style;if((u && "" === b.zIndex && (l = Q(t, "zIndex", r), ("auto" === l || "" === l) && this._addLazySet(b, "zIndex", 0)), "string" == typeof e && (d = b.cssText, l = K(t, r), b.cssText = d + ";" + e, l = J(t, l, K(t)).difs, !j && x.test(e) && (l.opacity = parseFloat(RegExp.$1)), e = l, b.cssText = d), this._firstPT = f = e.className?h.className.parse(t, e.className, "className", this, null, null, e):this.parse(t, e, null), this._transformType)){for(w = 3 === this._transformType, xe?p && (u = !0, "" === b.zIndex && (y = Q(t, "zIndex", r), ("auto" === y || "" === y) && this._addLazySet(b, "zIndex", 0)), c && this._addLazySet(b, "WebkitBackfaceVisibility", this._vars.WebkitBackfaceVisibility || (w?"visible":"hidden"))):b.zoom = 1, m = f; m && m._next;) m = m._next;T = new ce(t, "transform", 0, 0, null, 2), this._linkCSSP(T, null, m), T.setRatio = xe?Ie:ze, T.data = this._transform || Me(t, r, !0), T.tween = o, T.pr = -1, n.pop();}if(i){for(; f;) {for(v = f._next, m = d; m && m.pr > f.pr;) m = m._next;(f._prev = m?m._prev:g)?f._prev._next = f:d = f, (f._next = m)?m._prev = f:g = f, f = v;}this._firstPT = d;}return !0;}, l.parse = function(t, e, i, n){var a, o, l, u, p, f, c, m, d, g, v=t.style;for(a in e) f = e[a], o = h[a], o?i = o.parse(t, f, a, this, i, n, e):(p = Q(t, a, r) + "", d = "string" == typeof f, "color" === a || "fill" === a || "stroke" === a || -1 !== a.indexOf("Color") || d && P.test(f)?(d || (f = le(f), f = (f.length > 3?"rgba(":"rgb(") + f.join(",") + ")"), i = me(v, a, p, f, !0, "transparent", i, 0, n)):!d || -1 === f.indexOf(" ") && -1 === f.indexOf(",")?(l = parseFloat(p), c = l || 0 === l?p.substr((l + "").length):"", ("" === p || "auto" === p) && ("width" === a || "height" === a?(l = ie(t, a, r), c = "px"):"left" === a || "top" === a?(l = H(t, a, r), c = "px"):(l = "opacity" !== a?0:1, c = "")), g = d && "=" === f.charAt(1), g?(u = parseInt(f.charAt(0) + "1", 10), f = f.substr(2), u *= parseFloat(f), m = f.replace(T, "")):(u = parseFloat(f), m = d?f.replace(T, ""):""), "" === m && (m = a in s?s[a]:c), f = u || 0 === u?(g?u + l:u) + m:e[a], c !== m && "" !== m && (u || 0 === u) && l && (l = $(t, a, l, c), "%" === m?(l /= $(t, a, 100, "%") / 100, e.strictUnits !== !0 && (p = l + "%")):"em" === m?l /= $(t, a, 1, "em"):"px" !== m && (u = $(t, a, u, m), m = "px"), g && (u || 0 === u) && (f = u + l + m)), g && (u += l), !l && 0 !== l || !u && 0 !== u?void 0 !== v[a] && (f || "NaN" != f + "" && null != f)?(i = new ce(v, a, u || l || 0, 0, i, -1, a, !1, 0, p, f), i.xs0 = "none" !== f || "display" !== a && -1 === a.indexOf("Style")?f:p):q("invalid " + a + " tween value: " + e[a]):(i = new ce(v, a, l, u - l, i, 0, a, _ !== !1 && ("px" === m || "zIndex" === a), 0, p, f), i.xs0 = m)):i = me(v, a, p, f, !0, null, i, 0, n)), n && i && !i.plugin && (i.plugin = n);return i;}, l.setRatio = function(t){var e, i, s, r=this._firstPT, n=0.000001;if(1 !== t || this._tween._time !== this._tween._duration && 0 !== this._tween._time)if(t || this._tween._time !== this._tween._duration && 0 !== this._tween._time || this._tween._rawPrevTime === -0.000001)for(; r;) {if((e = r.c * t + r.s, r.r?e = Math.round(e):n > e && e > -n && (e = 0), r.type))if(1 === r.type)if((s = r.l, 2 === s))r.t[r.p] = r.xs0 + e + r.xs1 + r.xn1 + r.xs2;else if(3 === s)r.t[r.p] = r.xs0 + e + r.xs1 + r.xn1 + r.xs2 + r.xn2 + r.xs3;else if(4 === s)r.t[r.p] = r.xs0 + e + r.xs1 + r.xn1 + r.xs2 + r.xn2 + r.xs3 + r.xn3 + r.xs4;else if(5 === s)r.t[r.p] = r.xs0 + e + r.xs1 + r.xn1 + r.xs2 + r.xn2 + r.xs3 + r.xn3 + r.xs4 + r.xn4 + r.xs5;else {for(i = r.xs0 + e + r.xs1, s = 1; r.l > s; s++) i += r["xn" + s] + r["xs" + (s + 1)];r.t[r.p] = i;}else -1 === r.type?r.t[r.p] = r.xs0:r.setRatio && r.setRatio(t);else r.t[r.p] = e + r.xs0;r = r._next;}else for(; r;) 2 !== r.type?r.t[r.p] = r.b:r.setRatio(t), r = r._next;else for(; r;) 2 !== r.type?r.t[r.p] = r.e:r.setRatio(t), r = r._next;}, l._enableTransforms = function(t){this._transform = this._transform || Me(this._target, r, !0), this._transformType = this._transform.svg && Te || !t && 3 !== this._transformType?2:3;};var Xe=function Xe(){this.t[this.p] = this.e, this.data._linkCSSP(this, this._next, null, !0);};l._addLazySet = function(t, e, i){var s=this._firstPT = new ce(t, e, 0, 0, this._firstPT, 2);s.e = i, s.setRatio = Xe, s.data = this;}, l._linkCSSP = function(t, e, i, s){return (t && (e && (e._prev = t), t._next && (t._next._prev = t._prev), t._prev?t._prev._next = t._next:this._firstPT === t && (this._firstPT = t._next, s = !0), i?i._next = t:s || null !== this._firstPT || (this._firstPT = t), t._next = e, t._prev = i), t);}, l._kill = function(e){var i, s, r, n=e;if(e.autoAlpha || e.alpha){n = {};for(s in e) n[s] = e[s];n.opacity = 1, n.autoAlpha && (n.visibility = 1);}return (e.className && (i = this._classNamePT) && (r = i.xfirst, r && r._prev?this._linkCSSP(r._prev, i._next, r._prev._prev):r === this._firstPT && (this._firstPT = i._next), i._next && this._linkCSSP(i._next, i._next._next, r._prev), this._classNamePT = null), t.prototype._kill.call(this, n));};var Ue=(function(_Ue){function Ue(_x12, _x13, _x14){return _Ue.apply(this, arguments);}Ue.toString = function(){return _Ue.toString();};return Ue;})(function(t, e, i){var s, r, n, a;if(t.slice)for(r = t.length; --r > -1;) Ue(t[r], e, i);else for(s = t.childNodes, r = s.length; --r > -1;) n = s[r], a = n.type, n.style && (e.push(K(n)), i && i.push(n)), 1 !== a && 9 !== a && 11 !== a || !n.childNodes.length || Ue(n, e, i);});return (a.cascadeTo = function(t, i, s){var r, n, a, o, h=e.to(t, i, s), l=[h], _=[], u=[], p=[], f=e._internals.reservedProps;for(t = h._targets || h.target, Ue(t, _, p), h.render(i, !0, !0), Ue(t, u), h.render(0, !0, !0), h._enabled(!0), r = p.length; --r > -1;) if((n = J(p[r], _[r], u[r]), n.firstMPT)){n = n.difs;for(a in s) f[a] && (n[a] = s[a]);o = {};for(a in n) o[a] = _[r][a];l.push(e.fromTo(p[r], i, o, n));}return l;}, t.activate([a]), a);}, !0), (function(){var t=_gsScope._gsDefine.plugin({propName:"roundProps", priority:-1, API:2, init:function init(t, e, i){return (this._tween = i, !0);}}), e=t.prototype;e._onInitAllProps = function(){for(var t, e, i, s=this._tween, r=s.vars.roundProps instanceof Array?s.vars.roundProps:s.vars.roundProps.split(","), n=r.length, a={}, o=s._propLookup.roundProps; --n > -1;) a[r[n]] = 1;for(n = r.length; --n > -1;) for(t = r[n], e = s._firstPT; e;) i = e._next, e.pg?e.t._roundProps(a, !0):e.n === t && (this._add(e.t, t, e.s, e.c), i && (i._prev = e._prev), e._prev?e._prev._next = i:s._firstPT === e && (s._firstPT = i), e._next = e._prev = null, s._propLookup[t] = o), e = i;return !1;}, e._add = function(t, e, i, s){this._addTween(t, e, i, i + s, e, !0), this._overwriteProps.push(e);};})(), _gsScope._gsDefine.plugin({propName:"attr", API:2, version:"0.3.3", init:function init(t, e){var i, s, r;if("function" != typeof t.setAttribute){return !1;}this._target = t, this._proxy = {}, this._start = {}, this._end = {};for(i in e) this._start[i] = this._proxy[i] = s = t.getAttribute(i), r = this._addTween(this._proxy, i, parseFloat(s), e[i], i), this._end[i] = r?r.s + r.c:e[i], this._overwriteProps.push(i);return !0;}, set:function set(t){this._super.setRatio.call(this, t);for(var e, i=this._overwriteProps, s=i.length, r=1 === t?this._end:t?this._proxy:this._start; --s > -1;) e = i[s], this._target.setAttribute(e, r[e] + "");}}), _gsScope._gsDefine.plugin({propName:"directionalRotation", version:"0.2.1", API:2, init:function init(t, e){"object" != typeof e && (e = {rotation:e}), this.finals = {};var i, s, r, n, a, o, h=e.useRadians === !0?2 * Math.PI:360, l=0.000001;for(i in e) "useRadians" !== i && (o = (e[i] + "").split("_"), s = o[0], r = parseFloat("function" != typeof t[i]?t[i]:t[i.indexOf("set") || "function" != typeof t["get" + i.substr(3)]?i:"get" + i.substr(3)]()), n = this.finals[i] = "string" == typeof s && "=" === s.charAt(1)?r + parseInt(s.charAt(0) + "1", 10) * Number(s.substr(2)):Number(s) || 0, a = n - r, o.length && (s = o.join("_"), -1 !== s.indexOf("short") && (a %= h, a !== a % (h / 2) && (a = 0 > a?a + h:a - h)), -1 !== s.indexOf("_cw") && 0 > a?a = (a + 9999999999 * h) % h - (0 | a / h) * h:-1 !== s.indexOf("ccw") && a > 0 && (a = (a - 9999999999 * h) % h - (0 | a / h) * h)), (a > l || -l > a) && (this._addTween(t, i, r, r + a, i), this._overwriteProps.push(i)));return !0;}, set:function set(t){var e;if(1 !== t)this._super.setRatio.call(this, t);else for(e = this._firstPT; e;) e.f?e.t[e.p](this.finals[e.p]):e.t[e.p] = this.finals[e.p], e = e._next;}})._autoCSS = !0, _gsScope._gsDefine("easing.Back", ["easing.Ease"], function(t){var e, i, s, r=_gsScope.GreenSockGlobals || _gsScope, n=r.com.greensock, a=2 * Math.PI, o=Math.PI / 2, h=n._class, l=function l(e, i){var s=h("easing." + e, function(){}, !0), r=s.prototype = new t();return (r.constructor = s, r.getRatio = i, s);}, _=t.register || function(){}, u=function u(t, e, i, s){var r=h("easing." + t, {easeOut:new e(), easeIn:new i(), easeInOut:new s()}, !0);return (_(r, t), r);}, p=function p(t, e, i){this.t = t, this.v = e, i && (this.next = i, i.prev = this, this.c = i.v - e, this.gap = i.t - t);}, f=function f(e, i){var s=h("easing." + e, function(t){this._p1 = t || 0 === t?t:1.70158, this._p2 = 1.525 * this._p1;}, !0), r=s.prototype = new t();return (r.constructor = s, r.getRatio = i, r.config = function(t){return new s(t);}, s);}, c=u("Back", f("BackOut", function(t){return (t -= 1) * t * ((this._p1 + 1) * t + this._p1) + 1;}), f("BackIn", function(t){return t * t * ((this._p1 + 1) * t - this._p1);}), f("BackInOut", function(t){return 1 > (t *= 2)?0.5 * t * t * ((this._p2 + 1) * t - this._p2):0.5 * ((t -= 2) * t * ((this._p2 + 1) * t + this._p2) + 2);})), m=h("easing.SlowMo", function(t, e, i){e = e || 0 === e?e:0.7, null == t?t = 0.7:t > 1 && (t = 1), this._p = 1 !== t?e:0, this._p1 = (1 - t) / 2, this._p2 = t, this._p3 = this._p1 + this._p2, this._calcEnd = i === !0;}, !0), d=m.prototype = new t();return (d.constructor = m, d.getRatio = function(t){var e=t + (0.5 - t) * this._p;return this._p1 > t?this._calcEnd?1 - (t = 1 - t / this._p1) * t:e - (t = 1 - t / this._p1) * t * t * t * e:t > this._p3?this._calcEnd?1 - (t = (t - this._p3) / this._p1) * t:e + (t - e) * (t = (t - this._p3) / this._p1) * t * t * t:this._calcEnd?1:e;}, m.ease = new m(0.7, 0.7), d.config = m.config = function(t, e, i){return new m(t, e, i);}, e = h("easing.SteppedEase", function(t){t = t || 1, this._p1 = 1 / t, this._p2 = t + 1;}, !0), d = e.prototype = new t(), d.constructor = e, d.getRatio = function(t){return (0 > t?t = 0:t >= 1 && (t = 0.999999999), (this._p2 * t >> 0) * this._p1);}, d.config = e.config = function(t){return new e(t);}, i = h("easing.RoughEase", function(e){e = e || {};for(var i, s, r, n, a, o, h=e.taper || "none", l=[], _=0, u=0 | (e.points || 20), f=u, c=e.randomize !== !1, m=e.clamp === !0, d=e.template instanceof t?e.template:null, g="number" == typeof e.strength?0.4 * e.strength:0.4; --f > -1;) i = c?Math.random():1 / u * f, s = d?d.getRatio(i):i, "none" === h?r = g:"out" === h?(n = 1 - i, r = n * n * g):"in" === h?r = i * i * g:0.5 > i?(n = 2 * i, r = 0.5 * n * n * g):(n = 2 * (1 - i), r = 0.5 * n * n * g), c?s += Math.random() * r - 0.5 * r:f % 2?s += 0.5 * r:s -= 0.5 * r, m && (s > 1?s = 1:0 > s && (s = 0)), l[_++] = {x:i, y:s};for(l.sort(function(t, e){return t.x - e.x;}), o = new p(1, 1, null), f = u; --f > -1;) a = l[f], o = new p(a.x, a.y, o);this._prev = new p(0, 0, 0 !== o.t?o:o.next);}, !0), d = i.prototype = new t(), d.constructor = i, d.getRatio = function(t){var e=this._prev;if(t > e.t){for(; e.next && t >= e.t;) e = e.next;e = e.prev;}else for(; e.prev && e.t >= t;) e = e.prev;return (this._prev = e, e.v + (t - e.t) / e.gap * e.c);}, d.config = function(t){return new i(t);}, i.ease = new i(), u("Bounce", l("BounceOut", function(t){return 1 / 2.75 > t?7.5625 * t * t:2 / 2.75 > t?7.5625 * (t -= 1.5 / 2.75) * t + 0.75:2.5 / 2.75 > t?7.5625 * (t -= 2.25 / 2.75) * t + 0.9375:7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;}), l("BounceIn", function(t){return 1 / 2.75 > (t = 1 - t)?1 - 7.5625 * t * t:2 / 2.75 > t?1 - (7.5625 * (t -= 1.5 / 2.75) * t + 0.75):2.5 / 2.75 > t?1 - (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375):1 - (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);}), l("BounceInOut", function(t){var e=0.5 > t;return (t = e?1 - 2 * t:2 * t - 1, t = 1 / 2.75 > t?7.5625 * t * t:2 / 2.75 > t?7.5625 * (t -= 1.5 / 2.75) * t + 0.75:2.5 / 2.75 > t?7.5625 * (t -= 2.25 / 2.75) * t + 0.9375:7.5625 * (t -= 2.625 / 2.75) * t + 0.984375, e?0.5 * (1 - t):0.5 * t + 0.5);})), u("Circ", l("CircOut", function(t){return Math.sqrt(1 - (t -= 1) * t);}), l("CircIn", function(t){return -(Math.sqrt(1 - t * t) - 1);}), l("CircInOut", function(t){return 1 > (t *= 2)?-0.5 * (Math.sqrt(1 - t * t) - 1):0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);})), s = function(e, i, s){var r=h("easing." + e, function(t, e){this._p1 = t >= 1?t:1, this._p2 = (e || s) / (1 > t?t:1), this._p3 = this._p2 / a * (Math.asin(1 / this._p1) || 0), this._p2 = a / this._p2;}, !0), n=r.prototype = new t();return (n.constructor = r, n.getRatio = i, n.config = function(t, e){return new r(t, e);}, r);}, u("Elastic", s("ElasticOut", function(t){return this._p1 * Math.pow(2, -10 * t) * Math.sin((t - this._p3) * this._p2) + 1;}, 0.3), s("ElasticIn", function(t){return -(this._p1 * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - this._p3) * this._p2));}, 0.3), s("ElasticInOut", function(t){return 1 > (t *= 2)?-0.5 * this._p1 * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - this._p3) * this._p2):0.5 * this._p1 * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - this._p3) * this._p2) + 1;}, 0.45)), u("Expo", l("ExpoOut", function(t){return 1 - Math.pow(2, -10 * t);}), l("ExpoIn", function(t){return Math.pow(2, 10 * (t - 1)) - 0.001;}), l("ExpoInOut", function(t){return 1 > (t *= 2)?0.5 * Math.pow(2, 10 * (t - 1)):0.5 * (2 - Math.pow(2, -10 * (t - 1)));})), u("Sine", l("SineOut", function(t){return Math.sin(t * o);}), l("SineIn", function(t){return -Math.cos(t * o) + 1;}), l("SineInOut", function(t){return -0.5 * (Math.cos(Math.PI * t) - 1);})), h("easing.EaseLookup", {find:function find(e){return t.map[e];}}, !0), _(r.SlowMo, "SlowMo", "ease,"), _(i, "RoughEase", "ease,"), _(e, "SteppedEase", "ease,"), c);}, !0);}), _gsScope._gsDefine && _gsScope._gsQueue.pop()(), (function(t, e){"use strict";var i=t.GreenSockGlobals = t.GreenSockGlobals || t;if(!i.TweenLite){var s, r, n, a, o, h=function h(t){var e, s=t.split("."), r=i;for(e = 0; s.length > e; e++) r[s[e]] = r = r[s[e]] || {};return r;}, l=h("com.greensock"), _=1e-10, u=function u(t){var e, i=[], s=t.length;for(e = 0; e !== s; i.push(t[e++]));return i;}, p=function p(){}, f=(function(){var t=Object.prototype.toString, e=t.call([]);return function(i){return null != i && (i instanceof Array || "object" == typeof i && !!i.push && t.call(i) === e);};})(), c={}, m=(function(_m){function m(_x15, _x16, _x17, _x18){return _m.apply(this, arguments);}m.toString = function(){return _m.toString();};return m;})(function(s, r, n, a){this.sc = c[s]?c[s].sc:[], c[s] = this, this.gsClass = null, this.func = n;var o=[];this.check = function(l){for(var _, u, p, f, d=r.length, g=d; --d > -1;) (_ = c[r[d]] || new m(r[d], [])).gsClass?(o[d] = _.gsClass, g--):l && _.sc.push(this);if(0 === g && n)for(u = ("com.greensock." + s).split("."), p = u.pop(), f = h(u.join("."))[p] = this.gsClass = n.apply(n, o), a && (i[p] = f, "function" == typeof define && define.amd?define((t.GreenSockAMDPath?t.GreenSockAMDPath + "/":"") + s.split(".").pop(), [], function(){return f;}):s === e && "undefined" != typeof module && module.exports && (module.exports = f)), d = 0; this.sc.length > d; d++) this.sc[d].check();}, this.check(!0);}), d=t._gsDefine = function(t, e, i, s){return new m(t, e, i, s);}, g=l._class = function(t, e, i){return (e = e || function(){}, d(t, [], function(){return e;}, i), e);};d.globals = i;var v=[0, 0, 1, 1], y=[], T=g("easing.Ease", function(t, e, i, s){this._func = t, this._type = i || 0, this._power = s || 0, this._params = e?v.concat(e):v;}, !0), w=T.map = {}, x=T.register = function(t, e, i, s){for(var r, n, a, o, h=e.split(","), _=h.length, u=(i || "easeIn,easeOut,easeInOut").split(","); --_ > -1;) for(n = h[_], r = s?g("easing." + n, null, !0):l.easing[n] || {}, a = u.length; --a > -1;) o = u[a], w[n + "." + o] = w[o + n] = r[o] = t.getRatio?t:t[o] || new t();};for(n = T.prototype, n._calcEnd = !1, n.getRatio = function(t){if(this._func)return (this._params[0] = t, this._func.apply(null, this._params));var e=this._type, i=this._power, s=1 === e?1 - t:2 === e?t:0.5 > t?2 * t:2 * (1 - t);return (1 === i?s *= s:2 === i?s *= s * s:3 === i?s *= s * s * s:4 === i && (s *= s * s * s * s), 1 === e?1 - s:2 === e?s:0.5 > t?s / 2:1 - s / 2);}, s = ["Linear", "Quad", "Cubic", "Quart", "Quint,Strong"], r = s.length; --r > -1;) n = s[r] + ",Power" + r, x(new T(null, null, 1, r), n, "easeOut", !0), x(new T(null, null, 2, r), n, "easeIn" + (0 === r?",easeNone":"")), x(new T(null, null, 3, r), n, "easeInOut");w.linear = l.easing.Linear.easeIn, w.swing = l.easing.Quad.easeInOut;var b=g("events.EventDispatcher", function(t){this._listeners = {}, this._eventTarget = t || this;});n = b.prototype, n.addEventListener = function(t, e, i, s, r){r = r || 0;var n, h, l=this._listeners[t], _=0;for(null == l && (this._listeners[t] = l = []), h = l.length; --h > -1;) n = l[h], n.c === e && n.s === i?l.splice(h, 1):0 === _ && r > n.pr && (_ = h + 1);l.splice(_, 0, {c:e, s:i, up:s, pr:r}), this !== a || o || a.wake();}, n.removeEventListener = function(t, e){var i, s=this._listeners[t];if(s)for(i = s.length; --i > -1;) if(s[i].c === e)return (s.splice(i, 1), void 0);}, n.dispatchEvent = function(t){var e, i, s, r=this._listeners[t];if(r)for(e = r.length, i = this._eventTarget; --e > -1;) s = r[e], s && (s.up?s.c.call(s.s || i, {type:t, target:i}):s.c.call(s.s || i));};var P=t.requestAnimationFrame, S=t.cancelAnimationFrame, k=Date.now || function(){return new Date().getTime();}, R=k();for(s = ["ms", "moz", "webkit", "o"], r = s.length; --r > -1 && !P;) P = t[s[r] + "RequestAnimationFrame"], S = t[s[r] + "CancelAnimationFrame"] || t[s[r] + "CancelRequestAnimationFrame"];g("Ticker", function(t, e){var i, s, r, n, h, l=this, u=k(), f=e !== !1 && P, c=500, m=33, d="tick", g=(function(_g){function g(_x19){return _g.apply(this, arguments);}g.toString = function(){return _g.toString();};return g;})(function(t){var e, a, o=k() - R;o > c && (u += o - m), R += o, l.time = (R - u) / 1000, e = l.time - h, (!i || e > 0 || t === !0) && (l.frame++, h += e + (e >= n?0.004:n - e), a = !0), t !== !0 && (r = s(g)), a && l.dispatchEvent(d);});b.call(l), l.time = l.frame = 0, l.tick = function(){g(!0);}, l.lagSmoothing = function(t, e){c = t || 1 / _, m = Math.min(e, c, 0);}, l.sleep = function(){null != r && (f && S?S(r):clearTimeout(r), s = p, r = null, l === a && (o = !1));}, l.wake = function(){null !== r?l.sleep():l.frame > 10 && (R = k() - c + 5), s = 0 === i?p:f && P?P:function(t){return setTimeout(t, 0 | 1000 * (h - l.time) + 1);}, l === a && (o = !0), g(2);}, l.fps = function(t){return arguments.length?(i = t, n = 1 / (i || 60), h = this.time + n, l.wake(), void 0):i;}, l.useRAF = function(t){return arguments.length?(l.sleep(), f = t, l.fps(i), void 0):f;}, l.fps(t), setTimeout(function(){f && 5 > l.frame && l.useRAF(!1);}, 1500);}), n = l.Ticker.prototype = new l.events.EventDispatcher(), n.constructor = l.Ticker;var A=g("core.Animation", function(t, e){if((this.vars = e = e || {}, this._duration = this._totalDuration = t || 0, this._delay = Number(e.delay) || 0, this._timeScale = 1, this._active = e.immediateRender === !0, this.data = e.data, this._reversed = e.reversed === !0, B)){o || a.wake();var i=this.vars.useFrames?j:B;i.add(this, i._time), this.vars.paused && this.paused(!0);}});a = A.ticker = new l.Ticker(), n = A.prototype, n._dirty = n._gc = n._initted = n._paused = !1, n._totalTime = n._time = 0, n._rawPrevTime = -1, n._next = n._last = n._onUpdate = n._timeline = n.timeline = null, n._paused = !1;var O=(function(_O){function O(){return _O.apply(this, arguments);}O.toString = function(){return _O.toString();};return O;})(function(){o && k() - R > 2000 && a.wake(), setTimeout(O, 2000);});O(), n.play = function(t, e){return (null != t && this.seek(t, e), this.reversed(!1).paused(!1));}, n.pause = function(t, e){return (null != t && this.seek(t, e), this.paused(!0));}, n.resume = function(t, e){return (null != t && this.seek(t, e), this.paused(!1));}, n.seek = function(t, e){return this.totalTime(Number(t), e !== !1);}, n.restart = function(t, e){return this.reversed(!1).paused(!1).totalTime(t?-this._delay:0, e !== !1, !0);}, n.reverse = function(t, e){return (null != t && this.seek(t || this.totalDuration(), e), this.reversed(!0).paused(!1));}, n.render = function(){}, n.invalidate = function(){return (this._time = this._totalTime = 0, this._initted = this._gc = !1, this._rawPrevTime = -1, (this._gc || !this.timeline) && this._enabled(!0), this);}, n.isActive = function(){var t, e=this._timeline, i=this._startTime;return !e || !this._gc && !this._paused && e.isActive() && (t = e.rawTime()) >= i && i + this.totalDuration() / this._timeScale > t;}, n._enabled = function(t, e){return (o || a.wake(), this._gc = !t, this._active = this.isActive(), e !== !0 && (t && !this.timeline?this._timeline.add(this, this._startTime - this._delay):!t && this.timeline && this._timeline._remove(this, !0)), !1);}, n._kill = function(){return this._enabled(!1, !1);}, n.kill = function(t, e){return (this._kill(t, e), this);}, n._uncache = function(t){for(var e=t?this:this.timeline; e;) e._dirty = !0, e = e.timeline;return this;}, n._swapSelfInParams = function(t){for(var e=t.length, i=t.concat(); --e > -1;) "{self}" === t[e] && (i[e] = this);return i;}, n.eventCallback = function(t, e, i, s){if("on" === (t || "").substr(0, 2)){var r=this.vars;if(1 === arguments.length)return r[t];null == e?delete r[t]:(r[t] = e, r[t + "Params"] = f(i) && -1 !== i.join("").indexOf("{self}")?this._swapSelfInParams(i):i, r[t + "Scope"] = s), "onUpdate" === t && (this._onUpdate = e);}return this;}, n.delay = function(t){return arguments.length?(this._timeline.smoothChildTiming && this.startTime(this._startTime + t - this._delay), this._delay = t, this):this._delay;}, n.duration = function(t){return arguments.length?(this._duration = this._totalDuration = t, this._uncache(!0), this._timeline.smoothChildTiming && this._time > 0 && this._time < this._duration && 0 !== t && this.totalTime(this._totalTime * (t / this._duration), !0), this):(this._dirty = !1, this._duration);}, n.totalDuration = function(t){return (this._dirty = !1, arguments.length?this.duration(t):this._totalDuration);}, n.time = function(t, e){return arguments.length?(this._dirty && this.totalDuration(), this.totalTime(t > this._duration?this._duration:t, e)):this._time;}, n.totalTime = function(t, e, i){if((o || a.wake(), !arguments.length))return this._totalTime;if(this._timeline){if((0 > t && !i && (t += this.totalDuration()), this._timeline.smoothChildTiming)){this._dirty && this.totalDuration();var s=this._totalDuration, r=this._timeline;if((t > s && !i && (t = s), this._startTime = (this._paused?this._pauseTime:r._time) - (this._reversed?s - t:t) / this._timeScale, r._dirty || this._uncache(!1), r._timeline))for(; r._timeline;) r._timeline._time !== (r._startTime + r._totalTime) / r._timeScale && r.totalTime(r._totalTime, !0), r = r._timeline;}this._gc && this._enabled(!0, !1), (this._totalTime !== t || 0 === this._duration) && (this.render(t, e, !1), I.length && V());}return this;}, n.progress = n.totalProgress = function(t, e){return arguments.length?this.totalTime(this.duration() * t, e):this._time / this.duration();}, n.startTime = function(t){return arguments.length?(t !== this._startTime && (this._startTime = t, this.timeline && this.timeline._sortChildren && this.timeline.add(this, t - this._delay)), this):this._startTime;}, n.endTime = function(t){return this._startTime + (0 != t?this.totalDuration():this.duration()) / this._timeScale;}, n.timeScale = function(t){if(!arguments.length)return this._timeScale;if((t = t || _, this._timeline && this._timeline.smoothChildTiming)){var e=this._pauseTime, i=e || 0 === e?e:this._timeline.totalTime();this._startTime = i - (i - this._startTime) * this._timeScale / t;}return (this._timeScale = t, this._uncache(!1));}, n.reversed = function(t){return arguments.length?(t != this._reversed && (this._reversed = t, this.totalTime(this._timeline && !this._timeline.smoothChildTiming?this.totalDuration() - this._totalTime:this._totalTime, !0)), this):this._reversed;}, n.paused = function(t){if(!arguments.length)return this._paused;var e, i, s=this._timeline;return (t != this._paused && s && (o || t || a.wake(), e = s.rawTime(), i = e - this._pauseTime, !t && s.smoothChildTiming && (this._startTime += i, this._uncache(!1)), this._pauseTime = t?e:null, this._paused = t, this._active = this.isActive(), !t && 0 !== i && this._initted && this.duration() && this.render(s.smoothChildTiming?this._totalTime:(e - this._startTime) / this._timeScale, !0, !0)), this._gc && !t && this._enabled(!0, !1), this);};var C=g("core.SimpleTimeline", function(t){A.call(this, 0, t), this.autoRemoveChildren = this.smoothChildTiming = !0;});n = C.prototype = new A(), n.constructor = C, n.kill()._gc = !1, n._first = n._last = n._recent = null, n._sortChildren = !1, n.add = n.insert = function(t, e){var i, s;if((t._startTime = Number(e || 0) + t._delay, t._paused && this !== t._timeline && (t._pauseTime = t._startTime + (this.rawTime() - t._startTime) / t._timeScale), t.timeline && t.timeline._remove(t, !0), t.timeline = t._timeline = this, t._gc && t._enabled(!0, !0), i = this._last, this._sortChildren))for(s = t._startTime; i && i._startTime > s;) i = i._prev;return (i?(t._next = i._next, i._next = t):(t._next = this._first, this._first = t), t._next?t._next._prev = t:this._last = t, t._prev = i, this._recent = t, this._timeline && this._uncache(!0), this);}, n._remove = function(t, e){return (t.timeline === this && (e || t._enabled(!1, !0), t._prev?t._prev._next = t._next:this._first === t && (this._first = t._next), t._next?t._next._prev = t._prev:this._last === t && (this._last = t._prev), t._next = t._prev = t.timeline = null, t === this._recent && (this._recent = this._last), this._timeline && this._uncache(!0)), this);}, n.render = function(t, e, i){var s, r=this._first;for(this._totalTime = this._time = this._rawPrevTime = t; r;) s = r._next, (r._active || t >= r._startTime && !r._paused) && (r._reversed?r.render((r._dirty?r.totalDuration():r._totalDuration) - (t - r._startTime) * r._timeScale, e, i):r.render((t - r._startTime) * r._timeScale, e, i)), r = s;}, n.rawTime = function(){return (o || a.wake(), this._totalTime);};var D=g("TweenLite", function(e, i, s){if((A.call(this, i, s), this.render = D.prototype.render, null == e))throw "Cannot tween a null target.";this.target = e = "string" != typeof e?e:D.selector(e) || e;var r, n, a, o=e.jquery || e.length && e !== t && e[0] && (e[0] === t || e[0].nodeType && e[0].style && !e.nodeType), h=this.vars.overwrite;if((this._overwrite = h = null == h?Y[D.defaultOverwrite]:"number" == typeof h?h >> 0:Y[h], (o || e instanceof Array || e.push && f(e)) && "number" != typeof e[0]))for(this._targets = a = u(e), this._propLookup = [], this._siblings = [], r = 0; a.length > r; r++) n = a[r], n?"string" != typeof n?n.length && n !== t && n[0] && (n[0] === t || n[0].nodeType && n[0].style && !n.nodeType)?(a.splice(r--, 1), this._targets = a = a.concat(u(n))):(this._siblings[r] = G(n, this, !1), 1 === h && this._siblings[r].length > 1 && Z(n, this, null, 1, this._siblings[r])):(n = a[r--] = D.selector(n), "string" == typeof n && a.splice(r + 1, 1)):a.splice(r--, 1);else this._propLookup = {}, this._siblings = G(e, this, !1), 1 === h && this._siblings.length > 1 && Z(e, this, null, 1, this._siblings);(this.vars.immediateRender || 0 === i && 0 === this._delay && this.vars.immediateRender !== !1) && (this._time = -_, this.render(-this._delay));}, !0), M=function M(e){return e && e.length && e !== t && e[0] && (e[0] === t || e[0].nodeType && e[0].style && !e.nodeType);}, z=function z(t, e){var i, s={};for(i in t) U[i] || i in e && "transform" !== i && "x" !== i && "y" !== i && "width" !== i && "height" !== i && "className" !== i && "border" !== i || !(!N[i] || N[i] && N[i]._autoCSS) || (s[i] = t[i], delete t[i]);t.css = s;};n = D.prototype = new A(), n.constructor = D, n.kill()._gc = !1, n.ratio = 0, n._firstPT = n._targets = n._overwrittenProps = n._startAt = null, n._notifyPluginsOfEnabled = n._lazy = !1, D.version = "1.16.1", D.defaultEase = n._ease = new T(null, null, 1, 1), D.defaultOverwrite = "auto", D.ticker = a, D.autoSleep = 120, D.lagSmoothing = function(t, e){a.lagSmoothing(t, e);}, D.selector = t.$ || t.jQuery || function(e){var i=t.$ || t.jQuery;return i?(D.selector = i, i(e)):"undefined" == typeof document?e:document.querySelectorAll?document.querySelectorAll(e):document.getElementById("#" === e.charAt(0)?e.substr(1):e);};var I=[], F={}, E=D._internals = {isArray:f, isSelector:M, lazyTweens:I}, N=D._plugins = {}, L=E.tweenLookup = {}, X=0, U=E.reservedProps = {ease:1, delay:1, overwrite:1, onComplete:1, onCompleteParams:1, onCompleteScope:1, useFrames:1, runBackwards:1, startAt:1, onUpdate:1, onUpdateParams:1, onUpdateScope:1, onStart:1, onStartParams:1, onStartScope:1, onReverseComplete:1, onReverseCompleteParams:1, onReverseCompleteScope:1, onRepeat:1, onRepeatParams:1, onRepeatScope:1, easeParams:1, yoyo:1, immediateRender:1, repeat:1, repeatDelay:1, data:1, paused:1, reversed:1, autoCSS:1, lazy:1, onOverwrite:1}, Y={none:0, all:1, auto:2, concurrent:3, allOnStart:4, preexisting:5, "true":1, "false":0}, j=A._rootFramesTimeline = new C(), B=A._rootTimeline = new C(), q=30, V=E.lazyRender = function(){var t, e=I.length;for(F = {}; --e > -1;) t = I[e], t && t._lazy !== !1 && (t.render(t._lazy[0], t._lazy[1], !0), t._lazy = !1);I.length = 0;};B._startTime = a.time, j._startTime = a.frame, B._active = j._active = !0, setTimeout(V, 1), A._updateRoot = D.render = function(){var t, e, i;if((I.length && V(), B.render((a.time - B._startTime) * B._timeScale, !1, !1), j.render((a.frame - j._startTime) * j._timeScale, !1, !1), I.length && V(), a.frame >= q)){q = a.frame + (parseInt(D.autoSleep, 10) || 120);for(i in L) {for(e = L[i].tweens, t = e.length; --t > -1;) e[t]._gc && e.splice(t, 1);0 === e.length && delete L[i];}if((i = B._first, (!i || i._paused) && D.autoSleep && !j._first && 1 === a._listeners.tick.length)){for(; i && i._paused;) i = i._next;i || a.sleep();}}}, a.addEventListener("tick", A._updateRoot);var G=function G(t, e, i){var s, r, n=t._gsTweenID;if((L[n || (t._gsTweenID = n = "t" + X++)] || (L[n] = {target:t, tweens:[]}), e && (s = L[n].tweens, s[r = s.length] = e, i)))for(; --r > -1;) s[r] === e && s.splice(r, 1);return L[n].tweens;}, W=function W(t, e, i, s){var r, n, a=t.vars.onOverwrite;return (a && (r = a(t, e, i, s)), a = D.onOverwrite, a && (n = a(t, e, i, s)), r !== !1 && n !== !1);}, Z=function Z(t, e, i, s, r){var n, a, o, h;if(1 === s || s >= 4){for(h = r.length, n = 0; h > n; n++) if((o = r[n]) !== e)o._gc || W(o, e) && o._enabled(!1, !1) && (a = !0);else if(5 === s)break;return a;}var l, u=e._startTime + _, p=[], f=0, c=0 === e._duration;for(n = r.length; --n > -1;) (o = r[n]) === e || o._gc || o._paused || (o._timeline !== e._timeline?(l = l || Q(e, 0, c), 0 === Q(o, l, c) && (p[f++] = o)):u >= o._startTime && o._startTime + o.totalDuration() / o._timeScale > u && ((c || !o._initted) && 2e-10 >= u - o._startTime || (p[f++] = o)));for(n = f; --n > -1;) if((o = p[n], 2 === s && o._kill(i, t, e) && (a = !0), 2 !== s || !o._firstPT && o._initted)){if(2 !== s && !W(o, e))continue;o._enabled(!1, !1) && (a = !0);}return a;}, Q=function Q(t, e, i){for(var s=t._timeline, r=s._timeScale, n=t._startTime; s._timeline;) {if((n += s._startTime, r *= s._timeScale, s._paused)){return -100;}s = s._timeline;}return (n /= r, n > e?n - e:i && n === e || !t._initted && 2 * _ > n - e?_:(n += t.totalDuration() / t._timeScale / r) > e + _?0:n - e - _);};n._init = function(){var t, e, i, s, r, n=this.vars, a=this._overwrittenProps, o=this._duration, h=!!n.immediateRender, l=n.ease;if(n.startAt){this._startAt && (this._startAt.render(-1, !0), this._startAt.kill()), r = {};for(s in n.startAt) r[s] = n.startAt[s];if((r.overwrite = !1, r.immediateRender = !0, r.lazy = h && n.lazy !== !1, r.startAt = r.delay = null, this._startAt = D.to(this.target, 0, r), h))if(this._time > 0)this._startAt = null;else if(0 !== o)return;}else if(n.runBackwards && 0 !== o)if(this._startAt)this._startAt.render(-1, !0), this._startAt.kill(), this._startAt = null;else {0 !== this._time && (h = !1), i = {};for(s in n) U[s] && "autoCSS" !== s || (i[s] = n[s]);if((i.overwrite = 0, i.data = "isFromStart", i.lazy = h && n.lazy !== !1, i.immediateRender = h, this._startAt = D.to(this.target, 0, i), h)){if(0 === this._time)return;}else this._startAt._init(), this._startAt._enabled(!1), this.vars.immediateRender && (this._startAt = null);}if((this._ease = l = l?l instanceof T?l:"function" == typeof l?new T(l, n.easeParams):w[l] || D.defaultEase:D.defaultEase, n.easeParams instanceof Array && l.config && (this._ease = l.config.apply(l, n.easeParams)), this._easeType = this._ease._type, this._easePower = this._ease._power, this._firstPT = null, this._targets))for(t = this._targets.length; --t > -1;) this._initProps(this._targets[t], this._propLookup[t] = {}, this._siblings[t], a?a[t]:null) && (e = !0);else e = this._initProps(this.target, this._propLookup, this._siblings, a);if((e && D._onPluginEvent("_onInitAllProps", this), a && (this._firstPT || "function" != typeof this.target && this._enabled(!1, !1)), n.runBackwards))for(i = this._firstPT; i;) i.s += i.c, i.c = -i.c, i = i._next;this._onUpdate = n.onUpdate, this._initted = !0;}, n._initProps = function(e, i, s, r){var n, a, o, h, l, _;if(null == e)return !1;F[e._gsTweenID] && V(), this.vars.css || e.style && e !== t && e.nodeType && N.css && this.vars.autoCSS !== !1 && z(this.vars, e);for(n in this.vars) {if((_ = this.vars[n], U[n]))_ && (_ instanceof Array || _.push && f(_)) && -1 !== _.join("").indexOf("{self}") && (this.vars[n] = _ = this._swapSelfInParams(_, this));else if(N[n] && (h = new N[n]())._onInitTween(e, this.vars[n], this)){for(this._firstPT = l = {_next:this._firstPT, t:h, p:"setRatio", s:0, c:1, f:!0, n:n, pg:!0, pr:h._priority}, a = h._overwriteProps.length; --a > -1;) i[h._overwriteProps[a]] = this._firstPT;(h._priority || h._onInitAllProps) && (o = !0), (h._onDisable || h._onEnable) && (this._notifyPluginsOfEnabled = !0);}else this._firstPT = i[n] = l = {_next:this._firstPT, t:e, p:n, f:"function" == typeof e[n], n:n, pg:!1, pr:0}, l.s = l.f?e[n.indexOf("set") || "function" != typeof e["get" + n.substr(3)]?n:"get" + n.substr(3)]():parseFloat(e[n]), l.c = "string" == typeof _ && "=" === _.charAt(1)?parseInt(_.charAt(0) + "1", 10) * Number(_.substr(2)):Number(_) - l.s || 0;l && l._next && (l._next._prev = l);}return r && this._kill(r, e)?this._initProps(e, i, s, r):this._overwrite > 1 && this._firstPT && s.length > 1 && Z(e, this, i, this._overwrite, s)?(this._kill(i, e), this._initProps(e, i, s, r)):(this._firstPT && (this.vars.lazy !== !1 && this._duration || this.vars.lazy && !this._duration) && (F[e._gsTweenID] = !0), o);}, n.render = function(t, e, i){var s, r, n, a, o=this._time, h=this._duration, l=this._rawPrevTime;if(t >= h)this._totalTime = this._time = h, this.ratio = this._ease._calcEnd?this._ease.getRatio(1):1, this._reversed || (s = !0, r = "onComplete", i = i || this._timeline.autoRemoveChildren), 0 === h && (this._initted || !this.vars.lazy || i) && (this._startTime === this._timeline._duration && (t = 0), (0 === t || 0 > l || l === _ && "isPause" !== this.data) && l !== t && (i = !0, l > _ && (r = "onReverseComplete")), this._rawPrevTime = a = !e || t || l === t?t:_);else if(1e-7 > t)this._totalTime = this._time = 0, this.ratio = this._ease._calcEnd?this._ease.getRatio(0):0, (0 !== o || 0 === h && l > 0) && (r = "onReverseComplete", s = this._reversed), 0 > t && (this._active = !1, 0 === h && (this._initted || !this.vars.lazy || i) && (l >= 0 && (l !== _ || "isPause" !== this.data) && (i = !0), this._rawPrevTime = a = !e || t || l === t?t:_)), this._initted || (i = !0);else if((this._totalTime = this._time = t, this._easeType)){var u=t / h, p=this._easeType, f=this._easePower;(1 === p || 3 === p && u >= 0.5) && (u = 1 - u), 3 === p && (u *= 2), 1 === f?u *= u:2 === f?u *= u * u:3 === f?u *= u * u * u:4 === f && (u *= u * u * u * u), this.ratio = 1 === p?1 - u:2 === p?u:0.5 > t / h?u / 2:1 - u / 2;}else this.ratio = this._ease.getRatio(t / h);if(this._time !== o || i){if(!this._initted){if((this._init(), !this._initted || this._gc))return;if(!i && this._firstPT && (this.vars.lazy !== !1 && this._duration || this.vars.lazy && !this._duration))return (this._time = this._totalTime = o, this._rawPrevTime = l, I.push(this), this._lazy = [t, e], void 0);this._time && !s?this.ratio = this._ease.getRatio(this._time / h):s && this._ease._calcEnd && (this.ratio = this._ease.getRatio(0 === this._time?0:1));}for(this._lazy !== !1 && (this._lazy = !1), this._active || !this._paused && this._time !== o && t >= 0 && (this._active = !0), 0 === o && (this._startAt && (t >= 0?this._startAt.render(t, e, i):r || (r = "_dummyGS")), this.vars.onStart && (0 !== this._time || 0 === h) && (e || this.vars.onStart.apply(this.vars.onStartScope || this, this.vars.onStartParams || y))), n = this._firstPT; n;) n.f?n.t[n.p](n.c * this.ratio + n.s):n.t[n.p] = n.c * this.ratio + n.s, n = n._next;this._onUpdate && (0 > t && this._startAt && t !== -0.0001 && this._startAt.render(t, e, i), e || (this._time !== o || s) && this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || y)), r && (!this._gc || i) && (0 > t && this._startAt && !this._onUpdate && t !== -0.0001 && this._startAt.render(t, e, i), s && (this._timeline.autoRemoveChildren && this._enabled(!1, !1), this._active = !1), !e && this.vars[r] && this.vars[r].apply(this.vars[r + "Scope"] || this, this.vars[r + "Params"] || y), 0 === h && this._rawPrevTime === _ && a !== _ && (this._rawPrevTime = 0));}}, n._kill = function(t, e, i){if(("all" === t && (t = null), null == t && (null == e || e === this.target)))return (this._lazy = !1, this._enabled(!1, !1));e = "string" != typeof e?e || this._targets || this.target:D.selector(e) || e;var s, r, n, a, o, h, l, _, u;if((f(e) || M(e)) && "number" != typeof e[0])for(s = e.length; --s > -1;) this._kill(t, e[s]) && (h = !0);else {if(this._targets){for(s = this._targets.length; --s > -1;) if(e === this._targets[s]){o = this._propLookup[s] || {}, this._overwrittenProps = this._overwrittenProps || [], r = this._overwrittenProps[s] = t?this._overwrittenProps[s] || {}:"all";break;}}else {if(e !== this.target)return !1;o = this._propLookup, r = this._overwrittenProps = t?this._overwrittenProps || {}:"all";}if(o){if((l = t || o, _ = t !== r && "all" !== r && t !== o && ("object" != typeof t || !t._tempKill), i && (D.onOverwrite || this.vars.onOverwrite))){for(n in l) o[n] && (u || (u = []), u.push(n));if(!W(this, i, e, u))return !1;}for(n in l) (a = o[n]) && (a.pg && a.t._kill(l) && (h = !0), a.pg && 0 !== a.t._overwriteProps.length || (a._prev?a._prev._next = a._next:a === this._firstPT && (this._firstPT = a._next), a._next && (a._next._prev = a._prev), a._next = a._prev = null), delete o[n]), _ && (r[n] = 1);!this._firstPT && this._initted && this._enabled(!1, !1);}}return h;}, n.invalidate = function(){return (this._notifyPluginsOfEnabled && D._onPluginEvent("_onDisable", this), this._firstPT = this._overwrittenProps = this._startAt = this._onUpdate = null, this._notifyPluginsOfEnabled = this._active = this._lazy = !1, this._propLookup = this._targets?{}:[], A.prototype.invalidate.call(this), this.vars.immediateRender && (this._time = -_, this.render(-this._delay)), this);}, n._enabled = function(t, e){if((o || a.wake(), t && this._gc)){var i, s=this._targets;if(s)for(i = s.length; --i > -1;) this._siblings[i] = G(s[i], this, !0);else this._siblings = G(this.target, this, !0);}return (A.prototype._enabled.call(this, t, e), this._notifyPluginsOfEnabled && this._firstPT?D._onPluginEvent(t?"_onEnable":"_onDisable", this):!1);}, D.to = function(t, e, i){return new D(t, e, i);}, D.from = function(t, e, i){return (i.runBackwards = !0, i.immediateRender = 0 != i.immediateRender, new D(t, e, i));}, D.fromTo = function(t, e, i, s){return (s.startAt = i, s.immediateRender = 0 != s.immediateRender && 0 != i.immediateRender, new D(t, e, s));}, D.delayedCall = function(t, e, i, s, r){return new D(e, 0, {delay:t, onComplete:e, onCompleteParams:i, onCompleteScope:s, onReverseComplete:e, onReverseCompleteParams:i, onReverseCompleteScope:s, immediateRender:!1, lazy:!1, useFrames:r, overwrite:0});}, D.set = function(t, e){return new D(t, 0, e);}, D.getTweensOf = function(t, e){if(null == t)return [];t = "string" != typeof t?t:D.selector(t) || t;var i, s, r, n;if((f(t) || M(t)) && "number" != typeof t[0]){for(i = t.length, s = []; --i > -1;) s = s.concat(D.getTweensOf(t[i], e));for(i = s.length; --i > -1;) for(n = s[i], r = i; --r > -1;) n === s[r] && s.splice(i, 1);}else for(s = G(t).concat(), i = s.length; --i > -1;) (s[i]._gc || e && !s[i].isActive()) && s.splice(i, 1);return s;}, D.killTweensOf = D.killDelayedCallsTo = function(t, e, i){"object" == typeof e && (i = e, e = !1);for(var s=D.getTweensOf(t, e), r=s.length; --r > -1;) s[r]._kill(i, t);};var $=g("plugins.TweenPlugin", function(t, e){this._overwriteProps = (t || "").split(","), this._propName = this._overwriteProps[0], this._priority = e || 0, this._super = $.prototype;}, !0);if((n = $.prototype, $.version = "1.10.1", $.API = 2, n._firstPT = null, n._addTween = function(t, e, i, s, r, n){var a, o;return null != s && (a = "number" == typeof s || "=" !== s.charAt(1)?Number(s) - i:parseInt(s.charAt(0) + "1", 10) * Number(s.substr(2)))?(this._firstPT = o = {_next:this._firstPT, t:t, p:e, s:i, c:a, f:"function" == typeof t[e], n:r || e, r:n}, o._next && (o._next._prev = o), o):void 0;}, n.setRatio = function(t){for(var e, i=this._firstPT, s=0.000001; i;) e = i.c * t + i.s, i.r?e = Math.round(e):s > e && e > -s && (e = 0), i.f?i.t[i.p](e):i.t[i.p] = e, i = i._next;}, n._kill = function(t){var e, i=this._overwriteProps, s=this._firstPT;if(null != t[this._propName])this._overwriteProps = [];else for(e = i.length; --e > -1;) null != t[i[e]] && i.splice(e, 1);for(; s;) null != t[s.n] && (s._next && (s._next._prev = s._prev), s._prev?(s._prev._next = s._next, s._prev = null):this._firstPT === s && (this._firstPT = s._next)), s = s._next;return !1;}, n._roundProps = function(t, e){for(var i=this._firstPT; i;) (t[this._propName] || null != i.n && t[i.n.split(this._propName + "_").join("")]) && (i.r = e), i = i._next;}, D._onPluginEvent = function(t, e){var i, s, r, n, a, o=e._firstPT;if("_onInitAllProps" === t){for(; o;) {for(a = o._next, s = r; s && s.pr > o.pr;) s = s._next;(o._prev = s?s._prev:n)?o._prev._next = o:r = o, (o._next = s)?s._prev = o:n = o, o = a;}o = e._firstPT = r;}for(; o;) o.pg && "function" == typeof o.t[t] && o.t[t]() && (i = !0), o = o._next;return i;}, $.activate = function(t){for(var e=t.length; --e > -1;) t[e].API === $.API && (N[new t[e]()._propName] = t[e]);return !0;}, d.plugin = function(t){if(!(t && t.propName && t.init && t.API))throw "illegal plugin definition.";var e, i=t.propName, s=t.priority || 0, r=t.overwriteProps, n={init:"_onInitTween", set:"setRatio", kill:"_kill", round:"_roundProps", initAll:"_onInitAllProps"}, a=g("plugins." + i.charAt(0).toUpperCase() + i.substr(1) + "Plugin", function(){$.call(this, i, s), this._overwriteProps = r || [];}, t.global === !0), o=a.prototype = new $(i);o.constructor = a, a.API = t.API;for(e in n) "function" == typeof t[e] && (o[n[e]] = t[e]);return (a.version = t.version, $.activate([a]), a);}, s = t._gsQueue)){for(r = 0; s.length > r; r++) s[r]();for(n in c) c[n].func || t.console.log("GSAP encountered missing dependency: com.greensock." + n);}o = !1;}})("undefined" != typeof module && module.exports && "undefined" != typeof global?global:undefined || window, "TweenMax");

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],83:[function(require,module,exports){
/**
 * This is the main entry point for KaTeX. Here, we expose functions for
 * rendering expressions either to DOM nodes or to markup strings.
 *
 * We also expose the ParseError class to check if errors thrown from KaTeX are
 * errors in the expression, or errors in javascript handling.
 */

"use strict";

var ParseError = require("./src/ParseError");
var Settings = require("./src/Settings");

var buildTree = require("./src/buildTree");
var parseTree = require("./src/parseTree");
var utils = require("./src/utils");

/**
 * Parse and build an expression, and place that expression in the DOM node
 * given.
 */
var render = function render(expression, baseNode, options) {
    utils.clearNode(baseNode);

    var settings = new Settings(options);

    var tree = parseTree(expression, settings);
    var node = buildTree(tree, expression, settings).toNode();

    baseNode.appendChild(node);
};

// KaTeX's styles don't work properly in quirks mode. Print out an error, and
// disable rendering.
if (typeof document !== "undefined") {
    if (document.compatMode !== "CSS1Compat") {
        typeof console !== "undefined" && console.warn("Warning: KaTeX doesn't work in quirks mode. Make sure your " + "website has a suitable doctype.");

        render = function () {
            throw new ParseError("KaTeX doesn't work in quirks mode.");
        };
    }
}

/**
 * Parse and build an expression, and return the markup for that.
 */
var renderToString = function renderToString(expression, options) {
    var settings = new Settings(options);

    var tree = parseTree(expression, settings);
    return buildTree(tree, expression, settings).toMarkup();
};

/**
 * Parse an expression and return the parse tree.
 */
var generateParseTree = function generateParseTree(expression, options) {
    var settings = new Settings(options);
    return parseTree(expression, settings);
};

module.exports = {
    render: render,
    renderToString: renderToString,
    /**
     * NOTE: This method is not currently recommended for public use.
     * The internal tree representation is unstable and is very likely
     * to change. Use at your own risk.
     */
    __parse: generateParseTree,
    ParseError: ParseError
};

},{"./src/ParseError":87,"./src/Settings":89,"./src/buildTree":94,"./src/parseTree":103,"./src/utils":105}],84:[function(require,module,exports){
/** @flow */

"use strict";

function getRelocatable(re) {
  // In the future, this could use a WeakMap instead of an expando.
  if (!re.__matchAtRelocatable) {
    // Disjunctions are the lowest-precedence operator, so we can make any
    // pattern match the empty string by appending `|()` to it:
    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-patterns
    var source = re.source + "|()";

    // We always make the new regex global.
    var flags = "g" + (re.ignoreCase ? "i" : "") + (re.multiline ? "m" : "") + (re.unicode ? "u" : "")
    // sticky (/.../y) doesn't make sense in conjunction with our relocation
    // logic, so we ignore it here.
    ;

    re.__matchAtRelocatable = new RegExp(source, flags);
  }
  return re.__matchAtRelocatable;
}

function matchAt(re, str, pos) {
  if (re.global || re.sticky) {
    throw new Error("matchAt(...): Only non-global regexes are supported");
  }
  var reloc = getRelocatable(re);
  reloc.lastIndex = pos;
  var match = reloc.exec(str);
  // Last capturing group is our sentinel that indicates whether the regex
  // matched at the given location.
  if (match[match.length - 1] == null) {
    // Original regex matched.
    match.length = match.length - 1;
    return match;
  } else {
    return null;
  }
}

module.exports = matchAt;
},{}],85:[function(require,module,exports){
/**
 * The Lexer class handles tokenizing the input in various ways. Since our
 * parser expects us to be able to backtrack, the lexer allows lexing from any
 * given starting point.
 *
 * Its main exposed function is the `lex` function, which takes a position to
 * lex from and a type of token to lex. It defers to the appropriate `_innerLex`
 * function.
 *
 * The various `_innerLex` functions perform the actual lexing of different
 * kinds.
 */

"use strict";

var matchAt = require("match-at");

var ParseError = require("./ParseError");

// The main lexer class
function Lexer(input) {
    this._input = input;
}

// The resulting token returned from `lex`.
function Token(text, data, position) {
    this.text = text;
    this.data = data;
    this.position = position;
}

// "normal" types of tokens. These are tokens which can be matched by a simple
// regex
var mathNormals = [/[/|@.""`0-9a-zA-Z]/, // ords
/[*+-]/, // bins
/[=<>:]/, // rels
/[,;]/, // punctuation
/['\^_{}]/, // misc
/[(\[]/, // opens
/[)\]?!]/, // closes
/~/, // spacing
/&/, // horizontal alignment
/\\\\/ // line break
];

// These are "normal" tokens like above, but should instead be parsed in text
// mode.
var textNormals = [/[a-zA-Z0-9`!@*()-=+\[\]'";:?\/.,]/, // ords
/[{}]/, // grouping
/~/, // spacing
/&/, // horizontal alignment
/\\\\/ // line break
];

// Regexes for matching whitespace
var whitespaceRegex = /\s*/;
var whitespaceConcatRegex = / +|\\  +/;

// This regex matches any other TeX function, which is a backslash followed by a
// word or a single symbol
var anyFunc = /\\(?:[a-zA-Z]+|.)/;

/**
 * This function lexes a single normal token. It takes a position, a list of
 * "normal" tokens to try, and whether it should completely ignore whitespace or
 * not.
 */
Lexer.prototype._innerLex = function (pos, normals, ignoreWhitespace) {
    var input = this._input;
    var whitespace;

    if (ignoreWhitespace) {
        // Get rid of whitespace.
        whitespace = matchAt(whitespaceRegex, input, pos)[0];
        pos += whitespace.length;
    } else {
        // Do the funky concatenation of whitespace that happens in text mode.
        whitespace = matchAt(whitespaceConcatRegex, input, pos);
        if (whitespace !== null) {
            return new Token(" ", null, pos + whitespace[0].length);
        }
    }

    // If there's no more input to parse, return an EOF token
    if (pos === input.length) {
        return new Token("EOF", null, pos);
    }

    var match;
    if (match = matchAt(anyFunc, input, pos)) {
        // If we match a function token, return it
        return new Token(match[0], null, pos + match[0].length);
    } else {
        // Otherwise, we look through the normal token regexes and see if it's
        // one of them.
        for (var i = 0; i < normals.length; i++) {
            var normal = normals[i];

            if (match = matchAt(normal, input, pos)) {
                // If it is, return it
                return new Token(match[0], null, pos + match[0].length);
            }
        }
    }

    throw new ParseError("Unexpected character: '" + input[pos] + "'", this, pos);
};

// A regex to match a CSS color (like #ffffff or BlueViolet)
var cssColor = /#[a-z0-9]+|[a-z]+/i;

/**
 * This function lexes a CSS color.
 */
Lexer.prototype._innerLexColor = function (pos) {
    var input = this._input;

    // Ignore whitespace
    var whitespace = matchAt(whitespaceRegex, input, pos)[0];
    pos += whitespace.length;

    var match;
    if (match = matchAt(cssColor, input, pos)) {
        // If we look like a color, return a color
        return new Token(match[0], null, pos + match[0].length);
    } else {
        throw new ParseError("Invalid color", this, pos);
    }
};

// A regex to match a dimension. Dimensions look like
// "1.2em" or ".4pt" or "1 ex"
var sizeRegex = /(-?)\s*(\d+(?:\.\d*)?|\.\d+)\s*([a-z]{2})/;

/**
 * This function lexes a dimension.
 */
Lexer.prototype._innerLexSize = function (pos) {
    var input = this._input;

    // Ignore whitespace
    var whitespace = matchAt(whitespaceRegex, input, pos)[0];
    pos += whitespace.length;

    var match;
    if (match = matchAt(sizeRegex, input, pos)) {
        var unit = match[3];
        // We only currently handle "em" and "ex" units
        if (unit !== "em" && unit !== "ex") {
            throw new ParseError("Invalid unit: '" + unit + "'", this, pos);
        }
        return new Token(match[0], {
            number: +(match[1] + match[2]),
            unit: unit
        }, pos + match[0].length);
    }

    throw new ParseError("Invalid size", this, pos);
};

/**
 * This function lexes a string of whitespace.
 */
Lexer.prototype._innerLexWhitespace = function (pos) {
    var input = this._input;

    var whitespace = matchAt(whitespaceRegex, input, pos)[0];
    pos += whitespace.length;

    return new Token(whitespace[0], null, pos);
};

/**
 * This function lexes a single token starting at `pos` and of the given mode.
 * Based on the mode, we defer to one of the `_innerLex` functions.
 */
Lexer.prototype.lex = function (pos, mode) {
    if (mode === "math") {
        return this._innerLex(pos, mathNormals, true);
    } else if (mode === "text") {
        return this._innerLex(pos, textNormals, false);
    } else if (mode === "color") {
        return this._innerLexColor(pos);
    } else if (mode === "size") {
        return this._innerLexSize(pos);
    } else if (mode === "whitespace") {
        return this._innerLexWhitespace(pos);
    }
};

module.exports = Lexer;

},{"./ParseError":87,"match-at":84}],86:[function(require,module,exports){
/**
 * This file contains information about the options that the Parser carries
 * around with it while parsing. Data is held in an `Options` object, and when
 * recursing, a new `Options` object can be created with the `.with*` and
 * `.reset` functions.
 */

/**
 * This is the main options class. It contains the style, size, color, and font
 * of the current parse level. It also contains the style and size of the parent
 * parse level, so size changes can be handled efficiently.
 *
 * Each of the `.with*` and `.reset` functions passes its current style and size
 * as the parentStyle and parentSize of the new options class, so parent
 * handling is taken care of automatically.
 */
"use strict";

function Options(data) {
    this.style = data.style;
    this.color = data.color;
    this.size = data.size;
    this.phantom = data.phantom;
    this.font = data.font;

    if (data.parentStyle === undefined) {
        this.parentStyle = data.style;
    } else {
        this.parentStyle = data.parentStyle;
    }

    if (data.parentSize === undefined) {
        this.parentSize = data.size;
    } else {
        this.parentSize = data.parentSize;
    }
}

/**
 * Returns a new options object with the same properties as "this".  Properties
 * from "extension" will be copied to the new options object.
 */
Options.prototype.extend = function (extension) {
    var data = {
        style: this.style,
        size: this.size,
        color: this.color,
        parentStyle: this.style,
        parentSize: this.size,
        phantom: this.phantom,
        font: this.font
    };

    for (var key in extension) {
        if (extension.hasOwnProperty(key)) {
            data[key] = extension[key];
        }
    }

    return new Options(data);
};

/**
 * Create a new options object with the given style.
 */
Options.prototype.withStyle = function (style) {
    return this.extend({
        style: style
    });
};

/**
 * Create a new options object with the given size.
 */
Options.prototype.withSize = function (size) {
    return this.extend({
        size: size
    });
};

/**
 * Create a new options object with the given color.
 */
Options.prototype.withColor = function (color) {
    return this.extend({
        color: color
    });
};

/**
 * Create a new options object with "phantom" set to true.
 */
Options.prototype.withPhantom = function () {
    return this.extend({
        phantom: true
    });
};

/**
 * Create a new options objects with the give font.
 */
Options.prototype.withFont = function (font) {
    return this.extend({
        font: font
    });
};

/**
 * Create a new options object with the same style, size, and color. This is
 * used so that parent style and size changes are handled correctly.
 */
Options.prototype.reset = function () {
    return this.extend({});
};

/**
 * A map of color names to CSS colors.
 * TODO(emily): Remove this when we have real macros
 */
var colorMap = {
    "katex-blue": "#6495ed",
    "katex-orange": "#ffa500",
    "katex-pink": "#ff00af",
    "katex-red": "#df0030",
    "katex-green": "#28ae7b",
    "katex-gray": "gray",
    "katex-purple": "#9d38bd",
    "katex-blueA": "#c7e9f1",
    "katex-blueB": "#9cdceb",
    "katex-blueC": "#58c4dd",
    "katex-blueD": "#29abca",
    "katex-blueE": "#1c758a",
    "katex-tealA": "#acead7",
    "katex-tealB": "#76ddc0",
    "katex-tealC": "#5cd0b3",
    "katex-tealD": "#55c1a7",
    "katex-tealE": "#49a88f",
    "katex-greenA": "#c9e2ae",
    "katex-greenB": "#a6cf8c",
    "katex-greenC": "#83c167",
    "katex-greenD": "#77b05d",
    "katex-greenE": "#699c52",
    "katex-goldA": "#f7c797",
    "katex-goldB": "#f9b775",
    "katex-goldC": "#f0ac5f",
    "katex-goldD": "#e1a158",
    "katex-goldE": "#c78d46",
    "katex-redA": "#f7a1a3",
    "katex-redB": "#ff8080",
    "katex-redC": "#fc6255",
    "katex-redD": "#e65a4c",
    "katex-redE": "#cf5044",
    "katex-maroonA": "#ecabc1",
    "katex-maroonB": "#ec92ab",
    "katex-maroonC": "#c55f73",
    "katex-maroonD": "#a24d61",
    "katex-maroonE": "#94424f",
    "katex-purpleA": "#caa3e8",
    "katex-purpleB": "#b189c6",
    "katex-purpleC": "#9a72ac",
    "katex-purpleD": "#715582",
    "katex-purpleE": "#644172",
    "katex-mintA": "#f5f9e8",
    "katex-mintB": "#edf2df",
    "katex-mintC": "#e0e5cc",
    "katex-grayA": "#fdfdfd",
    "katex-grayB": "#f7f7f7",
    "katex-grayC": "#eeeeee",
    "katex-grayD": "#dddddd",
    "katex-grayE": "#cccccc",
    "katex-grayF": "#aaaaaa",
    "katex-grayG": "#999999",
    "katex-grayH": "#555555",
    "katex-grayI": "#333333",
    "katex-kaBlue": "#314453",
    "katex-kaGreen": "#639b24"
};

/**
 * Gets the CSS color of the current options object, accounting for the
 * `colorMap`.
 */
Options.prototype.getColor = function () {
    if (this.phantom) {
        return "transparent";
    } else {
        return colorMap[this.color] || this.color;
    }
};

module.exports = Options;

},{}],87:[function(require,module,exports){
/**
 * This is the ParseError class, which is the main error thrown by KaTeX
 * functions when something has gone wrong. This is used to distinguish internal
 * errors from errors in the expression that the user provided.
 */
"use strict";

function ParseError(message, lexer, position) {
    var error = "KaTeX parse error: " + message;

    if (lexer !== undefined && position !== undefined) {
        // If we have the input and a position, make the error a bit fancier

        // Prepend some information
        error += " at position " + position + ": ";

        // Get the input
        var input = lexer._input;
        // Insert a combining underscore at the correct position
        input = input.slice(0, position) + "̲" + input.slice(position);

        // Extract some context from the input and add it to the error
        var begin = Math.max(0, position - 15);
        var end = position + 15;
        error += input.slice(begin, end);
    }

    // Some hackery to make ParseError a prototype of Error
    // See http://stackoverflow.com/a/8460753
    var self = new Error(error);
    self.name = "ParseError";
    self.__proto__ = ParseError.prototype;

    self.position = position;
    return self;
}

// More hackery
ParseError.prototype.__proto__ = Error.prototype;

module.exports = ParseError;

},{}],88:[function(require,module,exports){
"use strict";

var functions = require("./functions");
var environments = require("./environments");
var Lexer = require("./Lexer");
var symbols = require("./symbols");
var utils = require("./utils");

var parseData = require("./parseData");
var ParseError = require("./ParseError");

/**
 * This file contains the parser used to parse out a TeX expression from the
 * input. Since TeX isn't context-free, standard parsers don't work particularly
 * well.
 *
 * The strategy of this parser is as such:
 *
 * The main functions (the `.parse...` ones) take a position in the current
 * parse string to parse tokens from. The lexer (found in Lexer.js, stored at
 * this.lexer) also supports pulling out tokens at arbitrary places. When
 * individual tokens are needed at a position, the lexer is called to pull out a
 * token, which is then used.
 *
 * The main functions also take a mode that the parser is currently in
 * (currently "math" or "text"), which denotes whether the current environment
 * is a math-y one or a text-y one (e.g. inside \text). Currently, this serves
 * to limit the functions which can be used in text mode.
 *
 * The main functions then return an object which contains the useful data that
 * was parsed at its given point, and a new position at the end of the parsed
 * data. The main functions can call each other and continue the parsing by
 * using the returned position as a new starting point.
 *
 * There are also extra `.handle...` functions, which pull out some reused
 * functionality into self-contained functions.
 *
 * The earlier functions return `ParseResult`s, which contain a ParseNode and a
 * new position.
 *
 * The later functions (which are called deeper in the parse) sometimes return
 * ParseFuncOrArgument, which contain a ParseResult as well as some data about
 * whether the parsed object is a function which is missing some arguments, or a
 * standalone object which can be used as an argument to another function.
 */

/**
 * Main Parser class
 */
function Parser(input, settings) {
    // Make a new lexer
    this.lexer = new Lexer(input);
    // Store the settings for use in parsing
    this.settings = settings;
}

var ParseNode = parseData.ParseNode;
var ParseResult = parseData.ParseResult;

/**
 * An initial function (without its arguments), or an argument to a function.
 * The `result` argument should be a ParseResult.
 */
function ParseFuncOrArgument(result, isFunction) {
    this.result = result;
    // Is this a function (i.e. is it something defined in functions.js)?
    this.isFunction = isFunction;
}

/**
 * Checks a result to make sure it has the right type, and throws an
 * appropriate error otherwise.
 */
Parser.prototype.expect = function (result, text) {
    if (result.text !== text) {
        throw new ParseError("Expected '" + text + "', got '" + result.text + "'", this.lexer, result.position);
    }
};

/**
 * Main parsing function, which parses an entire input.
 *
 * @return {?Array.<ParseNode>}
 */
Parser.prototype.parse = function (input) {
    // Try to parse the input
    var parse = this.parseInput(0, "math");
    return parse.result;
};

/**
 * Parses an entire input tree.
 */
Parser.prototype.parseInput = function (pos, mode) {
    // Parse an expression
    var expression = this.parseExpression(pos, mode, false);
    // If we succeeded, make sure there's an EOF at the end
    this.expect(expression.peek, "EOF");
    return expression;
};

var endOfExpression = ["}", "\\end", "\\right", "&", "\\\\", "\\cr"];

/**
 * Parses an "expression", which is a list of atoms.
 *
 * @param {boolean} breakOnInfix Should the parsing stop when we hit infix
 *                  nodes? This happens when functions have higher precendence
 *                  than infix nodes in implicit parses.
 *
 * @param {?string} breakOnToken The token that the expression should end with,
 *                  or `null` if something else should end the expression.
 *
 * @return {ParseResult}
 */
Parser.prototype.parseExpression = function (pos, mode, breakOnInfix, breakOnToken) {
    var body = [];
    var lex = null;
    // Keep adding atoms to the body until we can't parse any more atoms (either
    // we reached the end, a }, or a \right)
    while (true) {
        lex = this.lexer.lex(pos, mode);
        if (endOfExpression.indexOf(lex.text) !== -1) {
            break;
        }
        if (breakOnToken && lex.text === breakOnToken) {
            break;
        }
        var atom = this.parseAtom(pos, mode);
        if (!atom) {
            if (!this.settings.throwOnError && lex.text[0] === "\\") {
                var errorNode = this.handleUnsupportedCmd(lex.text, mode);
                body.push(errorNode);

                pos = lex.position;
                continue;
            }

            break;
        }
        if (breakOnInfix && atom.result.type === "infix") {
            break;
        }
        body.push(atom.result);
        pos = atom.position;
    }
    var res = new ParseResult(this.handleInfixNodes(body, mode), pos);
    res.peek = lex;
    return res;
};

/**
 * Rewrites infix operators such as \over with corresponding commands such
 * as \frac.
 *
 * There can only be one infix operator per group.  If there's more than one
 * then the expression is ambiguous.  This can be resolved by adding {}.
 *
 * @returns {Array}
 */
Parser.prototype.handleInfixNodes = function (body, mode) {
    var overIndex = -1;
    var func;
    var funcName;

    for (var i = 0; i < body.length; i++) {
        var node = body[i];
        if (node.type === "infix") {
            if (overIndex !== -1) {
                throw new ParseError("only one infix operator per group", this.lexer, -1);
            }
            overIndex = i;
            funcName = node.value.replaceWith;
            func = functions.funcs[funcName];
        }
    }

    if (overIndex !== -1) {
        var numerNode, denomNode;

        var numerBody = body.slice(0, overIndex);
        var denomBody = body.slice(overIndex + 1);

        if (numerBody.length === 1 && numerBody[0].type === "ordgroup") {
            numerNode = numerBody[0];
        } else {
            numerNode = new ParseNode("ordgroup", numerBody, mode);
        }

        if (denomBody.length === 1 && denomBody[0].type === "ordgroup") {
            denomNode = denomBody[0];
        } else {
            denomNode = new ParseNode("ordgroup", denomBody, mode);
        }

        var value = func.handler(funcName, numerNode, denomNode);
        return [new ParseNode(value.type, value, mode)];
    } else {
        return body;
    }
};

// The greediness of a superscript or subscript
var SUPSUB_GREEDINESS = 1;

/**
 * Handle a subscript or superscript with nice errors.
 */
Parser.prototype.handleSupSubscript = function (pos, mode, symbol, name) {
    var group = this.parseGroup(pos, mode);

    if (!group) {
        var lex = this.lexer.lex(pos, mode);

        if (!this.settings.throwOnError && lex.text[0] === "\\") {
            return new ParseResult(this.handleUnsupportedCmd(lex.text, mode), lex.position);
        } else {
            throw new ParseError("Expected group after '" + symbol + "'", this.lexer, pos);
        }
    } else if (group.isFunction) {
        // ^ and _ have a greediness, so handle interactions with functions'
        // greediness
        var funcGreediness = functions.funcs[group.result.result].greediness;
        if (funcGreediness > SUPSUB_GREEDINESS) {
            return this.parseFunction(pos, mode);
        } else {
            throw new ParseError("Got function '" + group.result.result + "' with no arguments " + "as " + name, this.lexer, pos);
        }
    } else {
        return group.result;
    }
};

/**
 * Converts the textual input of an unsupported command into a text node
 * contained within a color node whose color is determined by errorColor
 */
Parser.prototype.handleUnsupportedCmd = function (text, mode) {
    var textordArray = [];

    for (var i = 0; i < text.length; i++) {
        textordArray.push(new ParseNode("textord", text[i], "text"));
    }

    var textNode = new ParseNode("text", {
        body: textordArray,
        type: "text"
    }, mode);

    var colorNode = new ParseNode("color", {
        color: this.settings.errorColor,
        value: [textNode],
        type: "color"
    }, mode);

    return colorNode;
};

/**
 * Parses a group with optional super/subscripts.
 *
 * @return {?ParseResult}
 */
Parser.prototype.parseAtom = function (pos, mode) {
    // The body of an atom is an implicit group, so that things like
    // \left(x\right)^2 work correctly.
    var base = this.parseImplicitGroup(pos, mode);

    // In text mode, we don't have superscripts or subscripts
    if (mode === "text") {
        return base;
    }

    // Handle an empty base
    var currPos;
    if (!base) {
        currPos = pos;
        base = undefined;
    } else {
        currPos = base.position;
    }

    var superscript;
    var subscript;
    var result;
    while (true) {
        // Lex the first token
        var lex = this.lexer.lex(currPos, mode);

        if (lex.text === "\\limits" || lex.text === "\\nolimits") {
            // We got a limit control
            if (!base || base.result.type !== "op") {
                throw new ParseError("Limit controls must follow a math operator", this.lexer, currPos);
            } else {
                var limits = lex.text === "\\limits";
                base.result.value.limits = limits;
                base.result.value.alwaysHandleSupSub = true;
                currPos = lex.position;
            }
        } else if (lex.text === "^") {
            // We got a superscript start
            if (superscript) {
                throw new ParseError("Double superscript", this.lexer, currPos);
            }
            result = this.handleSupSubscript(lex.position, mode, lex.text, "superscript");
            currPos = result.position;
            superscript = result.result;
        } else if (lex.text === "_") {
            // We got a subscript start
            if (subscript) {
                throw new ParseError("Double subscript", this.lexer, currPos);
            }
            result = this.handleSupSubscript(lex.position, mode, lex.text, "subscript");
            currPos = result.position;
            subscript = result.result;
        } else if (lex.text === "'") {
            // We got a prime
            var prime = new ParseNode("textord", "\\prime", mode);

            // Many primes can be grouped together, so we handle this here
            var primes = [prime];
            currPos = lex.position;
            // Keep lexing tokens until we get something that's not a prime
            while ((lex = this.lexer.lex(currPos, mode)).text === "'") {
                // For each one, add another prime to the list
                primes.push(prime);
                currPos = lex.position;
            }
            // Put them into an ordgroup as the superscript
            superscript = new ParseNode("ordgroup", primes, mode);
        } else {
            // If it wasn't ^, _, or ', stop parsing super/subscripts
            break;
        }
    }

    if (superscript || subscript) {
        // If we got either a superscript or subscript, create a supsub
        return new ParseResult(new ParseNode("supsub", {
            base: base && base.result,
            sup: superscript,
            sub: subscript
        }, mode), currPos);
    } else {
        // Otherwise return the original body
        return base;
    }
};

// A list of the size-changing functions, for use in parseImplicitGroup
var sizeFuncs = ["\\tiny", "\\scriptsize", "\\footnotesize", "\\small", "\\normalsize", "\\large", "\\Large", "\\LARGE", "\\huge", "\\Huge"];

// A list of the style-changing functions, for use in parseImplicitGroup
var styleFuncs = ["\\displaystyle", "\\textstyle", "\\scriptstyle", "\\scriptscriptstyle"];

/**
 * Parses an implicit group, which is a group that starts at the end of a
 * specified, and ends right before a higher explicit group ends, or at EOL. It
 * is used for functions that appear to affect the current style, like \Large or
 * \textrm, where instead of keeping a style we just pretend that there is an
 * implicit grouping after it until the end of the group. E.g.
 *   small text {\Large large text} small text again
 * It is also used for \left and \right to get the correct grouping.
 *
 * @return {?ParseResult}
 */
Parser.prototype.parseImplicitGroup = function (pos, mode) {
    var start = this.parseSymbol(pos, mode);

    if (!start || !start.result) {
        // If we didn't get anything we handle, fall back to parseFunction
        return this.parseFunction(pos, mode);
    }

    var func = start.result.result;
    var body;

    if (func === "\\left") {
        // If we see a left:
        // Parse the entire left function (including the delimiter)
        var left = this.parseFunction(pos, mode);
        // Parse out the implicit body
        body = this.parseExpression(left.position, mode, false);
        // Check the next token
        this.expect(body.peek, "\\right");
        var right = this.parseFunction(body.position, mode);
        return new ParseResult(new ParseNode("leftright", {
            body: body.result,
            left: left.result.value.value,
            right: right.result.value.value
        }, mode), right.position);
    } else if (func === "\\begin") {
        // begin...end is similar to left...right
        var begin = this.parseFunction(pos, mode);
        var envName = begin.result.value.name;
        if (!environments.hasOwnProperty(envName)) {
            throw new ParseError("No such environment: " + envName, this.lexer, begin.result.value.namepos);
        }
        // Build the environment object. Arguments and other information will
        // be made available to the begin and end methods using properties.
        var env = environments[envName];
        var args = [null, mode, envName];
        var newPos = this.parseArguments(begin.position, mode, "\\begin{" + envName + "}", env, args);
        args[0] = newPos;
        var result = env.handler.apply(this, args);
        var endLex = this.lexer.lex(result.position, mode);
        this.expect(endLex, "\\end");
        var end = this.parseFunction(result.position, mode);
        if (end.result.value.name !== envName) {
            throw new ParseError("Mismatch: \\begin{" + envName + "} matched " + "by \\end{" + end.result.value.name + "}", this.lexer, end.namepos);
        }
        result.position = end.position;
        return result;
    } else if (utils.contains(sizeFuncs, func)) {
        // If we see a sizing function, parse out the implict body
        body = this.parseExpression(start.result.position, mode, false);
        return new ParseResult(new ParseNode("sizing", {
            // Figure out what size to use based on the list of functions above
            size: "size" + (utils.indexOf(sizeFuncs, func) + 1),
            value: body.result
        }, mode), body.position);
    } else if (utils.contains(styleFuncs, func)) {
        // If we see a styling function, parse out the implict body
        body = this.parseExpression(start.result.position, mode, true);
        return new ParseResult(new ParseNode("styling", {
            // Figure out what style to use by pulling out the style from
            // the function name
            style: func.slice(1, func.length - 5),
            value: body.result
        }, mode), body.position);
    } else {
        // Defer to parseFunction if it's not a function we handle
        return this.parseFunction(pos, mode);
    }
};

/**
 * Parses an entire function, including its base and all of its arguments
 *
 * @return {?ParseResult}
 */
Parser.prototype.parseFunction = function (pos, mode) {
    var baseGroup = this.parseGroup(pos, mode);

    if (baseGroup) {
        if (baseGroup.isFunction) {
            var func = baseGroup.result.result;
            var funcData = functions.funcs[func];
            if (mode === "text" && !funcData.allowedInText) {
                throw new ParseError("Can't use function '" + func + "' in text mode", this.lexer, baseGroup.position);
            }

            var args = [func];
            var newPos = this.parseArguments(baseGroup.result.position, mode, func, funcData, args);
            var result = functions.funcs[func].handler.apply(this, args);
            return new ParseResult(new ParseNode(result.type, result, mode), newPos);
        } else {
            return baseGroup.result;
        }
    } else {
        return null;
    }
};

/**
 * Parses the arguments of a function or environment
 *
 * @param {string} func  "\name" or "\begin{name}"
 * @param {{numArgs:number,numOptionalArgs:number|undefined}} funcData
 * @param {Array} args  list of arguments to which new ones will be pushed
 * @return the position after all arguments have been parsed
 */
Parser.prototype.parseArguments = function (pos, mode, func, funcData, args) {
    var totalArgs = funcData.numArgs + funcData.numOptionalArgs;
    if (totalArgs === 0) {
        return pos;
    }

    var newPos = pos;
    var baseGreediness = funcData.greediness;
    var positions = [newPos];

    for (var i = 0; i < totalArgs; i++) {
        var argType = funcData.argTypes && funcData.argTypes[i];
        var arg;
        if (i < funcData.numOptionalArgs) {
            if (argType) {
                arg = this.parseSpecialGroup(newPos, argType, mode, true);
            } else {
                arg = this.parseOptionalGroup(newPos, mode);
            }
            if (!arg) {
                args.push(null);
                positions.push(newPos);
                continue;
            }
        } else {
            if (argType) {
                arg = this.parseSpecialGroup(newPos, argType, mode);
            } else {
                arg = this.parseGroup(newPos, mode);
            }
            if (!arg) {
                var lex = this.lexer.lex(newPos, mode);

                if (!this.settings.throwOnError && lex.text[0] === "\\") {
                    arg = new ParseFuncOrArgument(new ParseResult(this.handleUnsupportedCmd(lex.text, mode), lex.position), false);
                } else {
                    throw new ParseError("Expected group after '" + func + "'", this.lexer, pos);
                }
            }
        }
        var argNode;
        if (arg.isFunction) {
            var argGreediness = functions.funcs[arg.result.result].greediness;
            if (argGreediness > baseGreediness) {
                argNode = this.parseFunction(newPos, mode);
            } else {
                throw new ParseError("Got function '" + arg.result.result + "' as " + "argument to '" + func + "'", this.lexer, arg.result.position - 1);
            }
        } else {
            argNode = arg.result;
        }
        args.push(argNode.result);
        positions.push(argNode.position);
        newPos = argNode.position;
    }

    args.push(positions);

    return newPos;
};

/**
 * Parses a group when the mode is changing. Takes a position, a new mode, and
 * an outer mode that is used to parse the outside.
 *
 * @return {?ParseFuncOrArgument}
 */
Parser.prototype.parseSpecialGroup = function (pos, mode, outerMode, optional) {
    // Handle `original` argTypes
    if (mode === "original") {
        mode = outerMode;
    }

    if (mode === "color" || mode === "size") {
        // color and size modes are special because they should have braces and
        // should only lex a single symbol inside
        var openBrace = this.lexer.lex(pos, outerMode);
        if (optional && openBrace.text !== "[") {
            // optional arguments should return null if they don't exist
            return null;
        }
        this.expect(openBrace, optional ? "[" : "{");
        var inner = this.lexer.lex(openBrace.position, mode);
        var data;
        if (mode === "color") {
            data = inner.text;
        } else {
            data = inner.data;
        }
        var closeBrace = this.lexer.lex(inner.position, outerMode);
        this.expect(closeBrace, optional ? "]" : "}");
        return new ParseFuncOrArgument(new ParseResult(new ParseNode(mode, data, outerMode), closeBrace.position), false);
    } else if (mode === "text") {
        // text mode is special because it should ignore the whitespace before
        // it
        var whitespace = this.lexer.lex(pos, "whitespace");
        pos = whitespace.position;
    }

    if (optional) {
        return this.parseOptionalGroup(pos, mode);
    } else {
        return this.parseGroup(pos, mode);
    }
};

/**
 * Parses a group, which is either a single nucleus (like "x") or an expression
 * in braces (like "{x+y}")
 *
 * @return {?ParseFuncOrArgument}
 */
Parser.prototype.parseGroup = function (pos, mode) {
    var start = this.lexer.lex(pos, mode);
    // Try to parse an open brace
    if (start.text === "{") {
        // If we get a brace, parse an expression
        var expression = this.parseExpression(start.position, mode, false);
        // Make sure we get a close brace
        var closeBrace = this.lexer.lex(expression.position, mode);
        this.expect(closeBrace, "}");
        return new ParseFuncOrArgument(new ParseResult(new ParseNode("ordgroup", expression.result, mode), closeBrace.position), false);
    } else {
        // Otherwise, just return a nucleus
        return this.parseSymbol(pos, mode);
    }
};

/**
 * Parses a group, which is an expression in brackets (like "[x+y]")
 *
 * @return {?ParseFuncOrArgument}
 */
Parser.prototype.parseOptionalGroup = function (pos, mode) {
    var start = this.lexer.lex(pos, mode);
    // Try to parse an open bracket
    if (start.text === "[") {
        // If we get a brace, parse an expression
        var expression = this.parseExpression(start.position, mode, false, "]");
        // Make sure we get a close bracket
        var closeBracket = this.lexer.lex(expression.position, mode);
        this.expect(closeBracket, "]");
        return new ParseFuncOrArgument(new ParseResult(new ParseNode("ordgroup", expression.result, mode), closeBracket.position), false);
    } else {
        // Otherwise, return null,
        return null;
    }
};

/**
 * Parse a single symbol out of the string. Here, we handle both the functions
 * we have defined, as well as the single character symbols
 *
 * @return {?ParseFuncOrArgument}
 */
Parser.prototype.parseSymbol = function (pos, mode) {
    var nucleus = this.lexer.lex(pos, mode);

    if (functions.funcs[nucleus.text]) {
        // If there exists a function with this name, we return the function and
        // say that it is a function.
        return new ParseFuncOrArgument(new ParseResult(nucleus.text, nucleus.position), true);
    } else if (symbols[mode][nucleus.text]) {
        // Otherwise if this is a no-argument function, find the type it
        // corresponds to in the symbols map
        return new ParseFuncOrArgument(new ParseResult(new ParseNode(symbols[mode][nucleus.text].group, nucleus.text, mode), nucleus.position), false);
    } else {
        return null;
    }
};

Parser.prototype.ParseNode = ParseNode;

module.exports = Parser;

},{"./Lexer":85,"./ParseError":87,"./environments":97,"./functions":100,"./parseData":102,"./symbols":104,"./utils":105}],89:[function(require,module,exports){
/**
 * This is a module for storing settings passed into KaTeX. It correctly handles
 * default settings.
 */

/**
 * Helper function for getting a default value if the value is undefined
 */
"use strict";

function get(option, defaultValue) {
  return option === undefined ? defaultValue : option;
}

/**
 * The main Settings object
 *
 * The current options stored are:
 *  - displayMode: Whether the expression should be typeset by default in
 *                 textstyle or displaystyle (default false)
 */
function Settings(options) {
  // allow null options
  options = options || {};
  this.displayMode = get(options.displayMode, false);
  this.throwOnError = get(options.throwOnError, true);
  this.errorColor = get(options.errorColor, "#cc0000");
}

module.exports = Settings;

},{}],90:[function(require,module,exports){
/**
 * This file contains information and classes for the various kinds of styles
 * used in TeX. It provides a generic `Style` class, which holds information
 * about a specific style. It then provides instances of all the different kinds
 * of styles possible, and provides functions to move between them and get
 * information about them.
 */

/**
 * The main style class. Contains a unique id for the style, a size (which is
 * the same for cramped and uncramped version of a style), a cramped flag, and a
 * size multiplier, which gives the size difference between a style and
 * textstyle.
 */
"use strict";

function Style(id, size, multiplier, cramped) {
    this.id = id;
    this.size = size;
    this.cramped = cramped;
    this.sizeMultiplier = multiplier;
}

/**
 * Get the style of a superscript given a base in the current style.
 */
Style.prototype.sup = function () {
    return styles[sup[this.id]];
};

/**
 * Get the style of a subscript given a base in the current style.
 */
Style.prototype.sub = function () {
    return styles[sub[this.id]];
};

/**
 * Get the style of a fraction numerator given the fraction in the current
 * style.
 */
Style.prototype.fracNum = function () {
    return styles[fracNum[this.id]];
};

/**
 * Get the style of a fraction denominator given the fraction in the current
 * style.
 */
Style.prototype.fracDen = function () {
    return styles[fracDen[this.id]];
};

/**
 * Get the cramped version of a style (in particular, cramping a cramped style
 * doesn't change the style).
 */
Style.prototype.cramp = function () {
    return styles[cramp[this.id]];
};

/**
 * HTML class name, like "displaystyle cramped"
 */
Style.prototype.cls = function () {
    return sizeNames[this.size] + (this.cramped ? " cramped" : " uncramped");
};

/**
 * HTML Reset class name, like "reset-textstyle"
 */
Style.prototype.reset = function () {
    return resetNames[this.size];
};

// IDs of the different styles
var D = 0;
var Dc = 1;
var T = 2;
var Tc = 3;
var S = 4;
var Sc = 5;
var SS = 6;
var SSc = 7;

// String names for the different sizes
var sizeNames = ["displaystyle textstyle", "textstyle", "scriptstyle", "scriptscriptstyle"];

// Reset names for the different sizes
var resetNames = ["reset-textstyle", "reset-textstyle", "reset-scriptstyle", "reset-scriptscriptstyle"];

// Instances of the different styles
var styles = [new Style(D, 0, 1, false), new Style(Dc, 0, 1, true), new Style(T, 1, 1, false), new Style(Tc, 1, 1, true), new Style(S, 2, 0.7, false), new Style(Sc, 2, 0.7, true), new Style(SS, 3, 0.5, false), new Style(SSc, 3, 0.5, true)];

// Lookup tables for switching from one style to another
var sup = [S, Sc, S, Sc, SS, SSc, SS, SSc];
var sub = [Sc, Sc, Sc, Sc, SSc, SSc, SSc, SSc];
var fracNum = [T, Tc, S, Sc, SS, SSc, SS, SSc];
var fracDen = [Tc, Tc, Sc, Sc, SSc, SSc, SSc, SSc];
var cramp = [Dc, Dc, Tc, Tc, Sc, Sc, SSc, SSc];

// We only export some of the styles. Also, we don't export the `Style` class so
// no more styles can be generated.
module.exports = {
    DISPLAY: styles[D],
    TEXT: styles[T],
    SCRIPT: styles[S],
    SCRIPTSCRIPT: styles[SS]
};

},{}],91:[function(require,module,exports){
/**
 * This module contains general functions that can be used for building
 * different kinds of domTree nodes in a consistent manner.
 */

"use strict";

var domTree = require("./domTree");
var fontMetrics = require("./fontMetrics");
var symbols = require("./symbols");
var utils = require("./utils");

var greekCapitals = ["\\Gamma", "\\Delta", "\\Theta", "\\Lambda", "\\Xi", "\\Pi", "\\Sigma", "\\Upsilon", "\\Phi", "\\Psi", "\\Omega"];

var dotlessLetters = ["ı", // dotless i, \imath
"ȷ" // dotless j, \jmath
];

/**
 * Makes a symbolNode after translation via the list of symbols in symbols.js.
 * Correctly pulls out metrics for the character, and optionally takes a list of
 * classes to be attached to the node.
 */
var makeSymbol = function makeSymbol(value, style, mode, color, classes) {
    // Replace the value with its replaced value from symbol.js
    if (symbols[mode][value] && symbols[mode][value].replace) {
        value = symbols[mode][value].replace;
    }

    var metrics = fontMetrics.getCharacterMetrics(value, style);

    var symbolNode;
    if (metrics) {
        symbolNode = new domTree.symbolNode(value, metrics.height, metrics.depth, metrics.italic, metrics.skew, classes);
    } else {
        // TODO(emily): Figure out a good way to only print this in development
        typeof console !== "undefined" && console.warn("No character metrics for '" + value + "' in style '" + style + "'");
        symbolNode = new domTree.symbolNode(value, 0, 0, 0, 0, classes);
    }

    if (color) {
        symbolNode.style.color = color;
    }

    return symbolNode;
};

/**
 * Makes a symbol in Main-Regular or AMS-Regular.
 * Used for rel, bin, open, close, inner, and punct.
 */
var mathsym = function mathsym(value, mode, color, classes) {
    // Decide what font to render the symbol in by its entry in the symbols
    // table.
    // Have a special case for when the value = \ because the \ is used as a
    // textord in unsupported command errors but cannot be parsed as a regular
    // text ordinal and is therefore not present as a symbol in the symbols
    // table for text
    if (value === "\\" || symbols[mode][value].font === "main") {
        return makeSymbol(value, "Main-Regular", mode, color, classes);
    } else {
        return makeSymbol(value, "AMS-Regular", mode, color, classes.concat(["amsrm"]));
    }
};

/**
 * Makes a symbol in the default font for mathords and textords.
 */
var mathDefault = function mathDefault(value, mode, color, classes, type) {
    if (type === "mathord") {
        return mathit(value, mode, color, classes);
    } else if (type === "textord") {
        return makeSymbol(value, "Main-Regular", mode, color, classes.concat(["mathrm"]));
    } else {
        throw new Error("unexpected type: " + type + " in mathDefault");
    }
};

/**
 * Makes a symbol in the italic math font.
 */
var mathit = function mathit(value, mode, color, classes) {
    if (/[0-9]/.test(value.charAt(0)) ||
    // glyphs for \imath and \jmath do not exist in Math-Italic so we
    // need to use Main-Italic instead
    utils.contains(dotlessLetters, value) || utils.contains(greekCapitals, value)) {
        return makeSymbol(value, "Main-Italic", mode, color, classes.concat(["mainit"]));
    } else {
        return makeSymbol(value, "Math-Italic", mode, color, classes.concat(["mathit"]));
    }
};

/**
 * Makes either a mathord or textord in the correct font and color.
 */
var makeOrd = function makeOrd(group, options, type) {
    var mode = group.mode;
    var value = group.value;
    if (symbols[mode][value] && symbols[mode][value].replace) {
        value = symbols[mode][value].replace;
    }

    var classes = ["mord"];
    var color = options.getColor();

    var font = options.font;
    if (font) {
        if (font === "mathit" || utils.contains(dotlessLetters, value)) {
            return mathit(value, mode, color, classes);
        } else {
            var fontName = fontMap[font].fontName;
            if (fontMetrics.getCharacterMetrics(value, fontName)) {
                return makeSymbol(value, fontName, mode, color, classes.concat([font]));
            } else {
                return mathDefault(value, mode, color, classes, type);
            }
        }
    } else {
        return mathDefault(value, mode, color, classes, type);
    }
};

/**
 * Calculate the height, depth, and maxFontSize of an element based on its
 * children.
 */
var sizeElementFromChildren = function sizeElementFromChildren(elem) {
    var height = 0;
    var depth = 0;
    var maxFontSize = 0;

    if (elem.children) {
        for (var i = 0; i < elem.children.length; i++) {
            if (elem.children[i].height > height) {
                height = elem.children[i].height;
            }
            if (elem.children[i].depth > depth) {
                depth = elem.children[i].depth;
            }
            if (elem.children[i].maxFontSize > maxFontSize) {
                maxFontSize = elem.children[i].maxFontSize;
            }
        }
    }

    elem.height = height;
    elem.depth = depth;
    elem.maxFontSize = maxFontSize;
};

/**
 * Makes a span with the given list of classes, list of children, and color.
 */
var makeSpan = function makeSpan(classes, children, color) {
    var span = new domTree.span(classes, children);

    sizeElementFromChildren(span);

    if (color) {
        span.style.color = color;
    }

    return span;
};

/**
 * Makes a document fragment with the given list of children.
 */
var makeFragment = function makeFragment(children) {
    var fragment = new domTree.documentFragment(children);

    sizeElementFromChildren(fragment);

    return fragment;
};

/**
 * Makes an element placed in each of the vlist elements to ensure that each
 * element has the same max font size. To do this, we create a zero-width space
 * with the correct font size.
 */
var makeFontSizer = function makeFontSizer(options, fontSize) {
    var fontSizeInner = makeSpan([], [new domTree.symbolNode("​")]);
    fontSizeInner.style.fontSize = fontSize / options.style.sizeMultiplier + "em";

    var fontSizer = makeSpan(["fontsize-ensurer", "reset-" + options.size, "size5"], [fontSizeInner]);

    return fontSizer;
};

/**
 * Makes a vertical list by stacking elements and kerns on top of each other.
 * Allows for many different ways of specifying the positioning method.
 *
 * Arguments:
 *  - children: A list of child or kern nodes to be stacked on top of each other
 *              (i.e. the first element will be at the bottom, and the last at
 *              the top). Element nodes are specified as
 *                {type: "elem", elem: node}
 *              while kern nodes are specified as
 *                {type: "kern", size: size}
 *  - positionType: The method by which the vlist should be positioned. Valid
 *                  values are:
 *                   - "individualShift": The children list only contains elem
 *                                        nodes, and each node contains an extra
 *                                        "shift" value of how much it should be
 *                                        shifted (note that shifting is always
 *                                        moving downwards). positionData is
 *                                        ignored.
 *                   - "top": The positionData specifies the topmost point of
 *                            the vlist (note this is expected to be a height,
 *                            so positive values move up)
 *                   - "bottom": The positionData specifies the bottommost point
 *                               of the vlist (note this is expected to be a
 *                               depth, so positive values move down
 *                   - "shift": The vlist will be positioned such that its
 *                              baseline is positionData away from the baseline
 *                              of the first child. Positive values move
 *                              downwards.
 *                   - "firstBaseline": The vlist will be positioned such that
 *                                      its baseline is aligned with the
 *                                      baseline of the first child.
 *                                      positionData is ignored. (this is
 *                                      equivalent to "shift" with
 *                                      positionData=0)
 *  - positionData: Data used in different ways depending on positionType
 *  - options: An Options object
 *
 */
var makeVList = function makeVList(children, positionType, positionData, options) {
    var depth;
    var currPos;
    var i;
    if (positionType === "individualShift") {
        var oldChildren = children;
        children = [oldChildren[0]];

        // Add in kerns to the list of children to get each element to be
        // shifted to the correct specified shift
        depth = -oldChildren[0].shift - oldChildren[0].elem.depth;
        currPos = depth;
        for (i = 1; i < oldChildren.length; i++) {
            var diff = -oldChildren[i].shift - currPos - oldChildren[i].elem.depth;
            var size = diff - (oldChildren[i - 1].elem.height + oldChildren[i - 1].elem.depth);

            currPos = currPos + diff;

            children.push({ type: "kern", size: size });
            children.push(oldChildren[i]);
        }
    } else if (positionType === "top") {
        // We always start at the bottom, so calculate the bottom by adding up
        // all the sizes
        var bottom = positionData;
        for (i = 0; i < children.length; i++) {
            if (children[i].type === "kern") {
                bottom -= children[i].size;
            } else {
                bottom -= children[i].elem.height + children[i].elem.depth;
            }
        }
        depth = bottom;
    } else if (positionType === "bottom") {
        depth = -positionData;
    } else if (positionType === "shift") {
        depth = -children[0].elem.depth - positionData;
    } else if (positionType === "firstBaseline") {
        depth = -children[0].elem.depth;
    } else {
        depth = 0;
    }

    // Make the fontSizer
    var maxFontSize = 0;
    for (i = 0; i < children.length; i++) {
        if (children[i].type === "elem") {
            maxFontSize = Math.max(maxFontSize, children[i].elem.maxFontSize);
        }
    }
    var fontSizer = makeFontSizer(options, maxFontSize);

    // Create a new list of actual children at the correct offsets
    var realChildren = [];
    currPos = depth;
    for (i = 0; i < children.length; i++) {
        if (children[i].type === "kern") {
            currPos += children[i].size;
        } else {
            var child = children[i].elem;

            var shift = -child.depth - currPos;
            currPos += child.height + child.depth;

            var childWrap = makeSpan([], [fontSizer, child]);
            childWrap.height -= shift;
            childWrap.depth += shift;
            childWrap.style.top = shift + "em";

            realChildren.push(childWrap);
        }
    }

    // Add in an element at the end with no offset to fix the calculation of
    // baselines in some browsers (namely IE, sometimes safari)
    var baselineFix = makeSpan(["baseline-fix"], [fontSizer, new domTree.symbolNode("​")]);
    realChildren.push(baselineFix);

    var vlist = makeSpan(["vlist"], realChildren);
    // Fix the final height and depth, in case there were kerns at the ends
    // since the makeSpan calculation won't take that in to account.
    vlist.height = Math.max(currPos, vlist.height);
    vlist.depth = Math.max(-depth, vlist.depth);
    return vlist;
};

// A table of size -> font size for the different sizing functions
var sizingMultiplier = {
    size1: 0.5,
    size2: 0.7,
    size3: 0.8,
    size4: 0.9,
    size5: 1,
    size6: 1.2,
    size7: 1.44,
    size8: 1.73,
    size9: 2.07,
    size10: 2.49
};

// A map of spacing functions to their attributes, like size and corresponding
// CSS class
var spacingFunctions = {
    "\\qquad": {
        size: "2em",
        className: "qquad"
    },
    "\\quad": {
        size: "1em",
        className: "quad"
    },
    "\\enspace": {
        size: "0.5em",
        className: "enspace"
    },
    "\\;": {
        size: "0.277778em",
        className: "thickspace"
    },
    "\\:": {
        size: "0.22222em",
        className: "mediumspace"
    },
    "\\,": {
        size: "0.16667em",
        className: "thinspace"
    },
    "\\!": {
        size: "-0.16667em",
        className: "negativethinspace"
    }
};

/**
 * Maps TeX font commands to objects containing:
 * - variant: string used for "mathvariant" attribute in buildMathML.js
 * - fontName: the "style" parameter to fontMetrics.getCharacterMetrics
 */
// A map between tex font commands an MathML mathvariant attribute values
var fontMap = {
    // styles
    mathbf: {
        variant: "bold",
        fontName: "Main-Bold"
    },
    mathrm: {
        variant: "normal",
        fontName: "Main-Regular"
    },

    // "mathit" is missing because it requires the use of two fonts: Main-Italic
    // and Math-Italic.  This is handled by a special case in makeOrd which ends
    // up calling mathit.

    // families
    mathbb: {
        variant: "double-struck",
        fontName: "AMS-Regular"
    },
    mathcal: {
        variant: "script",
        fontName: "Caligraphic-Regular"
    },
    mathfrak: {
        variant: "fraktur",
        fontName: "Fraktur-Regular"
    },
    mathscr: {
        variant: "script",
        fontName: "Script-Regular"
    },
    mathsf: {
        variant: "sans-serif",
        fontName: "SansSerif-Regular"
    },
    mathtt: {
        variant: "monospace",
        fontName: "Typewriter-Regular"
    }
};

module.exports = {
    fontMap: fontMap,
    makeSymbol: makeSymbol,
    mathsym: mathsym,
    makeSpan: makeSpan,
    makeFragment: makeFragment,
    makeVList: makeVList,
    makeOrd: makeOrd,
    sizingMultiplier: sizingMultiplier,
    spacingFunctions: spacingFunctions
};

},{"./domTree":96,"./fontMetrics":98,"./symbols":104,"./utils":105}],92:[function(require,module,exports){
/**
 * This file does the main work of building a domTree structure from a parse
 * tree. The entry point is the `buildHTML` function, which takes a parse tree.
 * Then, the buildExpression, buildGroup, and various groupTypes functions are
 * called, to produce a final HTML tree.
 */

"use strict";

var ParseError = require("./ParseError");
var Style = require("./Style");

var buildCommon = require("./buildCommon");
var delimiter = require("./delimiter");
var domTree = require("./domTree");
var fontMetrics = require("./fontMetrics");
var utils = require("./utils");

var makeSpan = buildCommon.makeSpan;

/**
 * Take a list of nodes, build them in order, and return a list of the built
 * nodes. This function handles the `prev` node correctly, and passes the
 * previous element from the list as the prev of the next element.
 */
var buildExpression = function buildExpression(expression, options, prev) {
    var groups = [];
    for (var i = 0; i < expression.length; i++) {
        var group = expression[i];
        groups.push(buildGroup(group, options, prev));
        prev = group;
    }
    return groups;
};

// List of types used by getTypeOfGroup,
// see https://github.com/Khan/KaTeX/wiki/Examining-TeX#group-types
var groupToType = {
    mathord: "mord",
    textord: "mord",
    bin: "mbin",
    rel: "mrel",
    text: "mord",
    open: "mopen",
    close: "mclose",
    inner: "minner",
    genfrac: "mord",
    array: "mord",
    spacing: "mord",
    punct: "mpunct",
    ordgroup: "mord",
    op: "mop",
    katex: "mord",
    overline: "mord",
    rule: "mord",
    leftright: "minner",
    sqrt: "mord",
    accent: "mord"
};

/**
 * Gets the final math type of an expression, given its group type. This type is
 * used to determine spacing between elements, and affects bin elements by
 * causing them to change depending on what types are around them. This type
 * must be attached to the outermost node of an element as a CSS class so that
 * spacing with its surrounding elements works correctly.
 *
 * Some elements can be mapped one-to-one from group type to math type, and
 * those are listed in the `groupToType` table.
 *
 * Others (usually elements that wrap around other elements) often have
 * recursive definitions, and thus call `getTypeOfGroup` on their inner
 * elements.
 */
var getTypeOfGroup = (function (_getTypeOfGroup) {
    function getTypeOfGroup(_x) {
        return _getTypeOfGroup.apply(this, arguments);
    }

    getTypeOfGroup.toString = function () {
        return _getTypeOfGroup.toString();
    };

    return getTypeOfGroup;
})(function (group) {
    if (group == null) {
        // Like when typesetting $^3$
        return groupToType.mathord;
    } else if (group.type === "supsub") {
        return getTypeOfGroup(group.value.base);
    } else if (group.type === "llap" || group.type === "rlap") {
        return getTypeOfGroup(group.value);
    } else if (group.type === "color") {
        return getTypeOfGroup(group.value.value);
    } else if (group.type === "sizing") {
        return getTypeOfGroup(group.value.value);
    } else if (group.type === "styling") {
        return getTypeOfGroup(group.value.value);
    } else if (group.type === "delimsizing") {
        return groupToType[group.value.delimType];
    } else {
        return groupToType[group.type];
    }
});

/**
 * Sometimes, groups perform special rules when they have superscripts or
 * subscripts attached to them. This function lets the `supsub` group know that
 * its inner element should handle the superscripts and subscripts instead of
 * handling them itself.
 */
var shouldHandleSupSub = function shouldHandleSupSub(group, options) {
    if (!group) {
        return false;
    } else if (group.type === "op") {
        // Operators handle supsubs differently when they have limits
        // (e.g. `\displaystyle\sum_2^3`)
        return group.value.limits && (options.style.size === Style.DISPLAY.size || group.value.alwaysHandleSupSub);
    } else if (group.type === "accent") {
        return isCharacterBox(group.value.base);
    } else {
        return null;
    }
};

/**
 * Sometimes we want to pull out the innermost element of a group. In most
 * cases, this will just be the group itself, but when ordgroups and colors have
 * a single element, we want to pull that out.
 */
var getBaseElem = (function (_getBaseElem) {
    function getBaseElem(_x2) {
        return _getBaseElem.apply(this, arguments);
    }

    getBaseElem.toString = function () {
        return _getBaseElem.toString();
    };

    return getBaseElem;
})(function (group) {
    if (!group) {
        return false;
    } else if (group.type === "ordgroup") {
        if (group.value.length === 1) {
            return getBaseElem(group.value[0]);
        } else {
            return group;
        }
    } else if (group.type === "color") {
        if (group.value.value.length === 1) {
            return getBaseElem(group.value.value[0]);
        } else {
            return group;
        }
    } else {
        return group;
    }
});

/**
 * TeXbook algorithms often reference "character boxes", which are simply groups
 * with a single character in them. To decide if something is a character box,
 * we find its innermost group, and see if it is a single character.
 */
var isCharacterBox = function isCharacterBox(group) {
    var baseElem = getBaseElem(group);

    // These are all they types of groups which hold single characters
    return baseElem.type === "mathord" || baseElem.type === "textord" || baseElem.type === "bin" || baseElem.type === "rel" || baseElem.type === "inner" || baseElem.type === "open" || baseElem.type === "close" || baseElem.type === "punct";
};

var makeNullDelimiter = function makeNullDelimiter(options) {
    return makeSpan(["sizing", "reset-" + options.size, "size5", options.style.reset(), Style.TEXT.cls(), "nulldelimiter"]);
};

/**
 * This is a map of group types to the function used to handle that type.
 * Simpler types come at the beginning, while complicated types come afterwards.
 */
var groupTypes = {
    mathord: function mathord(group, options, prev) {
        return buildCommon.makeOrd(group, options, "mathord");
    },

    textord: function textord(group, options, prev) {
        return buildCommon.makeOrd(group, options, "textord");
    },

    bin: function bin(group, options, prev) {
        var className = "mbin";
        // Pull out the most recent element. Do some special handling to find
        // things at the end of a \color group. Note that we don't use the same
        // logic for ordgroups (which count as ords).
        var prevAtom = prev;
        while (prevAtom && prevAtom.type === "color") {
            var atoms = prevAtom.value.value;
            prevAtom = atoms[atoms.length - 1];
        }
        // See TeXbook pg. 442-446, Rules 5 and 6, and the text before Rule 19.
        // Here, we determine whether the bin should turn into an ord. We
        // currently only apply Rule 5.
        if (!prev || utils.contains(["mbin", "mopen", "mrel", "mop", "mpunct"], getTypeOfGroup(prevAtom))) {
            group.type = "textord";
            className = "mord";
        }

        return buildCommon.mathsym(group.value, group.mode, options.getColor(), [className]);
    },

    rel: function rel(group, options, prev) {
        return buildCommon.mathsym(group.value, group.mode, options.getColor(), ["mrel"]);
    },

    open: function open(group, options, prev) {
        return buildCommon.mathsym(group.value, group.mode, options.getColor(), ["mopen"]);
    },

    close: function close(group, options, prev) {
        return buildCommon.mathsym(group.value, group.mode, options.getColor(), ["mclose"]);
    },

    inner: function inner(group, options, prev) {
        return buildCommon.mathsym(group.value, group.mode, options.getColor(), ["minner"]);
    },

    punct: function punct(group, options, prev) {
        return buildCommon.mathsym(group.value, group.mode, options.getColor(), ["mpunct"]);
    },

    ordgroup: function ordgroup(group, options, prev) {
        return makeSpan(["mord", options.style.cls()], buildExpression(group.value, options.reset()));
    },

    text: function text(group, options, prev) {
        return makeSpan(["text", "mord", options.style.cls()], buildExpression(group.value.body, options.reset()));
    },

    color: function color(group, options, prev) {
        var elements = buildExpression(group.value.value, options.withColor(group.value.color), prev);

        // \color isn't supposed to affect the type of the elements it contains.
        // To accomplish this, we wrap the results in a fragment, so the inner
        // elements will be able to directly interact with their neighbors. For
        // example, `\color{red}{2 +} 3` has the same spacing as `2 + 3`
        return new buildCommon.makeFragment(elements);
    },

    supsub: function supsub(group, options, prev) {
        // Superscript and subscripts are handled in the TeXbook on page
        // 445-446, rules 18(a-f).

        // Here is where we defer to the inner group if it should handle
        // superscripts and subscripts itself.
        if (shouldHandleSupSub(group.value.base, options)) {
            return groupTypes[group.value.base.type](group, options, prev);
        }

        var base = buildGroup(group.value.base, options.reset());
        var supmid, submid, sup, sub;

        if (group.value.sup) {
            sup = buildGroup(group.value.sup, options.withStyle(options.style.sup()));
            supmid = makeSpan([options.style.reset(), options.style.sup().cls()], [sup]);
        }

        if (group.value.sub) {
            sub = buildGroup(group.value.sub, options.withStyle(options.style.sub()));
            submid = makeSpan([options.style.reset(), options.style.sub().cls()], [sub]);
        }

        // Rule 18a
        var supShift, subShift;
        if (isCharacterBox(group.value.base)) {
            supShift = 0;
            subShift = 0;
        } else {
            supShift = base.height - fontMetrics.metrics.supDrop;
            subShift = base.depth + fontMetrics.metrics.subDrop;
        }

        // Rule 18c
        var minSupShift;
        if (options.style === Style.DISPLAY) {
            minSupShift = fontMetrics.metrics.sup1;
        } else if (options.style.cramped) {
            minSupShift = fontMetrics.metrics.sup3;
        } else {
            minSupShift = fontMetrics.metrics.sup2;
        }

        // scriptspace is a font-size-independent size, so scale it
        // appropriately
        var multiplier = Style.TEXT.sizeMultiplier * options.style.sizeMultiplier;
        var scriptspace = 0.5 / fontMetrics.metrics.ptPerEm / multiplier + "em";

        var supsub;
        if (!group.value.sup) {
            // Rule 18b
            subShift = Math.max(subShift, fontMetrics.metrics.sub1, sub.height - 0.8 * fontMetrics.metrics.xHeight);

            supsub = buildCommon.makeVList([{ type: "elem", elem: submid }], "shift", subShift, options);

            supsub.children[0].style.marginRight = scriptspace;

            // Subscripts shouldn't be shifted by the base's italic correction.
            // Account for that by shifting the subscript back the appropriate
            // amount. Note we only do this when the base is a single symbol.
            if (base instanceof domTree.symbolNode) {
                supsub.children[0].style.marginLeft = -base.italic + "em";
            }
        } else if (!group.value.sub) {
            // Rule 18c, d
            supShift = Math.max(supShift, minSupShift, sup.depth + 0.25 * fontMetrics.metrics.xHeight);

            supsub = buildCommon.makeVList([{ type: "elem", elem: supmid }], "shift", -supShift, options);

            supsub.children[0].style.marginRight = scriptspace;
        } else {
            supShift = Math.max(supShift, minSupShift, sup.depth + 0.25 * fontMetrics.metrics.xHeight);
            subShift = Math.max(subShift, fontMetrics.metrics.sub2);

            var ruleWidth = fontMetrics.metrics.defaultRuleThickness;

            // Rule 18e
            if (supShift - sup.depth - (sub.height - subShift) < 4 * ruleWidth) {
                subShift = 4 * ruleWidth - (supShift - sup.depth) + sub.height;
                var psi = 0.8 * fontMetrics.metrics.xHeight - (supShift - sup.depth);
                if (psi > 0) {
                    supShift += psi;
                    subShift -= psi;
                }
            }

            supsub = buildCommon.makeVList([{ type: "elem", elem: submid, shift: subShift }, { type: "elem", elem: supmid, shift: -supShift }], "individualShift", null, options);

            // See comment above about subscripts not being shifted
            if (base instanceof domTree.symbolNode) {
                supsub.children[0].style.marginLeft = -base.italic + "em";
            }

            supsub.children[0].style.marginRight = scriptspace;
            supsub.children[1].style.marginRight = scriptspace;
        }

        return makeSpan([getTypeOfGroup(group.value.base)], [base, supsub]);
    },

    genfrac: function genfrac(group, options, prev) {
        // Fractions are handled in the TeXbook on pages 444-445, rules 15(a-e).
        // Figure out what style this fraction should be in based on the
        // function used
        var fstyle = options.style;
        if (group.value.size === "display") {
            fstyle = Style.DISPLAY;
        } else if (group.value.size === "text") {
            fstyle = Style.TEXT;
        }

        var nstyle = fstyle.fracNum();
        var dstyle = fstyle.fracDen();

        var numer = buildGroup(group.value.numer, options.withStyle(nstyle));
        var numerreset = makeSpan([fstyle.reset(), nstyle.cls()], [numer]);

        var denom = buildGroup(group.value.denom, options.withStyle(dstyle));
        var denomreset = makeSpan([fstyle.reset(), dstyle.cls()], [denom]);

        var ruleWidth;
        if (group.value.hasBarLine) {
            ruleWidth = fontMetrics.metrics.defaultRuleThickness / options.style.sizeMultiplier;
        } else {
            ruleWidth = 0;
        }

        // Rule 15b
        var numShift;
        var clearance;
        var denomShift;
        if (fstyle.size === Style.DISPLAY.size) {
            numShift = fontMetrics.metrics.num1;
            if (ruleWidth > 0) {
                clearance = 3 * ruleWidth;
            } else {
                clearance = 7 * fontMetrics.metrics.defaultRuleThickness;
            }
            denomShift = fontMetrics.metrics.denom1;
        } else {
            if (ruleWidth > 0) {
                numShift = fontMetrics.metrics.num2;
                clearance = ruleWidth;
            } else {
                numShift = fontMetrics.metrics.num3;
                clearance = 3 * fontMetrics.metrics.defaultRuleThickness;
            }
            denomShift = fontMetrics.metrics.denom2;
        }

        var frac;
        if (ruleWidth === 0) {
            // Rule 15c
            var candiateClearance = numShift - numer.depth - (denom.height - denomShift);
            if (candiateClearance < clearance) {
                numShift += 0.5 * (clearance - candiateClearance);
                denomShift += 0.5 * (clearance - candiateClearance);
            }

            frac = buildCommon.makeVList([{ type: "elem", elem: denomreset, shift: denomShift }, { type: "elem", elem: numerreset, shift: -numShift }], "individualShift", null, options);
        } else {
            // Rule 15d
            var axisHeight = fontMetrics.metrics.axisHeight;

            if (numShift - numer.depth - (axisHeight + 0.5 * ruleWidth) < clearance) {
                numShift += clearance - (numShift - numer.depth - (axisHeight + 0.5 * ruleWidth));
            }

            if (axisHeight - 0.5 * ruleWidth - (denom.height - denomShift) < clearance) {
                denomShift += clearance - (axisHeight - 0.5 * ruleWidth - (denom.height - denomShift));
            }

            var mid = makeSpan([options.style.reset(), Style.TEXT.cls(), "frac-line"]);
            // Manually set the height of the line because its height is
            // created in CSS
            mid.height = ruleWidth;

            var midShift = -(axisHeight - 0.5 * ruleWidth);

            frac = buildCommon.makeVList([{ type: "elem", elem: denomreset, shift: denomShift }, { type: "elem", elem: mid, shift: midShift }, { type: "elem", elem: numerreset, shift: -numShift }], "individualShift", null, options);
        }

        // Since we manually change the style sometimes (with \dfrac or \tfrac),
        // account for the possible size change here.
        frac.height *= fstyle.sizeMultiplier / options.style.sizeMultiplier;
        frac.depth *= fstyle.sizeMultiplier / options.style.sizeMultiplier;

        // Rule 15e
        var delimSize;
        if (fstyle.size === Style.DISPLAY.size) {
            delimSize = fontMetrics.metrics.delim1;
        } else {
            delimSize = fontMetrics.metrics.getDelim2(fstyle);
        }

        var leftDelim, rightDelim;
        if (group.value.leftDelim == null) {
            leftDelim = makeNullDelimiter(options);
        } else {
            leftDelim = delimiter.customSizedDelim(group.value.leftDelim, delimSize, true, options.withStyle(fstyle), group.mode);
        }
        if (group.value.rightDelim == null) {
            rightDelim = makeNullDelimiter(options);
        } else {
            rightDelim = delimiter.customSizedDelim(group.value.rightDelim, delimSize, true, options.withStyle(fstyle), group.mode);
        }

        return makeSpan(["mord", options.style.reset(), fstyle.cls()], [leftDelim, makeSpan(["mfrac"], [frac]), rightDelim], options.getColor());
    },

    array: function array(group, options, prev) {
        var r, c;
        var nr = group.value.body.length;
        var nc = 0;
        var body = new Array(nr);

        // Horizontal spacing
        var pt = 1 / fontMetrics.metrics.ptPerEm;
        var arraycolsep = 5 * pt; // \arraycolsep in article.cls

        // Vertical spacing
        var baselineskip = 12 * pt; // see size10.clo
        // Default \arraystretch from lttab.dtx
        // TODO(gagern): may get redefined once we have user-defined macros
        var arraystretch = utils.deflt(group.value.arraystretch, 1);
        var arrayskip = arraystretch * baselineskip;
        var arstrutHeight = 0.7 * arrayskip; // \strutbox in ltfsstrc.dtx and
        var arstrutDepth = 0.3 * arrayskip; // \@arstrutbox in lttab.dtx

        var totalHeight = 0;
        for (r = 0; r < group.value.body.length; ++r) {
            var inrow = group.value.body[r];
            var height = arstrutHeight; // \@array adds an \@arstrut
            var depth = arstrutDepth; // to each tow (via the template)

            if (nc < inrow.length) {
                nc = inrow.length;
            }

            var outrow = new Array(inrow.length);
            for (c = 0; c < inrow.length; ++c) {
                var elt = buildGroup(inrow[c], options);
                if (depth < elt.depth) {
                    depth = elt.depth;
                }
                if (height < elt.height) {
                    height = elt.height;
                }
                outrow[c] = elt;
            }

            var gap = 0;
            if (group.value.rowGaps[r]) {
                gap = group.value.rowGaps[r].value;
                switch (gap.unit) {
                    case "em":
                        gap = gap.number;
                        break;
                    case "ex":
                        gap = gap.number * fontMetrics.metrics.emPerEx;
                        break;
                    default:
                        console.error("Can't handle unit " + gap.unit);
                        gap = 0;
                }
                if (gap > 0) {
                    // \@argarraycr
                    gap += arstrutDepth;
                    if (depth < gap) {
                        depth = gap; // \@xargarraycr
                    }
                    gap = 0;
                }
            }

            outrow.height = height;
            outrow.depth = depth;
            totalHeight += height;
            outrow.pos = totalHeight;
            totalHeight += depth + gap; // \@yargarraycr
            body[r] = outrow;
        }

        var offset = totalHeight / 2 + fontMetrics.metrics.axisHeight;
        var colDescriptions = group.value.cols || [];
        var cols = [];
        var colSep;
        var colDescrNum;
        for (c = 0, colDescrNum = 0;
        // Continue while either there are more columns or more column
        // descriptions, so trailing separators don't get lost.
        c < nc || colDescrNum < colDescriptions.length; ++c, ++colDescrNum) {

            var colDescr = colDescriptions[colDescrNum] || {};

            var firstSeparator = true;
            while (colDescr.type === "separator") {
                // If there is more than one separator in a row, add a space
                // between them.
                if (!firstSeparator) {
                    colSep = makeSpan(["arraycolsep"], []);
                    colSep.style.width = fontMetrics.metrics.doubleRuleSep + "em";
                    cols.push(colSep);
                }

                if (colDescr.separator === "|") {
                    var separator = makeSpan(["vertical-separator"], []);
                    separator.style.height = totalHeight + "em";
                    separator.style.verticalAlign = -(totalHeight - offset) + "em";

                    cols.push(separator);
                } else {
                    throw new ParseError("Invalid separator type: " + colDescr.separator);
                }

                colDescrNum++;
                colDescr = colDescriptions[colDescrNum] || {};
                firstSeparator = false;
            }

            if (c >= nc) {
                continue;
            }

            var sepwidth;
            if (c > 0 || group.value.hskipBeforeAndAfter) {
                sepwidth = utils.deflt(colDescr.pregap, arraycolsep);
                if (sepwidth !== 0) {
                    colSep = makeSpan(["arraycolsep"], []);
                    colSep.style.width = sepwidth + "em";
                    cols.push(colSep);
                }
            }

            var col = [];
            for (r = 0; r < nr; ++r) {
                var row = body[r];
                var elem = row[c];
                if (!elem) {
                    continue;
                }
                var shift = row.pos - offset;
                elem.depth = row.depth;
                elem.height = row.height;
                col.push({ type: "elem", elem: elem, shift: shift });
            }

            col = buildCommon.makeVList(col, "individualShift", null, options);
            col = makeSpan(["col-align-" + (colDescr.align || "c")], [col]);
            cols.push(col);

            if (c < nc - 1 || group.value.hskipBeforeAndAfter) {
                sepwidth = utils.deflt(colDescr.postgap, arraycolsep);
                if (sepwidth !== 0) {
                    colSep = makeSpan(["arraycolsep"], []);
                    colSep.style.width = sepwidth + "em";
                    cols.push(colSep);
                }
            }
        }
        body = makeSpan(["mtable"], cols);
        return makeSpan(["mord"], [body], options.getColor());
    },

    spacing: function spacing(group, options, prev) {
        if (group.value === "\\ " || group.value === "\\space" || group.value === " " || group.value === "~") {
            // Spaces are generated by adding an actual space. Each of these
            // things has an entry in the symbols table, so these will be turned
            // into appropriate outputs.
            return makeSpan(["mord", "mspace"], [buildCommon.mathsym(group.value, group.mode)]);
        } else {
            // Other kinds of spaces are of arbitrary width. We use CSS to
            // generate these.
            return makeSpan(["mord", "mspace", buildCommon.spacingFunctions[group.value].className]);
        }
    },

    llap: function llap(group, options, prev) {
        var inner = makeSpan(["inner"], [buildGroup(group.value.body, options.reset())]);
        var fix = makeSpan(["fix"], []);
        return makeSpan(["llap", options.style.cls()], [inner, fix]);
    },

    rlap: function rlap(group, options, prev) {
        var inner = makeSpan(["inner"], [buildGroup(group.value.body, options.reset())]);
        var fix = makeSpan(["fix"], []);
        return makeSpan(["rlap", options.style.cls()], [inner, fix]);
    },

    op: function op(group, options, prev) {
        // Operators are handled in the TeXbook pg. 443-444, rule 13(a).
        var supGroup;
        var subGroup;
        var hasLimits = false;
        if (group.type === "supsub") {
            // If we have limits, supsub will pass us its group to handle. Pull
            // out the superscript and subscript and set the group to the op in
            // its base.
            supGroup = group.value.sup;
            subGroup = group.value.sub;
            group = group.value.base;
            hasLimits = true;
        }

        // Most operators have a large successor symbol, but these don't.
        var noSuccessor = ["\\smallint"];

        var large = false;
        if (options.style.size === Style.DISPLAY.size && group.value.symbol && !utils.contains(noSuccessor, group.value.body)) {

            // Most symbol operators get larger in displaystyle (rule 13)
            large = true;
        }

        var base;
        var baseShift = 0;
        var slant = 0;
        if (group.value.symbol) {
            // If this is a symbol, create the symbol.
            var style = large ? "Size2-Regular" : "Size1-Regular";
            base = buildCommon.makeSymbol(group.value.body, style, "math", options.getColor(), ["op-symbol", large ? "large-op" : "small-op", "mop"]);

            // Shift the symbol so its center lies on the axis (rule 13). It
            // appears that our fonts have the centers of the symbols already
            // almost on the axis, so these numbers are very small. Note we
            // don't actually apply this here, but instead it is used either in
            // the vlist creation or separately when there are no limits.
            baseShift = (base.height - base.depth) / 2 - fontMetrics.metrics.axisHeight * options.style.sizeMultiplier;

            // The slant of the symbol is just its italic correction.
            slant = base.italic;
        } else {
            // Otherwise, this is a text operator. Build the text from the
            // operator's name.
            // TODO(emily): Add a space in the middle of some of these
            // operators, like \limsup
            var output = [];
            for (var i = 1; i < group.value.body.length; i++) {
                output.push(buildCommon.mathsym(group.value.body[i], group.mode));
            }
            base = makeSpan(["mop"], output, options.getColor());
        }

        if (hasLimits) {
            // IE 8 clips \int if it is in a display: inline-block. We wrap it
            // in a new span so it is an inline, and works.
            base = makeSpan([], [base]);

            var supmid, supKern, submid, subKern;
            // We manually have to handle the superscripts and subscripts. This,
            // aside from the kern calculations, is copied from supsub.
            if (supGroup) {
                var sup = buildGroup(supGroup, options.withStyle(options.style.sup()));
                supmid = makeSpan([options.style.reset(), options.style.sup().cls()], [sup]);

                supKern = Math.max(fontMetrics.metrics.bigOpSpacing1, fontMetrics.metrics.bigOpSpacing3 - sup.depth);
            }

            if (subGroup) {
                var sub = buildGroup(subGroup, options.withStyle(options.style.sub()));
                submid = makeSpan([options.style.reset(), options.style.sub().cls()], [sub]);

                subKern = Math.max(fontMetrics.metrics.bigOpSpacing2, fontMetrics.metrics.bigOpSpacing4 - sub.height);
            }

            // Build the final group as a vlist of the possible subscript, base,
            // and possible superscript.
            var finalGroup, top, bottom;
            if (!supGroup) {
                top = base.height - baseShift;

                finalGroup = buildCommon.makeVList([{ type: "kern", size: fontMetrics.metrics.bigOpSpacing5 }, { type: "elem", elem: submid }, { type: "kern", size: subKern }, { type: "elem", elem: base }], "top", top, options);

                // Here, we shift the limits by the slant of the symbol. Note
                // that we are supposed to shift the limits by 1/2 of the slant,
                // but since we are centering the limits adding a full slant of
                // margin will shift by 1/2 that.
                finalGroup.children[0].style.marginLeft = -slant + "em";
            } else if (!subGroup) {
                bottom = base.depth + baseShift;

                finalGroup = buildCommon.makeVList([{ type: "elem", elem: base }, { type: "kern", size: supKern }, { type: "elem", elem: supmid }, { type: "kern", size: fontMetrics.metrics.bigOpSpacing5 }], "bottom", bottom, options);

                // See comment above about slants
                finalGroup.children[1].style.marginLeft = slant + "em";
            } else if (!supGroup && !subGroup) {
                // This case probably shouldn't occur (this would mean the
                // supsub was sending us a group with no superscript or
                // subscript) but be safe.
                return base;
            } else {
                bottom = fontMetrics.metrics.bigOpSpacing5 + submid.height + submid.depth + subKern + base.depth + baseShift;

                finalGroup = buildCommon.makeVList([{ type: "kern", size: fontMetrics.metrics.bigOpSpacing5 }, { type: "elem", elem: submid }, { type: "kern", size: subKern }, { type: "elem", elem: base }, { type: "kern", size: supKern }, { type: "elem", elem: supmid }, { type: "kern", size: fontMetrics.metrics.bigOpSpacing5 }], "bottom", bottom, options);

                // See comment above about slants
                finalGroup.children[0].style.marginLeft = -slant + "em";
                finalGroup.children[2].style.marginLeft = slant + "em";
            }

            return makeSpan(["mop", "op-limits"], [finalGroup]);
        } else {
            if (group.value.symbol) {
                base.style.top = baseShift + "em";
            }

            return base;
        }
    },

    katex: function katex(group, options, prev) {
        // The KaTeX logo. The offsets for the K and a were chosen to look
        // good, but the offsets for the T, E, and X were taken from the
        // definition of \TeX in TeX (see TeXbook pg. 356)
        var k = makeSpan(["k"], [buildCommon.mathsym("K", group.mode)]);
        var a = makeSpan(["a"], [buildCommon.mathsym("A", group.mode)]);

        a.height = (a.height + 0.2) * 0.75;
        a.depth = (a.height - 0.2) * 0.75;

        var t = makeSpan(["t"], [buildCommon.mathsym("T", group.mode)]);
        var e = makeSpan(["e"], [buildCommon.mathsym("E", group.mode)]);

        e.height = e.height - 0.2155;
        e.depth = e.depth + 0.2155;

        var x = makeSpan(["x"], [buildCommon.mathsym("X", group.mode)]);

        return makeSpan(["katex-logo", "mord"], [k, a, t, e, x], options.getColor());
    },

    overline: function overline(group, options, prev) {
        // Overlines are handled in the TeXbook pg 443, Rule 9.

        // Build the inner group in the cramped style.
        var innerGroup = buildGroup(group.value.body, options.withStyle(options.style.cramp()));

        var ruleWidth = fontMetrics.metrics.defaultRuleThickness / options.style.sizeMultiplier;

        // Create the line above the body
        var line = makeSpan([options.style.reset(), Style.TEXT.cls(), "overline-line"]);
        line.height = ruleWidth;
        line.maxFontSize = 1;

        // Generate the vlist, with the appropriate kerns
        var vlist = buildCommon.makeVList([{ type: "elem", elem: innerGroup }, { type: "kern", size: 3 * ruleWidth }, { type: "elem", elem: line }, { type: "kern", size: ruleWidth }], "firstBaseline", null, options);

        return makeSpan(["overline", "mord"], [vlist], options.getColor());
    },

    sqrt: function sqrt(group, options, prev) {
        // Square roots are handled in the TeXbook pg. 443, Rule 11.

        // First, we do the same steps as in overline to build the inner group
        // and line
        var inner = buildGroup(group.value.body, options.withStyle(options.style.cramp()));

        var ruleWidth = fontMetrics.metrics.defaultRuleThickness / options.style.sizeMultiplier;

        var line = makeSpan([options.style.reset(), Style.TEXT.cls(), "sqrt-line"], [], options.getColor());
        line.height = ruleWidth;
        line.maxFontSize = 1;

        var phi = ruleWidth;
        if (options.style.id < Style.TEXT.id) {
            phi = fontMetrics.metrics.xHeight;
        }

        // Calculate the clearance between the body and line
        var lineClearance = ruleWidth + phi / 4;

        var innerHeight = (inner.height + inner.depth) * options.style.sizeMultiplier;
        var minDelimiterHeight = innerHeight + lineClearance + ruleWidth;

        // Create a \surd delimiter of the required minimum size
        var delim = makeSpan(["sqrt-sign"], [delimiter.customSizedDelim("\\surd", minDelimiterHeight, false, options, group.mode)], options.getColor());

        var delimDepth = delim.height + delim.depth - ruleWidth;

        // Adjust the clearance based on the delimiter size
        if (delimDepth > inner.height + inner.depth + lineClearance) {
            lineClearance = (lineClearance + delimDepth - inner.height - inner.depth) / 2;
        }

        // Shift the delimiter so that its top lines up with the top of the line
        var delimShift = -(inner.height + lineClearance + ruleWidth) + delim.height;
        delim.style.top = delimShift + "em";
        delim.height -= delimShift;
        delim.depth += delimShift;

        // We add a special case here, because even when `inner` is empty, we
        // still get a line. So, we use a simple heuristic to decide if we
        // should omit the body entirely. (note this doesn't work for something
        // like `\sqrt{\rlap{x}}`, but if someone is doing that they deserve for
        // it not to work.
        var body;
        if (inner.height === 0 && inner.depth === 0) {
            body = makeSpan();
        } else {
            body = buildCommon.makeVList([{ type: "elem", elem: inner }, { type: "kern", size: lineClearance }, { type: "elem", elem: line }, { type: "kern", size: ruleWidth }], "firstBaseline", null, options);
        }

        if (!group.value.index) {
            return makeSpan(["sqrt", "mord"], [delim, body]);
        } else {
            // Handle the optional root index

            // The index is always in scriptscript style
            var root = buildGroup(group.value.index, options.withStyle(Style.SCRIPTSCRIPT));
            var rootWrap = makeSpan([options.style.reset(), Style.SCRIPTSCRIPT.cls()], [root]);

            // Figure out the height and depth of the inner part
            var innerRootHeight = Math.max(delim.height, body.height);
            var innerRootDepth = Math.max(delim.depth, body.depth);

            // The amount the index is shifted by. This is taken from the TeX
            // source, in the definition of `\r@@t`.
            var toShift = 0.6 * (innerRootHeight - innerRootDepth);

            // Build a VList with the superscript shifted up correctly
            var rootVList = buildCommon.makeVList([{ type: "elem", elem: rootWrap }], "shift", -toShift, options);
            // Add a class surrounding it so we can add on the appropriate
            // kerning
            var rootVListWrap = makeSpan(["root"], [rootVList]);

            return makeSpan(["sqrt", "mord"], [rootVListWrap, delim, body]);
        }
    },

    sizing: function sizing(group, options, prev) {
        // Handle sizing operators like \Huge. Real TeX doesn't actually allow
        // these functions inside of math expressions, so we do some special
        // handling.
        var inner = buildExpression(group.value.value, options.withSize(group.value.size), prev);

        var span = makeSpan(["mord"], [makeSpan(["sizing", "reset-" + options.size, group.value.size, options.style.cls()], inner)]);

        // Calculate the correct maxFontSize manually
        var fontSize = buildCommon.sizingMultiplier[group.value.size];
        span.maxFontSize = fontSize * options.style.sizeMultiplier;

        return span;
    },

    styling: function styling(group, options, prev) {
        // Style changes are handled in the TeXbook on pg. 442, Rule 3.

        // Figure out what style we're changing to.
        var style = {
            display: Style.DISPLAY,
            text: Style.TEXT,
            script: Style.SCRIPT,
            scriptscript: Style.SCRIPTSCRIPT
        };

        var newStyle = style[group.value.style];

        // Build the inner expression in the new style.
        var inner = buildExpression(group.value.value, options.withStyle(newStyle), prev);

        return makeSpan([options.style.reset(), newStyle.cls()], inner);
    },

    font: function font(group, options, prev) {
        var font = group.value.font;
        return buildGroup(group.value.body, options.withFont(font), prev);
    },

    delimsizing: function delimsizing(group, options, prev) {
        var delim = group.value.value;

        if (delim === ".") {
            // Empty delimiters still count as elements, even though they don't
            // show anything.
            return makeSpan([groupToType[group.value.delimType]]);
        }

        // Use delimiter.sizedDelim to generate the delimiter.
        return makeSpan([groupToType[group.value.delimType]], [delimiter.sizedDelim(delim, group.value.size, options, group.mode)]);
    },

    leftright: function leftright(group, options, prev) {
        // Build the inner expression
        var inner = buildExpression(group.value.body, options.reset());

        var innerHeight = 0;
        var innerDepth = 0;

        // Calculate its height and depth
        for (var i = 0; i < inner.length; i++) {
            innerHeight = Math.max(inner[i].height, innerHeight);
            innerDepth = Math.max(inner[i].depth, innerDepth);
        }

        // The size of delimiters is the same, regardless of what style we are
        // in. Thus, to correctly calculate the size of delimiter we need around
        // a group, we scale down the inner size based on the size.
        innerHeight *= options.style.sizeMultiplier;
        innerDepth *= options.style.sizeMultiplier;

        var leftDelim;
        if (group.value.left === ".") {
            // Empty delimiters in \left and \right make null delimiter spaces.
            leftDelim = makeNullDelimiter(options);
        } else {
            // Otherwise, use leftRightDelim to generate the correct sized
            // delimiter.
            leftDelim = delimiter.leftRightDelim(group.value.left, innerHeight, innerDepth, options, group.mode);
        }
        // Add it to the beginning of the expression
        inner.unshift(leftDelim);

        var rightDelim;
        // Same for the right delimiter
        if (group.value.right === ".") {
            rightDelim = makeNullDelimiter(options);
        } else {
            rightDelim = delimiter.leftRightDelim(group.value.right, innerHeight, innerDepth, options, group.mode);
        }
        // Add it to the end of the expression.
        inner.push(rightDelim);

        return makeSpan(["minner", options.style.cls()], inner, options.getColor());
    },

    rule: function rule(group, options, prev) {
        // Make an empty span for the rule
        var rule = makeSpan(["mord", "rule"], [], options.getColor());

        // Calculate the shift, width, and height of the rule, and account for units
        var shift = 0;
        if (group.value.shift) {
            shift = group.value.shift.number;
            if (group.value.shift.unit === "ex") {
                shift *= fontMetrics.metrics.xHeight;
            }
        }

        var width = group.value.width.number;
        if (group.value.width.unit === "ex") {
            width *= fontMetrics.metrics.xHeight;
        }

        var height = group.value.height.number;
        if (group.value.height.unit === "ex") {
            height *= fontMetrics.metrics.xHeight;
        }

        // The sizes of rules are absolute, so make it larger if we are in a
        // smaller style.
        shift /= options.style.sizeMultiplier;
        width /= options.style.sizeMultiplier;
        height /= options.style.sizeMultiplier;

        // Style the rule to the right size
        rule.style.borderRightWidth = width + "em";
        rule.style.borderTopWidth = height + "em";
        rule.style.bottom = shift + "em";

        // Record the height and width
        rule.width = width;
        rule.height = height + shift;
        rule.depth = -shift;

        return rule;
    },

    accent: function accent(group, options, prev) {
        // Accents are handled in the TeXbook pg. 443, rule 12.
        var base = group.value.base;

        var supsubGroup;
        if (group.type === "supsub") {
            // If our base is a character box, and we have superscripts and
            // subscripts, the supsub will defer to us. In particular, we want
            // to attach the superscripts and subscripts to the inner body (so
            // that the position of the superscripts and subscripts won't be
            // affected by the height of the accent). We accomplish this by
            // sticking the base of the accent into the base of the supsub, and
            // rendering that, while keeping track of where the accent is.

            // The supsub group is the group that was passed in
            var supsub = group;
            // The real accent group is the base of the supsub group
            group = supsub.value.base;
            // The character box is the base of the accent group
            base = group.value.base;
            // Stick the character box into the base of the supsub group
            supsub.value.base = base;

            // Rerender the supsub group with its new base, and store that
            // result.
            supsubGroup = buildGroup(supsub, options.reset(), prev);
        }

        // Build the base group
        var body = buildGroup(base, options.withStyle(options.style.cramp()));

        // Calculate the skew of the accent. This is based on the line "If the
        // nucleus is not a single character, let s = 0; otherwise set s to the
        // kern amount for the nucleus followed by the \skewchar of its font."
        // Note that our skew metrics are just the kern between each character
        // and the skewchar.
        var skew;
        if (isCharacterBox(base)) {
            // If the base is a character box, then we want the skew of the
            // innermost character. To do that, we find the innermost character:
            var baseChar = getBaseElem(base);
            // Then, we render its group to get the symbol inside it
            var baseGroup = buildGroup(baseChar, options.withStyle(options.style.cramp()));
            // Finally, we pull the skew off of the symbol.
            skew = baseGroup.skew;
            // Note that we now throw away baseGroup, because the layers we
            // removed with getBaseElem might contain things like \color which
            // we can't get rid of.
            // TODO(emily): Find a better way to get the skew
        } else {
            skew = 0;
        }

        // calculate the amount of space between the body and the accent
        var clearance = Math.min(body.height, fontMetrics.metrics.xHeight);

        // Build the accent
        var accent = buildCommon.makeSymbol(group.value.accent, "Main-Regular", "math", options.getColor());
        // Remove the italic correction of the accent, because it only serves to
        // shift the accent over to a place we don't want.
        accent.italic = 0;

        // The \vec character that the fonts use is a combining character, and
        // thus shows up much too far to the left. To account for this, we add a
        // specific class which shifts the accent over to where we want it.
        // TODO(emily): Fix this in a better way, like by changing the font
        var vecClass = group.value.accent === "\\vec" ? "accent-vec" : null;

        var accentBody = makeSpan(["accent-body", vecClass], [makeSpan([], [accent])]);

        accentBody = buildCommon.makeVList([{ type: "elem", elem: body }, { type: "kern", size: -clearance }, { type: "elem", elem: accentBody }], "firstBaseline", null, options);

        // Shift the accent over by the skew. Note we shift by twice the skew
        // because we are centering the accent, so by adding 2*skew to the left,
        // we shift it to the right by 1*skew.
        accentBody.children[1].style.marginLeft = 2 * skew + "em";

        var accentWrap = makeSpan(["mord", "accent"], [accentBody]);

        if (supsubGroup) {
            // Here, we replace the "base" child of the supsub with our newly
            // generated accent.
            supsubGroup.children[0] = accentWrap;

            // Since we don't rerun the height calculation after replacing the
            // accent, we manually recalculate height.
            supsubGroup.height = Math.max(accentWrap.height, supsubGroup.height);

            // Accents should always be ords, even when their innards are not.
            supsubGroup.classes[0] = "mord";

            return supsubGroup;
        } else {
            return accentWrap;
        }
    },

    phantom: function phantom(group, options, prev) {
        var elements = buildExpression(group.value.value, options.withPhantom(), prev);

        // \phantom isn't supposed to affect the elements it contains.
        // See "color" for more details.
        return new buildCommon.makeFragment(elements);
    }
};

/**
 * buildGroup is the function that takes a group and calls the correct groupType
 * function for it. It also handles the interaction of size and style changes
 * between parents and children.
 */
var buildGroup = function buildGroup(group, options, prev) {
    if (!group) {
        return makeSpan();
    }

    if (groupTypes[group.type]) {
        // Call the groupTypes function
        var groupNode = groupTypes[group.type](group, options, prev);
        var multiplier;

        // If the style changed between the parent and the current group,
        // account for the size difference
        if (options.style !== options.parentStyle) {
            multiplier = options.style.sizeMultiplier / options.parentStyle.sizeMultiplier;

            groupNode.height *= multiplier;
            groupNode.depth *= multiplier;
        }

        // If the size changed between the parent and the current group, account
        // for that size difference.
        if (options.size !== options.parentSize) {
            multiplier = buildCommon.sizingMultiplier[options.size] / buildCommon.sizingMultiplier[options.parentSize];

            groupNode.height *= multiplier;
            groupNode.depth *= multiplier;
        }

        return groupNode;
    } else {
        throw new ParseError("Got group of unknown type: '" + group.type + "'");
    }
};

/**
 * Take an entire parse tree, and build it into an appropriate set of HTML
 * nodes.
 */
var buildHTML = function buildHTML(tree, options) {
    // buildExpression is destructive, so we need to make a clone
    // of the incoming tree so that it isn't accidentally changed
    tree = JSON.parse(JSON.stringify(tree));

    // Build the expression contained in the tree
    var expression = buildExpression(tree, options);
    var body = makeSpan(["base", options.style.cls()], expression);

    // Add struts, which ensure that the top of the HTML element falls at the
    // height of the expression, and the bottom of the HTML element falls at the
    // depth of the expression.
    var topStrut = makeSpan(["strut"]);
    var bottomStrut = makeSpan(["strut", "bottom"]);

    topStrut.style.height = body.height + "em";
    bottomStrut.style.height = body.height + body.depth + "em";
    // We'd like to use `vertical-align: top` but in IE 9 this lowers the
    // baseline of the box to the bottom of this strut (instead staying in the
    // normal place) so we use an absolute value for vertical-align instead
    bottomStrut.style.verticalAlign = -body.depth + "em";

    // Wrap the struts and body together
    var htmlNode = makeSpan(["katex-html"], [topStrut, bottomStrut, body]);

    htmlNode.setAttribute("aria-hidden", "true");

    return htmlNode;
};

module.exports = buildHTML;

},{"./ParseError":87,"./Style":90,"./buildCommon":91,"./delimiter":95,"./domTree":96,"./fontMetrics":98,"./utils":105}],93:[function(require,module,exports){
/**
 * This file converts a parse tree into a cooresponding MathML tree. The main
 * entry point is the `buildMathML` function, which takes a parse tree from the
 * parser.
 */

"use strict";

var buildCommon = require("./buildCommon");
var fontMetrics = require("./fontMetrics");
var mathMLTree = require("./mathMLTree");
var ParseError = require("./ParseError");
var symbols = require("./symbols");
var utils = require("./utils");

var makeSpan = buildCommon.makeSpan;
var fontMap = buildCommon.fontMap;

/**
 * Takes a symbol and converts it into a MathML text node after performing
 * optional replacement from symbols.js.
 */
var makeText = function makeText(text, mode) {
    if (symbols[mode][text] && symbols[mode][text].replace) {
        text = symbols[mode][text].replace;
    }

    return new mathMLTree.TextNode(text);
};

/**
 * Returns the math variant as a string or null if none is required.
 */
var getVariant = function getVariant(group, options) {
    var font = options.font;
    if (!font) {
        return null;
    }

    var mode = group.mode;
    if (font === "mathit") {
        return "italic";
    }

    var value = group.value;
    if (utils.contains(["\\imath", "\\jmath"], value)) {
        return null;
    }

    if (symbols[mode][value] && symbols[mode][value].replace) {
        value = symbols[mode][value].replace;
    }

    var fontName = fontMap[font].fontName;
    if (fontMetrics.getCharacterMetrics(value, fontName)) {
        return fontMap[options.font].variant;
    }

    return null;
};

/**
 * Functions for handling the different types of groups found in the parse
 * tree. Each function should take a parse group and return a MathML node.
 */
var groupTypes = {
    mathord: function mathord(group, options) {
        var node = new mathMLTree.MathNode("mi", [makeText(group.value, group.mode)]);

        var variant = getVariant(group, options);
        if (variant) {
            node.setAttribute("mathvariant", variant);
        }
        return node;
    },

    textord: function textord(group, options) {
        var text = makeText(group.value, group.mode);

        var variant = getVariant(group, options) || "normal";

        var node;
        if (/[0-9]/.test(group.value)) {
            // TODO(kevinb) merge adjacent <mn> nodes
            // do it as a post processing step
            node = new mathMLTree.MathNode("mn", [text]);
            if (options.font) {
                node.setAttribute("mathvariant", variant);
            }
        } else {
            node = new mathMLTree.MathNode("mi", [text]);
            node.setAttribute("mathvariant", variant);
        }

        return node;
    },

    bin: function bin(group) {
        var node = new mathMLTree.MathNode("mo", [makeText(group.value, group.mode)]);

        return node;
    },

    rel: function rel(group) {
        var node = new mathMLTree.MathNode("mo", [makeText(group.value, group.mode)]);

        return node;
    },

    open: function open(group) {
        var node = new mathMLTree.MathNode("mo", [makeText(group.value, group.mode)]);

        return node;
    },

    close: function close(group) {
        var node = new mathMLTree.MathNode("mo", [makeText(group.value, group.mode)]);

        return node;
    },

    inner: function inner(group) {
        var node = new mathMLTree.MathNode("mo", [makeText(group.value, group.mode)]);

        return node;
    },

    punct: function punct(group) {
        var node = new mathMLTree.MathNode("mo", [makeText(group.value, group.mode)]);

        node.setAttribute("separator", "true");

        return node;
    },

    ordgroup: function ordgroup(group, options) {
        var inner = buildExpression(group.value, options);

        var node = new mathMLTree.MathNode("mrow", inner);

        return node;
    },

    text: function text(group, options) {
        var inner = buildExpression(group.value.body, options);

        var node = new mathMLTree.MathNode("mtext", inner);

        return node;
    },

    color: function color(group, options) {
        var inner = buildExpression(group.value.value, options);

        var node = new mathMLTree.MathNode("mstyle", inner);

        node.setAttribute("mathcolor", group.value.color);

        return node;
    },

    supsub: function supsub(group, options) {
        var children = [buildGroup(group.value.base, options)];

        if (group.value.sub) {
            children.push(buildGroup(group.value.sub, options));
        }

        if (group.value.sup) {
            children.push(buildGroup(group.value.sup, options));
        }

        var nodeType;
        if (!group.value.sub) {
            nodeType = "msup";
        } else if (!group.value.sup) {
            nodeType = "msub";
        } else {
            nodeType = "msubsup";
        }

        var node = new mathMLTree.MathNode(nodeType, children);

        return node;
    },

    genfrac: function genfrac(group, options) {
        var node = new mathMLTree.MathNode("mfrac", [buildGroup(group.value.numer, options), buildGroup(group.value.denom, options)]);

        if (!group.value.hasBarLine) {
            node.setAttribute("linethickness", "0px");
        }

        if (group.value.leftDelim != null || group.value.rightDelim != null) {
            var withDelims = [];

            if (group.value.leftDelim != null) {
                var leftOp = new mathMLTree.MathNode("mo", [new mathMLTree.TextNode(group.value.leftDelim)]);

                leftOp.setAttribute("fence", "true");

                withDelims.push(leftOp);
            }

            withDelims.push(node);

            if (group.value.rightDelim != null) {
                var rightOp = new mathMLTree.MathNode("mo", [new mathMLTree.TextNode(group.value.rightDelim)]);

                rightOp.setAttribute("fence", "true");

                withDelims.push(rightOp);
            }

            var outerNode = new mathMLTree.MathNode("mrow", withDelims);

            return outerNode;
        }

        return node;
    },

    array: function array(group, options) {
        return new mathMLTree.MathNode("mtable", group.value.body.map(function (row) {
            return new mathMLTree.MathNode("mtr", row.map(function (cell) {
                return new mathMLTree.MathNode("mtd", [buildGroup(cell, options)]);
            }));
        }));
    },

    sqrt: function sqrt(group, options) {
        var node;
        if (group.value.index) {
            node = new mathMLTree.MathNode("mroot", [buildGroup(group.value.body, options), buildGroup(group.value.index, options)]);
        } else {
            node = new mathMLTree.MathNode("msqrt", [buildGroup(group.value.body, options)]);
        }

        return node;
    },

    leftright: function leftright(group, options) {
        var inner = buildExpression(group.value.body, options);

        if (group.value.left !== ".") {
            var leftNode = new mathMLTree.MathNode("mo", [makeText(group.value.left, group.mode)]);

            leftNode.setAttribute("fence", "true");

            inner.unshift(leftNode);
        }

        if (group.value.right !== ".") {
            var rightNode = new mathMLTree.MathNode("mo", [makeText(group.value.right, group.mode)]);

            rightNode.setAttribute("fence", "true");

            inner.push(rightNode);
        }

        var outerNode = new mathMLTree.MathNode("mrow", inner);

        return outerNode;
    },

    accent: function accent(group, options) {
        var accentNode = new mathMLTree.MathNode("mo", [makeText(group.value.accent, group.mode)]);

        var node = new mathMLTree.MathNode("mover", [buildGroup(group.value.base, options), accentNode]);

        node.setAttribute("accent", "true");

        return node;
    },

    spacing: function spacing(group) {
        var node;

        if (group.value === "\\ " || group.value === "\\space" || group.value === " " || group.value === "~") {
            node = new mathMLTree.MathNode("mtext", [new mathMLTree.TextNode(" ")]);
        } else {
            node = new mathMLTree.MathNode("mspace");

            node.setAttribute("width", buildCommon.spacingFunctions[group.value].size);
        }

        return node;
    },

    op: function op(group) {
        var node;

        // TODO(emily): handle big operators using the `largeop` attribute

        if (group.value.symbol) {
            // This is a symbol. Just add the symbol.
            node = new mathMLTree.MathNode("mo", [makeText(group.value.body, group.mode)]);
        } else {
            // This is a text operator. Add all of the characters from the
            // operator's name.
            // TODO(emily): Add a space in the middle of some of these
            // operators, like \limsup.
            node = new mathMLTree.MathNode("mi", [new mathMLTree.TextNode(group.value.body.slice(1))]);
        }

        return node;
    },

    katex: function katex(group) {
        var node = new mathMLTree.MathNode("mtext", [new mathMLTree.TextNode("KaTeX")]);

        return node;
    },

    font: function font(group, options) {
        var font = group.value.font;
        return buildGroup(group.value.body, options.withFont(font));
    },

    delimsizing: function delimsizing(group) {
        var children = [];

        if (group.value.value !== ".") {
            children.push(makeText(group.value.value, group.mode));
        }

        var node = new mathMLTree.MathNode("mo", children);

        if (group.value.delimType === "open" || group.value.delimType === "close") {
            // Only some of the delimsizing functions act as fences, and they
            // return "open" or "close" delimTypes.
            node.setAttribute("fence", "true");
        } else {
            // Explicitly disable fencing if it's not a fence, to override the
            // defaults.
            node.setAttribute("fence", "false");
        }

        return node;
    },

    styling: function styling(group, options) {
        var inner = buildExpression(group.value.value, options);

        var node = new mathMLTree.MathNode("mstyle", inner);

        var styleAttributes = {
            display: ["0", "true"],
            text: ["0", "false"],
            script: ["1", "false"],
            scriptscript: ["2", "false"]
        };

        var attr = styleAttributes[group.value.style];

        node.setAttribute("scriptlevel", attr[0]);
        node.setAttribute("displaystyle", attr[1]);

        return node;
    },

    sizing: function sizing(group, options) {
        var inner = buildExpression(group.value.value, options);

        var node = new mathMLTree.MathNode("mstyle", inner);

        // TODO(emily): This doesn't produce the correct size for nested size
        // changes, because we don't keep state of what style we're currently
        // in, so we can't reset the size to normal before changing it.  Now
        // that we're passing an options parameter we should be able to fix
        // this.
        node.setAttribute("mathsize", buildCommon.sizingMultiplier[group.value.size] + "em");

        return node;
    },

    overline: function overline(group, options) {
        var operator = new mathMLTree.MathNode("mo", [new mathMLTree.TextNode("‾")]);
        operator.setAttribute("stretchy", "true");

        var node = new mathMLTree.MathNode("mover", [buildGroup(group.value.body, options), operator]);
        node.setAttribute("accent", "true");

        return node;
    },

    rule: function rule(group) {
        // TODO(emily): Figure out if there's an actual way to draw black boxes
        // in MathML.
        var node = new mathMLTree.MathNode("mrow");

        return node;
    },

    llap: function llap(group, options) {
        var node = new mathMLTree.MathNode("mpadded", [buildGroup(group.value.body, options)]);

        node.setAttribute("lspace", "-1width");
        node.setAttribute("width", "0px");

        return node;
    },

    rlap: function rlap(group, options) {
        var node = new mathMLTree.MathNode("mpadded", [buildGroup(group.value.body, options)]);

        node.setAttribute("width", "0px");

        return node;
    },

    phantom: function phantom(group, options, prev) {
        var inner = buildExpression(group.value.value, options);
        return new mathMLTree.MathNode("mphantom", inner);
    }
};

/**
 * Takes a list of nodes, builds them, and returns a list of the generated
 * MathML nodes. A little simpler than the HTML version because we don't do any
 * previous-node handling.
 */
var buildExpression = function buildExpression(expression, options) {
    var groups = [];
    for (var i = 0; i < expression.length; i++) {
        var group = expression[i];
        groups.push(buildGroup(group, options));
    }
    return groups;
};

/**
 * Takes a group from the parser and calls the appropriate groupTypes function
 * on it to produce a MathML node.
 */
var buildGroup = function buildGroup(group, options) {
    if (!group) {
        return new mathMLTree.MathNode("mrow");
    }

    if (groupTypes[group.type]) {
        // Call the groupTypes function
        return groupTypes[group.type](group, options);
    } else {
        throw new ParseError("Got group of unknown type: '" + group.type + "'");
    }
};

/**
 * Takes a full parse tree and settings and builds a MathML representation of
 * it. In particular, we put the elements from building the parse tree into a
 * <semantics> tag so we can also include that TeX source as an annotation.
 *
 * Note that we actually return a domTree element with a `<math>` inside it so
 * we can do appropriate styling.
 */
var buildMathML = function buildMathML(tree, texExpression, options) {
    var expression = buildExpression(tree, options);

    // Wrap up the expression in an mrow so it is presented in the semantics
    // tag correctly.
    var wrapper = new mathMLTree.MathNode("mrow", expression);

    // Build a TeX annotation of the source
    var annotation = new mathMLTree.MathNode("annotation", [new mathMLTree.TextNode(texExpression)]);

    annotation.setAttribute("encoding", "application/x-tex");

    var semantics = new mathMLTree.MathNode("semantics", [wrapper, annotation]);

    var math = new mathMLTree.MathNode("math", [semantics]);

    // You can't style <math> nodes, so we wrap the node in a span.
    return makeSpan(["katex-mathml"], [math]);
};

module.exports = buildMathML;

},{"./ParseError":87,"./buildCommon":91,"./fontMetrics":98,"./mathMLTree":101,"./symbols":104,"./utils":105}],94:[function(require,module,exports){
"use strict";

var buildHTML = require("./buildHTML");
var buildMathML = require("./buildMathML");
var buildCommon = require("./buildCommon");
var Options = require("./Options");
var Settings = require("./Settings");
var Style = require("./Style");

var makeSpan = buildCommon.makeSpan;

var buildTree = function buildTree(tree, expression, settings) {
    settings = settings || new Settings({});

    var startStyle = Style.TEXT;
    if (settings.displayMode) {
        startStyle = Style.DISPLAY;
    }

    // Setup the default options
    var options = new Options({
        style: startStyle,
        size: "size5"
    });

    // `buildHTML` sometimes messes with the parse tree (like turning bins ->
    // ords), so we build the MathML version first.
    var mathMLNode = buildMathML(tree, expression, options);
    var htmlNode = buildHTML(tree, options);

    var katexNode = makeSpan(["katex"], [mathMLNode, htmlNode]);

    if (settings.displayMode) {
        return makeSpan(["katex-display"], [katexNode]);
    } else {
        return katexNode;
    }
};

module.exports = buildTree;

},{"./Options":86,"./Settings":89,"./Style":90,"./buildCommon":91,"./buildHTML":92,"./buildMathML":93}],95:[function(require,module,exports){
/**
 * This file deals with creating delimiters of various sizes. The TeXbook
 * discusses these routines on page 441-442, in the "Another subroutine sets box
 * x to a specified variable delimiter" paragraph.
 *
 * There are three main routines here. `makeSmallDelim` makes a delimiter in the
 * normal font, but in either text, script, or scriptscript style.
 * `makeLargeDelim` makes a delimiter in textstyle, but in one of the Size1,
 * Size2, Size3, or Size4 fonts. `makeStackedDelim` makes a delimiter out of
 * smaller pieces that are stacked on top of one another.
 *
 * The functions take a parameter `center`, which determines if the delimiter
 * should be centered around the axis.
 *
 * Then, there are three exposed functions. `sizedDelim` makes a delimiter in
 * one of the given sizes. This is used for things like `\bigl`.
 * `customSizedDelim` makes a delimiter with a given total height+depth. It is
 * called in places like `\sqrt`. `leftRightDelim` makes an appropriate
 * delimiter which surrounds an expression of a given height an depth. It is
 * used in `\left` and `\right`.
 */

"use strict";

var ParseError = require("./ParseError");
var Style = require("./Style");

var buildCommon = require("./buildCommon");
var fontMetrics = require("./fontMetrics");
var symbols = require("./symbols");
var utils = require("./utils");

var makeSpan = buildCommon.makeSpan;

/**
 * Get the metrics for a given symbol and font, after transformation (i.e.
 * after following replacement from symbols.js)
 */
var getMetrics = function getMetrics(symbol, font) {
    if (symbols.math[symbol] && symbols.math[symbol].replace) {
        return fontMetrics.getCharacterMetrics(symbols.math[symbol].replace, font);
    } else {
        return fontMetrics.getCharacterMetrics(symbol, font);
    }
};

/**
 * Builds a symbol in the given font size (note size is an integer)
 */
var mathrmSize = function mathrmSize(value, size, mode) {
    return buildCommon.makeSymbol(value, "Size" + size + "-Regular", mode);
};

/**
 * Puts a delimiter span in a given style, and adds appropriate height, depth,
 * and maxFontSizes.
 */
var styleWrap = function styleWrap(delim, toStyle, options) {
    var span = makeSpan(["style-wrap", options.style.reset(), toStyle.cls()], [delim]);

    var multiplier = toStyle.sizeMultiplier / options.style.sizeMultiplier;

    span.height *= multiplier;
    span.depth *= multiplier;
    span.maxFontSize = toStyle.sizeMultiplier;

    return span;
};

/**
 * Makes a small delimiter. This is a delimiter that comes in the Main-Regular
 * font, but is restyled to either be in textstyle, scriptstyle, or
 * scriptscriptstyle.
 */
var makeSmallDelim = function makeSmallDelim(delim, style, center, options, mode) {
    var text = buildCommon.makeSymbol(delim, "Main-Regular", mode);

    var span = styleWrap(text, style, options);

    if (center) {
        var shift = (1 - options.style.sizeMultiplier / style.sizeMultiplier) * fontMetrics.metrics.axisHeight;

        span.style.top = shift + "em";
        span.height -= shift;
        span.depth += shift;
    }

    return span;
};

/**
 * Makes a large delimiter. This is a delimiter that comes in the Size1, Size2,
 * Size3, or Size4 fonts. It is always rendered in textstyle.
 */
var makeLargeDelim = function makeLargeDelim(delim, size, center, options, mode) {
    var inner = mathrmSize(delim, size, mode);

    var span = styleWrap(makeSpan(["delimsizing", "size" + size], [inner], options.getColor()), Style.TEXT, options);

    if (center) {
        var shift = (1 - options.style.sizeMultiplier) * fontMetrics.metrics.axisHeight;

        span.style.top = shift + "em";
        span.height -= shift;
        span.depth += shift;
    }

    return span;
};

/**
 * Make an inner span with the given offset and in the given font. This is used
 * in `makeStackedDelim` to make the stacking pieces for the delimiter.
 */
var makeInner = function makeInner(symbol, font, mode) {
    var sizeClass;
    // Apply the correct CSS class to choose the right font.
    if (font === "Size1-Regular") {
        sizeClass = "delim-size1";
    } else if (font === "Size4-Regular") {
        sizeClass = "delim-size4";
    }

    var inner = makeSpan(["delimsizinginner", sizeClass], [makeSpan([], [buildCommon.makeSymbol(symbol, font, mode)])]);

    // Since this will be passed into `makeVList` in the end, wrap the element
    // in the appropriate tag that VList uses.
    return { type: "elem", elem: inner };
};

/**
 * Make a stacked delimiter out of a given delimiter, with the total height at
 * least `heightTotal`. This routine is mentioned on page 442 of the TeXbook.
 */
var makeStackedDelim = function makeStackedDelim(delim, heightTotal, center, options, mode) {
    // There are four parts, the top, an optional middle, a repeated part, and a
    // bottom.
    var top, middle, repeat, bottom;
    top = repeat = bottom = delim;
    middle = null;
    // Also keep track of what font the delimiters are in
    var font = "Size1-Regular";

    // We set the parts and font based on the symbol. Note that we use
    // '\u23d0' instead of '|' and '\u2016' instead of '\\|' for the
    // repeats of the arrows
    if (delim === "\\uparrow") {
        repeat = bottom = "⏐";
    } else if (delim === "\\Uparrow") {
        repeat = bottom = "‖";
    } else if (delim === "\\downarrow") {
        top = repeat = "⏐";
    } else if (delim === "\\Downarrow") {
        top = repeat = "‖";
    } else if (delim === "\\updownarrow") {
        top = "\\uparrow";
        repeat = "⏐";
        bottom = "\\downarrow";
    } else if (delim === "\\Updownarrow") {
        top = "\\Uparrow";
        repeat = "‖";
        bottom = "\\Downarrow";
    } else if (delim === "[" || delim === "\\lbrack") {
        top = "⎡";
        repeat = "⎢";
        bottom = "⎣";
        font = "Size4-Regular";
    } else if (delim === "]" || delim === "\\rbrack") {
        top = "⎤";
        repeat = "⎥";
        bottom = "⎦";
        font = "Size4-Regular";
    } else if (delim === "\\lfloor") {
        repeat = top = "⎢";
        bottom = "⎣";
        font = "Size4-Regular";
    } else if (delim === "\\lceil") {
        top = "⎡";
        repeat = bottom = "⎢";
        font = "Size4-Regular";
    } else if (delim === "\\rfloor") {
        repeat = top = "⎥";
        bottom = "⎦";
        font = "Size4-Regular";
    } else if (delim === "\\rceil") {
        top = "⎤";
        repeat = bottom = "⎥";
        font = "Size4-Regular";
    } else if (delim === "(") {
        top = "⎛";
        repeat = "⎜";
        bottom = "⎝";
        font = "Size4-Regular";
    } else if (delim === ")") {
        top = "⎞";
        repeat = "⎟";
        bottom = "⎠";
        font = "Size4-Regular";
    } else if (delim === "\\{" || delim === "\\lbrace") {
        top = "⎧";
        middle = "⎨";
        bottom = "⎩";
        repeat = "⎪";
        font = "Size4-Regular";
    } else if (delim === "\\}" || delim === "\\rbrace") {
        top = "⎫";
        middle = "⎬";
        bottom = "⎭";
        repeat = "⎪";
        font = "Size4-Regular";
    } else if (delim === "\\lgroup") {
        top = "⎧";
        bottom = "⎩";
        repeat = "⎪";
        font = "Size4-Regular";
    } else if (delim === "\\rgroup") {
        top = "⎫";
        bottom = "⎭";
        repeat = "⎪";
        font = "Size4-Regular";
    } else if (delim === "\\lmoustache") {
        top = "⎧";
        bottom = "⎭";
        repeat = "⎪";
        font = "Size4-Regular";
    } else if (delim === "\\rmoustache") {
        top = "⎫";
        bottom = "⎩";
        repeat = "⎪";
        font = "Size4-Regular";
    } else if (delim === "\\surd") {
        top = "";
        bottom = "⎷";
        repeat = "";
        font = "Size4-Regular";
    }

    // Get the metrics of the four sections
    var topMetrics = getMetrics(top, font);
    var topHeightTotal = topMetrics.height + topMetrics.depth;
    var repeatMetrics = getMetrics(repeat, font);
    var repeatHeightTotal = repeatMetrics.height + repeatMetrics.depth;
    var bottomMetrics = getMetrics(bottom, font);
    var bottomHeightTotal = bottomMetrics.height + bottomMetrics.depth;
    var middleHeightTotal = 0;
    var middleFactor = 1;
    if (middle !== null) {
        var middleMetrics = getMetrics(middle, font);
        middleHeightTotal = middleMetrics.height + middleMetrics.depth;
        middleFactor = 2; // repeat symmetrically above and below middle
    }

    // Calcuate the minimal height that the delimiter can have.
    // It is at least the size of the top, bottom, and optional middle combined.
    var minHeight = topHeightTotal + bottomHeightTotal + middleHeightTotal;

    // Compute the number of copies of the repeat symbol we will need
    var repeatCount = Math.ceil((heightTotal - minHeight) / (middleFactor * repeatHeightTotal));

    // Compute the total height of the delimiter including all the symbols
    var realHeightTotal = minHeight + repeatCount * middleFactor * repeatHeightTotal;

    // The center of the delimiter is placed at the center of the axis. Note
    // that in this context, "center" means that the delimiter should be
    // centered around the axis in the current style, while normally it is
    // centered around the axis in textstyle.
    var axisHeight = fontMetrics.metrics.axisHeight;
    if (center) {
        axisHeight *= options.style.sizeMultiplier;
    }
    // Calculate the depth
    var depth = realHeightTotal / 2 - axisHeight;

    // Now, we start building the pieces that will go into the vlist

    // Keep a list of the inner pieces
    var inners = [];

    // Add the bottom symbol
    inners.push(makeInner(bottom, font, mode));

    var i;
    if (middle === null) {
        // Add that many symbols
        for (i = 0; i < repeatCount; i++) {
            inners.push(makeInner(repeat, font, mode));
        }
    } else {
        // When there is a middle bit, we need the middle part and two repeated
        // sections
        for (i = 0; i < repeatCount; i++) {
            inners.push(makeInner(repeat, font, mode));
        }
        inners.push(makeInner(middle, font, mode));
        for (i = 0; i < repeatCount; i++) {
            inners.push(makeInner(repeat, font, mode));
        }
    }

    // Add the top symbol
    inners.push(makeInner(top, font, mode));

    // Finally, build the vlist
    var inner = buildCommon.makeVList(inners, "bottom", depth, options);

    return styleWrap(makeSpan(["delimsizing", "mult"], [inner], options.getColor()), Style.TEXT, options);
};

// There are three kinds of delimiters, delimiters that stack when they become
// too large
var stackLargeDelimiters = ["(", ")", "[", "\\lbrack", "]", "\\rbrack", "\\{", "\\lbrace", "\\}", "\\rbrace", "\\lfloor", "\\rfloor", "\\lceil", "\\rceil", "\\surd"];

// delimiters that always stack
var stackAlwaysDelimiters = ["\\uparrow", "\\downarrow", "\\updownarrow", "\\Uparrow", "\\Downarrow", "\\Updownarrow", "|", "\\|", "\\vert", "\\Vert", "\\lvert", "\\rvert", "\\lVert", "\\rVert", "\\lgroup", "\\rgroup", "\\lmoustache", "\\rmoustache"];

// and delimiters that never stack
var stackNeverDelimiters = ["<", ">", "\\langle", "\\rangle", "/", "\\backslash"];

// Metrics of the different sizes. Found by looking at TeX's output of
// $\bigl| // \Bigl| \biggl| \Biggl| \showlists$
// Used to create stacked delimiters of appropriate sizes in makeSizedDelim.
var sizeToMaxHeight = [0, 1.2, 1.8, 2.4, 3];

/**
 * Used to create a delimiter of a specific size, where `size` is 1, 2, 3, or 4.
 */
var makeSizedDelim = function makeSizedDelim(delim, size, options, mode) {
    // < and > turn into \langle and \rangle in delimiters
    if (delim === "<") {
        delim = "\\langle";
    } else if (delim === ">") {
        delim = "\\rangle";
    }

    // Sized delimiters are never centered.
    if (utils.contains(stackLargeDelimiters, delim) || utils.contains(stackNeverDelimiters, delim)) {
        return makeLargeDelim(delim, size, false, options, mode);
    } else if (utils.contains(stackAlwaysDelimiters, delim)) {
        return makeStackedDelim(delim, sizeToMaxHeight[size], false, options, mode);
    } else {
        throw new ParseError("Illegal delimiter: '" + delim + "'");
    }
};

/**
 * There are three different sequences of delimiter sizes that the delimiters
 * follow depending on the kind of delimiter. This is used when creating custom
 * sized delimiters to decide whether to create a small, large, or stacked
 * delimiter.
 *
 * In real TeX, these sequences aren't explicitly defined, but are instead
 * defined inside the font metrics. Since there are only three sequences that
 * are possible for the delimiters that TeX defines, it is easier to just encode
 * them explicitly here.
 */

// Delimiters that never stack try small delimiters and large delimiters only
var stackNeverDelimiterSequence = [{ type: "small", style: Style.SCRIPTSCRIPT }, { type: "small", style: Style.SCRIPT }, { type: "small", style: Style.TEXT }, { type: "large", size: 1 }, { type: "large", size: 2 }, { type: "large", size: 3 }, { type: "large", size: 4 }];

// Delimiters that always stack try the small delimiters first, then stack
var stackAlwaysDelimiterSequence = [{ type: "small", style: Style.SCRIPTSCRIPT }, { type: "small", style: Style.SCRIPT }, { type: "small", style: Style.TEXT }, { type: "stack" }];

// Delimiters that stack when large try the small and then large delimiters, and
// stack afterwards
var stackLargeDelimiterSequence = [{ type: "small", style: Style.SCRIPTSCRIPT }, { type: "small", style: Style.SCRIPT }, { type: "small", style: Style.TEXT }, { type: "large", size: 1 }, { type: "large", size: 2 }, { type: "large", size: 3 }, { type: "large", size: 4 }, { type: "stack" }];

/**
 * Get the font used in a delimiter based on what kind of delimiter it is.
 */
var delimTypeToFont = function delimTypeToFont(type) {
    if (type.type === "small") {
        return "Main-Regular";
    } else if (type.type === "large") {
        return "Size" + type.size + "-Regular";
    } else if (type.type === "stack") {
        return "Size4-Regular";
    }
};

/**
 * Traverse a sequence of types of delimiters to decide what kind of delimiter
 * should be used to create a delimiter of the given height+depth.
 */
var traverseSequence = function traverseSequence(delim, height, sequence, options) {
    // Here, we choose the index we should start at in the sequences. In smaller
    // sizes (which correspond to larger numbers in style.size) we start earlier
    // in the sequence. Thus, scriptscript starts at index 3-3=0, script starts
    // at index 3-2=1, text starts at 3-1=2, and display starts at min(2,3-0)=2
    var start = Math.min(2, 3 - options.style.size);
    for (var i = start; i < sequence.length; i++) {
        if (sequence[i].type === "stack") {
            // This is always the last delimiter, so we just break the loop now.
            break;
        }

        var metrics = getMetrics(delim, delimTypeToFont(sequence[i]));
        var heightDepth = metrics.height + metrics.depth;

        // Small delimiters are scaled down versions of the same font, so we
        // account for the style change size.

        if (sequence[i].type === "small") {
            heightDepth *= sequence[i].style.sizeMultiplier;
        }

        // Check if the delimiter at this size works for the given height.
        if (heightDepth > height) {
            return sequence[i];
        }
    }

    // If we reached the end of the sequence, return the last sequence element.
    return sequence[sequence.length - 1];
};

/**
 * Make a delimiter of a given height+depth, with optional centering. Here, we
 * traverse the sequences, and create a delimiter that the sequence tells us to.
 */
var makeCustomSizedDelim = function makeCustomSizedDelim(delim, height, center, options, mode) {
    if (delim === "<") {
        delim = "\\langle";
    } else if (delim === ">") {
        delim = "\\rangle";
    }

    // Decide what sequence to use
    var sequence;
    if (utils.contains(stackNeverDelimiters, delim)) {
        sequence = stackNeverDelimiterSequence;
    } else if (utils.contains(stackLargeDelimiters, delim)) {
        sequence = stackLargeDelimiterSequence;
    } else {
        sequence = stackAlwaysDelimiterSequence;
    }

    // Look through the sequence
    var delimType = traverseSequence(delim, height, sequence, options);

    // Depending on the sequence element we decided on, call the appropriate
    // function.
    if (delimType.type === "small") {
        return makeSmallDelim(delim, delimType.style, center, options, mode);
    } else if (delimType.type === "large") {
        return makeLargeDelim(delim, delimType.size, center, options, mode);
    } else if (delimType.type === "stack") {
        return makeStackedDelim(delim, height, center, options, mode);
    }
};

/**
 * Make a delimiter for use with `\left` and `\right`, given a height and depth
 * of an expression that the delimiters surround.
 */
var makeLeftRightDelim = function makeLeftRightDelim(delim, height, depth, options, mode) {
    // We always center \left/\right delimiters, so the axis is always shifted
    var axisHeight = fontMetrics.metrics.axisHeight * options.style.sizeMultiplier;

    // Taken from TeX source, tex.web, function make_left_right
    var delimiterFactor = 901;
    var delimiterExtend = 5 / fontMetrics.metrics.ptPerEm;

    var maxDistFromAxis = Math.max(height - axisHeight, depth + axisHeight);

    var totalHeight = Math.max(
    // In real TeX, calculations are done using integral values which are
    // 65536 per pt, or 655360 per em. So, the division here truncates in
    // TeX but doesn't here, producing different results. If we wanted to
    // exactly match TeX's calculation, we could do
    //   Math.floor(655360 * maxDistFromAxis / 500) *
    //    delimiterFactor / 655360
    // (To see the difference, compare
    //    x^{x^{\left(\rule{0.1em}{0.68em}\right)}}
    // in TeX and KaTeX)
    maxDistFromAxis / 500 * delimiterFactor, 2 * maxDistFromAxis - delimiterExtend);

    // Finally, we defer to `makeCustomSizedDelim` with our calculated total
    // height
    return makeCustomSizedDelim(delim, totalHeight, true, options, mode);
};

module.exports = {
    sizedDelim: makeSizedDelim,
    customSizedDelim: makeCustomSizedDelim,
    leftRightDelim: makeLeftRightDelim
};

},{"./ParseError":87,"./Style":90,"./buildCommon":91,"./fontMetrics":98,"./symbols":104,"./utils":105}],96:[function(require,module,exports){
/**
 * These objects store the data about the DOM nodes we create, as well as some
 * extra data. They can then be transformed into real DOM nodes with the
 * `toNode` function or HTML markup using `toMarkup`. They are useful for both
 * storing extra properties on the nodes, as well as providing a way to easily
 * work with the DOM.
 *
 * Similar functions for working with MathML nodes exist in mathMLTree.js.
 */

"use strict";

var utils = require("./utils");

/**
 * Create an HTML className based on a list of classes. In addition to joining
 * with spaces, we also remove null or empty classes.
 */
var createClass = function createClass(classes) {
    classes = classes.slice();
    for (var i = classes.length - 1; i >= 0; i--) {
        if (!classes[i]) {
            classes.splice(i, 1);
        }
    }

    return classes.join(" ");
};

/**
 * This node represents a span node, with a className, a list of children, and
 * an inline style. It also contains information about its height, depth, and
 * maxFontSize.
 */
function span(classes, children, height, depth, maxFontSize, style) {
    this.classes = classes || [];
    this.children = children || [];
    this.height = height || 0;
    this.depth = depth || 0;
    this.maxFontSize = maxFontSize || 0;
    this.style = style || {};
    this.attributes = {};
}

/**
 * Sets an arbitrary attribute on the span. Warning: use this wisely. Not all
 * browsers support attributes the same, and having too many custom attributes
 * is probably bad.
 */
span.prototype.setAttribute = function (attribute, value) {
    this.attributes[attribute] = value;
};

/**
 * Convert the span into an HTML node
 */
span.prototype.toNode = function () {
    var span = document.createElement("span");

    // Apply the class
    span.className = createClass(this.classes);

    // Apply inline styles
    for (var style in this.style) {
        if (Object.prototype.hasOwnProperty.call(this.style, style)) {
            span.style[style] = this.style[style];
        }
    }

    // Apply attributes
    for (var attr in this.attributes) {
        if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
            span.setAttribute(attr, this.attributes[attr]);
        }
    }

    // Append the children, also as HTML nodes
    for (var i = 0; i < this.children.length; i++) {
        span.appendChild(this.children[i].toNode());
    }

    return span;
};

/**
 * Convert the span into an HTML markup string
 */
span.prototype.toMarkup = function () {
    var markup = "<span";

    // Add the class
    if (this.classes.length) {
        markup += " class=\"";
        markup += utils.escape(createClass(this.classes));
        markup += "\"";
    }

    var styles = "";

    // Add the styles, after hyphenation
    for (var style in this.style) {
        if (this.style.hasOwnProperty(style)) {
            styles += utils.hyphenate(style) + ":" + this.style[style] + ";";
        }
    }

    if (styles) {
        markup += " style=\"" + utils.escape(styles) + "\"";
    }

    // Add the attributes
    for (var attr in this.attributes) {
        if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
            markup += " " + attr + "=\"";
            markup += utils.escape(this.attributes[attr]);
            markup += "\"";
        }
    }

    markup += ">";

    // Add the markup of the children, also as markup
    for (var i = 0; i < this.children.length; i++) {
        markup += this.children[i].toMarkup();
    }

    markup += "</span>";

    return markup;
};

/**
 * This node represents a document fragment, which contains elements, but when
 * placed into the DOM doesn't have any representation itself. Thus, it only
 * contains children and doesn't have any HTML properties. It also keeps track
 * of a height, depth, and maxFontSize.
 */
function documentFragment(children, height, depth, maxFontSize) {
    this.children = children || [];
    this.height = height || 0;
    this.depth = depth || 0;
    this.maxFontSize = maxFontSize || 0;
}

/**
 * Convert the fragment into a node
 */
documentFragment.prototype.toNode = function () {
    // Create a fragment
    var frag = document.createDocumentFragment();

    // Append the children
    for (var i = 0; i < this.children.length; i++) {
        frag.appendChild(this.children[i].toNode());
    }

    return frag;
};

/**
 * Convert the fragment into HTML markup
 */
documentFragment.prototype.toMarkup = function () {
    var markup = "";

    // Simply concatenate the markup for the children together
    for (var i = 0; i < this.children.length; i++) {
        markup += this.children[i].toMarkup();
    }

    return markup;
};

/**
 * A symbol node contains information about a single symbol. It either renders
 * to a single text node, or a span with a single text node in it, depending on
 * whether it has CSS classes, styles, or needs italic correction.
 */
function symbolNode(value, height, depth, italic, skew, classes, style) {
    this.value = value || "";
    this.height = height || 0;
    this.depth = depth || 0;
    this.italic = italic || 0;
    this.skew = skew || 0;
    this.classes = classes || [];
    this.style = style || {};
    this.maxFontSize = 0;
}

/**
 * Creates a text node or span from a symbol node. Note that a span is only
 * created if it is needed.
 */
symbolNode.prototype.toNode = function () {
    var node = document.createTextNode(this.value);
    var span = null;

    if (this.italic > 0) {
        span = document.createElement("span");
        span.style.marginRight = this.italic + "em";
    }

    if (this.classes.length > 0) {
        span = span || document.createElement("span");
        span.className = createClass(this.classes);
    }

    for (var style in this.style) {
        if (this.style.hasOwnProperty(style)) {
            span = span || document.createElement("span");
            span.style[style] = this.style[style];
        }
    }

    if (span) {
        span.appendChild(node);
        return span;
    } else {
        return node;
    }
};

/**
 * Creates markup for a symbol node.
 */
symbolNode.prototype.toMarkup = function () {
    // TODO(alpert): More duplication than I'd like from
    // span.prototype.toMarkup and symbolNode.prototype.toNode...
    var needsSpan = false;

    var markup = "<span";

    if (this.classes.length) {
        needsSpan = true;
        markup += " class=\"";
        markup += utils.escape(createClass(this.classes));
        markup += "\"";
    }

    var styles = "";

    if (this.italic > 0) {
        styles += "margin-right:" + this.italic + "em;";
    }
    for (var style in this.style) {
        if (this.style.hasOwnProperty(style)) {
            styles += utils.hyphenate(style) + ":" + this.style[style] + ";";
        }
    }

    if (styles) {
        needsSpan = true;
        markup += " style=\"" + utils.escape(styles) + "\"";
    }

    var escaped = utils.escape(this.value);
    if (needsSpan) {
        markup += ">";
        markup += escaped;
        markup += "</span>";
        return markup;
    } else {
        return escaped;
    }
};

module.exports = {
    span: span,
    documentFragment: documentFragment,
    symbolNode: symbolNode
};

},{"./utils":105}],97:[function(require,module,exports){
"use strict";

var fontMetrics = require("./fontMetrics");
var parseData = require("./parseData");
var ParseError = require("./ParseError");

var ParseNode = parseData.ParseNode;
var ParseResult = parseData.ParseResult;

/**
 * Parse the body of the environment, with rows delimited by \\ and
 * columns delimited by &, and create a nested list in row-major order
 * with one group per cell.
 */
function parseArray(parser, pos, mode, result) {
    var row = [],
        body = [row],
        rowGaps = [];
    while (true) {
        var cell = parser.parseExpression(pos, mode, false, null);
        row.push(new ParseNode("ordgroup", cell.result, mode));
        pos = cell.position;
        var next = cell.peek.text;
        if (next === "&") {
            pos = cell.peek.position;
        } else if (next === "\\end") {
            break;
        } else if (next === "\\\\" || next === "\\cr") {
            var cr = parser.parseFunction(pos, mode);
            rowGaps.push(cr.result.value.size);
            pos = cr.position;
            row = [];
            body.push(row);
        } else {
            throw new ParseError("Expected & or \\\\ or \\end", parser.lexer, cell.peek.position);
        }
    }
    result.body = body;
    result.rowGaps = rowGaps;
    return new ParseResult(new ParseNode(result.type, result, mode), pos);
}

/*
 * An environment definition is very similar to a function definition.
 * Each element of the following array may contain
 *  - names: The names associated with a function. This can be used to
 *           share one implementation between several similar environments.
 *  - numArgs: The number of arguments after the \begin{name} function.
 *  - argTypes: (optional) Just like for a function
 *  - allowedInText: (optional) Whether or not the environment is allowed inside
 *                   text mode (default false) (not enforced yet)
 *  - numOptionalArgs: (optional) Just like for a function
 *  - handler: The function that is called to handle this environment.
 *             It will receive the following arguments:
 *             - pos: the current position of the parser.
 *             - mode: the current parsing mode.
 *             - envName: the name of the environment, one of the listed names.
 *             - [args]: the arguments passed to \begin.
 *             - positions: the positions associated with these arguments.
 */

var environmentDefinitions = [

// Arrays are part of LaTeX, defined in lttab.dtx so its documentation
// is part of the source2e.pdf file of LaTeX2e source documentation.
{
    names: ["array"],
    numArgs: 1,
    handler: function handler(pos, mode, envName, colalign, positions) {
        var parser = this;
        colalign = colalign.value.map ? colalign.value : [colalign];
        var cols = colalign.map(function (node) {
            var ca = node.value;
            if ("lcr".indexOf(ca) !== -1) {
                return {
                    type: "align",
                    align: ca
                };
            } else if (ca === "|") {
                return {
                    type: "separator",
                    separator: "|"
                };
            }
            throw new ParseError("Unknown column alignment: " + node.value, parser.lexer, positions[1]);
        });
        var res = {
            type: "array",
            cols: cols,
            hskipBeforeAndAfter: true // \@preamble in lttab.dtx
        };
        res = parseArray(parser, pos, mode, res);
        return res;
    }
},

// The matrix environments of amsmath builds on the array environment
// of LaTeX, which is discussed above.
{
    names: ["matrix", "pmatrix", "bmatrix", "Bmatrix", "vmatrix", "Vmatrix"],
    handler: function handler(pos, mode, envName) {
        var delimiters = ({
            matrix: null,
            pmatrix: ["(", ")"],
            bmatrix: ["[", "]"],
            Bmatrix: ["\\{", "\\}"],
            vmatrix: ["|", "|"],
            Vmatrix: ["\\Vert", "\\Vert"]
        })[envName];
        var res = {
            type: "array",
            hskipBeforeAndAfter: false // \hskip -\arraycolsep in amsmath
        };
        res = parseArray(this, pos, mode, res);
        if (delimiters) {
            res.result = new ParseNode("leftright", {
                body: [res.result],
                left: delimiters[0],
                right: delimiters[1]
            }, mode);
        }
        return res;
    }
},

// A cases environment (in amsmath.sty) is almost equivalent to
// \def\arraystretch{1.2}%
// \left\{\begin{array}{@{}l@{\quad}l@{}} … \end{array}\right.
{
    names: ["cases"],
    handler: function handler(pos, mode, envName) {
        var res = {
            type: "array",
            arraystretch: 1.2,
            cols: [{
                type: "align",
                align: "l",
                pregap: 0,
                postgap: fontMetrics.metrics.quad
            }, {
                type: "align",
                align: "l",
                pregap: 0,
                postgap: 0
            }]
        };
        res = parseArray(this, pos, mode, res);
        res.result = new ParseNode("leftright", {
            body: [res.result],
            left: "\\{",
            right: "."
        }, mode);
        return res;
    }
}];

module.exports = (function () {
    // nested function so we don't leak i and j into the module scope
    var exports = {};
    for (var i = 0; i < environmentDefinitions.length; ++i) {
        var def = environmentDefinitions[i];
        def.greediness = 1;
        def.allowedInText = !!def.allowedInText;
        def.numArgs = def.numArgs || 0;
        def.numOptionalArgs = def.numOptionalArgs || 0;
        for (var j = 0; j < def.names.length; ++j) {
            exports[def.names[j]] = def;
        }
    }
    return exports;
})();

},{"./ParseError":87,"./fontMetrics":98,"./parseData":102}],98:[function(require,module,exports){
/* jshint unused:false */

"use strict";

var Style = require("./Style");

/**
 * This file contains metrics regarding fonts and individual symbols. The sigma
 * and xi variables, as well as the metricMap map contain data extracted from
 * TeX, TeX font metrics, and the TTF files. These data are then exposed via the
 * `metrics` variable and the getCharacterMetrics function.
 */

// These font metrics are extracted from TeX by using
// \font\a=cmmi10
// \showthe\fontdimenX\a
// where X is the corresponding variable number. These correspond to the font
// parameters of the symbol fonts. In TeX, there are actually three sets of
// dimensions, one for each of textstyle, scriptstyle, and scriptscriptstyle,
// but we only use the textstyle ones, and scale certain dimensions accordingly.
// See the TeXbook, page 441.
var sigma1 = 0.025;
var sigma2 = 0;
var sigma3 = 0;
var sigma4 = 0;
var sigma5 = 0.431;
var sigma6 = 1;
var sigma7 = 0;
var sigma8 = 0.677;
var sigma9 = 0.394;
var sigma10 = 0.444;
var sigma11 = 0.686;
var sigma12 = 0.345;
var sigma13 = 0.413;
var sigma14 = 0.363;
var sigma15 = 0.289;
var sigma16 = 0.15;
var sigma17 = 0.247;
var sigma18 = 0.386;
var sigma19 = 0.05;
var sigma20 = 2.39;
var sigma21 = 1.01;
var sigma21Script = 0.81;
var sigma21ScriptScript = 0.71;
var sigma22 = 0.25;

// These font metrics are extracted from TeX by using
// \font\a=cmex10
// \showthe\fontdimenX\a
// where X is the corresponding variable number. These correspond to the font
// parameters of the extension fonts (family 3). See the TeXbook, page 441.
var xi1 = 0;
var xi2 = 0;
var xi3 = 0;
var xi4 = 0;
var xi5 = 0.431;
var xi6 = 1;
var xi7 = 0;
var xi8 = 0.04;
var xi9 = 0.111;
var xi10 = 0.166;
var xi11 = 0.2;
var xi12 = 0.6;
var xi13 = 0.1;

// This value determines how large a pt is, for metrics which are defined in
// terms of pts.
// This value is also used in katex.less; if you change it make sure the values
// match.
var ptPerEm = 10;

// The space between adjacent `|` columns in an array definition. From
// `\showthe\doublerulesep` in LaTeX.
var doubleRuleSep = 2 / ptPerEm;

/**
 * This is just a mapping from common names to real metrics
 */
var metrics = {
    xHeight: sigma5,
    quad: sigma6,
    num1: sigma8,
    num2: sigma9,
    num3: sigma10,
    denom1: sigma11,
    denom2: sigma12,
    sup1: sigma13,
    sup2: sigma14,
    sup3: sigma15,
    sub1: sigma16,
    sub2: sigma17,
    supDrop: sigma18,
    subDrop: sigma19,
    axisHeight: sigma22,
    defaultRuleThickness: xi8,
    bigOpSpacing1: xi9,
    bigOpSpacing2: xi10,
    bigOpSpacing3: xi11,
    bigOpSpacing4: xi12,
    bigOpSpacing5: xi13,
    ptPerEm: ptPerEm,
    emPerEx: sigma5 / sigma6,
    doubleRuleSep: doubleRuleSep,

    // TODO(alpert): Missing parallel structure here. We should probably add
    // style-specific metrics for all of these.
    delim1: sigma20,
    getDelim2: function getDelim2(style) {
        if (style.size === Style.TEXT.size) {
            return sigma21;
        } else if (style.size === Style.SCRIPT.size) {
            return sigma21Script;
        } else if (style.size === Style.SCRIPTSCRIPT.size) {
            return sigma21ScriptScript;
        }
        throw new Error("Unexpected style size: " + style.size);
    }
};

// This map contains a mapping from font name and character code to character
// metrics, including height, depth, italic correction, and skew (kern from the
// character to the corresponding \skewchar)
// This map is generated via `make metrics`. It should not be changed manually.
var metricMap = require("./fontMetricsData");

/**
 * This function is a convience function for looking up information in the
 * metricMap table. It takes a character as a string, and a style
 */
var getCharacterMetrics = function getCharacterMetrics(character, style) {
    return metricMap[style][character.charCodeAt(0)];
};

module.exports = {
    metrics: metrics,
    getCharacterMetrics: getCharacterMetrics
};

},{"./Style":90,"./fontMetricsData":99}],99:[function(require,module,exports){
"use strict";module.exports = {"AMS-Regular":{"65":{depth:0, height:0.68889, italic:0, skew:0}, "66":{depth:0, height:0.68889, italic:0, skew:0}, "67":{depth:0, height:0.68889, italic:0, skew:0}, "68":{depth:0, height:0.68889, italic:0, skew:0}, "69":{depth:0, height:0.68889, italic:0, skew:0}, "70":{depth:0, height:0.68889, italic:0, skew:0}, "71":{depth:0, height:0.68889, italic:0, skew:0}, "72":{depth:0, height:0.68889, italic:0, skew:0}, "73":{depth:0, height:0.68889, italic:0, skew:0}, "74":{depth:0.16667, height:0.68889, italic:0, skew:0}, "75":{depth:0, height:0.68889, italic:0, skew:0}, "76":{depth:0, height:0.68889, italic:0, skew:0}, "77":{depth:0, height:0.68889, italic:0, skew:0}, "78":{depth:0, height:0.68889, italic:0, skew:0}, "79":{depth:0.16667, height:0.68889, italic:0, skew:0}, "80":{depth:0, height:0.68889, italic:0, skew:0}, "81":{depth:0.16667, height:0.68889, italic:0, skew:0}, "82":{depth:0, height:0.68889, italic:0, skew:0}, "83":{depth:0, height:0.68889, italic:0, skew:0}, "84":{depth:0, height:0.68889, italic:0, skew:0}, "85":{depth:0, height:0.68889, italic:0, skew:0}, "86":{depth:0, height:0.68889, italic:0, skew:0}, "87":{depth:0, height:0.68889, italic:0, skew:0}, "88":{depth:0, height:0.68889, italic:0, skew:0}, "89":{depth:0, height:0.68889, italic:0, skew:0}, "90":{depth:0, height:0.68889, italic:0, skew:0}, "107":{depth:0, height:0.68889, italic:0, skew:0}, "165":{depth:0, height:0.675, italic:0.025, skew:0}, "174":{depth:0.15559, height:0.69224, italic:0, skew:0}, "240":{depth:0, height:0.68889, italic:0, skew:0}, "295":{depth:0, height:0.68889, italic:0, skew:0}, "710":{depth:0, height:0.825, italic:0, skew:0}, "732":{depth:0, height:0.9, italic:0, skew:0}, "770":{depth:0, height:0.825, italic:0, skew:0}, "771":{depth:0, height:0.9, italic:0, skew:0}, "989":{depth:0.08167, height:0.58167, italic:0, skew:0}, "1008":{depth:0, height:0.43056, italic:0.04028, skew:0}, "8245":{depth:0, height:0.54986, italic:0, skew:0}, "8463":{depth:0, height:0.68889, italic:0, skew:0}, "8487":{depth:0, height:0.68889, italic:0, skew:0}, "8498":{depth:0, height:0.68889, italic:0, skew:0}, "8502":{depth:0, height:0.68889, italic:0, skew:0}, "8503":{depth:0, height:0.68889, italic:0, skew:0}, "8504":{depth:0, height:0.68889, italic:0, skew:0}, "8513":{depth:0, height:0.68889, italic:0, skew:0}, "8592":{depth:-0.03598, height:0.46402, italic:0, skew:0}, "8594":{depth:-0.03598, height:0.46402, italic:0, skew:0}, "8602":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8603":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8606":{depth:0.01354, height:0.52239, italic:0, skew:0}, "8608":{depth:0.01354, height:0.52239, italic:0, skew:0}, "8610":{depth:0.01354, height:0.52239, italic:0, skew:0}, "8611":{depth:0.01354, height:0.52239, italic:0, skew:0}, "8619":{depth:0, height:0.54986, italic:0, skew:0}, "8620":{depth:0, height:0.54986, italic:0, skew:0}, "8621":{depth:-0.13313, height:0.37788, italic:0, skew:0}, "8622":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8624":{depth:0, height:0.69224, italic:0, skew:0}, "8625":{depth:0, height:0.69224, italic:0, skew:0}, "8630":{depth:0, height:0.43056, italic:0, skew:0}, "8631":{depth:0, height:0.43056, italic:0, skew:0}, "8634":{depth:0.08198, height:0.58198, italic:0, skew:0}, "8635":{depth:0.08198, height:0.58198, italic:0, skew:0}, "8638":{depth:0.19444, height:0.69224, italic:0, skew:0}, "8639":{depth:0.19444, height:0.69224, italic:0, skew:0}, "8642":{depth:0.19444, height:0.69224, italic:0, skew:0}, "8643":{depth:0.19444, height:0.69224, italic:0, skew:0}, "8644":{depth:0.1808, height:0.675, italic:0, skew:0}, "8646":{depth:0.1808, height:0.675, italic:0, skew:0}, "8647":{depth:0.1808, height:0.675, italic:0, skew:0}, "8648":{depth:0.19444, height:0.69224, italic:0, skew:0}, "8649":{depth:0.1808, height:0.675, italic:0, skew:0}, "8650":{depth:0.19444, height:0.69224, italic:0, skew:0}, "8651":{depth:0.01354, height:0.52239, italic:0, skew:0}, "8652":{depth:0.01354, height:0.52239, italic:0, skew:0}, "8653":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8654":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8655":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8666":{depth:0.13667, height:0.63667, italic:0, skew:0}, "8667":{depth:0.13667, height:0.63667, italic:0, skew:0}, "8669":{depth:-0.13313, height:0.37788, italic:0, skew:0}, "8672":{depth:-0.064, height:0.437, italic:0, skew:0}, "8674":{depth:-0.064, height:0.437, italic:0, skew:0}, "8705":{depth:0, height:0.825, italic:0, skew:0}, "8708":{depth:0, height:0.68889, italic:0, skew:0}, "8709":{depth:0.08167, height:0.58167, italic:0, skew:0}, "8717":{depth:0, height:0.43056, italic:0, skew:0}, "8722":{depth:-0.03598, height:0.46402, italic:0, skew:0}, "8724":{depth:0.08198, height:0.69224, italic:0, skew:0}, "8726":{depth:0.08167, height:0.58167, italic:0, skew:0}, "8733":{depth:0, height:0.69224, italic:0, skew:0}, "8736":{depth:0, height:0.69224, italic:0, skew:0}, "8737":{depth:0, height:0.69224, italic:0, skew:0}, "8738":{depth:0.03517, height:0.52239, italic:0, skew:0}, "8739":{depth:0.08167, height:0.58167, italic:0, skew:0}, "8740":{depth:0.25142, height:0.74111, italic:0, skew:0}, "8741":{depth:0.08167, height:0.58167, italic:0, skew:0}, "8742":{depth:0.25142, height:0.74111, italic:0, skew:0}, "8756":{depth:0, height:0.69224, italic:0, skew:0}, "8757":{depth:0, height:0.69224, italic:0, skew:0}, "8764":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8765":{depth:-0.13313, height:0.37788, italic:0, skew:0}, "8769":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8770":{depth:-0.03625, height:0.46375, italic:0, skew:0}, "8774":{depth:0.30274, height:0.79383, italic:0, skew:0}, "8776":{depth:-0.01688, height:0.48312, italic:0, skew:0}, "8778":{depth:0.08167, height:0.58167, italic:0, skew:0}, "8782":{depth:0.06062, height:0.54986, italic:0, skew:0}, "8783":{depth:0.06062, height:0.54986, italic:0, skew:0}, "8785":{depth:0.08198, height:0.58198, italic:0, skew:0}, "8786":{depth:0.08198, height:0.58198, italic:0, skew:0}, "8787":{depth:0.08198, height:0.58198, italic:0, skew:0}, "8790":{depth:0, height:0.69224, italic:0, skew:0}, "8791":{depth:0.22958, height:0.72958, italic:0, skew:0}, "8796":{depth:0.08198, height:0.91667, italic:0, skew:0}, "8806":{depth:0.25583, height:0.75583, italic:0, skew:0}, "8807":{depth:0.25583, height:0.75583, italic:0, skew:0}, "8808":{depth:0.25142, height:0.75726, italic:0, skew:0}, "8809":{depth:0.25142, height:0.75726, italic:0, skew:0}, "8812":{depth:0.25583, height:0.75583, italic:0, skew:0}, "8814":{depth:0.20576, height:0.70576, italic:0, skew:0}, "8815":{depth:0.20576, height:0.70576, italic:0, skew:0}, "8816":{depth:0.30274, height:0.79383, italic:0, skew:0}, "8817":{depth:0.30274, height:0.79383, italic:0, skew:0}, "8818":{depth:0.22958, height:0.72958, italic:0, skew:0}, "8819":{depth:0.22958, height:0.72958, italic:0, skew:0}, "8822":{depth:0.1808, height:0.675, italic:0, skew:0}, "8823":{depth:0.1808, height:0.675, italic:0, skew:0}, "8828":{depth:0.13667, height:0.63667, italic:0, skew:0}, "8829":{depth:0.13667, height:0.63667, italic:0, skew:0}, "8830":{depth:0.22958, height:0.72958, italic:0, skew:0}, "8831":{depth:0.22958, height:0.72958, italic:0, skew:0}, "8832":{depth:0.20576, height:0.70576, italic:0, skew:0}, "8833":{depth:0.20576, height:0.70576, italic:0, skew:0}, "8840":{depth:0.30274, height:0.79383, italic:0, skew:0}, "8841":{depth:0.30274, height:0.79383, italic:0, skew:0}, "8842":{depth:0.13597, height:0.63597, italic:0, skew:0}, "8843":{depth:0.13597, height:0.63597, italic:0, skew:0}, "8847":{depth:0.03517, height:0.54986, italic:0, skew:0}, "8848":{depth:0.03517, height:0.54986, italic:0, skew:0}, "8858":{depth:0.08198, height:0.58198, italic:0, skew:0}, "8859":{depth:0.08198, height:0.58198, italic:0, skew:0}, "8861":{depth:0.08198, height:0.58198, italic:0, skew:0}, "8862":{depth:0, height:0.675, italic:0, skew:0}, "8863":{depth:0, height:0.675, italic:0, skew:0}, "8864":{depth:0, height:0.675, italic:0, skew:0}, "8865":{depth:0, height:0.675, italic:0, skew:0}, "8872":{depth:0, height:0.69224, italic:0, skew:0}, "8873":{depth:0, height:0.69224, italic:0, skew:0}, "8874":{depth:0, height:0.69224, italic:0, skew:0}, "8876":{depth:0, height:0.68889, italic:0, skew:0}, "8877":{depth:0, height:0.68889, italic:0, skew:0}, "8878":{depth:0, height:0.68889, italic:0, skew:0}, "8879":{depth:0, height:0.68889, italic:0, skew:0}, "8882":{depth:0.03517, height:0.54986, italic:0, skew:0}, "8883":{depth:0.03517, height:0.54986, italic:0, skew:0}, "8884":{depth:0.13667, height:0.63667, italic:0, skew:0}, "8885":{depth:0.13667, height:0.63667, italic:0, skew:0}, "8888":{depth:0, height:0.54986, italic:0, skew:0}, "8890":{depth:0.19444, height:0.43056, italic:0, skew:0}, "8891":{depth:0.19444, height:0.69224, italic:0, skew:0}, "8892":{depth:0.19444, height:0.69224, italic:0, skew:0}, "8901":{depth:0, height:0.54986, italic:0, skew:0}, "8903":{depth:0.08167, height:0.58167, italic:0, skew:0}, "8905":{depth:0.08167, height:0.58167, italic:0, skew:0}, "8906":{depth:0.08167, height:0.58167, italic:0, skew:0}, "8907":{depth:0, height:0.69224, italic:0, skew:0}, "8908":{depth:0, height:0.69224, italic:0, skew:0}, "8909":{depth:-0.03598, height:0.46402, italic:0, skew:0}, "8910":{depth:0, height:0.54986, italic:0, skew:0}, "8911":{depth:0, height:0.54986, italic:0, skew:0}, "8912":{depth:0.03517, height:0.54986, italic:0, skew:0}, "8913":{depth:0.03517, height:0.54986, italic:0, skew:0}, "8914":{depth:0, height:0.54986, italic:0, skew:0}, "8915":{depth:0, height:0.54986, italic:0, skew:0}, "8916":{depth:0, height:0.69224, italic:0, skew:0}, "8918":{depth:0.0391, height:0.5391, italic:0, skew:0}, "8919":{depth:0.0391, height:0.5391, italic:0, skew:0}, "8920":{depth:0.03517, height:0.54986, italic:0, skew:0}, "8921":{depth:0.03517, height:0.54986, italic:0, skew:0}, "8922":{depth:0.38569, height:0.88569, italic:0, skew:0}, "8923":{depth:0.38569, height:0.88569, italic:0, skew:0}, "8926":{depth:0.13667, height:0.63667, italic:0, skew:0}, "8927":{depth:0.13667, height:0.63667, italic:0, skew:0}, "8928":{depth:0.30274, height:0.79383, italic:0, skew:0}, "8929":{depth:0.30274, height:0.79383, italic:0, skew:0}, "8934":{depth:0.23222, height:0.74111, italic:0, skew:0}, "8935":{depth:0.23222, height:0.74111, italic:0, skew:0}, "8936":{depth:0.23222, height:0.74111, italic:0, skew:0}, "8937":{depth:0.23222, height:0.74111, italic:0, skew:0}, "8938":{depth:0.20576, height:0.70576, italic:0, skew:0}, "8939":{depth:0.20576, height:0.70576, italic:0, skew:0}, "8940":{depth:0.30274, height:0.79383, italic:0, skew:0}, "8941":{depth:0.30274, height:0.79383, italic:0, skew:0}, "8994":{depth:0.19444, height:0.69224, italic:0, skew:0}, "8995":{depth:0.19444, height:0.69224, italic:0, skew:0}, "9416":{depth:0.15559, height:0.69224, italic:0, skew:0}, "9484":{depth:0, height:0.69224, italic:0, skew:0}, "9488":{depth:0, height:0.69224, italic:0, skew:0}, "9492":{depth:0, height:0.37788, italic:0, skew:0}, "9496":{depth:0, height:0.37788, italic:0, skew:0}, "9585":{depth:0.19444, height:0.68889, italic:0, skew:0}, "9586":{depth:0.19444, height:0.74111, italic:0, skew:0}, "9632":{depth:0, height:0.675, italic:0, skew:0}, "9633":{depth:0, height:0.675, italic:0, skew:0}, "9650":{depth:0, height:0.54986, italic:0, skew:0}, "9651":{depth:0, height:0.54986, italic:0, skew:0}, "9654":{depth:0.03517, height:0.54986, italic:0, skew:0}, "9660":{depth:0, height:0.54986, italic:0, skew:0}, "9661":{depth:0, height:0.54986, italic:0, skew:0}, "9664":{depth:0.03517, height:0.54986, italic:0, skew:0}, "9674":{depth:0.11111, height:0.69224, italic:0, skew:0}, "9733":{depth:0.19444, height:0.69224, italic:0, skew:0}, "10003":{depth:0, height:0.69224, italic:0, skew:0}, "10016":{depth:0, height:0.69224, italic:0, skew:0}, "10731":{depth:0.11111, height:0.69224, italic:0, skew:0}, "10846":{depth:0.19444, height:0.75583, italic:0, skew:0}, "10877":{depth:0.13667, height:0.63667, italic:0, skew:0}, "10878":{depth:0.13667, height:0.63667, italic:0, skew:0}, "10885":{depth:0.25583, height:0.75583, italic:0, skew:0}, "10886":{depth:0.25583, height:0.75583, italic:0, skew:0}, "10887":{depth:0.13597, height:0.63597, italic:0, skew:0}, "10888":{depth:0.13597, height:0.63597, italic:0, skew:0}, "10889":{depth:0.26167, height:0.75726, italic:0, skew:0}, "10890":{depth:0.26167, height:0.75726, italic:0, skew:0}, "10891":{depth:0.48256, height:0.98256, italic:0, skew:0}, "10892":{depth:0.48256, height:0.98256, italic:0, skew:0}, "10901":{depth:0.13667, height:0.63667, italic:0, skew:0}, "10902":{depth:0.13667, height:0.63667, italic:0, skew:0}, "10933":{depth:0.25142, height:0.75726, italic:0, skew:0}, "10934":{depth:0.25142, height:0.75726, italic:0, skew:0}, "10935":{depth:0.26167, height:0.75726, italic:0, skew:0}, "10936":{depth:0.26167, height:0.75726, italic:0, skew:0}, "10937":{depth:0.26167, height:0.75726, italic:0, skew:0}, "10938":{depth:0.26167, height:0.75726, italic:0, skew:0}, "10949":{depth:0.25583, height:0.75583, italic:0, skew:0}, "10950":{depth:0.25583, height:0.75583, italic:0, skew:0}, "10955":{depth:0.28481, height:0.79383, italic:0, skew:0}, "10956":{depth:0.28481, height:0.79383, italic:0, skew:0}, "57350":{depth:0.08167, height:0.58167, italic:0, skew:0}, "57351":{depth:0.08167, height:0.58167, italic:0, skew:0}, "57352":{depth:0.08167, height:0.58167, italic:0, skew:0}, "57353":{depth:0, height:0.43056, italic:0.04028, skew:0}, "57356":{depth:0.25142, height:0.75726, italic:0, skew:0}, "57357":{depth:0.25142, height:0.75726, italic:0, skew:0}, "57358":{depth:0.41951, height:0.91951, italic:0, skew:0}, "57359":{depth:0.30274, height:0.79383, italic:0, skew:0}, "57360":{depth:0.30274, height:0.79383, italic:0, skew:0}, "57361":{depth:0.41951, height:0.91951, italic:0, skew:0}, "57366":{depth:0.25142, height:0.75726, italic:0, skew:0}, "57367":{depth:0.25142, height:0.75726, italic:0, skew:0}, "57368":{depth:0.25142, height:0.75726, italic:0, skew:0}, "57369":{depth:0.25142, height:0.75726, italic:0, skew:0}, "57370":{depth:0.13597, height:0.63597, italic:0, skew:0}, "57371":{depth:0.13597, height:0.63597, italic:0, skew:0}}, "Caligraphic-Regular":{"48":{depth:0, height:0.43056, italic:0, skew:0}, "49":{depth:0, height:0.43056, italic:0, skew:0}, "50":{depth:0, height:0.43056, italic:0, skew:0}, "51":{depth:0.19444, height:0.43056, italic:0, skew:0}, "52":{depth:0.19444, height:0.43056, italic:0, skew:0}, "53":{depth:0.19444, height:0.43056, italic:0, skew:0}, "54":{depth:0, height:0.64444, italic:0, skew:0}, "55":{depth:0.19444, height:0.43056, italic:0, skew:0}, "56":{depth:0, height:0.64444, italic:0, skew:0}, "57":{depth:0.19444, height:0.43056, italic:0, skew:0}, "65":{depth:0, height:0.68333, italic:0, skew:0.19445}, "66":{depth:0, height:0.68333, italic:0.03041, skew:0.13889}, "67":{depth:0, height:0.68333, italic:0.05834, skew:0.13889}, "68":{depth:0, height:0.68333, italic:0.02778, skew:0.08334}, "69":{depth:0, height:0.68333, italic:0.08944, skew:0.11111}, "70":{depth:0, height:0.68333, italic:0.09931, skew:0.11111}, "71":{depth:0.09722, height:0.68333, italic:0.0593, skew:0.11111}, "72":{depth:0, height:0.68333, italic:0.00965, skew:0.11111}, "73":{depth:0, height:0.68333, italic:0.07382, skew:0}, "74":{depth:0.09722, height:0.68333, italic:0.18472, skew:0.16667}, "75":{depth:0, height:0.68333, italic:0.01445, skew:0.05556}, "76":{depth:0, height:0.68333, italic:0, skew:0.13889}, "77":{depth:0, height:0.68333, italic:0, skew:0.13889}, "78":{depth:0, height:0.68333, italic:0.14736, skew:0.08334}, "79":{depth:0, height:0.68333, italic:0.02778, skew:0.11111}, "80":{depth:0, height:0.68333, italic:0.08222, skew:0.08334}, "81":{depth:0.09722, height:0.68333, italic:0, skew:0.11111}, "82":{depth:0, height:0.68333, italic:0, skew:0.08334}, "83":{depth:0, height:0.68333, italic:0.075, skew:0.13889}, "84":{depth:0, height:0.68333, italic:0.25417, skew:0}, "85":{depth:0, height:0.68333, italic:0.09931, skew:0.08334}, "86":{depth:0, height:0.68333, italic:0.08222, skew:0}, "87":{depth:0, height:0.68333, italic:0.08222, skew:0.08334}, "88":{depth:0, height:0.68333, italic:0.14643, skew:0.13889}, "89":{depth:0.09722, height:0.68333, italic:0.08222, skew:0.08334}, "90":{depth:0, height:0.68333, italic:0.07944, skew:0.13889}}, "Fraktur-Regular":{"33":{depth:0, height:0.69141, italic:0, skew:0}, "34":{depth:0, height:0.69141, italic:0, skew:0}, "38":{depth:0, height:0.69141, italic:0, skew:0}, "39":{depth:0, height:0.69141, italic:0, skew:0}, "40":{depth:0.24982, height:0.74947, italic:0, skew:0}, "41":{depth:0.24982, height:0.74947, italic:0, skew:0}, "42":{depth:0, height:0.62119, italic:0, skew:0}, "43":{depth:0.08319, height:0.58283, italic:0, skew:0}, "44":{depth:0, height:0.10803, italic:0, skew:0}, "45":{depth:0.08319, height:0.58283, italic:0, skew:0}, "46":{depth:0, height:0.10803, italic:0, skew:0}, "47":{depth:0.24982, height:0.74947, italic:0, skew:0}, "48":{depth:0, height:0.47534, italic:0, skew:0}, "49":{depth:0, height:0.47534, italic:0, skew:0}, "50":{depth:0, height:0.47534, italic:0, skew:0}, "51":{depth:0.18906, height:0.47534, italic:0, skew:0}, "52":{depth:0.18906, height:0.47534, italic:0, skew:0}, "53":{depth:0.18906, height:0.47534, italic:0, skew:0}, "54":{depth:0, height:0.69141, italic:0, skew:0}, "55":{depth:0.18906, height:0.47534, italic:0, skew:0}, "56":{depth:0, height:0.69141, italic:0, skew:0}, "57":{depth:0.18906, height:0.47534, italic:0, skew:0}, "58":{depth:0, height:0.47534, italic:0, skew:0}, "59":{depth:0.12604, height:0.47534, italic:0, skew:0}, "61":{depth:-0.13099, height:0.36866, italic:0, skew:0}, "63":{depth:0, height:0.69141, italic:0, skew:0}, "65":{depth:0, height:0.69141, italic:0, skew:0}, "66":{depth:0, height:0.69141, italic:0, skew:0}, "67":{depth:0, height:0.69141, italic:0, skew:0}, "68":{depth:0, height:0.69141, italic:0, skew:0}, "69":{depth:0, height:0.69141, italic:0, skew:0}, "70":{depth:0.12604, height:0.69141, italic:0, skew:0}, "71":{depth:0, height:0.69141, italic:0, skew:0}, "72":{depth:0.06302, height:0.69141, italic:0, skew:0}, "73":{depth:0, height:0.69141, italic:0, skew:0}, "74":{depth:0.12604, height:0.69141, italic:0, skew:0}, "75":{depth:0, height:0.69141, italic:0, skew:0}, "76":{depth:0, height:0.69141, italic:0, skew:0}, "77":{depth:0, height:0.69141, italic:0, skew:0}, "78":{depth:0, height:0.69141, italic:0, skew:0}, "79":{depth:0, height:0.69141, italic:0, skew:0}, "80":{depth:0.18906, height:0.69141, italic:0, skew:0}, "81":{depth:0.03781, height:0.69141, italic:0, skew:0}, "82":{depth:0, height:0.69141, italic:0, skew:0}, "83":{depth:0, height:0.69141, italic:0, skew:0}, "84":{depth:0, height:0.69141, italic:0, skew:0}, "85":{depth:0, height:0.69141, italic:0, skew:0}, "86":{depth:0, height:0.69141, italic:0, skew:0}, "87":{depth:0, height:0.69141, italic:0, skew:0}, "88":{depth:0, height:0.69141, italic:0, skew:0}, "89":{depth:0.18906, height:0.69141, italic:0, skew:0}, "90":{depth:0.12604, height:0.69141, italic:0, skew:0}, "91":{depth:0.24982, height:0.74947, italic:0, skew:0}, "93":{depth:0.24982, height:0.74947, italic:0, skew:0}, "94":{depth:0, height:0.69141, italic:0, skew:0}, "97":{depth:0, height:0.47534, italic:0, skew:0}, "98":{depth:0, height:0.69141, italic:0, skew:0}, "99":{depth:0, height:0.47534, italic:0, skew:0}, "100":{depth:0, height:0.62119, italic:0, skew:0}, "101":{depth:0, height:0.47534, italic:0, skew:0}, "102":{depth:0.18906, height:0.69141, italic:0, skew:0}, "103":{depth:0.18906, height:0.47534, italic:0, skew:0}, "104":{depth:0.18906, height:0.69141, italic:0, skew:0}, "105":{depth:0, height:0.69141, italic:0, skew:0}, "106":{depth:0, height:0.69141, italic:0, skew:0}, "107":{depth:0, height:0.69141, italic:0, skew:0}, "108":{depth:0, height:0.69141, italic:0, skew:0}, "109":{depth:0, height:0.47534, italic:0, skew:0}, "110":{depth:0, height:0.47534, italic:0, skew:0}, "111":{depth:0, height:0.47534, italic:0, skew:0}, "112":{depth:0.18906, height:0.52396, italic:0, skew:0}, "113":{depth:0.18906, height:0.47534, italic:0, skew:0}, "114":{depth:0, height:0.47534, italic:0, skew:0}, "115":{depth:0, height:0.47534, italic:0, skew:0}, "116":{depth:0, height:0.62119, italic:0, skew:0}, "117":{depth:0, height:0.47534, italic:0, skew:0}, "118":{depth:0, height:0.52396, italic:0, skew:0}, "119":{depth:0, height:0.52396, italic:0, skew:0}, "120":{depth:0.18906, height:0.47534, italic:0, skew:0}, "121":{depth:0.18906, height:0.47534, italic:0, skew:0}, "122":{depth:0.18906, height:0.47534, italic:0, skew:0}, "8216":{depth:0, height:0.69141, italic:0, skew:0}, "8217":{depth:0, height:0.69141, italic:0, skew:0}, "58112":{depth:0, height:0.62119, italic:0, skew:0}, "58113":{depth:0, height:0.62119, italic:0, skew:0}, "58114":{depth:0.18906, height:0.69141, italic:0, skew:0}, "58115":{depth:0.18906, height:0.69141, italic:0, skew:0}, "58116":{depth:0.18906, height:0.47534, italic:0, skew:0}, "58117":{depth:0, height:0.69141, italic:0, skew:0}, "58118":{depth:0, height:0.62119, italic:0, skew:0}, "58119":{depth:0, height:0.47534, italic:0, skew:0}}, "Main-Bold":{"33":{depth:0, height:0.69444, italic:0, skew:0}, "34":{depth:0, height:0.69444, italic:0, skew:0}, "35":{depth:0.19444, height:0.69444, italic:0, skew:0}, "36":{depth:0.05556, height:0.75, italic:0, skew:0}, "37":{depth:0.05556, height:0.75, italic:0, skew:0}, "38":{depth:0, height:0.69444, italic:0, skew:0}, "39":{depth:0, height:0.69444, italic:0, skew:0}, "40":{depth:0.25, height:0.75, italic:0, skew:0}, "41":{depth:0.25, height:0.75, italic:0, skew:0}, "42":{depth:0, height:0.75, italic:0, skew:0}, "43":{depth:0.13333, height:0.63333, italic:0, skew:0}, "44":{depth:0.19444, height:0.15556, italic:0, skew:0}, "45":{depth:0, height:0.44444, italic:0, skew:0}, "46":{depth:0, height:0.15556, italic:0, skew:0}, "47":{depth:0.25, height:0.75, italic:0, skew:0}, "48":{depth:0, height:0.64444, italic:0, skew:0}, "49":{depth:0, height:0.64444, italic:0, skew:0}, "50":{depth:0, height:0.64444, italic:0, skew:0}, "51":{depth:0, height:0.64444, italic:0, skew:0}, "52":{depth:0, height:0.64444, italic:0, skew:0}, "53":{depth:0, height:0.64444, italic:0, skew:0}, "54":{depth:0, height:0.64444, italic:0, skew:0}, "55":{depth:0, height:0.64444, italic:0, skew:0}, "56":{depth:0, height:0.64444, italic:0, skew:0}, "57":{depth:0, height:0.64444, italic:0, skew:0}, "58":{depth:0, height:0.44444, italic:0, skew:0}, "59":{depth:0.19444, height:0.44444, italic:0, skew:0}, "60":{depth:0.08556, height:0.58556, italic:0, skew:0}, "61":{depth:-0.10889, height:0.39111, italic:0, skew:0}, "62":{depth:0.08556, height:0.58556, italic:0, skew:0}, "63":{depth:0, height:0.69444, italic:0, skew:0}, "64":{depth:0, height:0.69444, italic:0, skew:0}, "65":{depth:0, height:0.68611, italic:0, skew:0}, "66":{depth:0, height:0.68611, italic:0, skew:0}, "67":{depth:0, height:0.68611, italic:0, skew:0}, "68":{depth:0, height:0.68611, italic:0, skew:0}, "69":{depth:0, height:0.68611, italic:0, skew:0}, "70":{depth:0, height:0.68611, italic:0, skew:0}, "71":{depth:0, height:0.68611, italic:0, skew:0}, "72":{depth:0, height:0.68611, italic:0, skew:0}, "73":{depth:0, height:0.68611, italic:0, skew:0}, "74":{depth:0, height:0.68611, italic:0, skew:0}, "75":{depth:0, height:0.68611, italic:0, skew:0}, "76":{depth:0, height:0.68611, italic:0, skew:0}, "77":{depth:0, height:0.68611, italic:0, skew:0}, "78":{depth:0, height:0.68611, italic:0, skew:0}, "79":{depth:0, height:0.68611, italic:0, skew:0}, "80":{depth:0, height:0.68611, italic:0, skew:0}, "81":{depth:0.19444, height:0.68611, italic:0, skew:0}, "82":{depth:0, height:0.68611, italic:0, skew:0}, "83":{depth:0, height:0.68611, italic:0, skew:0}, "84":{depth:0, height:0.68611, italic:0, skew:0}, "85":{depth:0, height:0.68611, italic:0, skew:0}, "86":{depth:0, height:0.68611, italic:0.01597, skew:0}, "87":{depth:0, height:0.68611, italic:0.01597, skew:0}, "88":{depth:0, height:0.68611, italic:0, skew:0}, "89":{depth:0, height:0.68611, italic:0.02875, skew:0}, "90":{depth:0, height:0.68611, italic:0, skew:0}, "91":{depth:0.25, height:0.75, italic:0, skew:0}, "92":{depth:0.25, height:0.75, italic:0, skew:0}, "93":{depth:0.25, height:0.75, italic:0, skew:0}, "94":{depth:0, height:0.69444, italic:0, skew:0}, "95":{depth:0.31, height:0.13444, italic:0.03194, skew:0}, "96":{depth:0, height:0.69444, italic:0, skew:0}, "97":{depth:0, height:0.44444, italic:0, skew:0}, "98":{depth:0, height:0.69444, italic:0, skew:0}, "99":{depth:0, height:0.44444, italic:0, skew:0}, "100":{depth:0, height:0.69444, italic:0, skew:0}, "101":{depth:0, height:0.44444, italic:0, skew:0}, "102":{depth:0, height:0.69444, italic:0.10903, skew:0}, "103":{depth:0.19444, height:0.44444, italic:0.01597, skew:0}, "104":{depth:0, height:0.69444, italic:0, skew:0}, "105":{depth:0, height:0.69444, italic:0, skew:0}, "106":{depth:0.19444, height:0.69444, italic:0, skew:0}, "107":{depth:0, height:0.69444, italic:0, skew:0}, "108":{depth:0, height:0.69444, italic:0, skew:0}, "109":{depth:0, height:0.44444, italic:0, skew:0}, "110":{depth:0, height:0.44444, italic:0, skew:0}, "111":{depth:0, height:0.44444, italic:0, skew:0}, "112":{depth:0.19444, height:0.44444, italic:0, skew:0}, "113":{depth:0.19444, height:0.44444, italic:0, skew:0}, "114":{depth:0, height:0.44444, italic:0, skew:0}, "115":{depth:0, height:0.44444, italic:0, skew:0}, "116":{depth:0, height:0.63492, italic:0, skew:0}, "117":{depth:0, height:0.44444, italic:0, skew:0}, "118":{depth:0, height:0.44444, italic:0.01597, skew:0}, "119":{depth:0, height:0.44444, italic:0.01597, skew:0}, "120":{depth:0, height:0.44444, italic:0, skew:0}, "121":{depth:0.19444, height:0.44444, italic:0.01597, skew:0}, "122":{depth:0, height:0.44444, italic:0, skew:0}, "123":{depth:0.25, height:0.75, italic:0, skew:0}, "124":{depth:0.25, height:0.75, italic:0, skew:0}, "125":{depth:0.25, height:0.75, italic:0, skew:0}, "126":{depth:0.35, height:0.34444, italic:0, skew:0}, "168":{depth:0, height:0.69444, italic:0, skew:0}, "172":{depth:0, height:0.44444, italic:0, skew:0}, "175":{depth:0, height:0.59611, italic:0, skew:0}, "176":{depth:0, height:0.69444, italic:0, skew:0}, "177":{depth:0.13333, height:0.63333, italic:0, skew:0}, "180":{depth:0, height:0.69444, italic:0, skew:0}, "215":{depth:0.13333, height:0.63333, italic:0, skew:0}, "247":{depth:0.13333, height:0.63333, italic:0, skew:0}, "305":{depth:0, height:0.44444, italic:0, skew:0}, "567":{depth:0.19444, height:0.44444, italic:0, skew:0}, "710":{depth:0, height:0.69444, italic:0, skew:0}, "711":{depth:0, height:0.63194, italic:0, skew:0}, "713":{depth:0, height:0.59611, italic:0, skew:0}, "714":{depth:0, height:0.69444, italic:0, skew:0}, "715":{depth:0, height:0.69444, italic:0, skew:0}, "728":{depth:0, height:0.69444, italic:0, skew:0}, "729":{depth:0, height:0.69444, italic:0, skew:0}, "730":{depth:0, height:0.69444, italic:0, skew:0}, "732":{depth:0, height:0.69444, italic:0, skew:0}, "768":{depth:0, height:0.69444, italic:0, skew:0}, "769":{depth:0, height:0.69444, italic:0, skew:0}, "770":{depth:0, height:0.69444, italic:0, skew:0}, "771":{depth:0, height:0.69444, italic:0, skew:0}, "772":{depth:0, height:0.59611, italic:0, skew:0}, "774":{depth:0, height:0.69444, italic:0, skew:0}, "775":{depth:0, height:0.69444, italic:0, skew:0}, "776":{depth:0, height:0.69444, italic:0, skew:0}, "778":{depth:0, height:0.69444, italic:0, skew:0}, "779":{depth:0, height:0.69444, italic:0, skew:0}, "780":{depth:0, height:0.63194, italic:0, skew:0}, "824":{depth:0.19444, height:0.69444, italic:0, skew:0}, "915":{depth:0, height:0.68611, italic:0, skew:0}, "916":{depth:0, height:0.68611, italic:0, skew:0}, "920":{depth:0, height:0.68611, italic:0, skew:0}, "923":{depth:0, height:0.68611, italic:0, skew:0}, "926":{depth:0, height:0.68611, italic:0, skew:0}, "928":{depth:0, height:0.68611, italic:0, skew:0}, "931":{depth:0, height:0.68611, italic:0, skew:0}, "933":{depth:0, height:0.68611, italic:0, skew:0}, "934":{depth:0, height:0.68611, italic:0, skew:0}, "936":{depth:0, height:0.68611, italic:0, skew:0}, "937":{depth:0, height:0.68611, italic:0, skew:0}, "8211":{depth:0, height:0.44444, italic:0.03194, skew:0}, "8212":{depth:0, height:0.44444, italic:0.03194, skew:0}, "8216":{depth:0, height:0.69444, italic:0, skew:0}, "8217":{depth:0, height:0.69444, italic:0, skew:0}, "8220":{depth:0, height:0.69444, italic:0, skew:0}, "8221":{depth:0, height:0.69444, italic:0, skew:0}, "8224":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8225":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8242":{depth:0, height:0.55556, italic:0, skew:0}, "8407":{depth:0, height:0.72444, italic:0.15486, skew:0}, "8463":{depth:0, height:0.69444, italic:0, skew:0}, "8465":{depth:0, height:0.69444, italic:0, skew:0}, "8467":{depth:0, height:0.69444, italic:0, skew:0}, "8472":{depth:0.19444, height:0.44444, italic:0, skew:0}, "8476":{depth:0, height:0.69444, italic:0, skew:0}, "8501":{depth:0, height:0.69444, italic:0, skew:0}, "8592":{depth:-0.10889, height:0.39111, italic:0, skew:0}, "8593":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8594":{depth:-0.10889, height:0.39111, italic:0, skew:0}, "8595":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8596":{depth:-0.10889, height:0.39111, italic:0, skew:0}, "8597":{depth:0.25, height:0.75, italic:0, skew:0}, "8598":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8599":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8600":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8601":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8636":{depth:-0.10889, height:0.39111, italic:0, skew:0}, "8637":{depth:-0.10889, height:0.39111, italic:0, skew:0}, "8640":{depth:-0.10889, height:0.39111, italic:0, skew:0}, "8641":{depth:-0.10889, height:0.39111, italic:0, skew:0}, "8656":{depth:-0.10889, height:0.39111, italic:0, skew:0}, "8657":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8658":{depth:-0.10889, height:0.39111, italic:0, skew:0}, "8659":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8660":{depth:-0.10889, height:0.39111, italic:0, skew:0}, "8661":{depth:0.25, height:0.75, italic:0, skew:0}, "8704":{depth:0, height:0.69444, italic:0, skew:0}, "8706":{depth:0, height:0.69444, italic:0.06389, skew:0}, "8707":{depth:0, height:0.69444, italic:0, skew:0}, "8709":{depth:0.05556, height:0.75, italic:0, skew:0}, "8711":{depth:0, height:0.68611, italic:0, skew:0}, "8712":{depth:0.08556, height:0.58556, italic:0, skew:0}, "8715":{depth:0.08556, height:0.58556, italic:0, skew:0}, "8722":{depth:0.13333, height:0.63333, italic:0, skew:0}, "8723":{depth:0.13333, height:0.63333, italic:0, skew:0}, "8725":{depth:0.25, height:0.75, italic:0, skew:0}, "8726":{depth:0.25, height:0.75, italic:0, skew:0}, "8727":{depth:-0.02778, height:0.47222, italic:0, skew:0}, "8728":{depth:-0.02639, height:0.47361, italic:0, skew:0}, "8729":{depth:-0.02639, height:0.47361, italic:0, skew:0}, "8730":{depth:0.18, height:0.82, italic:0, skew:0}, "8733":{depth:0, height:0.44444, italic:0, skew:0}, "8734":{depth:0, height:0.44444, italic:0, skew:0}, "8736":{depth:0, height:0.69224, italic:0, skew:0}, "8739":{depth:0.25, height:0.75, italic:0, skew:0}, "8741":{depth:0.25, height:0.75, italic:0, skew:0}, "8743":{depth:0, height:0.55556, italic:0, skew:0}, "8744":{depth:0, height:0.55556, italic:0, skew:0}, "8745":{depth:0, height:0.55556, italic:0, skew:0}, "8746":{depth:0, height:0.55556, italic:0, skew:0}, "8747":{depth:0.19444, height:0.69444, italic:0.12778, skew:0}, "8764":{depth:-0.10889, height:0.39111, italic:0, skew:0}, "8768":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8771":{depth:0.00222, height:0.50222, italic:0, skew:0}, "8776":{depth:0.02444, height:0.52444, italic:0, skew:0}, "8781":{depth:0.00222, height:0.50222, italic:0, skew:0}, "8801":{depth:0.00222, height:0.50222, italic:0, skew:0}, "8804":{depth:0.19667, height:0.69667, italic:0, skew:0}, "8805":{depth:0.19667, height:0.69667, italic:0, skew:0}, "8810":{depth:0.08556, height:0.58556, italic:0, skew:0}, "8811":{depth:0.08556, height:0.58556, italic:0, skew:0}, "8826":{depth:0.08556, height:0.58556, italic:0, skew:0}, "8827":{depth:0.08556, height:0.58556, italic:0, skew:0}, "8834":{depth:0.08556, height:0.58556, italic:0, skew:0}, "8835":{depth:0.08556, height:0.58556, italic:0, skew:0}, "8838":{depth:0.19667, height:0.69667, italic:0, skew:0}, "8839":{depth:0.19667, height:0.69667, italic:0, skew:0}, "8846":{depth:0, height:0.55556, italic:0, skew:0}, "8849":{depth:0.19667, height:0.69667, italic:0, skew:0}, "8850":{depth:0.19667, height:0.69667, italic:0, skew:0}, "8851":{depth:0, height:0.55556, italic:0, skew:0}, "8852":{depth:0, height:0.55556, italic:0, skew:0}, "8853":{depth:0.13333, height:0.63333, italic:0, skew:0}, "8854":{depth:0.13333, height:0.63333, italic:0, skew:0}, "8855":{depth:0.13333, height:0.63333, italic:0, skew:0}, "8856":{depth:0.13333, height:0.63333, italic:0, skew:0}, "8857":{depth:0.13333, height:0.63333, italic:0, skew:0}, "8866":{depth:0, height:0.69444, italic:0, skew:0}, "8867":{depth:0, height:0.69444, italic:0, skew:0}, "8868":{depth:0, height:0.69444, italic:0, skew:0}, "8869":{depth:0, height:0.69444, italic:0, skew:0}, "8900":{depth:-0.02639, height:0.47361, italic:0, skew:0}, "8901":{depth:-0.02639, height:0.47361, italic:0, skew:0}, "8902":{depth:-0.02778, height:0.47222, italic:0, skew:0}, "8968":{depth:0.25, height:0.75, italic:0, skew:0}, "8969":{depth:0.25, height:0.75, italic:0, skew:0}, "8970":{depth:0.25, height:0.75, italic:0, skew:0}, "8971":{depth:0.25, height:0.75, italic:0, skew:0}, "8994":{depth:-0.13889, height:0.36111, italic:0, skew:0}, "8995":{depth:-0.13889, height:0.36111, italic:0, skew:0}, "9651":{depth:0.19444, height:0.69444, italic:0, skew:0}, "9657":{depth:-0.02778, height:0.47222, italic:0, skew:0}, "9661":{depth:0.19444, height:0.69444, italic:0, skew:0}, "9667":{depth:-0.02778, height:0.47222, italic:0, skew:0}, "9711":{depth:0.19444, height:0.69444, italic:0, skew:0}, "9824":{depth:0.12963, height:0.69444, italic:0, skew:0}, "9825":{depth:0.12963, height:0.69444, italic:0, skew:0}, "9826":{depth:0.12963, height:0.69444, italic:0, skew:0}, "9827":{depth:0.12963, height:0.69444, italic:0, skew:0}, "9837":{depth:0, height:0.75, italic:0, skew:0}, "9838":{depth:0.19444, height:0.69444, italic:0, skew:0}, "9839":{depth:0.19444, height:0.69444, italic:0, skew:0}, "10216":{depth:0.25, height:0.75, italic:0, skew:0}, "10217":{depth:0.25, height:0.75, italic:0, skew:0}, "10815":{depth:0, height:0.68611, italic:0, skew:0}, "10927":{depth:0.19667, height:0.69667, italic:0, skew:0}, "10928":{depth:0.19667, height:0.69667, italic:0, skew:0}}, "Main-Italic":{"33":{depth:0, height:0.69444, italic:0.12417, skew:0}, "34":{depth:0, height:0.69444, italic:0.06961, skew:0}, "35":{depth:0.19444, height:0.69444, italic:0.06616, skew:0}, "37":{depth:0.05556, height:0.75, italic:0.13639, skew:0}, "38":{depth:0, height:0.69444, italic:0.09694, skew:0}, "39":{depth:0, height:0.69444, italic:0.12417, skew:0}, "40":{depth:0.25, height:0.75, italic:0.16194, skew:0}, "41":{depth:0.25, height:0.75, italic:0.03694, skew:0}, "42":{depth:0, height:0.75, italic:0.14917, skew:0}, "43":{depth:0.05667, height:0.56167, italic:0.03694, skew:0}, "44":{depth:0.19444, height:0.10556, italic:0, skew:0}, "45":{depth:0, height:0.43056, italic:0.02826, skew:0}, "46":{depth:0, height:0.10556, italic:0, skew:0}, "47":{depth:0.25, height:0.75, italic:0.16194, skew:0}, "48":{depth:0, height:0.64444, italic:0.13556, skew:0}, "49":{depth:0, height:0.64444, italic:0.13556, skew:0}, "50":{depth:0, height:0.64444, italic:0.13556, skew:0}, "51":{depth:0, height:0.64444, italic:0.13556, skew:0}, "52":{depth:0.19444, height:0.64444, italic:0.13556, skew:0}, "53":{depth:0, height:0.64444, italic:0.13556, skew:0}, "54":{depth:0, height:0.64444, italic:0.13556, skew:0}, "55":{depth:0.19444, height:0.64444, italic:0.13556, skew:0}, "56":{depth:0, height:0.64444, italic:0.13556, skew:0}, "57":{depth:0, height:0.64444, italic:0.13556, skew:0}, "58":{depth:0, height:0.43056, italic:0.0582, skew:0}, "59":{depth:0.19444, height:0.43056, italic:0.0582, skew:0}, "61":{depth:-0.13313, height:0.36687, italic:0.06616, skew:0}, "63":{depth:0, height:0.69444, italic:0.1225, skew:0}, "64":{depth:0, height:0.69444, italic:0.09597, skew:0}, "65":{depth:0, height:0.68333, italic:0, skew:0}, "66":{depth:0, height:0.68333, italic:0.10257, skew:0}, "67":{depth:0, height:0.68333, italic:0.14528, skew:0}, "68":{depth:0, height:0.68333, italic:0.09403, skew:0}, "69":{depth:0, height:0.68333, italic:0.12028, skew:0}, "70":{depth:0, height:0.68333, italic:0.13305, skew:0}, "71":{depth:0, height:0.68333, italic:0.08722, skew:0}, "72":{depth:0, height:0.68333, italic:0.16389, skew:0}, "73":{depth:0, height:0.68333, italic:0.15806, skew:0}, "74":{depth:0, height:0.68333, italic:0.14028, skew:0}, "75":{depth:0, height:0.68333, italic:0.14528, skew:0}, "76":{depth:0, height:0.68333, italic:0, skew:0}, "77":{depth:0, height:0.68333, italic:0.16389, skew:0}, "78":{depth:0, height:0.68333, italic:0.16389, skew:0}, "79":{depth:0, height:0.68333, italic:0.09403, skew:0}, "80":{depth:0, height:0.68333, italic:0.10257, skew:0}, "81":{depth:0.19444, height:0.68333, italic:0.09403, skew:0}, "82":{depth:0, height:0.68333, italic:0.03868, skew:0}, "83":{depth:0, height:0.68333, italic:0.11972, skew:0}, "84":{depth:0, height:0.68333, italic:0.13305, skew:0}, "85":{depth:0, height:0.68333, italic:0.16389, skew:0}, "86":{depth:0, height:0.68333, italic:0.18361, skew:0}, "87":{depth:0, height:0.68333, italic:0.18361, skew:0}, "88":{depth:0, height:0.68333, italic:0.15806, skew:0}, "89":{depth:0, height:0.68333, italic:0.19383, skew:0}, "90":{depth:0, height:0.68333, italic:0.14528, skew:0}, "91":{depth:0.25, height:0.75, italic:0.1875, skew:0}, "93":{depth:0.25, height:0.75, italic:0.10528, skew:0}, "94":{depth:0, height:0.69444, italic:0.06646, skew:0}, "95":{depth:0.31, height:0.12056, italic:0.09208, skew:0}, "97":{depth:0, height:0.43056, italic:0.07671, skew:0}, "98":{depth:0, height:0.69444, italic:0.06312, skew:0}, "99":{depth:0, height:0.43056, italic:0.05653, skew:0}, "100":{depth:0, height:0.69444, italic:0.10333, skew:0}, "101":{depth:0, height:0.43056, italic:0.07514, skew:0}, "102":{depth:0.19444, height:0.69444, italic:0.21194, skew:0}, "103":{depth:0.19444, height:0.43056, italic:0.08847, skew:0}, "104":{depth:0, height:0.69444, italic:0.07671, skew:0}, "105":{depth:0, height:0.65536, italic:0.1019, skew:0}, "106":{depth:0.19444, height:0.65536, italic:0.14467, skew:0}, "107":{depth:0, height:0.69444, italic:0.10764, skew:0}, "108":{depth:0, height:0.69444, italic:0.10333, skew:0}, "109":{depth:0, height:0.43056, italic:0.07671, skew:0}, "110":{depth:0, height:0.43056, italic:0.07671, skew:0}, "111":{depth:0, height:0.43056, italic:0.06312, skew:0}, "112":{depth:0.19444, height:0.43056, italic:0.06312, skew:0}, "113":{depth:0.19444, height:0.43056, italic:0.08847, skew:0}, "114":{depth:0, height:0.43056, italic:0.10764, skew:0}, "115":{depth:0, height:0.43056, italic:0.08208, skew:0}, "116":{depth:0, height:0.61508, italic:0.09486, skew:0}, "117":{depth:0, height:0.43056, italic:0.07671, skew:0}, "118":{depth:0, height:0.43056, italic:0.10764, skew:0}, "119":{depth:0, height:0.43056, italic:0.10764, skew:0}, "120":{depth:0, height:0.43056, italic:0.12042, skew:0}, "121":{depth:0.19444, height:0.43056, italic:0.08847, skew:0}, "122":{depth:0, height:0.43056, italic:0.12292, skew:0}, "126":{depth:0.35, height:0.31786, italic:0.11585, skew:0}, "163":{depth:0, height:0.69444, italic:0, skew:0}, "305":{depth:0, height:0.43056, italic:0, skew:0.02778}, "567":{depth:0.19444, height:0.43056, italic:0, skew:0.08334}, "768":{depth:0, height:0.69444, italic:0, skew:0}, "769":{depth:0, height:0.69444, italic:0.09694, skew:0}, "770":{depth:0, height:0.69444, italic:0.06646, skew:0}, "771":{depth:0, height:0.66786, italic:0.11585, skew:0}, "772":{depth:0, height:0.56167, italic:0.10333, skew:0}, "774":{depth:0, height:0.69444, italic:0.10806, skew:0}, "775":{depth:0, height:0.66786, italic:0.11752, skew:0}, "776":{depth:0, height:0.66786, italic:0.10474, skew:0}, "778":{depth:0, height:0.69444, italic:0, skew:0}, "779":{depth:0, height:0.69444, italic:0.1225, skew:0}, "780":{depth:0, height:0.62847, italic:0.08295, skew:0}, "915":{depth:0, height:0.68333, italic:0.13305, skew:0}, "916":{depth:0, height:0.68333, italic:0, skew:0}, "920":{depth:0, height:0.68333, italic:0.09403, skew:0}, "923":{depth:0, height:0.68333, italic:0, skew:0}, "926":{depth:0, height:0.68333, italic:0.15294, skew:0}, "928":{depth:0, height:0.68333, italic:0.16389, skew:0}, "931":{depth:0, height:0.68333, italic:0.12028, skew:0}, "933":{depth:0, height:0.68333, italic:0.11111, skew:0}, "934":{depth:0, height:0.68333, italic:0.05986, skew:0}, "936":{depth:0, height:0.68333, italic:0.11111, skew:0}, "937":{depth:0, height:0.68333, italic:0.10257, skew:0}, "8211":{depth:0, height:0.43056, italic:0.09208, skew:0}, "8212":{depth:0, height:0.43056, italic:0.09208, skew:0}, "8216":{depth:0, height:0.69444, italic:0.12417, skew:0}, "8217":{depth:0, height:0.69444, italic:0.12417, skew:0}, "8220":{depth:0, height:0.69444, italic:0.1685, skew:0}, "8221":{depth:0, height:0.69444, italic:0.06961, skew:0}, "8463":{depth:0, height:0.68889, italic:0, skew:0}}, "Main-Regular":{"32":{depth:0, height:0, italic:0, skew:0}, "33":{depth:0, height:0.69444, italic:0, skew:0}, "34":{depth:0, height:0.69444, italic:0, skew:0}, "35":{depth:0.19444, height:0.69444, italic:0, skew:0}, "36":{depth:0.05556, height:0.75, italic:0, skew:0}, "37":{depth:0.05556, height:0.75, italic:0, skew:0}, "38":{depth:0, height:0.69444, italic:0, skew:0}, "39":{depth:0, height:0.69444, italic:0, skew:0}, "40":{depth:0.25, height:0.75, italic:0, skew:0}, "41":{depth:0.25, height:0.75, italic:0, skew:0}, "42":{depth:0, height:0.75, italic:0, skew:0}, "43":{depth:0.08333, height:0.58333, italic:0, skew:0}, "44":{depth:0.19444, height:0.10556, italic:0, skew:0}, "45":{depth:0, height:0.43056, italic:0, skew:0}, "46":{depth:0, height:0.10556, italic:0, skew:0}, "47":{depth:0.25, height:0.75, italic:0, skew:0}, "48":{depth:0, height:0.64444, italic:0, skew:0}, "49":{depth:0, height:0.64444, italic:0, skew:0}, "50":{depth:0, height:0.64444, italic:0, skew:0}, "51":{depth:0, height:0.64444, italic:0, skew:0}, "52":{depth:0, height:0.64444, italic:0, skew:0}, "53":{depth:0, height:0.64444, italic:0, skew:0}, "54":{depth:0, height:0.64444, italic:0, skew:0}, "55":{depth:0, height:0.64444, italic:0, skew:0}, "56":{depth:0, height:0.64444, italic:0, skew:0}, "57":{depth:0, height:0.64444, italic:0, skew:0}, "58":{depth:0, height:0.43056, italic:0, skew:0}, "59":{depth:0.19444, height:0.43056, italic:0, skew:0}, "60":{depth:0.0391, height:0.5391, italic:0, skew:0}, "61":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "62":{depth:0.0391, height:0.5391, italic:0, skew:0}, "63":{depth:0, height:0.69444, italic:0, skew:0}, "64":{depth:0, height:0.69444, italic:0, skew:0}, "65":{depth:0, height:0.68333, italic:0, skew:0}, "66":{depth:0, height:0.68333, italic:0, skew:0}, "67":{depth:0, height:0.68333, italic:0, skew:0}, "68":{depth:0, height:0.68333, italic:0, skew:0}, "69":{depth:0, height:0.68333, italic:0, skew:0}, "70":{depth:0, height:0.68333, italic:0, skew:0}, "71":{depth:0, height:0.68333, italic:0, skew:0}, "72":{depth:0, height:0.68333, italic:0, skew:0}, "73":{depth:0, height:0.68333, italic:0, skew:0}, "74":{depth:0, height:0.68333, italic:0, skew:0}, "75":{depth:0, height:0.68333, italic:0, skew:0}, "76":{depth:0, height:0.68333, italic:0, skew:0}, "77":{depth:0, height:0.68333, italic:0, skew:0}, "78":{depth:0, height:0.68333, italic:0, skew:0}, "79":{depth:0, height:0.68333, italic:0, skew:0}, "80":{depth:0, height:0.68333, italic:0, skew:0}, "81":{depth:0.19444, height:0.68333, italic:0, skew:0}, "82":{depth:0, height:0.68333, italic:0, skew:0}, "83":{depth:0, height:0.68333, italic:0, skew:0}, "84":{depth:0, height:0.68333, italic:0, skew:0}, "85":{depth:0, height:0.68333, italic:0, skew:0}, "86":{depth:0, height:0.68333, italic:0.01389, skew:0}, "87":{depth:0, height:0.68333, italic:0.01389, skew:0}, "88":{depth:0, height:0.68333, italic:0, skew:0}, "89":{depth:0, height:0.68333, italic:0.025, skew:0}, "90":{depth:0, height:0.68333, italic:0, skew:0}, "91":{depth:0.25, height:0.75, italic:0, skew:0}, "92":{depth:0.25, height:0.75, italic:0, skew:0}, "93":{depth:0.25, height:0.75, italic:0, skew:0}, "94":{depth:0, height:0.69444, italic:0, skew:0}, "95":{depth:0.31, height:0.12056, italic:0.02778, skew:0}, "96":{depth:0, height:0.69444, italic:0, skew:0}, "97":{depth:0, height:0.43056, italic:0, skew:0}, "98":{depth:0, height:0.69444, italic:0, skew:0}, "99":{depth:0, height:0.43056, italic:0, skew:0}, "100":{depth:0, height:0.69444, italic:0, skew:0}, "101":{depth:0, height:0.43056, italic:0, skew:0}, "102":{depth:0, height:0.69444, italic:0.07778, skew:0}, "103":{depth:0.19444, height:0.43056, italic:0.01389, skew:0}, "104":{depth:0, height:0.69444, italic:0, skew:0}, "105":{depth:0, height:0.66786, italic:0, skew:0}, "106":{depth:0.19444, height:0.66786, italic:0, skew:0}, "107":{depth:0, height:0.69444, italic:0, skew:0}, "108":{depth:0, height:0.69444, italic:0, skew:0}, "109":{depth:0, height:0.43056, italic:0, skew:0}, "110":{depth:0, height:0.43056, italic:0, skew:0}, "111":{depth:0, height:0.43056, italic:0, skew:0}, "112":{depth:0.19444, height:0.43056, italic:0, skew:0}, "113":{depth:0.19444, height:0.43056, italic:0, skew:0}, "114":{depth:0, height:0.43056, italic:0, skew:0}, "115":{depth:0, height:0.43056, italic:0, skew:0}, "116":{depth:0, height:0.61508, italic:0, skew:0}, "117":{depth:0, height:0.43056, italic:0, skew:0}, "118":{depth:0, height:0.43056, italic:0.01389, skew:0}, "119":{depth:0, height:0.43056, italic:0.01389, skew:0}, "120":{depth:0, height:0.43056, italic:0, skew:0}, "121":{depth:0.19444, height:0.43056, italic:0.01389, skew:0}, "122":{depth:0, height:0.43056, italic:0, skew:0}, "123":{depth:0.25, height:0.75, italic:0, skew:0}, "124":{depth:0.25, height:0.75, italic:0, skew:0}, "125":{depth:0.25, height:0.75, italic:0, skew:0}, "126":{depth:0.35, height:0.31786, italic:0, skew:0}, "160":{depth:0, height:0, italic:0, skew:0}, "168":{depth:0, height:0.66786, italic:0, skew:0}, "172":{depth:0, height:0.43056, italic:0, skew:0}, "175":{depth:0, height:0.56778, italic:0, skew:0}, "176":{depth:0, height:0.69444, italic:0, skew:0}, "177":{depth:0.08333, height:0.58333, italic:0, skew:0}, "180":{depth:0, height:0.69444, italic:0, skew:0}, "215":{depth:0.08333, height:0.58333, italic:0, skew:0}, "247":{depth:0.08333, height:0.58333, italic:0, skew:0}, "305":{depth:0, height:0.43056, italic:0, skew:0}, "567":{depth:0.19444, height:0.43056, italic:0, skew:0}, "710":{depth:0, height:0.69444, italic:0, skew:0}, "711":{depth:0, height:0.62847, italic:0, skew:0}, "713":{depth:0, height:0.56778, italic:0, skew:0}, "714":{depth:0, height:0.69444, italic:0, skew:0}, "715":{depth:0, height:0.69444, italic:0, skew:0}, "728":{depth:0, height:0.69444, italic:0, skew:0}, "729":{depth:0, height:0.66786, italic:0, skew:0}, "730":{depth:0, height:0.69444, italic:0, skew:0}, "732":{depth:0, height:0.66786, italic:0, skew:0}, "768":{depth:0, height:0.69444, italic:0, skew:0}, "769":{depth:0, height:0.69444, italic:0, skew:0}, "770":{depth:0, height:0.69444, italic:0, skew:0}, "771":{depth:0, height:0.66786, italic:0, skew:0}, "772":{depth:0, height:0.56778, italic:0, skew:0}, "774":{depth:0, height:0.69444, italic:0, skew:0}, "775":{depth:0, height:0.66786, italic:0, skew:0}, "776":{depth:0, height:0.66786, italic:0, skew:0}, "778":{depth:0, height:0.69444, italic:0, skew:0}, "779":{depth:0, height:0.69444, italic:0, skew:0}, "780":{depth:0, height:0.62847, italic:0, skew:0}, "824":{depth:0.19444, height:0.69444, italic:0, skew:0}, "915":{depth:0, height:0.68333, italic:0, skew:0}, "916":{depth:0, height:0.68333, italic:0, skew:0}, "920":{depth:0, height:0.68333, italic:0, skew:0}, "923":{depth:0, height:0.68333, italic:0, skew:0}, "926":{depth:0, height:0.68333, italic:0, skew:0}, "928":{depth:0, height:0.68333, italic:0, skew:0}, "931":{depth:0, height:0.68333, italic:0, skew:0}, "933":{depth:0, height:0.68333, italic:0, skew:0}, "934":{depth:0, height:0.68333, italic:0, skew:0}, "936":{depth:0, height:0.68333, italic:0, skew:0}, "937":{depth:0, height:0.68333, italic:0, skew:0}, "8211":{depth:0, height:0.43056, italic:0.02778, skew:0}, "8212":{depth:0, height:0.43056, italic:0.02778, skew:0}, "8216":{depth:0, height:0.69444, italic:0, skew:0}, "8217":{depth:0, height:0.69444, italic:0, skew:0}, "8220":{depth:0, height:0.69444, italic:0, skew:0}, "8221":{depth:0, height:0.69444, italic:0, skew:0}, "8224":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8225":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8230":{depth:0, height:0.12, italic:0, skew:0}, "8242":{depth:0, height:0.55556, italic:0, skew:0}, "8407":{depth:0, height:0.71444, italic:0.15382, skew:0}, "8463":{depth:0, height:0.68889, italic:0, skew:0}, "8465":{depth:0, height:0.69444, italic:0, skew:0}, "8467":{depth:0, height:0.69444, italic:0, skew:0.11111}, "8472":{depth:0.19444, height:0.43056, italic:0, skew:0.11111}, "8476":{depth:0, height:0.69444, italic:0, skew:0}, "8501":{depth:0, height:0.69444, italic:0, skew:0}, "8592":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8593":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8594":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8595":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8596":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8597":{depth:0.25, height:0.75, italic:0, skew:0}, "8598":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8599":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8600":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8601":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8614":{depth:0.011, height:0.511, italic:0, skew:0}, "8617":{depth:0.011, height:0.511, italic:0, skew:0}, "8618":{depth:0.011, height:0.511, italic:0, skew:0}, "8636":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8637":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8640":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8641":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8652":{depth:0.011, height:0.671, italic:0, skew:0}, "8656":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8657":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8658":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8659":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8660":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8661":{depth:0.25, height:0.75, italic:0, skew:0}, "8704":{depth:0, height:0.69444, italic:0, skew:0}, "8706":{depth:0, height:0.69444, italic:0.05556, skew:0.08334}, "8707":{depth:0, height:0.69444, italic:0, skew:0}, "8709":{depth:0.05556, height:0.75, italic:0, skew:0}, "8711":{depth:0, height:0.68333, italic:0, skew:0}, "8712":{depth:0.0391, height:0.5391, italic:0, skew:0}, "8715":{depth:0.0391, height:0.5391, italic:0, skew:0}, "8722":{depth:0.08333, height:0.58333, italic:0, skew:0}, "8723":{depth:0.08333, height:0.58333, italic:0, skew:0}, "8725":{depth:0.25, height:0.75, italic:0, skew:0}, "8726":{depth:0.25, height:0.75, italic:0, skew:0}, "8727":{depth:-0.03472, height:0.46528, italic:0, skew:0}, "8728":{depth:-0.05555, height:0.44445, italic:0, skew:0}, "8729":{depth:-0.05555, height:0.44445, italic:0, skew:0}, "8730":{depth:0.2, height:0.8, italic:0, skew:0}, "8733":{depth:0, height:0.43056, italic:0, skew:0}, "8734":{depth:0, height:0.43056, italic:0, skew:0}, "8736":{depth:0, height:0.69224, italic:0, skew:0}, "8739":{depth:0.25, height:0.75, italic:0, skew:0}, "8741":{depth:0.25, height:0.75, italic:0, skew:0}, "8743":{depth:0, height:0.55556, italic:0, skew:0}, "8744":{depth:0, height:0.55556, italic:0, skew:0}, "8745":{depth:0, height:0.55556, italic:0, skew:0}, "8746":{depth:0, height:0.55556, italic:0, skew:0}, "8747":{depth:0.19444, height:0.69444, italic:0.11111, skew:0}, "8764":{depth:-0.13313, height:0.36687, italic:0, skew:0}, "8768":{depth:0.19444, height:0.69444, italic:0, skew:0}, "8771":{depth:-0.03625, height:0.46375, italic:0, skew:0}, "8773":{depth:-0.022, height:0.589, italic:0, skew:0}, "8776":{depth:-0.01688, height:0.48312, italic:0, skew:0}, "8781":{depth:-0.03625, height:0.46375, italic:0, skew:0}, "8784":{depth:-0.133, height:0.67, italic:0, skew:0}, "8800":{depth:0.215, height:0.716, italic:0, skew:0}, "8801":{depth:-0.03625, height:0.46375, italic:0, skew:0}, "8804":{depth:0.13597, height:0.63597, italic:0, skew:0}, "8805":{depth:0.13597, height:0.63597, italic:0, skew:0}, "8810":{depth:0.0391, height:0.5391, italic:0, skew:0}, "8811":{depth:0.0391, height:0.5391, italic:0, skew:0}, "8826":{depth:0.0391, height:0.5391, italic:0, skew:0}, "8827":{depth:0.0391, height:0.5391, italic:0, skew:0}, "8834":{depth:0.0391, height:0.5391, italic:0, skew:0}, "8835":{depth:0.0391, height:0.5391, italic:0, skew:0}, "8838":{depth:0.13597, height:0.63597, italic:0, skew:0}, "8839":{depth:0.13597, height:0.63597, italic:0, skew:0}, "8846":{depth:0, height:0.55556, italic:0, skew:0}, "8849":{depth:0.13597, height:0.63597, italic:0, skew:0}, "8850":{depth:0.13597, height:0.63597, italic:0, skew:0}, "8851":{depth:0, height:0.55556, italic:0, skew:0}, "8852":{depth:0, height:0.55556, italic:0, skew:0}, "8853":{depth:0.08333, height:0.58333, italic:0, skew:0}, "8854":{depth:0.08333, height:0.58333, italic:0, skew:0}, "8855":{depth:0.08333, height:0.58333, italic:0, skew:0}, "8856":{depth:0.08333, height:0.58333, italic:0, skew:0}, "8857":{depth:0.08333, height:0.58333, italic:0, skew:0}, "8866":{depth:0, height:0.69444, italic:0, skew:0}, "8867":{depth:0, height:0.69444, italic:0, skew:0}, "8868":{depth:0, height:0.69444, italic:0, skew:0}, "8869":{depth:0, height:0.69444, italic:0, skew:0}, "8872":{depth:0.249, height:0.75, italic:0, skew:0}, "8900":{depth:-0.05555, height:0.44445, italic:0, skew:0}, "8901":{depth:-0.05555, height:0.44445, italic:0, skew:0}, "8902":{depth:-0.03472, height:0.46528, italic:0, skew:0}, "8904":{depth:0.005, height:0.505, italic:0, skew:0}, "8942":{depth:0.03, height:0.9, italic:0, skew:0}, "8943":{depth:-0.19, height:0.31, italic:0, skew:0}, "8945":{depth:-0.1, height:0.82, italic:0, skew:0}, "8968":{depth:0.25, height:0.75, italic:0, skew:0}, "8969":{depth:0.25, height:0.75, italic:0, skew:0}, "8970":{depth:0.25, height:0.75, italic:0, skew:0}, "8971":{depth:0.25, height:0.75, italic:0, skew:0}, "8994":{depth:-0.14236, height:0.35764, italic:0, skew:0}, "8995":{depth:-0.14236, height:0.35764, italic:0, skew:0}, "9136":{depth:0.244, height:0.744, italic:0, skew:0}, "9137":{depth:0.244, height:0.744, italic:0, skew:0}, "9651":{depth:0.19444, height:0.69444, italic:0, skew:0}, "9657":{depth:-0.03472, height:0.46528, italic:0, skew:0}, "9661":{depth:0.19444, height:0.69444, italic:0, skew:0}, "9667":{depth:-0.03472, height:0.46528, italic:0, skew:0}, "9711":{depth:0.19444, height:0.69444, italic:0, skew:0}, "9824":{depth:0.12963, height:0.69444, italic:0, skew:0}, "9825":{depth:0.12963, height:0.69444, italic:0, skew:0}, "9826":{depth:0.12963, height:0.69444, italic:0, skew:0}, "9827":{depth:0.12963, height:0.69444, italic:0, skew:0}, "9837":{depth:0, height:0.75, italic:0, skew:0}, "9838":{depth:0.19444, height:0.69444, italic:0, skew:0}, "9839":{depth:0.19444, height:0.69444, italic:0, skew:0}, "10216":{depth:0.25, height:0.75, italic:0, skew:0}, "10217":{depth:0.25, height:0.75, italic:0, skew:0}, "10222":{depth:0.244, height:0.744, italic:0, skew:0}, "10223":{depth:0.244, height:0.744, italic:0, skew:0}, "10229":{depth:0.011, height:0.511, italic:0, skew:0}, "10230":{depth:0.011, height:0.511, italic:0, skew:0}, "10231":{depth:0.011, height:0.511, italic:0, skew:0}, "10232":{depth:0.024, height:0.525, italic:0, skew:0}, "10233":{depth:0.024, height:0.525, italic:0, skew:0}, "10234":{depth:0.024, height:0.525, italic:0, skew:0}, "10236":{depth:0.011, height:0.511, italic:0, skew:0}, "10815":{depth:0, height:0.68333, italic:0, skew:0}, "10927":{depth:0.13597, height:0.63597, italic:0, skew:0}, "10928":{depth:0.13597, height:0.63597, italic:0, skew:0}}, "Math-BoldItalic":{"47":{depth:0.19444, height:0.69444, italic:0, skew:0}, "65":{depth:0, height:0.68611, italic:0, skew:0}, "66":{depth:0, height:0.68611, italic:0.04835, skew:0}, "67":{depth:0, height:0.68611, italic:0.06979, skew:0}, "68":{depth:0, height:0.68611, italic:0.03194, skew:0}, "69":{depth:0, height:0.68611, italic:0.05451, skew:0}, "70":{depth:0, height:0.68611, italic:0.15972, skew:0}, "71":{depth:0, height:0.68611, italic:0, skew:0}, "72":{depth:0, height:0.68611, italic:0.08229, skew:0}, "73":{depth:0, height:0.68611, italic:0.07778, skew:0}, "74":{depth:0, height:0.68611, italic:0.10069, skew:0}, "75":{depth:0, height:0.68611, italic:0.06979, skew:0}, "76":{depth:0, height:0.68611, italic:0, skew:0}, "77":{depth:0, height:0.68611, italic:0.11424, skew:0}, "78":{depth:0, height:0.68611, italic:0.11424, skew:0}, "79":{depth:0, height:0.68611, italic:0.03194, skew:0}, "80":{depth:0, height:0.68611, italic:0.15972, skew:0}, "81":{depth:0.19444, height:0.68611, italic:0, skew:0}, "82":{depth:0, height:0.68611, italic:0.00421, skew:0}, "83":{depth:0, height:0.68611, italic:0.05382, skew:0}, "84":{depth:0, height:0.68611, italic:0.15972, skew:0}, "85":{depth:0, height:0.68611, italic:0.11424, skew:0}, "86":{depth:0, height:0.68611, italic:0.25555, skew:0}, "87":{depth:0, height:0.68611, italic:0.15972, skew:0}, "88":{depth:0, height:0.68611, italic:0.07778, skew:0}, "89":{depth:0, height:0.68611, italic:0.25555, skew:0}, "90":{depth:0, height:0.68611, italic:0.06979, skew:0}, "97":{depth:0, height:0.44444, italic:0, skew:0}, "98":{depth:0, height:0.69444, italic:0, skew:0}, "99":{depth:0, height:0.44444, italic:0, skew:0}, "100":{depth:0, height:0.69444, italic:0, skew:0}, "101":{depth:0, height:0.44444, italic:0, skew:0}, "102":{depth:0.19444, height:0.69444, italic:0.11042, skew:0}, "103":{depth:0.19444, height:0.44444, italic:0.03704, skew:0}, "104":{depth:0, height:0.69444, italic:0, skew:0}, "105":{depth:0, height:0.69326, italic:0, skew:0}, "106":{depth:0.19444, height:0.69326, italic:0.0622, skew:0}, "107":{depth:0, height:0.69444, italic:0.01852, skew:0}, "108":{depth:0, height:0.69444, italic:0.0088, skew:0}, "109":{depth:0, height:0.44444, italic:0, skew:0}, "110":{depth:0, height:0.44444, italic:0, skew:0}, "111":{depth:0, height:0.44444, italic:0, skew:0}, "112":{depth:0.19444, height:0.44444, italic:0, skew:0}, "113":{depth:0.19444, height:0.44444, italic:0.03704, skew:0}, "114":{depth:0, height:0.44444, italic:0.03194, skew:0}, "115":{depth:0, height:0.44444, italic:0, skew:0}, "116":{depth:0, height:0.63492, italic:0, skew:0}, "117":{depth:0, height:0.44444, italic:0, skew:0}, "118":{depth:0, height:0.44444, italic:0.03704, skew:0}, "119":{depth:0, height:0.44444, italic:0.02778, skew:0}, "120":{depth:0, height:0.44444, italic:0, skew:0}, "121":{depth:0.19444, height:0.44444, italic:0.03704, skew:0}, "122":{depth:0, height:0.44444, italic:0.04213, skew:0}, "915":{depth:0, height:0.68611, italic:0.15972, skew:0}, "916":{depth:0, height:0.68611, italic:0, skew:0}, "920":{depth:0, height:0.68611, italic:0.03194, skew:0}, "923":{depth:0, height:0.68611, italic:0, skew:0}, "926":{depth:0, height:0.68611, italic:0.07458, skew:0}, "928":{depth:0, height:0.68611, italic:0.08229, skew:0}, "931":{depth:0, height:0.68611, italic:0.05451, skew:0}, "933":{depth:0, height:0.68611, italic:0.15972, skew:0}, "934":{depth:0, height:0.68611, italic:0, skew:0}, "936":{depth:0, height:0.68611, italic:0.11653, skew:0}, "937":{depth:0, height:0.68611, italic:0.04835, skew:0}, "945":{depth:0, height:0.44444, italic:0, skew:0}, "946":{depth:0.19444, height:0.69444, italic:0.03403, skew:0}, "947":{depth:0.19444, height:0.44444, italic:0.06389, skew:0}, "948":{depth:0, height:0.69444, italic:0.03819, skew:0}, "949":{depth:0, height:0.44444, italic:0, skew:0}, "950":{depth:0.19444, height:0.69444, italic:0.06215, skew:0}, "951":{depth:0.19444, height:0.44444, italic:0.03704, skew:0}, "952":{depth:0, height:0.69444, italic:0.03194, skew:0}, "953":{depth:0, height:0.44444, italic:0, skew:0}, "954":{depth:0, height:0.44444, italic:0, skew:0}, "955":{depth:0, height:0.69444, italic:0, skew:0}, "956":{depth:0.19444, height:0.44444, italic:0, skew:0}, "957":{depth:0, height:0.44444, italic:0.06898, skew:0}, "958":{depth:0.19444, height:0.69444, italic:0.03021, skew:0}, "959":{depth:0, height:0.44444, italic:0, skew:0}, "960":{depth:0, height:0.44444, italic:0.03704, skew:0}, "961":{depth:0.19444, height:0.44444, italic:0, skew:0}, "962":{depth:0.09722, height:0.44444, italic:0.07917, skew:0}, "963":{depth:0, height:0.44444, italic:0.03704, skew:0}, "964":{depth:0, height:0.44444, italic:0.13472, skew:0}, "965":{depth:0, height:0.44444, italic:0.03704, skew:0}, "966":{depth:0.19444, height:0.44444, italic:0, skew:0}, "967":{depth:0.19444, height:0.44444, italic:0, skew:0}, "968":{depth:0.19444, height:0.69444, italic:0.03704, skew:0}, "969":{depth:0, height:0.44444, italic:0.03704, skew:0}, "977":{depth:0, height:0.69444, italic:0, skew:0}, "981":{depth:0.19444, height:0.69444, italic:0, skew:0}, "982":{depth:0, height:0.44444, italic:0.03194, skew:0}, "1009":{depth:0.19444, height:0.44444, italic:0, skew:0}, "1013":{depth:0, height:0.44444, italic:0, skew:0}}, "Math-Italic":{"47":{depth:0.19444, height:0.69444, italic:0, skew:0}, "65":{depth:0, height:0.68333, italic:0, skew:0.13889}, "66":{depth:0, height:0.68333, italic:0.05017, skew:0.08334}, "67":{depth:0, height:0.68333, italic:0.07153, skew:0.08334}, "68":{depth:0, height:0.68333, italic:0.02778, skew:0.05556}, "69":{depth:0, height:0.68333, italic:0.05764, skew:0.08334}, "70":{depth:0, height:0.68333, italic:0.13889, skew:0.08334}, "71":{depth:0, height:0.68333, italic:0, skew:0.08334}, "72":{depth:0, height:0.68333, italic:0.08125, skew:0.05556}, "73":{depth:0, height:0.68333, italic:0.07847, skew:0.11111}, "74":{depth:0, height:0.68333, italic:0.09618, skew:0.16667}, "75":{depth:0, height:0.68333, italic:0.07153, skew:0.05556}, "76":{depth:0, height:0.68333, italic:0, skew:0.02778}, "77":{depth:0, height:0.68333, italic:0.10903, skew:0.08334}, "78":{depth:0, height:0.68333, italic:0.10903, skew:0.08334}, "79":{depth:0, height:0.68333, italic:0.02778, skew:0.08334}, "80":{depth:0, height:0.68333, italic:0.13889, skew:0.08334}, "81":{depth:0.19444, height:0.68333, italic:0, skew:0.08334}, "82":{depth:0, height:0.68333, italic:0.00773, skew:0.08334}, "83":{depth:0, height:0.68333, italic:0.05764, skew:0.08334}, "84":{depth:0, height:0.68333, italic:0.13889, skew:0.08334}, "85":{depth:0, height:0.68333, italic:0.10903, skew:0.02778}, "86":{depth:0, height:0.68333, italic:0.22222, skew:0}, "87":{depth:0, height:0.68333, italic:0.13889, skew:0}, "88":{depth:0, height:0.68333, italic:0.07847, skew:0.08334}, "89":{depth:0, height:0.68333, italic:0.22222, skew:0}, "90":{depth:0, height:0.68333, italic:0.07153, skew:0.08334}, "97":{depth:0, height:0.43056, italic:0, skew:0}, "98":{depth:0, height:0.69444, italic:0, skew:0}, "99":{depth:0, height:0.43056, italic:0, skew:0.05556}, "100":{depth:0, height:0.69444, italic:0, skew:0.16667}, "101":{depth:0, height:0.43056, italic:0, skew:0.05556}, "102":{depth:0.19444, height:0.69444, italic:0.10764, skew:0.16667}, "103":{depth:0.19444, height:0.43056, italic:0.03588, skew:0.02778}, "104":{depth:0, height:0.69444, italic:0, skew:0}, "105":{depth:0, height:0.65952, italic:0, skew:0}, "106":{depth:0.19444, height:0.65952, italic:0.05724, skew:0}, "107":{depth:0, height:0.69444, italic:0.03148, skew:0}, "108":{depth:0, height:0.69444, italic:0.01968, skew:0.08334}, "109":{depth:0, height:0.43056, italic:0, skew:0}, "110":{depth:0, height:0.43056, italic:0, skew:0}, "111":{depth:0, height:0.43056, italic:0, skew:0.05556}, "112":{depth:0.19444, height:0.43056, italic:0, skew:0.08334}, "113":{depth:0.19444, height:0.43056, italic:0.03588, skew:0.08334}, "114":{depth:0, height:0.43056, italic:0.02778, skew:0.05556}, "115":{depth:0, height:0.43056, italic:0, skew:0.05556}, "116":{depth:0, height:0.61508, italic:0, skew:0.08334}, "117":{depth:0, height:0.43056, italic:0, skew:0.02778}, "118":{depth:0, height:0.43056, italic:0.03588, skew:0.02778}, "119":{depth:0, height:0.43056, italic:0.02691, skew:0.08334}, "120":{depth:0, height:0.43056, italic:0, skew:0.02778}, "121":{depth:0.19444, height:0.43056, italic:0.03588, skew:0.05556}, "122":{depth:0, height:0.43056, italic:0.04398, skew:0.05556}, "915":{depth:0, height:0.68333, italic:0.13889, skew:0.08334}, "916":{depth:0, height:0.68333, italic:0, skew:0.16667}, "920":{depth:0, height:0.68333, italic:0.02778, skew:0.08334}, "923":{depth:0, height:0.68333, italic:0, skew:0.16667}, "926":{depth:0, height:0.68333, italic:0.07569, skew:0.08334}, "928":{depth:0, height:0.68333, italic:0.08125, skew:0.05556}, "931":{depth:0, height:0.68333, italic:0.05764, skew:0.08334}, "933":{depth:0, height:0.68333, italic:0.13889, skew:0.05556}, "934":{depth:0, height:0.68333, italic:0, skew:0.08334}, "936":{depth:0, height:0.68333, italic:0.11, skew:0.05556}, "937":{depth:0, height:0.68333, italic:0.05017, skew:0.08334}, "945":{depth:0, height:0.43056, italic:0.0037, skew:0.02778}, "946":{depth:0.19444, height:0.69444, italic:0.05278, skew:0.08334}, "947":{depth:0.19444, height:0.43056, italic:0.05556, skew:0}, "948":{depth:0, height:0.69444, italic:0.03785, skew:0.05556}, "949":{depth:0, height:0.43056, italic:0, skew:0.08334}, "950":{depth:0.19444, height:0.69444, italic:0.07378, skew:0.08334}, "951":{depth:0.19444, height:0.43056, italic:0.03588, skew:0.05556}, "952":{depth:0, height:0.69444, italic:0.02778, skew:0.08334}, "953":{depth:0, height:0.43056, italic:0, skew:0.05556}, "954":{depth:0, height:0.43056, italic:0, skew:0}, "955":{depth:0, height:0.69444, italic:0, skew:0}, "956":{depth:0.19444, height:0.43056, italic:0, skew:0.02778}, "957":{depth:0, height:0.43056, italic:0.06366, skew:0.02778}, "958":{depth:0.19444, height:0.69444, italic:0.04601, skew:0.11111}, "959":{depth:0, height:0.43056, italic:0, skew:0.05556}, "960":{depth:0, height:0.43056, italic:0.03588, skew:0}, "961":{depth:0.19444, height:0.43056, italic:0, skew:0.08334}, "962":{depth:0.09722, height:0.43056, italic:0.07986, skew:0.08334}, "963":{depth:0, height:0.43056, italic:0.03588, skew:0}, "964":{depth:0, height:0.43056, italic:0.1132, skew:0.02778}, "965":{depth:0, height:0.43056, italic:0.03588, skew:0.02778}, "966":{depth:0.19444, height:0.43056, italic:0, skew:0.08334}, "967":{depth:0.19444, height:0.43056, italic:0, skew:0.05556}, "968":{depth:0.19444, height:0.69444, italic:0.03588, skew:0.11111}, "969":{depth:0, height:0.43056, italic:0.03588, skew:0}, "977":{depth:0, height:0.69444, italic:0, skew:0.08334}, "981":{depth:0.19444, height:0.69444, italic:0, skew:0.08334}, "982":{depth:0, height:0.43056, italic:0.02778, skew:0}, "1009":{depth:0.19444, height:0.43056, italic:0, skew:0.08334}, "1013":{depth:0, height:0.43056, italic:0, skew:0.05556}}, "Math-Regular":{"65":{depth:0, height:0.68333, italic:0, skew:0.13889}, "66":{depth:0, height:0.68333, italic:0.05017, skew:0.08334}, "67":{depth:0, height:0.68333, italic:0.07153, skew:0.08334}, "68":{depth:0, height:0.68333, italic:0.02778, skew:0.05556}, "69":{depth:0, height:0.68333, italic:0.05764, skew:0.08334}, "70":{depth:0, height:0.68333, italic:0.13889, skew:0.08334}, "71":{depth:0, height:0.68333, italic:0, skew:0.08334}, "72":{depth:0, height:0.68333, italic:0.08125, skew:0.05556}, "73":{depth:0, height:0.68333, italic:0.07847, skew:0.11111}, "74":{depth:0, height:0.68333, italic:0.09618, skew:0.16667}, "75":{depth:0, height:0.68333, italic:0.07153, skew:0.05556}, "76":{depth:0, height:0.68333, italic:0, skew:0.02778}, "77":{depth:0, height:0.68333, italic:0.10903, skew:0.08334}, "78":{depth:0, height:0.68333, italic:0.10903, skew:0.08334}, "79":{depth:0, height:0.68333, italic:0.02778, skew:0.08334}, "80":{depth:0, height:0.68333, italic:0.13889, skew:0.08334}, "81":{depth:0.19444, height:0.68333, italic:0, skew:0.08334}, "82":{depth:0, height:0.68333, italic:0.00773, skew:0.08334}, "83":{depth:0, height:0.68333, italic:0.05764, skew:0.08334}, "84":{depth:0, height:0.68333, italic:0.13889, skew:0.08334}, "85":{depth:0, height:0.68333, italic:0.10903, skew:0.02778}, "86":{depth:0, height:0.68333, italic:0.22222, skew:0}, "87":{depth:0, height:0.68333, italic:0.13889, skew:0}, "88":{depth:0, height:0.68333, italic:0.07847, skew:0.08334}, "89":{depth:0, height:0.68333, italic:0.22222, skew:0}, "90":{depth:0, height:0.68333, italic:0.07153, skew:0.08334}, "97":{depth:0, height:0.43056, italic:0, skew:0}, "98":{depth:0, height:0.69444, italic:0, skew:0}, "99":{depth:0, height:0.43056, italic:0, skew:0.05556}, "100":{depth:0, height:0.69444, italic:0, skew:0.16667}, "101":{depth:0, height:0.43056, italic:0, skew:0.05556}, "102":{depth:0.19444, height:0.69444, italic:0.10764, skew:0.16667}, "103":{depth:0.19444, height:0.43056, italic:0.03588, skew:0.02778}, "104":{depth:0, height:0.69444, italic:0, skew:0}, "105":{depth:0, height:0.65952, italic:0, skew:0}, "106":{depth:0.19444, height:0.65952, italic:0.05724, skew:0}, "107":{depth:0, height:0.69444, italic:0.03148, skew:0}, "108":{depth:0, height:0.69444, italic:0.01968, skew:0.08334}, "109":{depth:0, height:0.43056, italic:0, skew:0}, "110":{depth:0, height:0.43056, italic:0, skew:0}, "111":{depth:0, height:0.43056, italic:0, skew:0.05556}, "112":{depth:0.19444, height:0.43056, italic:0, skew:0.08334}, "113":{depth:0.19444, height:0.43056, italic:0.03588, skew:0.08334}, "114":{depth:0, height:0.43056, italic:0.02778, skew:0.05556}, "115":{depth:0, height:0.43056, italic:0, skew:0.05556}, "116":{depth:0, height:0.61508, italic:0, skew:0.08334}, "117":{depth:0, height:0.43056, italic:0, skew:0.02778}, "118":{depth:0, height:0.43056, italic:0.03588, skew:0.02778}, "119":{depth:0, height:0.43056, italic:0.02691, skew:0.08334}, "120":{depth:0, height:0.43056, italic:0, skew:0.02778}, "121":{depth:0.19444, height:0.43056, italic:0.03588, skew:0.05556}, "122":{depth:0, height:0.43056, italic:0.04398, skew:0.05556}, "915":{depth:0, height:0.68333, italic:0.13889, skew:0.08334}, "916":{depth:0, height:0.68333, italic:0, skew:0.16667}, "920":{depth:0, height:0.68333, italic:0.02778, skew:0.08334}, "923":{depth:0, height:0.68333, italic:0, skew:0.16667}, "926":{depth:0, height:0.68333, italic:0.07569, skew:0.08334}, "928":{depth:0, height:0.68333, italic:0.08125, skew:0.05556}, "931":{depth:0, height:0.68333, italic:0.05764, skew:0.08334}, "933":{depth:0, height:0.68333, italic:0.13889, skew:0.05556}, "934":{depth:0, height:0.68333, italic:0, skew:0.08334}, "936":{depth:0, height:0.68333, italic:0.11, skew:0.05556}, "937":{depth:0, height:0.68333, italic:0.05017, skew:0.08334}, "945":{depth:0, height:0.43056, italic:0.0037, skew:0.02778}, "946":{depth:0.19444, height:0.69444, italic:0.05278, skew:0.08334}, "947":{depth:0.19444, height:0.43056, italic:0.05556, skew:0}, "948":{depth:0, height:0.69444, italic:0.03785, skew:0.05556}, "949":{depth:0, height:0.43056, italic:0, skew:0.08334}, "950":{depth:0.19444, height:0.69444, italic:0.07378, skew:0.08334}, "951":{depth:0.19444, height:0.43056, italic:0.03588, skew:0.05556}, "952":{depth:0, height:0.69444, italic:0.02778, skew:0.08334}, "953":{depth:0, height:0.43056, italic:0, skew:0.05556}, "954":{depth:0, height:0.43056, italic:0, skew:0}, "955":{depth:0, height:0.69444, italic:0, skew:0}, "956":{depth:0.19444, height:0.43056, italic:0, skew:0.02778}, "957":{depth:0, height:0.43056, italic:0.06366, skew:0.02778}, "958":{depth:0.19444, height:0.69444, italic:0.04601, skew:0.11111}, "959":{depth:0, height:0.43056, italic:0, skew:0.05556}, "960":{depth:0, height:0.43056, italic:0.03588, skew:0}, "961":{depth:0.19444, height:0.43056, italic:0, skew:0.08334}, "962":{depth:0.09722, height:0.43056, italic:0.07986, skew:0.08334}, "963":{depth:0, height:0.43056, italic:0.03588, skew:0}, "964":{depth:0, height:0.43056, italic:0.1132, skew:0.02778}, "965":{depth:0, height:0.43056, italic:0.03588, skew:0.02778}, "966":{depth:0.19444, height:0.43056, italic:0, skew:0.08334}, "967":{depth:0.19444, height:0.43056, italic:0, skew:0.05556}, "968":{depth:0.19444, height:0.69444, italic:0.03588, skew:0.11111}, "969":{depth:0, height:0.43056, italic:0.03588, skew:0}, "977":{depth:0, height:0.69444, italic:0, skew:0.08334}, "981":{depth:0.19444, height:0.69444, italic:0, skew:0.08334}, "982":{depth:0, height:0.43056, italic:0.02778, skew:0}, "1009":{depth:0.19444, height:0.43056, italic:0, skew:0.08334}, "1013":{depth:0, height:0.43056, italic:0, skew:0.05556}}, "SansSerif-Regular":{"33":{depth:0, height:0.69444, italic:0, skew:0}, "34":{depth:0, height:0.69444, italic:0, skew:0}, "35":{depth:0.19444, height:0.69444, italic:0, skew:0}, "36":{depth:0.05556, height:0.75, italic:0, skew:0}, "37":{depth:0.05556, height:0.75, italic:0, skew:0}, "38":{depth:0, height:0.69444, italic:0, skew:0}, "39":{depth:0, height:0.69444, italic:0, skew:0}, "40":{depth:0.25, height:0.75, italic:0, skew:0}, "41":{depth:0.25, height:0.75, italic:0, skew:0}, "42":{depth:0, height:0.75, italic:0, skew:0}, "43":{depth:0.08333, height:0.58333, italic:0, skew:0}, "44":{depth:0.125, height:0.08333, italic:0, skew:0}, "45":{depth:0, height:0.44444, italic:0, skew:0}, "46":{depth:0, height:0.08333, italic:0, skew:0}, "47":{depth:0.25, height:0.75, italic:0, skew:0}, "48":{depth:0, height:0.65556, italic:0, skew:0}, "49":{depth:0, height:0.65556, italic:0, skew:0}, "50":{depth:0, height:0.65556, italic:0, skew:0}, "51":{depth:0, height:0.65556, italic:0, skew:0}, "52":{depth:0, height:0.65556, italic:0, skew:0}, "53":{depth:0, height:0.65556, italic:0, skew:0}, "54":{depth:0, height:0.65556, italic:0, skew:0}, "55":{depth:0, height:0.65556, italic:0, skew:0}, "56":{depth:0, height:0.65556, italic:0, skew:0}, "57":{depth:0, height:0.65556, italic:0, skew:0}, "58":{depth:0, height:0.44444, italic:0, skew:0}, "59":{depth:0.125, height:0.44444, italic:0, skew:0}, "61":{depth:-0.13, height:0.37, italic:0, skew:0}, "63":{depth:0, height:0.69444, italic:0, skew:0}, "64":{depth:0, height:0.69444, italic:0, skew:0}, "65":{depth:0, height:0.69444, italic:0, skew:0}, "66":{depth:0, height:0.69444, italic:0, skew:0}, "67":{depth:0, height:0.69444, italic:0, skew:0}, "68":{depth:0, height:0.69444, italic:0, skew:0}, "69":{depth:0, height:0.69444, italic:0, skew:0}, "70":{depth:0, height:0.69444, italic:0, skew:0}, "71":{depth:0, height:0.69444, italic:0, skew:0}, "72":{depth:0, height:0.69444, italic:0, skew:0}, "73":{depth:0, height:0.69444, italic:0, skew:0}, "74":{depth:0, height:0.69444, italic:0, skew:0}, "75":{depth:0, height:0.69444, italic:0, skew:0}, "76":{depth:0, height:0.69444, italic:0, skew:0}, "77":{depth:0, height:0.69444, italic:0, skew:0}, "78":{depth:0, height:0.69444, italic:0, skew:0}, "79":{depth:0, height:0.69444, italic:0, skew:0}, "80":{depth:0, height:0.69444, italic:0, skew:0}, "81":{depth:0.125, height:0.69444, italic:0, skew:0}, "82":{depth:0, height:0.69444, italic:0, skew:0}, "83":{depth:0, height:0.69444, italic:0, skew:0}, "84":{depth:0, height:0.69444, italic:0, skew:0}, "85":{depth:0, height:0.69444, italic:0, skew:0}, "86":{depth:0, height:0.69444, italic:0.01389, skew:0}, "87":{depth:0, height:0.69444, italic:0.01389, skew:0}, "88":{depth:0, height:0.69444, italic:0, skew:0}, "89":{depth:0, height:0.69444, italic:0.025, skew:0}, "90":{depth:0, height:0.69444, italic:0, skew:0}, "91":{depth:0.25, height:0.75, italic:0, skew:0}, "93":{depth:0.25, height:0.75, italic:0, skew:0}, "94":{depth:0, height:0.69444, italic:0, skew:0}, "95":{depth:0.35, height:0.09444, italic:0.02778, skew:0}, "97":{depth:0, height:0.44444, italic:0, skew:0}, "98":{depth:0, height:0.69444, italic:0, skew:0}, "99":{depth:0, height:0.44444, italic:0, skew:0}, "100":{depth:0, height:0.69444, italic:0, skew:0}, "101":{depth:0, height:0.44444, italic:0, skew:0}, "102":{depth:0, height:0.69444, italic:0.06944, skew:0}, "103":{depth:0.19444, height:0.44444, italic:0.01389, skew:0}, "104":{depth:0, height:0.69444, italic:0, skew:0}, "105":{depth:0, height:0.67937, italic:0, skew:0}, "106":{depth:0.19444, height:0.67937, italic:0, skew:0}, "107":{depth:0, height:0.69444, italic:0, skew:0}, "108":{depth:0, height:0.69444, italic:0, skew:0}, "109":{depth:0, height:0.44444, italic:0, skew:0}, "110":{depth:0, height:0.44444, italic:0, skew:0}, "111":{depth:0, height:0.44444, italic:0, skew:0}, "112":{depth:0.19444, height:0.44444, italic:0, skew:0}, "113":{depth:0.19444, height:0.44444, italic:0, skew:0}, "114":{depth:0, height:0.44444, italic:0.01389, skew:0}, "115":{depth:0, height:0.44444, italic:0, skew:0}, "116":{depth:0, height:0.57143, italic:0, skew:0}, "117":{depth:0, height:0.44444, italic:0, skew:0}, "118":{depth:0, height:0.44444, italic:0.01389, skew:0}, "119":{depth:0, height:0.44444, italic:0.01389, skew:0}, "120":{depth:0, height:0.44444, italic:0, skew:0}, "121":{depth:0.19444, height:0.44444, italic:0.01389, skew:0}, "122":{depth:0, height:0.44444, italic:0, skew:0}, "126":{depth:0.35, height:0.32659, italic:0, skew:0}, "305":{depth:0, height:0.44444, italic:0, skew:0}, "567":{depth:0.19444, height:0.44444, italic:0, skew:0}, "768":{depth:0, height:0.69444, italic:0, skew:0}, "769":{depth:0, height:0.69444, italic:0, skew:0}, "770":{depth:0, height:0.69444, italic:0, skew:0}, "771":{depth:0, height:0.67659, italic:0, skew:0}, "772":{depth:0, height:0.60889, italic:0, skew:0}, "774":{depth:0, height:0.69444, italic:0, skew:0}, "775":{depth:0, height:0.67937, italic:0, skew:0}, "776":{depth:0, height:0.67937, italic:0, skew:0}, "778":{depth:0, height:0.69444, italic:0, skew:0}, "779":{depth:0, height:0.69444, italic:0, skew:0}, "780":{depth:0, height:0.63194, italic:0, skew:0}, "915":{depth:0, height:0.69444, italic:0, skew:0}, "916":{depth:0, height:0.69444, italic:0, skew:0}, "920":{depth:0, height:0.69444, italic:0, skew:0}, "923":{depth:0, height:0.69444, italic:0, skew:0}, "926":{depth:0, height:0.69444, italic:0, skew:0}, "928":{depth:0, height:0.69444, italic:0, skew:0}, "931":{depth:0, height:0.69444, italic:0, skew:0}, "933":{depth:0, height:0.69444, italic:0, skew:0}, "934":{depth:0, height:0.69444, italic:0, skew:0}, "936":{depth:0, height:0.69444, italic:0, skew:0}, "937":{depth:0, height:0.69444, italic:0, skew:0}, "8211":{depth:0, height:0.44444, italic:0.02778, skew:0}, "8212":{depth:0, height:0.44444, italic:0.02778, skew:0}, "8216":{depth:0, height:0.69444, italic:0, skew:0}, "8217":{depth:0, height:0.69444, italic:0, skew:0}, "8220":{depth:0, height:0.69444, italic:0, skew:0}, "8221":{depth:0, height:0.69444, italic:0, skew:0}}, "Script-Regular":{"65":{depth:0, height:0.7, italic:0.22925, skew:0}, "66":{depth:0, height:0.7, italic:0.04087, skew:0}, "67":{depth:0, height:0.7, italic:0.1689, skew:0}, "68":{depth:0, height:0.7, italic:0.09371, skew:0}, "69":{depth:0, height:0.7, italic:0.18583, skew:0}, "70":{depth:0, height:0.7, italic:0.13634, skew:0}, "71":{depth:0, height:0.7, italic:0.17322, skew:0}, "72":{depth:0, height:0.7, italic:0.29694, skew:0}, "73":{depth:0, height:0.7, italic:0.19189, skew:0}, "74":{depth:0.27778, height:0.7, italic:0.19189, skew:0}, "75":{depth:0, height:0.7, italic:0.31259, skew:0}, "76":{depth:0, height:0.7, italic:0.19189, skew:0}, "77":{depth:0, height:0.7, italic:0.15981, skew:0}, "78":{depth:0, height:0.7, italic:0.3525, skew:0}, "79":{depth:0, height:0.7, italic:0.08078, skew:0}, "80":{depth:0, height:0.7, italic:0.08078, skew:0}, "81":{depth:0, height:0.7, italic:0.03305, skew:0}, "82":{depth:0, height:0.7, italic:0.06259, skew:0}, "83":{depth:0, height:0.7, italic:0.19189, skew:0}, "84":{depth:0, height:0.7, italic:0.29087, skew:0}, "85":{depth:0, height:0.7, italic:0.25815, skew:0}, "86":{depth:0, height:0.7, italic:0.27523, skew:0}, "87":{depth:0, height:0.7, italic:0.27523, skew:0}, "88":{depth:0, height:0.7, italic:0.26006, skew:0}, "89":{depth:0, height:0.7, italic:0.2939, skew:0}, "90":{depth:0, height:0.7, italic:0.24037, skew:0}}, "Size1-Regular":{"40":{depth:0.35001, height:0.85, italic:0, skew:0}, "41":{depth:0.35001, height:0.85, italic:0, skew:0}, "47":{depth:0.35001, height:0.85, italic:0, skew:0}, "91":{depth:0.35001, height:0.85, italic:0, skew:0}, "92":{depth:0.35001, height:0.85, italic:0, skew:0}, "93":{depth:0.35001, height:0.85, italic:0, skew:0}, "123":{depth:0.35001, height:0.85, italic:0, skew:0}, "125":{depth:0.35001, height:0.85, italic:0, skew:0}, "710":{depth:0, height:0.72222, italic:0, skew:0}, "732":{depth:0, height:0.72222, italic:0, skew:0}, "770":{depth:0, height:0.72222, italic:0, skew:0}, "771":{depth:0, height:0.72222, italic:0, skew:0}, "8214":{depth:-0.00099, height:0.601, italic:0, skew:0}, "8593":{depth:0.00001, height:0.6, italic:0, skew:0}, "8595":{depth:0.00001, height:0.6, italic:0, skew:0}, "8657":{depth:0.00001, height:0.6, italic:0, skew:0}, "8659":{depth:0.00001, height:0.6, italic:0, skew:0}, "8719":{depth:0.25001, height:0.75, italic:0, skew:0}, "8720":{depth:0.25001, height:0.75, italic:0, skew:0}, "8721":{depth:0.25001, height:0.75, italic:0, skew:0}, "8730":{depth:0.35001, height:0.85, italic:0, skew:0}, "8739":{depth:-0.00599, height:0.606, italic:0, skew:0}, "8741":{depth:-0.00599, height:0.606, italic:0, skew:0}, "8747":{depth:0.30612, height:0.805, italic:0.19445, skew:0}, "8748":{depth:0.306, height:0.805, italic:0.19445, skew:0}, "8749":{depth:0.306, height:0.805, italic:0.19445, skew:0}, "8750":{depth:0.30612, height:0.805, italic:0.19445, skew:0}, "8896":{depth:0.25001, height:0.75, italic:0, skew:0}, "8897":{depth:0.25001, height:0.75, italic:0, skew:0}, "8898":{depth:0.25001, height:0.75, italic:0, skew:0}, "8899":{depth:0.25001, height:0.75, italic:0, skew:0}, "8968":{depth:0.35001, height:0.85, italic:0, skew:0}, "8969":{depth:0.35001, height:0.85, italic:0, skew:0}, "8970":{depth:0.35001, height:0.85, italic:0, skew:0}, "8971":{depth:0.35001, height:0.85, italic:0, skew:0}, "9168":{depth:-0.00099, height:0.601, italic:0, skew:0}, "10216":{depth:0.35001, height:0.85, italic:0, skew:0}, "10217":{depth:0.35001, height:0.85, italic:0, skew:0}, "10752":{depth:0.25001, height:0.75, italic:0, skew:0}, "10753":{depth:0.25001, height:0.75, italic:0, skew:0}, "10754":{depth:0.25001, height:0.75, italic:0, skew:0}, "10756":{depth:0.25001, height:0.75, italic:0, skew:0}, "10758":{depth:0.25001, height:0.75, italic:0, skew:0}}, "Size2-Regular":{"40":{depth:0.65002, height:1.15, italic:0, skew:0}, "41":{depth:0.65002, height:1.15, italic:0, skew:0}, "47":{depth:0.65002, height:1.15, italic:0, skew:0}, "91":{depth:0.65002, height:1.15, italic:0, skew:0}, "92":{depth:0.65002, height:1.15, italic:0, skew:0}, "93":{depth:0.65002, height:1.15, italic:0, skew:0}, "123":{depth:0.65002, height:1.15, italic:0, skew:0}, "125":{depth:0.65002, height:1.15, italic:0, skew:0}, "710":{depth:0, height:0.75, italic:0, skew:0}, "732":{depth:0, height:0.75, italic:0, skew:0}, "770":{depth:0, height:0.75, italic:0, skew:0}, "771":{depth:0, height:0.75, italic:0, skew:0}, "8719":{depth:0.55001, height:1.05, italic:0, skew:0}, "8720":{depth:0.55001, height:1.05, italic:0, skew:0}, "8721":{depth:0.55001, height:1.05, italic:0, skew:0}, "8730":{depth:0.65002, height:1.15, italic:0, skew:0}, "8747":{depth:0.86225, height:1.36, italic:0.44445, skew:0}, "8748":{depth:0.862, height:1.36, italic:0.44445, skew:0}, "8749":{depth:0.862, height:1.36, italic:0.44445, skew:0}, "8750":{depth:0.86225, height:1.36, italic:0.44445, skew:0}, "8896":{depth:0.55001, height:1.05, italic:0, skew:0}, "8897":{depth:0.55001, height:1.05, italic:0, skew:0}, "8898":{depth:0.55001, height:1.05, italic:0, skew:0}, "8899":{depth:0.55001, height:1.05, italic:0, skew:0}, "8968":{depth:0.65002, height:1.15, italic:0, skew:0}, "8969":{depth:0.65002, height:1.15, italic:0, skew:0}, "8970":{depth:0.65002, height:1.15, italic:0, skew:0}, "8971":{depth:0.65002, height:1.15, italic:0, skew:0}, "10216":{depth:0.65002, height:1.15, italic:0, skew:0}, "10217":{depth:0.65002, height:1.15, italic:0, skew:0}, "10752":{depth:0.55001, height:1.05, italic:0, skew:0}, "10753":{depth:0.55001, height:1.05, italic:0, skew:0}, "10754":{depth:0.55001, height:1.05, italic:0, skew:0}, "10756":{depth:0.55001, height:1.05, italic:0, skew:0}, "10758":{depth:0.55001, height:1.05, italic:0, skew:0}}, "Size3-Regular":{"40":{depth:0.95003, height:1.45, italic:0, skew:0}, "41":{depth:0.95003, height:1.45, italic:0, skew:0}, "47":{depth:0.95003, height:1.45, italic:0, skew:0}, "91":{depth:0.95003, height:1.45, italic:0, skew:0}, "92":{depth:0.95003, height:1.45, italic:0, skew:0}, "93":{depth:0.95003, height:1.45, italic:0, skew:0}, "123":{depth:0.95003, height:1.45, italic:0, skew:0}, "125":{depth:0.95003, height:1.45, italic:0, skew:0}, "710":{depth:0, height:0.75, italic:0, skew:0}, "732":{depth:0, height:0.75, italic:0, skew:0}, "770":{depth:0, height:0.75, italic:0, skew:0}, "771":{depth:0, height:0.75, italic:0, skew:0}, "8730":{depth:0.95003, height:1.45, italic:0, skew:0}, "8968":{depth:0.95003, height:1.45, italic:0, skew:0}, "8969":{depth:0.95003, height:1.45, italic:0, skew:0}, "8970":{depth:0.95003, height:1.45, italic:0, skew:0}, "8971":{depth:0.95003, height:1.45, italic:0, skew:0}, "10216":{depth:0.95003, height:1.45, italic:0, skew:0}, "10217":{depth:0.95003, height:1.45, italic:0, skew:0}}, "Size4-Regular":{"40":{depth:1.25003, height:1.75, italic:0, skew:0}, "41":{depth:1.25003, height:1.75, italic:0, skew:0}, "47":{depth:1.25003, height:1.75, italic:0, skew:0}, "91":{depth:1.25003, height:1.75, italic:0, skew:0}, "92":{depth:1.25003, height:1.75, italic:0, skew:0}, "93":{depth:1.25003, height:1.75, italic:0, skew:0}, "123":{depth:1.25003, height:1.75, italic:0, skew:0}, "125":{depth:1.25003, height:1.75, italic:0, skew:0}, "710":{depth:0, height:0.825, italic:0, skew:0}, "732":{depth:0, height:0.825, italic:0, skew:0}, "770":{depth:0, height:0.825, italic:0, skew:0}, "771":{depth:0, height:0.825, italic:0, skew:0}, "8730":{depth:1.25003, height:1.75, italic:0, skew:0}, "8968":{depth:1.25003, height:1.75, italic:0, skew:0}, "8969":{depth:1.25003, height:1.75, italic:0, skew:0}, "8970":{depth:1.25003, height:1.75, italic:0, skew:0}, "8971":{depth:1.25003, height:1.75, italic:0, skew:0}, "9115":{depth:0.64502, height:1.155, italic:0, skew:0}, "9116":{depth:0.00001, height:0.6, italic:0, skew:0}, "9117":{depth:0.64502, height:1.155, italic:0, skew:0}, "9118":{depth:0.64502, height:1.155, italic:0, skew:0}, "9119":{depth:0.00001, height:0.6, italic:0, skew:0}, "9120":{depth:0.64502, height:1.155, italic:0, skew:0}, "9121":{depth:0.64502, height:1.155, italic:0, skew:0}, "9122":{depth:-0.00099, height:0.601, italic:0, skew:0}, "9123":{depth:0.64502, height:1.155, italic:0, skew:0}, "9124":{depth:0.64502, height:1.155, italic:0, skew:0}, "9125":{depth:-0.00099, height:0.601, italic:0, skew:0}, "9126":{depth:0.64502, height:1.155, italic:0, skew:0}, "9127":{depth:0.00001, height:0.9, italic:0, skew:0}, "9128":{depth:0.65002, height:1.15, italic:0, skew:0}, "9129":{depth:0.90001, height:0, italic:0, skew:0}, "9130":{depth:0, height:0.3, italic:0, skew:0}, "9131":{depth:0.00001, height:0.9, italic:0, skew:0}, "9132":{depth:0.65002, height:1.15, italic:0, skew:0}, "9133":{depth:0.90001, height:0, italic:0, skew:0}, "9143":{depth:0.88502, height:0.915, italic:0, skew:0}, "10216":{depth:1.25003, height:1.75, italic:0, skew:0}, "10217":{depth:1.25003, height:1.75, italic:0, skew:0}, "57344":{depth:-0.00499, height:0.605, italic:0, skew:0}, "57345":{depth:-0.00499, height:0.605, italic:0, skew:0}, "57680":{depth:0, height:0.12, italic:0, skew:0}, "57681":{depth:0, height:0.12, italic:0, skew:0}, "57682":{depth:0, height:0.12, italic:0, skew:0}, "57683":{depth:0, height:0.12, italic:0, skew:0}}, "Typewriter-Regular":{"33":{depth:0, height:0.61111, italic:0, skew:0}, "34":{depth:0, height:0.61111, italic:0, skew:0}, "35":{depth:0, height:0.61111, italic:0, skew:0}, "36":{depth:0.08333, height:0.69444, italic:0, skew:0}, "37":{depth:0.08333, height:0.69444, italic:0, skew:0}, "38":{depth:0, height:0.61111, italic:0, skew:0}, "39":{depth:0, height:0.61111, italic:0, skew:0}, "40":{depth:0.08333, height:0.69444, italic:0, skew:0}, "41":{depth:0.08333, height:0.69444, italic:0, skew:0}, "42":{depth:0, height:0.52083, italic:0, skew:0}, "43":{depth:-0.08056, height:0.53055, italic:0, skew:0}, "44":{depth:0.13889, height:0.125, italic:0, skew:0}, "45":{depth:-0.08056, height:0.53055, italic:0, skew:0}, "46":{depth:0, height:0.125, italic:0, skew:0}, "47":{depth:0.08333, height:0.69444, italic:0, skew:0}, "48":{depth:0, height:0.61111, italic:0, skew:0}, "49":{depth:0, height:0.61111, italic:0, skew:0}, "50":{depth:0, height:0.61111, italic:0, skew:0}, "51":{depth:0, height:0.61111, italic:0, skew:0}, "52":{depth:0, height:0.61111, italic:0, skew:0}, "53":{depth:0, height:0.61111, italic:0, skew:0}, "54":{depth:0, height:0.61111, italic:0, skew:0}, "55":{depth:0, height:0.61111, italic:0, skew:0}, "56":{depth:0, height:0.61111, italic:0, skew:0}, "57":{depth:0, height:0.61111, italic:0, skew:0}, "58":{depth:0, height:0.43056, italic:0, skew:0}, "59":{depth:0.13889, height:0.43056, italic:0, skew:0}, "60":{depth:-0.05556, height:0.55556, italic:0, skew:0}, "61":{depth:-0.19549, height:0.41562, italic:0, skew:0}, "62":{depth:-0.05556, height:0.55556, italic:0, skew:0}, "63":{depth:0, height:0.61111, italic:0, skew:0}, "64":{depth:0, height:0.61111, italic:0, skew:0}, "65":{depth:0, height:0.61111, italic:0, skew:0}, "66":{depth:0, height:0.61111, italic:0, skew:0}, "67":{depth:0, height:0.61111, italic:0, skew:0}, "68":{depth:0, height:0.61111, italic:0, skew:0}, "69":{depth:0, height:0.61111, italic:0, skew:0}, "70":{depth:0, height:0.61111, italic:0, skew:0}, "71":{depth:0, height:0.61111, italic:0, skew:0}, "72":{depth:0, height:0.61111, italic:0, skew:0}, "73":{depth:0, height:0.61111, italic:0, skew:0}, "74":{depth:0, height:0.61111, italic:0, skew:0}, "75":{depth:0, height:0.61111, italic:0, skew:0}, "76":{depth:0, height:0.61111, italic:0, skew:0}, "77":{depth:0, height:0.61111, italic:0, skew:0}, "78":{depth:0, height:0.61111, italic:0, skew:0}, "79":{depth:0, height:0.61111, italic:0, skew:0}, "80":{depth:0, height:0.61111, italic:0, skew:0}, "81":{depth:0.13889, height:0.61111, italic:0, skew:0}, "82":{depth:0, height:0.61111, italic:0, skew:0}, "83":{depth:0, height:0.61111, italic:0, skew:0}, "84":{depth:0, height:0.61111, italic:0, skew:0}, "85":{depth:0, height:0.61111, italic:0, skew:0}, "86":{depth:0, height:0.61111, italic:0, skew:0}, "87":{depth:0, height:0.61111, italic:0, skew:0}, "88":{depth:0, height:0.61111, italic:0, skew:0}, "89":{depth:0, height:0.61111, italic:0, skew:0}, "90":{depth:0, height:0.61111, italic:0, skew:0}, "91":{depth:0.08333, height:0.69444, italic:0, skew:0}, "92":{depth:0.08333, height:0.69444, italic:0, skew:0}, "93":{depth:0.08333, height:0.69444, italic:0, skew:0}, "94":{depth:0, height:0.61111, italic:0, skew:0}, "95":{depth:0.09514, height:0, italic:0, skew:0}, "96":{depth:0, height:0.61111, italic:0, skew:0}, "97":{depth:0, height:0.43056, italic:0, skew:0}, "98":{depth:0, height:0.61111, italic:0, skew:0}, "99":{depth:0, height:0.43056, italic:0, skew:0}, "100":{depth:0, height:0.61111, italic:0, skew:0}, "101":{depth:0, height:0.43056, italic:0, skew:0}, "102":{depth:0, height:0.61111, italic:0, skew:0}, "103":{depth:0.22222, height:0.43056, italic:0, skew:0}, "104":{depth:0, height:0.61111, italic:0, skew:0}, "105":{depth:0, height:0.61111, italic:0, skew:0}, "106":{depth:0.22222, height:0.61111, italic:0, skew:0}, "107":{depth:0, height:0.61111, italic:0, skew:0}, "108":{depth:0, height:0.61111, italic:0, skew:0}, "109":{depth:0, height:0.43056, italic:0, skew:0}, "110":{depth:0, height:0.43056, italic:0, skew:0}, "111":{depth:0, height:0.43056, italic:0, skew:0}, "112":{depth:0.22222, height:0.43056, italic:0, skew:0}, "113":{depth:0.22222, height:0.43056, italic:0, skew:0}, "114":{depth:0, height:0.43056, italic:0, skew:0}, "115":{depth:0, height:0.43056, italic:0, skew:0}, "116":{depth:0, height:0.55358, italic:0, skew:0}, "117":{depth:0, height:0.43056, italic:0, skew:0}, "118":{depth:0, height:0.43056, italic:0, skew:0}, "119":{depth:0, height:0.43056, italic:0, skew:0}, "120":{depth:0, height:0.43056, italic:0, skew:0}, "121":{depth:0.22222, height:0.43056, italic:0, skew:0}, "122":{depth:0, height:0.43056, italic:0, skew:0}, "123":{depth:0.08333, height:0.69444, italic:0, skew:0}, "124":{depth:0.08333, height:0.69444, italic:0, skew:0}, "125":{depth:0.08333, height:0.69444, italic:0, skew:0}, "126":{depth:0, height:0.61111, italic:0, skew:0}, "127":{depth:0, height:0.61111, italic:0, skew:0}, "305":{depth:0, height:0.43056, italic:0, skew:0}, "567":{depth:0.22222, height:0.43056, italic:0, skew:0}, "768":{depth:0, height:0.61111, italic:0, skew:0}, "769":{depth:0, height:0.61111, italic:0, skew:0}, "770":{depth:0, height:0.61111, italic:0, skew:0}, "771":{depth:0, height:0.61111, italic:0, skew:0}, "772":{depth:0, height:0.56555, italic:0, skew:0}, "774":{depth:0, height:0.61111, italic:0, skew:0}, "776":{depth:0, height:0.61111, italic:0, skew:0}, "778":{depth:0, height:0.61111, italic:0, skew:0}, "780":{depth:0, height:0.56597, italic:0, skew:0}, "915":{depth:0, height:0.61111, italic:0, skew:0}, "916":{depth:0, height:0.61111, italic:0, skew:0}, "920":{depth:0, height:0.61111, italic:0, skew:0}, "923":{depth:0, height:0.61111, italic:0, skew:0}, "926":{depth:0, height:0.61111, italic:0, skew:0}, "928":{depth:0, height:0.61111, italic:0, skew:0}, "931":{depth:0, height:0.61111, italic:0, skew:0}, "933":{depth:0, height:0.61111, italic:0, skew:0}, "934":{depth:0, height:0.61111, italic:0, skew:0}, "936":{depth:0, height:0.61111, italic:0, skew:0}, "937":{depth:0, height:0.61111, italic:0, skew:0}, "2018":{depth:0, height:0.61111, italic:0, skew:0}, "2019":{depth:0, height:0.61111, italic:0, skew:0}, "8242":{depth:0, height:0.61111, italic:0, skew:0}}};

},{}],100:[function(require,module,exports){
"use strict";

var utils = require("./utils");
var ParseError = require("./ParseError");

// This file contains a list of functions that we parse. The functions map
// contains the following data:

/*
 * Keys are the name of the functions to parse
 * The data contains the following keys:
 *  - numArgs: The number of arguments the function takes.
 *  - argTypes: (optional) An array corresponding to each argument of the
 *              function, giving the type of argument that should be parsed. Its
 *              length should be equal to `numArgs + numOptionalArgs`. Valid
 *              types:
 *               - "size": A size-like thing, such as "1em" or "5ex"
 *               - "color": An html color, like "#abc" or "blue"
 *               - "original": The same type as the environment that the
 *                             function being parsed is in (e.g. used for the
 *                             bodies of functions like \color where the first
 *                             argument is special and the second argument is
 *                             parsed normally)
 *              Other possible types (probably shouldn't be used)
 *               - "text": Text-like (e.g. \text)
 *               - "math": Normal math
 *              If undefined, this will be treated as an appropriate length
 *              array of "original" strings
 *  - greediness: (optional) The greediness of the function to use ungrouped
 *                arguments.
 *
 *                E.g. if you have an expression
 *                  \sqrt \frac 1 2
 *                since \frac has greediness=2 vs \sqrt's greediness=1, \frac
 *                will use the two arguments '1' and '2' as its two arguments,
 *                then that whole function will be used as the argument to
 *                \sqrt. On the other hand, the expressions
 *                  \frac \frac 1 2 3
 *                and
 *                  \frac \sqrt 1 2
 *                will fail because \frac and \frac have equal greediness
 *                and \sqrt has a lower greediness than \frac respectively. To
 *                make these parse, we would have to change them to:
 *                  \frac {\frac 1 2} 3
 *                and
 *                  \frac {\sqrt 1} 2
 *
 *                The default value is `1`
 *  - allowedInText: (optional) Whether or not the function is allowed inside
 *                   text mode (default false)
 *  - numOptionalArgs: (optional) The number of optional arguments the function
 *                     should parse. If the optional arguments aren't found,
 *                     `null` will be passed to the handler in their place.
 *                     (default 0)
 *  - handler: The function that is called to handle this function and its
 *             arguments. The arguments are:
 *              - func: the text of the function
 *              - [args]: the next arguments are the arguments to the function,
 *                        of which there are numArgs of them
 *              - positions: the positions in the overall string of the function
 *                           and the arguments. Should only be used to produce
 *                           error messages
 *             The function should return an object with the following keys:
 *              - type: The type of element that this is. This is then used in
 *                      buildHTML/buildMathML to determine which function
 *                      should be called to build this node into a DOM node
 *             Any other data can be added to the object, which will be passed
 *             in to the function in buildHTML/buildMathML as `group.value`.
 */

var functions = {
    // A normal square root
    "\\sqrt": {
        numArgs: 1,
        numOptionalArgs: 1,
        handler: function handler(func, index, body, positions) {
            return {
                type: "sqrt",
                body: body,
                index: index
            };
        }
    },

    // Some non-mathy text
    "\\text": {
        numArgs: 1,
        argTypes: ["text"],
        greediness: 2,
        handler: function handler(func, body) {
            // Since the corresponding buildHTML/buildMathML function expects a
            // list of elements, we normalize for different kinds of arguments
            // TODO(emily): maybe this should be done somewhere else
            var inner;
            if (body.type === "ordgroup") {
                inner = body.value;
            } else {
                inner = [body];
            }

            return {
                type: "text",
                body: inner
            };
        }
    },

    // A two-argument custom color
    "\\color": {
        numArgs: 2,
        allowedInText: true,
        greediness: 3,
        argTypes: ["color", "original"],
        handler: function handler(func, color, body) {
            // Normalize the different kinds of bodies (see \text above)
            var inner;
            if (body.type === "ordgroup") {
                inner = body.value;
            } else {
                inner = [body];
            }

            return {
                type: "color",
                color: color.value,
                value: inner
            };
        }
    },

    // An overline
    "\\overline": {
        numArgs: 1,
        handler: function handler(func, body) {
            return {
                type: "overline",
                body: body
            };
        }
    },

    // A box of the width and height
    "\\rule": {
        numArgs: 2,
        numOptionalArgs: 1,
        argTypes: ["size", "size", "size"],
        handler: function handler(func, shift, width, height) {
            return {
                type: "rule",
                shift: shift && shift.value,
                width: width.value,
                height: height.value
            };
        }
    },

    // A KaTeX logo
    "\\KaTeX": {
        numArgs: 0,
        handler: function handler(func) {
            return {
                type: "katex"
            };
        }
    },

    "\\phantom": {
        numArgs: 1,
        handler: function handler(func, body) {
            var inner;
            if (body.type === "ordgroup") {
                inner = body.value;
            } else {
                inner = [body];
            }

            return {
                type: "phantom",
                value: inner
            };
        }
    }
};

// Extra data needed for the delimiter handler down below
var delimiterSizes = {
    "\\bigl": { type: "open", size: 1 },
    "\\Bigl": { type: "open", size: 2 },
    "\\biggl": { type: "open", size: 3 },
    "\\Biggl": { type: "open", size: 4 },
    "\\bigr": { type: "close", size: 1 },
    "\\Bigr": { type: "close", size: 2 },
    "\\biggr": { type: "close", size: 3 },
    "\\Biggr": { type: "close", size: 4 },
    "\\bigm": { type: "rel", size: 1 },
    "\\Bigm": { type: "rel", size: 2 },
    "\\biggm": { type: "rel", size: 3 },
    "\\Biggm": { type: "rel", size: 4 },
    "\\big": { type: "textord", size: 1 },
    "\\Big": { type: "textord", size: 2 },
    "\\bigg": { type: "textord", size: 3 },
    "\\Bigg": { type: "textord", size: 4 }
};

var delimiters = ["(", ")", "[", "\\lbrack", "]", "\\rbrack", "\\{", "\\lbrace", "\\}", "\\rbrace", "\\lfloor", "\\rfloor", "\\lceil", "\\rceil", "<", ">", "\\langle", "\\rangle", "\\lvert", "\\rvert", "\\lVert", "\\rVert", "\\lgroup", "\\rgroup", "\\lmoustache", "\\rmoustache", "/", "\\backslash", "|", "\\vert", "\\|", "\\Vert", "\\uparrow", "\\Uparrow", "\\downarrow", "\\Downarrow", "\\updownarrow", "\\Updownarrow", "."];

var fontAliases = {
    "\\Bbb": "\\mathbb",
    "\\bold": "\\mathbf",
    "\\frak": "\\mathfrak"
};

/*
 * This is a list of functions which each have the same function but have
 * different names so that we don't have to duplicate the data a bunch of times.
 * Each element in the list is an object with the following keys:
 *  - funcs: A list of function names to be associated with the data
 *  - data: An objecty with the same data as in each value of the `function`
 *          table above
 */
var duplicatedFunctions = [
// Single-argument color functions
{
    funcs: ["\\blue", "\\orange", "\\pink", "\\red", "\\green", "\\gray", "\\purple", "\\blueA", "\\blueB", "\\blueC", "\\blueD", "\\blueE", "\\tealA", "\\tealB", "\\tealC", "\\tealD", "\\tealE", "\\greenA", "\\greenB", "\\greenC", "\\greenD", "\\greenE", "\\goldA", "\\goldB", "\\goldC", "\\goldD", "\\goldE", "\\redA", "\\redB", "\\redC", "\\redD", "\\redE", "\\maroonA", "\\maroonB", "\\maroonC", "\\maroonD", "\\maroonE", "\\purpleA", "\\purpleB", "\\purpleC", "\\purpleD", "\\purpleE", "\\mintA", "\\mintB", "\\mintC", "\\grayA", "\\grayB", "\\grayC", "\\grayD", "\\grayE", "\\grayF", "\\grayG", "\\grayH", "\\grayI", "\\kaBlue", "\\kaGreen"],
    data: {
        numArgs: 1,
        allowedInText: true,
        greediness: 3,
        handler: function handler(func, body) {
            var atoms;
            if (body.type === "ordgroup") {
                atoms = body.value;
            } else {
                atoms = [body];
            }

            return {
                type: "color",
                color: "katex-" + func.slice(1),
                value: atoms
            };
        }
    }
},

// There are 2 flags for operators; whether they produce limits in
// displaystyle, and whether they are symbols and should grow in
// displaystyle. These four groups cover the four possible choices.

// No limits, not symbols
{
    funcs: ["\\arcsin", "\\arccos", "\\arctan", "\\arg", "\\cos", "\\cosh", "\\cot", "\\coth", "\\csc", "\\deg", "\\dim", "\\exp", "\\hom", "\\ker", "\\lg", "\\ln", "\\log", "\\sec", "\\sin", "\\sinh", "\\tan", "\\tanh"],
    data: {
        numArgs: 0,
        handler: function handler(func) {
            return {
                type: "op",
                limits: false,
                symbol: false,
                body: func
            };
        }
    }
},

// Limits, not symbols
{
    funcs: ["\\det", "\\gcd", "\\inf", "\\lim", "\\liminf", "\\limsup", "\\max", "\\min", "\\Pr", "\\sup"],
    data: {
        numArgs: 0,
        handler: function handler(func) {
            return {
                type: "op",
                limits: true,
                symbol: false,
                body: func
            };
        }
    }
},

// No limits, symbols
{
    funcs: ["\\int", "\\iint", "\\iiint", "\\oint"],
    data: {
        numArgs: 0,
        handler: function handler(func) {
            return {
                type: "op",
                limits: false,
                symbol: true,
                body: func
            };
        }
    }
},

// Limits, symbols
{
    funcs: ["\\coprod", "\\bigvee", "\\bigwedge", "\\biguplus", "\\bigcap", "\\bigcup", "\\intop", "\\prod", "\\sum", "\\bigotimes", "\\bigoplus", "\\bigodot", "\\bigsqcup", "\\smallint"],
    data: {
        numArgs: 0,
        handler: function handler(func) {
            return {
                type: "op",
                limits: true,
                symbol: true,
                body: func
            };
        }
    }
},

// Fractions
{
    funcs: ["\\dfrac", "\\frac", "\\tfrac", "\\dbinom", "\\binom", "\\tbinom"],
    data: {
        numArgs: 2,
        greediness: 2,
        handler: function handler(func, numer, denom) {
            var hasBarLine;
            var leftDelim = null;
            var rightDelim = null;
            var size = "auto";

            switch (func) {
                case "\\dfrac":
                case "\\frac":
                case "\\tfrac":
                    hasBarLine = true;
                    break;
                case "\\dbinom":
                case "\\binom":
                case "\\tbinom":
                    hasBarLine = false;
                    leftDelim = "(";
                    rightDelim = ")";
                    break;
                default:
                    throw new Error("Unrecognized genfrac command");
            }

            switch (func) {
                case "\\dfrac":
                case "\\dbinom":
                    size = "display";
                    break;
                case "\\tfrac":
                case "\\tbinom":
                    size = "text";
                    break;
            }

            return {
                type: "genfrac",
                numer: numer,
                denom: denom,
                hasBarLine: hasBarLine,
                leftDelim: leftDelim,
                rightDelim: rightDelim,
                size: size
            };
        }
    }
},

// Left and right overlap functions
{
    funcs: ["\\llap", "\\rlap"],
    data: {
        numArgs: 1,
        allowedInText: true,
        handler: function handler(func, body) {
            return {
                type: func.slice(1),
                body: body
            };
        }
    }
},

// Delimiter functions
{
    funcs: ["\\bigl", "\\Bigl", "\\biggl", "\\Biggl", "\\bigr", "\\Bigr", "\\biggr", "\\Biggr", "\\bigm", "\\Bigm", "\\biggm", "\\Biggm", "\\big", "\\Big", "\\bigg", "\\Bigg", "\\left", "\\right"],
    data: {
        numArgs: 1,
        handler: function handler(func, delim, positions) {
            if (!utils.contains(delimiters, delim.value)) {
                throw new ParseError("Invalid delimiter: '" + delim.value + "' after '" + func + "'", this.lexer, positions[1]);
            }

            // \left and \right are caught somewhere in Parser.js, which is
            // why this data doesn't match what is in buildHTML.
            if (func === "\\left" || func === "\\right") {
                return {
                    type: "leftright",
                    value: delim.value
                };
            } else {
                return {
                    type: "delimsizing",
                    size: delimiterSizes[func].size,
                    delimType: delimiterSizes[func].type,
                    value: delim.value
                };
            }
        }
    }
},

// Sizing functions (handled in Parser.js explicitly, hence no handler)
{
    funcs: ["\\tiny", "\\scriptsize", "\\footnotesize", "\\small", "\\normalsize", "\\large", "\\Large", "\\LARGE", "\\huge", "\\Huge"],
    data: {
        numArgs: 0
    }
},

// Style changing functions (handled in Parser.js explicitly, hence no
// handler)
{
    funcs: ["\\displaystyle", "\\textstyle", "\\scriptstyle", "\\scriptscriptstyle"],
    data: {
        numArgs: 0
    }
}, {
    funcs: [
    // styles
    "\\mathrm", "\\mathit", "\\mathbf",

    // families
    "\\mathbb", "\\mathcal", "\\mathfrak", "\\mathscr", "\\mathsf", "\\mathtt",

    // aliases
    "\\Bbb", "\\bold", "\\frak"],
    data: {
        numArgs: 1,
        handler: function handler(func, body) {
            if (func in fontAliases) {
                func = fontAliases[func];
            }
            return {
                type: "font",
                font: func.slice(1),
                body: body
            };
        }
    }
},

// Accents
{
    funcs: ["\\acute", "\\grave", "\\ddot", "\\tilde", "\\bar", "\\breve", "\\check", "\\hat", "\\vec", "\\dot"
    // We don't support expanding accents yet
    // "\\widetilde", "\\widehat"
    ],
    data: {
        numArgs: 1,
        handler: function handler(func, base) {
            return {
                type: "accent",
                accent: func,
                base: base
            };
        }
    }
},

// Infix generalized fractions
{
    funcs: ["\\over", "\\choose"],
    data: {
        numArgs: 0,
        handler: function handler(func) {
            var replaceWith;
            switch (func) {
                case "\\over":
                    replaceWith = "\\frac";
                    break;
                case "\\choose":
                    replaceWith = "\\binom";
                    break;
                default:
                    throw new Error("Unrecognized infix genfrac command");
            }
            return {
                type: "infix",
                replaceWith: replaceWith
            };
        }
    }
},

// Row breaks for aligned data
{
    funcs: ["\\\\", "\\cr"],
    data: {
        numArgs: 0,
        numOptionalArgs: 1,
        argTypes: ["size"],
        handler: function handler(func, size) {
            return {
                type: "cr",
                size: size
            };
        }
    }
},

// Environment delimiters
{
    funcs: ["\\begin", "\\end"],
    data: {
        numArgs: 1,
        argTypes: ["text"],
        handler: function handler(func, nameGroup, positions) {
            if (nameGroup.type !== "ordgroup") {
                throw new ParseError("Invalid environment name", this.lexer, positions[1]);
            }
            var name = "";
            for (var i = 0; i < nameGroup.value.length; ++i) {
                name += nameGroup.value[i].value;
            }
            return {
                type: "environment",
                name: name,
                namepos: positions[1]
            };
        }
    }
}];

var addFuncsWithData = function addFuncsWithData(funcs, data) {
    for (var i = 0; i < funcs.length; i++) {
        functions[funcs[i]] = data;
    }
};

// Add all of the functions in duplicatedFunctions to the functions map
for (var i = 0; i < duplicatedFunctions.length; i++) {
    addFuncsWithData(duplicatedFunctions[i].funcs, duplicatedFunctions[i].data);
}

// Set default values of functions
for (var f in functions) {
    if (functions.hasOwnProperty(f)) {
        var func = functions[f];

        functions[f] = {
            numArgs: func.numArgs,
            argTypes: func.argTypes,
            greediness: func.greediness === undefined ? 1 : func.greediness,
            allowedInText: func.allowedInText ? func.allowedInText : false,
            numOptionalArgs: func.numOptionalArgs === undefined ? 0 : func.numOptionalArgs,
            handler: func.handler
        };
    }
}

module.exports = {
    funcs: functions
};

},{"./ParseError":87,"./utils":105}],101:[function(require,module,exports){
/**
 * These objects store data about MathML nodes. This is the MathML equivalent
 * of the types in domTree.js. Since MathML handles its own rendering, and
 * since we're mainly using MathML to improve accessibility, we don't manage
 * any of the styling state that the plain DOM nodes do.
 *
 * The `toNode` and `toMarkup` functions work simlarly to how they do in
 * domTree.js, creating namespaced DOM nodes and HTML text markup respectively.
 */

"use strict";

var utils = require("./utils");

/**
 * This node represents a general purpose MathML node of any type. The
 * constructor requires the type of node to create (for example, `"mo"` or
 * `"mspace"`, corresponding to `<mo>` and `<mspace>` tags).
 */
function MathNode(type, children) {
    this.type = type;
    this.attributes = {};
    this.children = children || [];
}

/**
 * Sets an attribute on a MathML node. MathML depends on attributes to convey a
 * semantic content, so this is used heavily.
 */
MathNode.prototype.setAttribute = function (name, value) {
    this.attributes[name] = value;
};

/**
 * Converts the math node into a MathML-namespaced DOM element.
 */
MathNode.prototype.toNode = function () {
    var node = document.createElementNS("http://www.w3.org/1998/Math/MathML", this.type);

    for (var attr in this.attributes) {
        if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
            node.setAttribute(attr, this.attributes[attr]);
        }
    }

    for (var i = 0; i < this.children.length; i++) {
        node.appendChild(this.children[i].toNode());
    }

    return node;
};

/**
 * Converts the math node into an HTML markup string.
 */
MathNode.prototype.toMarkup = function () {
    var markup = "<" + this.type;

    // Add the attributes
    for (var attr in this.attributes) {
        if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
            markup += " " + attr + "=\"";
            markup += utils.escape(this.attributes[attr]);
            markup += "\"";
        }
    }

    markup += ">";

    for (var i = 0; i < this.children.length; i++) {
        markup += this.children[i].toMarkup();
    }

    markup += "</" + this.type + ">";

    return markup;
};

/**
 * This node represents a piece of text.
 */
function TextNode(text) {
    this.text = text;
}

/**
 * Converts the text node into a DOM text node.
 */
TextNode.prototype.toNode = function () {
    return document.createTextNode(this.text);
};

/**
 * Converts the text node into HTML markup (which is just the text itself).
 */
TextNode.prototype.toMarkup = function () {
    return utils.escape(this.text);
};

module.exports = {
    MathNode: MathNode,
    TextNode: TextNode
};

},{"./utils":105}],102:[function(require,module,exports){
/**
 * The resulting parse tree nodes of the parse tree.
 */
"use strict";

function ParseNode(type, value, mode) {
    this.type = type;
    this.value = value;
    this.mode = mode;
}

/**
 * A result and final position returned by the `.parse...` functions.
 * 
 */
function ParseResult(result, newPosition, peek) {
    this.result = result;
    this.position = newPosition;
}

module.exports = {
    ParseNode: ParseNode,
    ParseResult: ParseResult
};

},{}],103:[function(require,module,exports){
/**
 * Provides a single function for parsing an expression using a Parser
 * TODO(emily): Remove this
 */

"use strict";

var Parser = require("./Parser");

/**
 * Parses an expression using a Parser, then returns the parsed result.
 */
var parseTree = function parseTree(toParse, settings) {
  var parser = new Parser(toParse, settings);

  return parser.parse();
};

module.exports = parseTree;

},{"./Parser":88}],104:[function(require,module,exports){
/**
 * This file holds a list of all no-argument functions and single-character
 * symbols (like 'a' or ';').
 *
 * For each of the symbols, there are three properties they can have:
 * - font (required): the font to be used for this symbol. Either "main" (the
     normal font), or "ams" (the ams fonts).
 * - group (required): the ParseNode group type the symbol should have (i.e.
     "textord", "mathord", etc).
     See https://github.com/Khan/KaTeX/wiki/Examining-TeX#group-types
 * - replace (optional): the character that this symbol or function should be
 *   replaced with (i.e. "\phi" has a replace value of "\u03d5", the phi
 *   character in the main font).
 *
 * The outermost map in the table indicates what mode the symbols should be
 * accepted in (e.g. "math" or "text").
 */

"use strict";

var symbols = {
    math: {
        // Relation Symbols
        "\\equiv": {
            font: "main",
            group: "rel",
            replace: "≡"
        },
        "\\prec": {
            font: "main",
            group: "rel",
            replace: "≺"
        },
        "\\succ": {
            font: "main",
            group: "rel",
            replace: "≻"
        },
        "\\sim": {
            font: "main",
            group: "rel",
            replace: "∼"
        },
        "\\perp": {
            font: "main",
            group: "rel",
            replace: "⊥"
        },
        "\\preceq": {
            font: "main",
            group: "rel",
            replace: "⪯"
        },
        "\\succeq": {
            font: "main",
            group: "rel",
            replace: "⪰"
        },
        "\\simeq": {
            font: "main",
            group: "rel",
            replace: "≃"
        },
        "\\mid": {
            font: "main",
            group: "rel",
            replace: "∣"
        },
        "\\ll": {
            font: "main",
            group: "rel",
            replace: "≪"
        },
        "\\gg": {
            font: "main",
            group: "rel",
            replace: "≫"
        },
        "\\asymp": {
            font: "main",
            group: "rel",
            replace: "≍"
        },
        "\\parallel": {
            font: "main",
            group: "rel",
            replace: "∥"
        },
        "\\bowtie": {
            font: "main",
            group: "rel",
            replace: "⋈"
        },
        "\\smile": {
            font: "main",
            group: "rel",
            replace: "⌣"
        },
        "\\sqsubseteq": {
            font: "main",
            group: "rel",
            replace: "⊑"
        },
        "\\sqsupseteq": {
            font: "main",
            group: "rel",
            replace: "⊒"
        },
        "\\doteq": {
            font: "main",
            group: "rel",
            replace: "≐"
        },
        "\\frown": {
            font: "main",
            group: "rel",
            replace: "⌢"
        },
        "\\ni": {
            font: "main",
            group: "rel",
            replace: "∋"
        },
        "\\propto": {
            font: "main",
            group: "rel",
            replace: "∝"
        },
        "\\vdash": {
            font: "main",
            group: "rel",
            replace: "⊢"
        },
        "\\dashv": {
            font: "main",
            group: "rel",
            replace: "⊣"
        },
        "\\owns": {
            font: "main",
            group: "rel",
            replace: "∋"
        },

        // Punctuation
        "\\ldotp": {
            font: "main",
            group: "punct",
            replace: "."
        },
        "\\cdotp": {
            font: "main",
            group: "punct",
            replace: "⋅"
        },

        // Misc Symbols
        "\\#": {
            font: "main",
            group: "textord",
            replace: "#"
        },
        "\\&": {
            font: "main",
            group: "textord",
            replace: "&"
        },
        "\\aleph": {
            font: "main",
            group: "textord",
            replace: "ℵ"
        },
        "\\forall": {
            font: "main",
            group: "textord",
            replace: "∀"
        },
        "\\hbar": {
            font: "main",
            group: "textord",
            replace: "ℏ"
        },
        "\\exists": {
            font: "main",
            group: "textord",
            replace: "∃"
        },
        "\\nabla": {
            font: "main",
            group: "textord",
            replace: "∇"
        },
        "\\flat": {
            font: "main",
            group: "textord",
            replace: "♭"
        },
        "\\ell": {
            font: "main",
            group: "textord",
            replace: "ℓ"
        },
        "\\natural": {
            font: "main",
            group: "textord",
            replace: "♮"
        },
        "\\clubsuit": {
            font: "main",
            group: "textord",
            replace: "♣"
        },
        "\\wp": {
            font: "main",
            group: "textord",
            replace: "℘"
        },
        "\\sharp": {
            font: "main",
            group: "textord",
            replace: "♯"
        },
        "\\diamondsuit": {
            font: "main",
            group: "textord",
            replace: "♢"
        },
        "\\Re": {
            font: "main",
            group: "textord",
            replace: "ℜ"
        },
        "\\heartsuit": {
            font: "main",
            group: "textord",
            replace: "♡"
        },
        "\\Im": {
            font: "main",
            group: "textord",
            replace: "ℑ"
        },
        "\\spadesuit": {
            font: "main",
            group: "textord",
            replace: "♠"
        },

        // Math and Text
        "\\dag": {
            font: "main",
            group: "textord",
            replace: "†"
        },
        "\\ddag": {
            font: "main",
            group: "textord",
            replace: "‡"
        },

        // Large Delimiters
        "\\rmoustache": {
            font: "main",
            group: "close",
            replace: "⎱"
        },
        "\\lmoustache": {
            font: "main",
            group: "open",
            replace: "⎰"
        },
        "\\rgroup": {
            font: "main",
            group: "close",
            replace: "⟯"
        },
        "\\lgroup": {
            font: "main",
            group: "open",
            replace: "⟮"
        },

        // Binary Operators
        "\\mp": {
            font: "main",
            group: "bin",
            replace: "∓"
        },
        "\\ominus": {
            font: "main",
            group: "bin",
            replace: "⊖"
        },
        "\\uplus": {
            font: "main",
            group: "bin",
            replace: "⊎"
        },
        "\\sqcap": {
            font: "main",
            group: "bin",
            replace: "⊓"
        },
        "\\ast": {
            font: "main",
            group: "bin",
            replace: "∗"
        },
        "\\sqcup": {
            font: "main",
            group: "bin",
            replace: "⊔"
        },
        "\\bigcirc": {
            font: "main",
            group: "bin",
            replace: "◯"
        },
        "\\bullet": {
            font: "main",
            group: "bin",
            replace: "∙"
        },
        "\\ddagger": {
            font: "main",
            group: "bin",
            replace: "‡"
        },
        "\\wr": {
            font: "main",
            group: "bin",
            replace: "≀"
        },
        "\\amalg": {
            font: "main",
            group: "bin",
            replace: "⨿"
        },

        // Arrow Symbols
        "\\longleftarrow": {
            font: "main",
            group: "rel",
            replace: "⟵"
        },
        "\\Leftarrow": {
            font: "main",
            group: "rel",
            replace: "⇐"
        },
        "\\Longleftarrow": {
            font: "main",
            group: "rel",
            replace: "⟸"
        },
        "\\longrightarrow": {
            font: "main",
            group: "rel",
            replace: "⟶"
        },
        "\\Rightarrow": {
            font: "main",
            group: "rel",
            replace: "⇒"
        },
        "\\Longrightarrow": {
            font: "main",
            group: "rel",
            replace: "⟹"
        },
        "\\leftrightarrow": {
            font: "main",
            group: "rel",
            replace: "↔"
        },
        "\\longleftrightarrow": {
            font: "main",
            group: "rel",
            replace: "⟷"
        },
        "\\Leftrightarrow": {
            font: "main",
            group: "rel",
            replace: "⇔"
        },
        "\\Longleftrightarrow": {
            font: "main",
            group: "rel",
            replace: "⟺"
        },
        "\\mapsto": {
            font: "main",
            group: "rel",
            replace: "↦"
        },
        "\\longmapsto": {
            font: "main",
            group: "rel",
            replace: "⟼"
        },
        "\\nearrow": {
            font: "main",
            group: "rel",
            replace: "↗"
        },
        "\\hookleftarrow": {
            font: "main",
            group: "rel",
            replace: "↩"
        },
        "\\hookrightarrow": {
            font: "main",
            group: "rel",
            replace: "↪"
        },
        "\\searrow": {
            font: "main",
            group: "rel",
            replace: "↘"
        },
        "\\leftharpoonup": {
            font: "main",
            group: "rel",
            replace: "↼"
        },
        "\\rightharpoonup": {
            font: "main",
            group: "rel",
            replace: "⇀"
        },
        "\\swarrow": {
            font: "main",
            group: "rel",
            replace: "↙"
        },
        "\\leftharpoondown": {
            font: "main",
            group: "rel",
            replace: "↽"
        },
        "\\rightharpoondown": {
            font: "main",
            group: "rel",
            replace: "⇁"
        },
        "\\nwarrow": {
            font: "main",
            group: "rel",
            replace: "↖"
        },
        "\\rightleftharpoons": {
            font: "main",
            group: "rel",
            replace: "⇌"
        },

        // AMS Negated Binary Relations
        "\\nless": {
            font: "ams",
            group: "rel",
            replace: "≮"
        },
        "\\nleqslant": {
            font: "ams",
            group: "rel",
            replace: ""
        },
        "\\nleqq": {
            font: "ams",
            group: "rel",
            replace: ""
        },
        "\\lneq": {
            font: "ams",
            group: "rel",
            replace: "⪇"
        },
        "\\lneqq": {
            font: "ams",
            group: "rel",
            replace: "≨"
        },
        "\\lvertneqq": {
            font: "ams",
            group: "rel",
            replace: ""
        },
        "\\lnsim": {
            font: "ams",
            group: "rel",
            replace: "⋦"
        },
        "\\lnapprox": {
            font: "ams",
            group: "rel",
            replace: "⪉"
        },
        "\\nprec": {
            font: "ams",
            group: "rel",
            replace: "⊀"
        },
        "\\npreceq": {
            font: "ams",
            group: "rel",
            replace: "⋠"
        },
        "\\precnsim": {
            font: "ams",
            group: "rel",
            replace: "⋨"
        },
        "\\precnapprox": {
            font: "ams",
            group: "rel",
            replace: "⪹"
        },
        "\\nsim": {
            font: "ams",
            group: "rel",
            replace: "≁"
        },
        "\\nshortmid": {
            font: "ams",
            group: "rel",
            replace: ""
        },
        "\\nmid": {
            font: "ams",
            group: "rel",
            replace: "∤"
        },
        "\\nvdash": {
            font: "ams",
            group: "rel",
            replace: "⊬"
        },
        "\\nvDash": {
            font: "ams",
            group: "rel",
            replace: "⊭"
        },
        "\\ntriangleleft": {
            font: "ams",
            group: "rel",
            replace: "⋪"
        },
        "\\ntrianglelefteq": {
            font: "ams",
            group: "rel",
            replace: "⋬"
        },
        "\\subsetneq": {
            font: "ams",
            group: "rel",
            replace: "⊊"
        },
        "\\varsubsetneq": {
            font: "ams",
            group: "rel",
            replace: ""
        },
        "\\subsetneqq": {
            font: "ams",
            group: "rel",
            replace: "⫋"
        },
        "\\varsubsetneqq": {
            font: "ams",
            group: "rel",
            replace: ""
        },
        "\\ngtr": {
            font: "ams",
            group: "rel",
            replace: "≯"
        },
        "\\ngeqslant": {
            font: "ams",
            group: "rel",
            replace: ""
        },
        "\\ngeqq": {
            font: "ams",
            group: "rel",
            replace: ""
        },
        "\\gneq": {
            font: "ams",
            group: "rel",
            replace: "⪈"
        },
        "\\gneqq": {
            font: "ams",
            group: "rel",
            replace: "≩"
        },
        "\\gvertneqq": {
            font: "ams",
            group: "rel",
            replace: ""
        },
        "\\gnsim": {
            font: "ams",
            group: "rel",
            replace: "⋧"
        },
        "\\gnapprox": {
            font: "ams",
            group: "rel",
            replace: "⪊"
        },
        "\\nsucc": {
            font: "ams",
            group: "rel",
            replace: "⊁"
        },
        "\\nsucceq": {
            font: "ams",
            group: "rel",
            replace: "⋡"
        },
        "\\succnsim": {
            font: "ams",
            group: "rel",
            replace: "⋩"
        },
        "\\succnapprox": {
            font: "ams",
            group: "rel",
            replace: "⪺"
        },
        "\\ncong": {
            font: "ams",
            group: "rel",
            replace: "≆"
        },
        "\\nshortparallel": {
            font: "ams",
            group: "rel",
            replace: ""
        },
        "\\nparallel": {
            font: "ams",
            group: "rel",
            replace: "∦"
        },
        "\\nVDash": {
            font: "ams",
            group: "rel",
            replace: "⊯"
        },
        "\\ntriangleright": {
            font: "ams",
            group: "rel",
            replace: "⋫"
        },
        "\\ntrianglerighteq": {
            font: "ams",
            group: "rel",
            replace: "⋭"
        },
        "\\nsupseteqq": {
            font: "ams",
            group: "rel",
            replace: ""
        },
        "\\supsetneq": {
            font: "ams",
            group: "rel",
            replace: "⊋"
        },
        "\\varsupsetneq": {
            font: "ams",
            group: "rel",
            replace: ""
        },
        "\\supsetneqq": {
            font: "ams",
            group: "rel",
            replace: "⫌"
        },
        "\\varsupsetneqq": {
            font: "ams",
            group: "rel",
            replace: ""
        },
        "\\nVdash": {
            font: "ams",
            group: "rel",
            replace: "⊮"
        },
        "\\precneqq": {
            font: "ams",
            group: "rel",
            replace: "⪵"
        },
        "\\succneqq": {
            font: "ams",
            group: "rel",
            replace: "⪶"
        },
        "\\nsubseteqq": {
            font: "ams",
            group: "rel",
            replace: ""
        },
        "\\unlhd": {
            font: "ams",
            group: "bin",
            replace: "⊴"
        },
        "\\unrhd": {
            font: "ams",
            group: "bin",
            replace: "⊵"
        },

        // AMS Negated Arrows
        "\\nleftarrow": {
            font: "ams",
            group: "rel",
            replace: "↚"
        },
        "\\nrightarrow": {
            font: "ams",
            group: "rel",
            replace: "↛"
        },
        "\\nLeftarrow": {
            font: "ams",
            group: "rel",
            replace: "⇍"
        },
        "\\nRightarrow": {
            font: "ams",
            group: "rel",
            replace: "⇏"
        },
        "\\nleftrightarrow": {
            font: "ams",
            group: "rel",
            replace: "↮"
        },
        "\\nLeftrightarrow": {
            font: "ams",
            group: "rel",
            replace: "⇎"
        },

        // AMS Misc
        "\\vartriangle": {
            font: "ams",
            group: "rel",
            replace: "△"
        },
        "\\hslash": {
            font: "ams",
            group: "textord",
            replace: "ℏ"
        },
        "\\triangledown": {
            font: "ams",
            group: "textord",
            replace: "▽"
        },
        "\\lozenge": {
            font: "ams",
            group: "textord",
            replace: "◊"
        },
        "\\circledS": {
            font: "ams",
            group: "textord",
            replace: "Ⓢ"
        },
        "\\circledR": {
            font: "ams",
            group: "textord",
            replace: "®"
        },
        "\\measuredangle": {
            font: "ams",
            group: "textord",
            replace: "∡"
        },
        "\\nexists": {
            font: "ams",
            group: "textord",
            replace: "∄"
        },
        "\\mho": {
            font: "ams",
            group: "textord",
            replace: "℧"
        },
        "\\Finv": {
            font: "ams",
            group: "textord",
            replace: "Ⅎ"
        },
        "\\Game": {
            font: "ams",
            group: "textord",
            replace: "⅁"
        },
        "\\Bbbk": {
            font: "ams",
            group: "textord",
            replace: "k"
        },
        "\\backprime": {
            font: "ams",
            group: "textord",
            replace: "‵"
        },
        "\\blacktriangle": {
            font: "ams",
            group: "textord",
            replace: "▲"
        },
        "\\blacktriangledown": {
            font: "ams",
            group: "textord",
            replace: "▼"
        },
        "\\blacksquare": {
            font: "ams",
            group: "textord",
            replace: "■"
        },
        "\\blacklozenge": {
            font: "ams",
            group: "textord",
            replace: "⧫"
        },
        "\\bigstar": {
            font: "ams",
            group: "textord",
            replace: "★"
        },
        "\\sphericalangle": {
            font: "ams",
            group: "textord",
            replace: "∢"
        },
        "\\complement": {
            font: "ams",
            group: "textord",
            replace: "∁"
        },
        "\\eth": {
            font: "ams",
            group: "textord",
            replace: "ð"
        },
        "\\diagup": {
            font: "ams",
            group: "textord",
            replace: "╱"
        },
        "\\diagdown": {
            font: "ams",
            group: "textord",
            replace: "╲"
        },
        "\\square": {
            font: "ams",
            group: "textord",
            replace: "□"
        },
        "\\Box": {
            font: "ams",
            group: "textord",
            replace: "□"
        },
        "\\Diamond": {
            font: "ams",
            group: "textord",
            replace: "◊"
        },
        "\\yen": {
            font: "ams",
            group: "textord",
            replace: "¥"
        },
        "\\checkmark": {
            font: "ams",
            group: "textord",
            replace: "✓"
        },

        // AMS Hebrew
        "\\beth": {
            font: "ams",
            group: "textord",
            replace: "ℶ"
        },
        "\\daleth": {
            font: "ams",
            group: "textord",
            replace: "ℸ"
        },
        "\\gimel": {
            font: "ams",
            group: "textord",
            replace: "ℷ"
        },

        // AMS Greek
        "\\digamma": {
            font: "ams",
            group: "textord",
            replace: "ϝ"
        },
        "\\varkappa": {
            font: "ams",
            group: "textord",
            replace: "ϰ"
        },

        // AMS Delimiters
        "\\ulcorner": {
            font: "ams",
            group: "open",
            replace: "┌"
        },
        "\\urcorner": {
            font: "ams",
            group: "close",
            replace: "┐"
        },
        "\\llcorner": {
            font: "ams",
            group: "open",
            replace: "└"
        },
        "\\lrcorner": {
            font: "ams",
            group: "close",
            replace: "┘"
        },

        // AMS Binary Relations
        "\\leqq": {
            font: "ams",
            group: "rel",
            replace: "≦"
        },
        "\\leqslant": {
            font: "ams",
            group: "rel",
            replace: "⩽"
        },
        "\\eqslantless": {
            font: "ams",
            group: "rel",
            replace: "⪕"
        },
        "\\lesssim": {
            font: "ams",
            group: "rel",
            replace: "≲"
        },
        "\\lessapprox": {
            font: "ams",
            group: "rel",
            replace: "⪅"
        },
        "\\approxeq": {
            font: "ams",
            group: "rel",
            replace: "≊"
        },
        "\\lessdot": {
            font: "ams",
            group: "bin",
            replace: "⋖"
        },
        "\\lll": {
            font: "ams",
            group: "rel",
            replace: "⋘"
        },
        "\\lessgtr": {
            font: "ams",
            group: "rel",
            replace: "≶"
        },
        "\\lesseqgtr": {
            font: "ams",
            group: "rel",
            replace: "⋚"
        },
        "\\lesseqqgtr": {
            font: "ams",
            group: "rel",
            replace: "⪋"
        },
        "\\doteqdot": {
            font: "ams",
            group: "rel",
            replace: "≑"
        },
        "\\risingdotseq": {
            font: "ams",
            group: "rel",
            replace: "≓"
        },
        "\\fallingdotseq": {
            font: "ams",
            group: "rel",
            replace: "≒"
        },
        "\\backsim": {
            font: "ams",
            group: "rel",
            replace: "∽"
        },
        "\\backsimeq": {
            font: "ams",
            group: "rel",
            replace: "⋍"
        },
        "\\subseteqq": {
            font: "ams",
            group: "rel",
            replace: "⫅"
        },
        "\\Subset": {
            font: "ams",
            group: "rel",
            replace: "⋐"
        },
        "\\sqsubset": {
            font: "ams",
            group: "rel",
            replace: "⊏"
        },
        "\\preccurlyeq": {
            font: "ams",
            group: "rel",
            replace: "≼"
        },
        "\\curlyeqprec": {
            font: "ams",
            group: "rel",
            replace: "⋞"
        },
        "\\precsim": {
            font: "ams",
            group: "rel",
            replace: "≾"
        },
        "\\precapprox": {
            font: "ams",
            group: "rel",
            replace: "⪷"
        },
        "\\vartriangleleft": {
            font: "ams",
            group: "rel",
            replace: "⊲"
        },
        "\\trianglelefteq": {
            font: "ams",
            group: "rel",
            replace: "⊴"
        },
        "\\vDash": {
            font: "ams",
            group: "rel",
            replace: "⊨"
        },
        "\\Vvdash": {
            font: "ams",
            group: "rel",
            replace: "⊪"
        },
        "\\smallsmile": {
            font: "ams",
            group: "rel",
            replace: "⌣"
        },
        "\\smallfrown": {
            font: "ams",
            group: "rel",
            replace: "⌢"
        },
        "\\bumpeq": {
            font: "ams",
            group: "rel",
            replace: "≏"
        },
        "\\Bumpeq": {
            font: "ams",
            group: "rel",
            replace: "≎"
        },
        "\\geqq": {
            font: "ams",
            group: "rel",
            replace: "≧"
        },
        "\\geqslant": {
            font: "ams",
            group: "rel",
            replace: "⩾"
        },
        "\\eqslantgtr": {
            font: "ams",
            group: "rel",
            replace: "⪖"
        },
        "\\gtrsim": {
            font: "ams",
            group: "rel",
            replace: "≳"
        },
        "\\gtrapprox": {
            font: "ams",
            group: "rel",
            replace: "⪆"
        },
        "\\gtrdot": {
            font: "ams",
            group: "bin",
            replace: "⋗"
        },
        "\\ggg": {
            font: "ams",
            group: "rel",
            replace: "⋙"
        },
        "\\gtrless": {
            font: "ams",
            group: "rel",
            replace: "≷"
        },
        "\\gtreqless": {
            font: "ams",
            group: "rel",
            replace: "⋛"
        },
        "\\gtreqqless": {
            font: "ams",
            group: "rel",
            replace: "⪌"
        },
        "\\eqcirc": {
            font: "ams",
            group: "rel",
            replace: "≖"
        },
        "\\circeq": {
            font: "ams",
            group: "rel",
            replace: "≗"
        },
        "\\triangleq": {
            font: "ams",
            group: "rel",
            replace: "≜"
        },
        "\\thicksim": {
            font: "ams",
            group: "rel",
            replace: "∼"
        },
        "\\thickapprox": {
            font: "ams",
            group: "rel",
            replace: "≈"
        },
        "\\supseteqq": {
            font: "ams",
            group: "rel",
            replace: "⫆"
        },
        "\\Supset": {
            font: "ams",
            group: "rel",
            replace: "⋑"
        },
        "\\sqsupset": {
            font: "ams",
            group: "rel",
            replace: "⊐"
        },
        "\\succcurlyeq": {
            font: "ams",
            group: "rel",
            replace: "≽"
        },
        "\\curlyeqsucc": {
            font: "ams",
            group: "rel",
            replace: "⋟"
        },
        "\\succsim": {
            font: "ams",
            group: "rel",
            replace: "≿"
        },
        "\\succapprox": {
            font: "ams",
            group: "rel",
            replace: "⪸"
        },
        "\\vartriangleright": {
            font: "ams",
            group: "rel",
            replace: "⊳"
        },
        "\\trianglerighteq": {
            font: "ams",
            group: "rel",
            replace: "⊵"
        },
        "\\Vdash": {
            font: "ams",
            group: "rel",
            replace: "⊩"
        },
        "\\shortmid": {
            font: "ams",
            group: "rel",
            replace: "∣"
        },
        "\\shortparallel": {
            font: "ams",
            group: "rel",
            replace: "∥"
        },
        "\\between": {
            font: "ams",
            group: "rel",
            replace: "≬"
        },
        "\\pitchfork": {
            font: "ams",
            group: "rel",
            replace: "⋔"
        },
        "\\varpropto": {
            font: "ams",
            group: "rel",
            replace: "∝"
        },
        "\\blacktriangleleft": {
            font: "ams",
            group: "rel",
            replace: "◀"
        },
        "\\therefore": {
            font: "ams",
            group: "rel",
            replace: "∴"
        },
        "\\backepsilon": {
            font: "ams",
            group: "rel",
            replace: "∍"
        },
        "\\blacktriangleright": {
            font: "ams",
            group: "rel",
            replace: "▶"
        },
        "\\because": {
            font: "ams",
            group: "rel",
            replace: "∵"
        },
        "\\llless": {
            font: "ams",
            group: "rel",
            replace: "⋘"
        },
        "\\gggtr": {
            font: "ams",
            group: "rel",
            replace: "⋙"
        },
        "\\lhd": {
            font: "ams",
            group: "bin",
            replace: "⊲"
        },
        "\\rhd": {
            font: "ams",
            group: "bin",
            replace: "⊳"
        },
        "\\eqsim": {
            font: "ams",
            group: "rel",
            replace: "≂"
        },
        "\\Join": {
            font: "main",
            group: "rel",
            replace: "⋈"
        },
        "\\Doteq": {
            font: "ams",
            group: "rel",
            replace: "≑"
        },

        // AMS Binary Operators
        "\\dotplus": {
            font: "ams",
            group: "bin",
            replace: "∔"
        },
        "\\smallsetminus": {
            font: "ams",
            group: "bin",
            replace: "∖"
        },
        "\\Cap": {
            font: "ams",
            group: "bin",
            replace: "⋒"
        },
        "\\Cup": {
            font: "ams",
            group: "bin",
            replace: "⋓"
        },
        "\\doublebarwedge": {
            font: "ams",
            group: "bin",
            replace: "⩞"
        },
        "\\boxminus": {
            font: "ams",
            group: "bin",
            replace: "⊟"
        },
        "\\boxplus": {
            font: "ams",
            group: "bin",
            replace: "⊞"
        },
        "\\divideontimes": {
            font: "ams",
            group: "bin",
            replace: "⋇"
        },
        "\\ltimes": {
            font: "ams",
            group: "bin",
            replace: "⋉"
        },
        "\\rtimes": {
            font: "ams",
            group: "bin",
            replace: "⋊"
        },
        "\\leftthreetimes": {
            font: "ams",
            group: "bin",
            replace: "⋋"
        },
        "\\rightthreetimes": {
            font: "ams",
            group: "bin",
            replace: "⋌"
        },
        "\\curlywedge": {
            font: "ams",
            group: "bin",
            replace: "⋏"
        },
        "\\curlyvee": {
            font: "ams",
            group: "bin",
            replace: "⋎"
        },
        "\\circleddash": {
            font: "ams",
            group: "bin",
            replace: "⊝"
        },
        "\\circledast": {
            font: "ams",
            group: "bin",
            replace: "⊛"
        },
        "\\centerdot": {
            font: "ams",
            group: "bin",
            replace: "⋅"
        },
        "\\intercal": {
            font: "ams",
            group: "bin",
            replace: "⊺"
        },
        "\\doublecap": {
            font: "ams",
            group: "bin",
            replace: "⋒"
        },
        "\\doublecup": {
            font: "ams",
            group: "bin",
            replace: "⋓"
        },
        "\\boxtimes": {
            font: "ams",
            group: "bin",
            replace: "⊠"
        },

        // AMS Arrows
        "\\dashrightarrow": {
            font: "ams",
            group: "rel",
            replace: "⇢"
        },
        "\\dashleftarrow": {
            font: "ams",
            group: "rel",
            replace: "⇠"
        },
        "\\leftleftarrows": {
            font: "ams",
            group: "rel",
            replace: "⇇"
        },
        "\\leftrightarrows": {
            font: "ams",
            group: "rel",
            replace: "⇆"
        },
        "\\Lleftarrow": {
            font: "ams",
            group: "rel",
            replace: "⇚"
        },
        "\\twoheadleftarrow": {
            font: "ams",
            group: "rel",
            replace: "↞"
        },
        "\\leftarrowtail": {
            font: "ams",
            group: "rel",
            replace: "↢"
        },
        "\\looparrowleft": {
            font: "ams",
            group: "rel",
            replace: "↫"
        },
        "\\leftrightharpoons": {
            font: "ams",
            group: "rel",
            replace: "⇋"
        },
        "\\curvearrowleft": {
            font: "ams",
            group: "rel",
            replace: "↶"
        },
        "\\circlearrowleft": {
            font: "ams",
            group: "rel",
            replace: "↺"
        },
        "\\Lsh": {
            font: "ams",
            group: "rel",
            replace: "↰"
        },
        "\\upuparrows": {
            font: "ams",
            group: "rel",
            replace: "⇈"
        },
        "\\upharpoonleft": {
            font: "ams",
            group: "rel",
            replace: "↿"
        },
        "\\downharpoonleft": {
            font: "ams",
            group: "rel",
            replace: "⇃"
        },
        "\\multimap": {
            font: "ams",
            group: "rel",
            replace: "⊸"
        },
        "\\leftrightsquigarrow": {
            font: "ams",
            group: "rel",
            replace: "↭"
        },
        "\\rightrightarrows": {
            font: "ams",
            group: "rel",
            replace: "⇉"
        },
        "\\rightleftarrows": {
            font: "ams",
            group: "rel",
            replace: "⇄"
        },
        "\\twoheadrightarrow": {
            font: "ams",
            group: "rel",
            replace: "↠"
        },
        "\\rightarrowtail": {
            font: "ams",
            group: "rel",
            replace: "↣"
        },
        "\\looparrowright": {
            font: "ams",
            group: "rel",
            replace: "↬"
        },
        "\\curvearrowright": {
            font: "ams",
            group: "rel",
            replace: "↷"
        },
        "\\circlearrowright": {
            font: "ams",
            group: "rel",
            replace: "↻"
        },
        "\\Rsh": {
            font: "ams",
            group: "rel",
            replace: "↱"
        },
        "\\downdownarrows": {
            font: "ams",
            group: "rel",
            replace: "⇊"
        },
        "\\upharpoonright": {
            font: "ams",
            group: "rel",
            replace: "↾"
        },
        "\\downharpoonright": {
            font: "ams",
            group: "rel",
            replace: "⇂"
        },
        "\\rightsquigarrow": {
            font: "ams",
            group: "rel",
            replace: "⇝"
        },
        "\\leadsto": {
            font: "ams",
            group: "rel",
            replace: "⇝"
        },
        "\\Rrightarrow": {
            font: "ams",
            group: "rel",
            replace: "⇛"
        },
        "\\restriction": {
            font: "ams",
            group: "rel",
            replace: "↾"
        },

        "`": {
            font: "main",
            group: "textord",
            replace: "‘"
        },
        "\\$": {
            font: "main",
            group: "textord",
            replace: "$"
        },
        "\\%": {
            font: "main",
            group: "textord",
            replace: "%"
        },
        "\\_": {
            font: "main",
            group: "textord",
            replace: "_"
        },
        "\\angle": {
            font: "main",
            group: "textord",
            replace: "∠"
        },
        "\\infty": {
            font: "main",
            group: "textord",
            replace: "∞"
        },
        "\\prime": {
            font: "main",
            group: "textord",
            replace: "′"
        },
        "\\triangle": {
            font: "main",
            group: "textord",
            replace: "△"
        },
        "\\Gamma": {
            font: "main",
            group: "textord",
            replace: "Γ"
        },
        "\\Delta": {
            font: "main",
            group: "textord",
            replace: "Δ"
        },
        "\\Theta": {
            font: "main",
            group: "textord",
            replace: "Θ"
        },
        "\\Lambda": {
            font: "main",
            group: "textord",
            replace: "Λ"
        },
        "\\Xi": {
            font: "main",
            group: "textord",
            replace: "Ξ"
        },
        "\\Pi": {
            font: "main",
            group: "textord",
            replace: "Π"
        },
        "\\Sigma": {
            font: "main",
            group: "textord",
            replace: "Σ"
        },
        "\\Upsilon": {
            font: "main",
            group: "textord",
            replace: "Υ"
        },
        "\\Phi": {
            font: "main",
            group: "textord",
            replace: "Φ"
        },
        "\\Psi": {
            font: "main",
            group: "textord",
            replace: "Ψ"
        },
        "\\Omega": {
            font: "main",
            group: "textord",
            replace: "Ω"
        },
        "\\neg": {
            font: "main",
            group: "textord",
            replace: "¬"
        },
        "\\lnot": {
            font: "main",
            group: "textord",
            replace: "¬"
        },
        "\\top": {
            font: "main",
            group: "textord",
            replace: "⊤"
        },
        "\\bot": {
            font: "main",
            group: "textord",
            replace: "⊥"
        },
        "\\emptyset": {
            font: "main",
            group: "textord",
            replace: "∅"
        },
        "\\varnothing": {
            font: "ams",
            group: "textord",
            replace: "∅"
        },
        "\\alpha": {
            font: "main",
            group: "mathord",
            replace: "α"
        },
        "\\beta": {
            font: "main",
            group: "mathord",
            replace: "β"
        },
        "\\gamma": {
            font: "main",
            group: "mathord",
            replace: "γ"
        },
        "\\delta": {
            font: "main",
            group: "mathord",
            replace: "δ"
        },
        "\\epsilon": {
            font: "main",
            group: "mathord",
            replace: "ϵ"
        },
        "\\zeta": {
            font: "main",
            group: "mathord",
            replace: "ζ"
        },
        "\\eta": {
            font: "main",
            group: "mathord",
            replace: "η"
        },
        "\\theta": {
            font: "main",
            group: "mathord",
            replace: "θ"
        },
        "\\iota": {
            font: "main",
            group: "mathord",
            replace: "ι"
        },
        "\\kappa": {
            font: "main",
            group: "mathord",
            replace: "κ"
        },
        "\\lambda": {
            font: "main",
            group: "mathord",
            replace: "λ"
        },
        "\\mu": {
            font: "main",
            group: "mathord",
            replace: "μ"
        },
        "\\nu": {
            font: "main",
            group: "mathord",
            replace: "ν"
        },
        "\\xi": {
            font: "main",
            group: "mathord",
            replace: "ξ"
        },
        "\\omicron": {
            font: "main",
            group: "mathord",
            replace: "o"
        },
        "\\pi": {
            font: "main",
            group: "mathord",
            replace: "π"
        },
        "\\rho": {
            font: "main",
            group: "mathord",
            replace: "ρ"
        },
        "\\sigma": {
            font: "main",
            group: "mathord",
            replace: "σ"
        },
        "\\tau": {
            font: "main",
            group: "mathord",
            replace: "τ"
        },
        "\\upsilon": {
            font: "main",
            group: "mathord",
            replace: "υ"
        },
        "\\phi": {
            font: "main",
            group: "mathord",
            replace: "ϕ"
        },
        "\\chi": {
            font: "main",
            group: "mathord",
            replace: "χ"
        },
        "\\psi": {
            font: "main",
            group: "mathord",
            replace: "ψ"
        },
        "\\omega": {
            font: "main",
            group: "mathord",
            replace: "ω"
        },
        "\\varepsilon": {
            font: "main",
            group: "mathord",
            replace: "ε"
        },
        "\\vartheta": {
            font: "main",
            group: "mathord",
            replace: "ϑ"
        },
        "\\varpi": {
            font: "main",
            group: "mathord",
            replace: "ϖ"
        },
        "\\varrho": {
            font: "main",
            group: "mathord",
            replace: "ϱ"
        },
        "\\varsigma": {
            font: "main",
            group: "mathord",
            replace: "ς"
        },
        "\\varphi": {
            font: "main",
            group: "mathord",
            replace: "φ"
        },
        "*": {
            font: "main",
            group: "bin",
            replace: "∗"
        },
        "+": {
            font: "main",
            group: "bin"
        },
        "-": {
            font: "main",
            group: "bin",
            replace: "−"
        },
        "\\cdot": {
            font: "main",
            group: "bin",
            replace: "⋅"
        },
        "\\circ": {
            font: "main",
            group: "bin",
            replace: "∘"
        },
        "\\div": {
            font: "main",
            group: "bin",
            replace: "÷"
        },
        "\\pm": {
            font: "main",
            group: "bin",
            replace: "±"
        },
        "\\times": {
            font: "main",
            group: "bin",
            replace: "×"
        },
        "\\cap": {
            font: "main",
            group: "bin",
            replace: "∩"
        },
        "\\cup": {
            font: "main",
            group: "bin",
            replace: "∪"
        },
        "\\setminus": {
            font: "main",
            group: "bin",
            replace: "∖"
        },
        "\\land": {
            font: "main",
            group: "bin",
            replace: "∧"
        },
        "\\lor": {
            font: "main",
            group: "bin",
            replace: "∨"
        },
        "\\wedge": {
            font: "main",
            group: "bin",
            replace: "∧"
        },
        "\\vee": {
            font: "main",
            group: "bin",
            replace: "∨"
        },
        "\\surd": {
            font: "main",
            group: "textord",
            replace: "√"
        },
        "(": {
            font: "main",
            group: "open"
        },
        "[": {
            font: "main",
            group: "open"
        },
        "\\langle": {
            font: "main",
            group: "open",
            replace: "⟨"
        },
        "\\lvert": {
            font: "main",
            group: "open",
            replace: "∣"
        },
        "\\lVert": {
            font: "main",
            group: "open",
            replace: "∥"
        },
        ")": {
            font: "main",
            group: "close"
        },
        "]": {
            font: "main",
            group: "close"
        },
        "?": {
            font: "main",
            group: "close"
        },
        "!": {
            font: "main",
            group: "close"
        },
        "\\rangle": {
            font: "main",
            group: "close",
            replace: "⟩"
        },
        "\\rvert": {
            font: "main",
            group: "close",
            replace: "∣"
        },
        "\\rVert": {
            font: "main",
            group: "close",
            replace: "∥"
        },
        "=": {
            font: "main",
            group: "rel"
        },
        "<": {
            font: "main",
            group: "rel"
        },
        ">": {
            font: "main",
            group: "rel"
        },
        ":": {
            font: "main",
            group: "rel"
        },
        "\\approx": {
            font: "main",
            group: "rel",
            replace: "≈"
        },
        "\\cong": {
            font: "main",
            group: "rel",
            replace: "≅"
        },
        "\\ge": {
            font: "main",
            group: "rel",
            replace: "≥"
        },
        "\\geq": {
            font: "main",
            group: "rel",
            replace: "≥"
        },
        "\\gets": {
            font: "main",
            group: "rel",
            replace: "←"
        },
        "\\in": {
            font: "main",
            group: "rel",
            replace: "∈"
        },
        "\\notin": {
            font: "main",
            group: "rel",
            replace: "∉"
        },
        "\\subset": {
            font: "main",
            group: "rel",
            replace: "⊂"
        },
        "\\supset": {
            font: "main",
            group: "rel",
            replace: "⊃"
        },
        "\\subseteq": {
            font: "main",
            group: "rel",
            replace: "⊆"
        },
        "\\supseteq": {
            font: "main",
            group: "rel",
            replace: "⊇"
        },
        "\\nsubseteq": {
            font: "ams",
            group: "rel",
            replace: "⊈"
        },
        "\\nsupseteq": {
            font: "ams",
            group: "rel",
            replace: "⊉"
        },
        "\\models": {
            font: "main",
            group: "rel",
            replace: "⊨"
        },
        "\\leftarrow": {
            font: "main",
            group: "rel",
            replace: "←"
        },
        "\\le": {
            font: "main",
            group: "rel",
            replace: "≤"
        },
        "\\leq": {
            font: "main",
            group: "rel",
            replace: "≤"
        },
        "\\ne": {
            font: "main",
            group: "rel",
            replace: "≠"
        },
        "\\neq": {
            font: "main",
            group: "rel",
            replace: "≠"
        },
        "\\rightarrow": {
            font: "main",
            group: "rel",
            replace: "→"
        },
        "\\to": {
            font: "main",
            group: "rel",
            replace: "→"
        },
        "\\ngeq": {
            font: "ams",
            group: "rel",
            replace: "≱"
        },
        "\\nleq": {
            font: "ams",
            group: "rel",
            replace: "≰"
        },
        "\\!": {
            font: "main",
            group: "spacing"
        },
        "\\ ": {
            font: "main",
            group: "spacing",
            replace: " "
        },
        "~": {
            font: "main",
            group: "spacing",
            replace: " "
        },
        "\\,": {
            font: "main",
            group: "spacing"
        },
        "\\:": {
            font: "main",
            group: "spacing"
        },
        "\\;": {
            font: "main",
            group: "spacing"
        },
        "\\enspace": {
            font: "main",
            group: "spacing"
        },
        "\\qquad": {
            font: "main",
            group: "spacing"
        },
        "\\quad": {
            font: "main",
            group: "spacing"
        },
        "\\space": {
            font: "main",
            group: "spacing",
            replace: " "
        },
        ",": {
            font: "main",
            group: "punct"
        },
        ";": {
            font: "main",
            group: "punct"
        },
        "\\colon": {
            font: "main",
            group: "punct",
            replace: ":"
        },
        "\\barwedge": {
            font: "ams",
            group: "bin",
            replace: "⊼"
        },
        "\\veebar": {
            font: "ams",
            group: "bin",
            replace: "⊻"
        },
        "\\odot": {
            font: "main",
            group: "bin",
            replace: "⊙"
        },
        "\\oplus": {
            font: "main",
            group: "bin",
            replace: "⊕"
        },
        "\\otimes": {
            font: "main",
            group: "bin",
            replace: "⊗"
        },
        "\\partial": {
            font: "main",
            group: "textord",
            replace: "∂"
        },
        "\\oslash": {
            font: "main",
            group: "bin",
            replace: "⊘"
        },
        "\\circledcirc": {
            font: "ams",
            group: "bin",
            replace: "⊚"
        },
        "\\boxdot": {
            font: "ams",
            group: "bin",
            replace: "⊡"
        },
        "\\bigtriangleup": {
            font: "main",
            group: "bin",
            replace: "△"
        },
        "\\bigtriangledown": {
            font: "main",
            group: "bin",
            replace: "▽"
        },
        "\\dagger": {
            font: "main",
            group: "bin",
            replace: "†"
        },
        "\\diamond": {
            font: "main",
            group: "bin",
            replace: "⋄"
        },
        "\\star": {
            font: "main",
            group: "bin",
            replace: "⋆"
        },
        "\\triangleleft": {
            font: "main",
            group: "bin",
            replace: "◃"
        },
        "\\triangleright": {
            font: "main",
            group: "bin",
            replace: "▹"
        },
        "\\{": {
            font: "main",
            group: "open",
            replace: "{"
        },
        "\\}": {
            font: "main",
            group: "close",
            replace: "}"
        },
        "\\lbrace": {
            font: "main",
            group: "open",
            replace: "{"
        },
        "\\rbrace": {
            font: "main",
            group: "close",
            replace: "}"
        },
        "\\lbrack": {
            font: "main",
            group: "open",
            replace: "["
        },
        "\\rbrack": {
            font: "main",
            group: "close",
            replace: "]"
        },
        "\\lfloor": {
            font: "main",
            group: "open",
            replace: "⌊"
        },
        "\\rfloor": {
            font: "main",
            group: "close",
            replace: "⌋"
        },
        "\\lceil": {
            font: "main",
            group: "open",
            replace: "⌈"
        },
        "\\rceil": {
            font: "main",
            group: "close",
            replace: "⌉"
        },
        "\\backslash": {
            font: "main",
            group: "textord",
            replace: "\\"
        },
        "|": {
            font: "main",
            group: "textord",
            replace: "∣"
        },
        "\\vert": {
            font: "main",
            group: "textord",
            replace: "∣"
        },
        "\\|": {
            font: "main",
            group: "textord",
            replace: "∥"
        },
        "\\Vert": {
            font: "main",
            group: "textord",
            replace: "∥"
        },
        "\\uparrow": {
            font: "main",
            group: "rel",
            replace: "↑"
        },
        "\\Uparrow": {
            font: "main",
            group: "rel",
            replace: "⇑"
        },
        "\\downarrow": {
            font: "main",
            group: "rel",
            replace: "↓"
        },
        "\\Downarrow": {
            font: "main",
            group: "rel",
            replace: "⇓"
        },
        "\\updownarrow": {
            font: "main",
            group: "rel",
            replace: "↕"
        },
        "\\Updownarrow": {
            font: "main",
            group: "rel",
            replace: "⇕"
        },
        "\\coprod": {
            font: "math",
            group: "op",
            replace: "∐"
        },
        "\\bigvee": {
            font: "math",
            group: "op",
            replace: "⋁"
        },
        "\\bigwedge": {
            font: "math",
            group: "op",
            replace: "⋀"
        },
        "\\biguplus": {
            font: "math",
            group: "op",
            replace: "⨄"
        },
        "\\bigcap": {
            font: "math",
            group: "op",
            replace: "⋂"
        },
        "\\bigcup": {
            font: "math",
            group: "op",
            replace: "⋃"
        },
        "\\int": {
            font: "math",
            group: "op",
            replace: "∫"
        },
        "\\intop": {
            font: "math",
            group: "op",
            replace: "∫"
        },
        "\\iint": {
            font: "math",
            group: "op",
            replace: "∬"
        },
        "\\iiint": {
            font: "math",
            group: "op",
            replace: "∭"
        },
        "\\prod": {
            font: "math",
            group: "op",
            replace: "∏"
        },
        "\\sum": {
            font: "math",
            group: "op",
            replace: "∑"
        },
        "\\bigotimes": {
            font: "math",
            group: "op",
            replace: "⨂"
        },
        "\\bigoplus": {
            font: "math",
            group: "op",
            replace: "⨁"
        },
        "\\bigodot": {
            font: "math",
            group: "op",
            replace: "⨀"
        },
        "\\oint": {
            font: "math",
            group: "op",
            replace: "∮"
        },
        "\\bigsqcup": {
            font: "math",
            group: "op",
            replace: "⨆"
        },
        "\\smallint": {
            font: "math",
            group: "op",
            replace: "∫"
        },
        "\\ldots": {
            font: "main",
            group: "inner",
            replace: "…"
        },
        "\\cdots": {
            font: "main",
            group: "inner",
            replace: "⋯"
        },
        "\\ddots": {
            font: "main",
            group: "inner",
            replace: "⋱"
        },
        "\\vdots": {
            font: "main",
            group: "textord",
            replace: "⋮"
        },
        "\\acute": {
            font: "main",
            group: "accent",
            replace: "´"
        },
        "\\grave": {
            font: "main",
            group: "accent",
            replace: "`"
        },
        "\\ddot": {
            font: "main",
            group: "accent",
            replace: "¨"
        },
        "\\tilde": {
            font: "main",
            group: "accent",
            replace: "~"
        },
        "\\bar": {
            font: "main",
            group: "accent",
            replace: "¯"
        },
        "\\breve": {
            font: "main",
            group: "accent",
            replace: "˘"
        },
        "\\check": {
            font: "main",
            group: "accent",
            replace: "ˇ"
        },
        "\\hat": {
            font: "main",
            group: "accent",
            replace: "^"
        },
        "\\vec": {
            font: "main",
            group: "accent",
            replace: "⃗"
        },
        "\\dot": {
            font: "main",
            group: "accent",
            replace: "˙"
        },

        "\\imath": {
            font: "main",
            group: "mathord",
            replace: "ı"
        },
        "\\jmath": {
            font: "main",
            group: "mathord",
            replace: "ȷ"
        }
    },
    text: {
        "\\ ": {
            font: "main",
            group: "spacing",
            replace: " "
        },
        " ": {
            font: "main",
            group: "spacing",
            replace: " "
        },
        "~": {
            font: "main",
            group: "spacing",
            replace: " "
        }
    }
};

// There are lots of symbols which are the same, so we add them in afterwards.

// All of these are textords in math mode
var mathTextSymbols = "0123456789/@.\"";
for (var i = 0; i < mathTextSymbols.length; i++) {
    var ch = mathTextSymbols.charAt(i);
    symbols.math[ch] = {
        font: "main",
        group: "textord"
    };
}

// All of these are textords in text mode
var textSymbols = "0123456789`!@*()-=+[]'\";:?/.,";
for (var i = 0; i < textSymbols.length; i++) {
    var ch = textSymbols.charAt(i);
    symbols.text[ch] = {
        font: "main",
        group: "textord"
    };
}

// All of these are textords in text mode, and mathords in math mode
var letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
for (var i = 0; i < letters.length; i++) {
    var ch = letters.charAt(i);
    symbols.math[ch] = {
        font: "main",
        group: "mathord"
    };
    symbols.text[ch] = {
        font: "main",
        group: "textord"
    };
}

module.exports = symbols;

},{}],105:[function(require,module,exports){
/**
 * This file contains a list of utility functions which are useful in other
 * files.
 */

/**
 * Provide an `indexOf` function which works in IE8, but defers to native if
 * possible.
 */
"use strict";

var nativeIndexOf = Array.prototype.indexOf;
var indexOf = function indexOf(list, elem) {
    if (list == null) {
        return -1;
    }
    if (nativeIndexOf && list.indexOf === nativeIndexOf) {
        return list.indexOf(elem);
    }
    var i = 0,
        l = list.length;
    for (; i < l; i++) {
        if (list[i] === elem) {
            return i;
        }
    }
    return -1;
};

/**
 * Return whether an element is contained in a list
 */
var contains = function contains(list, elem) {
    return indexOf(list, elem) !== -1;
};

/**
 * Provide a default value if a setting is undefined
 */
var deflt = function deflt(setting, defaultIfUndefined) {
    return setting === undefined ? defaultIfUndefined : setting;
};

// hyphenate and escape adapted from Facebook's React under Apache 2 license

var uppercase = /([A-Z])/g;
var hyphenate = function hyphenate(str) {
    return str.replace(uppercase, "-$1").toLowerCase();
};

var ESCAPE_LOOKUP = {
    "&": "&amp;",
    ">": "&gt;",
    "<": "&lt;",
    "\"": "&quot;",
    "'": "&#x27;"
};

var ESCAPE_REGEX = /[&><"']/g;

function escaper(match) {
    return ESCAPE_LOOKUP[match];
}

/**
 * Escapes text to prevent scripting attacks.
 *
 * @param {*} text Text value to escape.
 * @return {string} An escaped string.
 */
function escape(text) {
    return ("" + text).replace(ESCAPE_REGEX, escaper);
}

/**
 * A function to set the text content of a DOM element in all supported
 * browsers. Note that we don't define this if there is no document.
 */
var setTextContent;
if (typeof document !== "undefined") {
    var testNode = document.createElement("span");
    if ("textContent" in testNode) {
        setTextContent = function (node, text) {
            node.textContent = text;
        };
    } else {
        setTextContent = function (node, text) {
            node.innerText = text;
        };
    }
}

/**
 * A function to clear a node.
 */
function clearNode(node) {
    setTextContent(node, "");
}

module.exports = {
    contains: contains,
    deflt: deflt,
    escape: escape,
    hyphenate: hyphenate,
    indexOf: indexOf,
    setTextContent: setTextContent,
    clearNode: clearNode
};

},{}],106:[function(require,module,exports){
'use strict';


module.exports = require('./lib/');

},{"./lib/":116}],107:[function(require,module,exports){
// HTML5 entities map: { name -> utf16string }
//
'use strict';

/*eslint quotes:0*/
module.exports = require('entities/maps/entities.json');

},{"entities/maps/entities.json":159}],108:[function(require,module,exports){
// List of valid html blocks names, accorting to commonmark spec
// http://jgm.github.io/CommonMark/spec.html#html-blocks

'use strict';


module.exports = [
  'address',
  'article',
  'aside',
  'base',
  'basefont',
  'blockquote',
  'body',
  'caption',
  'center',
  'col',
  'colgroup',
  'dd',
  'details',
  'dialog',
  'dir',
  'div',
  'dl',
  'dt',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'frame',
  'frameset',
  'h1',
  'head',
  'header',
  'hr',
  'html',
  'iframe',
  'legend',
  'li',
  'link',
  'main',
  'menu',
  'menuitem',
  'meta',
  'nav',
  'noframes',
  'ol',
  'optgroup',
  'option',
  'p',
  'param',
  'pre',
  'section',
  'source',
  'title',
  'summary',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'title',
  'tr',
  'track',
  'ul'
];

},{}],109:[function(require,module,exports){
// Regexps to match html elements

'use strict';

var attr_name     = '[a-zA-Z_:][a-zA-Z0-9:._-]*';

var unquoted      = '[^"\'=<>`\\x00-\\x20]+';
var single_quoted = "'[^']*'";
var double_quoted = '"[^"]*"';

var attr_value  = '(?:' + unquoted + '|' + single_quoted + '|' + double_quoted + ')';

var attribute   = '(?:\\s+' + attr_name + '(?:\\s*=\\s*' + attr_value + ')?)';

var open_tag    = '<[A-Za-z][A-Za-z0-9\\-]*' + attribute + '*\\s*\\/?>';

var close_tag   = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>';
var comment     = '<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->';
var processing  = '<[?].*?[?]>';
var declaration = '<![A-Z]+\\s+[^>]*>';
var cdata       = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>';

var HTML_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + '|' + comment +
                        '|' + processing + '|' + declaration + '|' + cdata + ')');
var HTML_OPEN_CLOSE_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + ')');

module.exports.HTML_TAG_RE = HTML_TAG_RE;
module.exports.HTML_OPEN_CLOSE_TAG_RE = HTML_OPEN_CLOSE_TAG_RE;

},{}],110:[function(require,module,exports){
// List of valid url schemas, accorting to commonmark spec
// http://jgm.github.io/CommonMark/spec.html#autolinks

'use strict';


module.exports = [
  'coap',
  'doi',
  'javascript',
  'aaa',
  'aaas',
  'about',
  'acap',
  'cap',
  'cid',
  'crid',
  'data',
  'dav',
  'dict',
  'dns',
  'file',
  'ftp',
  'geo',
  'go',
  'gopher',
  'h323',
  'http',
  'https',
  'iax',
  'icap',
  'im',
  'imap',
  'info',
  'ipp',
  'iris',
  'iris.beep',
  'iris.xpc',
  'iris.xpcs',
  'iris.lwz',
  'ldap',
  'mailto',
  'mid',
  'msrp',
  'msrps',
  'mtqp',
  'mupdate',
  'news',
  'nfs',
  'ni',
  'nih',
  'nntp',
  'opaquelocktoken',
  'pop',
  'pres',
  'rtsp',
  'service',
  'session',
  'shttp',
  'sieve',
  'sip',
  'sips',
  'sms',
  'snmp',
  'soap.beep',
  'soap.beeps',
  'tag',
  'tel',
  'telnet',
  'tftp',
  'thismessage',
  'tn3270',
  'tip',
  'tv',
  'urn',
  'vemmi',
  'ws',
  'wss',
  'xcon',
  'xcon-userid',
  'xmlrpc.beep',
  'xmlrpc.beeps',
  'xmpp',
  'z39.50r',
  'z39.50s',
  'adiumxtra',
  'afp',
  'afs',
  'aim',
  'apt',
  'attachment',
  'aw',
  'beshare',
  'bitcoin',
  'bolo',
  'callto',
  'chrome',
  'chrome-extension',
  'com-eventbrite-attendee',
  'content',
  'cvs',
  'dlna-playsingle',
  'dlna-playcontainer',
  'dtn',
  'dvb',
  'ed2k',
  'facetime',
  'feed',
  'finger',
  'fish',
  'gg',
  'git',
  'gizmoproject',
  'gtalk',
  'hcp',
  'icon',
  'ipn',
  'irc',
  'irc6',
  'ircs',
  'itms',
  'jar',
  'jms',
  'keyparc',
  'lastfm',
  'ldaps',
  'magnet',
  'maps',
  'market',
  'message',
  'mms',
  'ms-help',
  'msnim',
  'mumble',
  'mvn',
  'notes',
  'oid',
  'palm',
  'paparazzi',
  'platform',
  'proxy',
  'psyc',
  'query',
  'res',
  'resource',
  'rmi',
  'rsync',
  'rtmp',
  'secondlife',
  'sftp',
  'sgn',
  'skype',
  'smb',
  'soldat',
  'spotify',
  'ssh',
  'steam',
  'svn',
  'teamspeak',
  'things',
  'udp',
  'unreal',
  'ut2004',
  'ventrilo',
  'view-source',
  'webcal',
  'wtai',
  'wyciwyg',
  'xfire',
  'xri',
  'ymsgr'
];

},{}],111:[function(require,module,exports){
// Utilities
//
'use strict';


function _class(obj) { return Object.prototype.toString.call(obj); }

function isString(obj) { return _class(obj) === '[object String]'; }

var _hasOwnProperty = Object.prototype.hasOwnProperty;

function has(object, key) {
  return _hasOwnProperty.call(object, key);
}

// Merge objects
//
function assign(obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);

  sources.forEach(function (source) {
    if (!source) { return; }

    if (typeof source !== 'object') {
      throw new TypeError(source + 'must be object');
    }

    Object.keys(source).forEach(function (key) {
      obj[key] = source[key];
    });
  });

  return obj;
}

// Remove element from array and put another array at those position.
// Useful for some operations with tokens
function arrayReplaceAt(src, pos, newElements) {
  return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
}

////////////////////////////////////////////////////////////////////////////////

function isValidEntityCode(c) {
  /*eslint no-bitwise:0*/
  // broken sequence
  if (c >= 0xD800 && c <= 0xDFFF) { return false; }
  // never used
  if (c >= 0xFDD0 && c <= 0xFDEF) { return false; }
  if ((c & 0xFFFF) === 0xFFFF || (c & 0xFFFF) === 0xFFFE) { return false; }
  // control codes
  if (c >= 0x00 && c <= 0x08) { return false; }
  if (c === 0x0B) { return false; }
  if (c >= 0x0E && c <= 0x1F) { return false; }
  if (c >= 0x7F && c <= 0x9F) { return false; }
  // out of range
  if (c > 0x10FFFF) { return false; }
  return true;
}

function fromCodePoint(c) {
  /*eslint no-bitwise:0*/
  if (c > 0xffff) {
    c -= 0x10000;
    var surrogate1 = 0xd800 + (c >> 10),
        surrogate2 = 0xdc00 + (c & 0x3ff);

    return String.fromCharCode(surrogate1, surrogate2);
  }
  return String.fromCharCode(c);
}


var UNESCAPE_MD_RE  = /\\([!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~])/g;
var ENTITY_RE       = /&([a-z#][a-z0-9]{1,31});/gi;
var UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + '|' + ENTITY_RE.source, 'gi');

var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))/i;

var entities = require('./entities');

function replaceEntityPattern(match, name) {
  var code = 0;

  if (has(entities, name)) {
    return entities[name];
  }

  if (name.charCodeAt(0) === 0x23/* # */ && DIGITAL_ENTITY_TEST_RE.test(name)) {
    code = name[1].toLowerCase() === 'x' ?
      parseInt(name.slice(2), 16)
    :
      parseInt(name.slice(1), 10);
    if (isValidEntityCode(code)) {
      return fromCodePoint(code);
    }
  }

  return match;
}

/*function replaceEntities(str) {
  if (str.indexOf('&') < 0) { return str; }

  return str.replace(ENTITY_RE, replaceEntityPattern);
}*/

function unescapeMd(str) {
  if (str.indexOf('\\') < 0) { return str; }
  return str.replace(UNESCAPE_MD_RE, '$1');
}

function unescapeAll(str) {
  if (str.indexOf('\\') < 0 && str.indexOf('&') < 0) { return str; }

  return str.replace(UNESCAPE_ALL_RE, function(match, escaped, entity) {
    if (escaped) { return escaped; }
    return replaceEntityPattern(match, entity);
  });
}

////////////////////////////////////////////////////////////////////////////////

var HTML_ESCAPE_TEST_RE = /[&<>"]/;
var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
var HTML_REPLACEMENTS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};

function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
}

function escapeHtml(str) {
  if (HTML_ESCAPE_TEST_RE.test(str)) {
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }
  return str;
}

////////////////////////////////////////////////////////////////////////////////

var REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;

function escapeRE (str) {
  return str.replace(REGEXP_ESCAPE_RE, '\\$&');
}

////////////////////////////////////////////////////////////////////////////////

function isSpace(code) {
  switch (code) {
    case 0x09:
    case 0x20:
      return true;
  }
  return false;
}

// Zs (unicode class) || [\t\f\v\r\n]
function isWhiteSpace(code) {
  if (code >= 0x2000 && code <= 0x200A) { return true; }
  switch (code) {
    case 0x09: // \t
    case 0x0A: // \n
    case 0x0B: // \v
    case 0x0C: // \f
    case 0x0D: // \r
    case 0x20:
    case 0xA0:
    case 0x1680:
    case 0x202F:
    case 0x205F:
    case 0x3000:
      return true;
  }
  return false;
}

////////////////////////////////////////////////////////////////////////////////

/*eslint-disable max-len*/
var UNICODE_PUNCT_RE = require('uc.micro/categories/P/regex');

// Currently without astral characters support.
function isPunctChar(ch) {
  return UNICODE_PUNCT_RE.test(ch);
}


// Markdown ASCII punctuation characters.
//
// !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~
// http://spec.commonmark.org/0.15/#ascii-punctuation-character
//
// Don't confuse with unicode punctuation !!! It lacks some chars in ascii range.
//
function isMdAsciiPunct(ch) {
  switch (ch) {
    case 0x21/* ! */:
    case 0x22/* " */:
    case 0x23/* # */:
    case 0x24/* $ */:
    case 0x25/* % */:
    case 0x26/* & */:
    case 0x27/* ' */:
    case 0x28/* ( */:
    case 0x29/* ) */:
    case 0x2A/* * */:
    case 0x2B/* + */:
    case 0x2C/* , */:
    case 0x2D/* - */:
    case 0x2E/* . */:
    case 0x2F/* / */:
    case 0x3A/* : */:
    case 0x3B/* ; */:
    case 0x3C/* < */:
    case 0x3D/* = */:
    case 0x3E/* > */:
    case 0x3F/* ? */:
    case 0x40/* @ */:
    case 0x5B/* [ */:
    case 0x5C/* \ */:
    case 0x5D/* ] */:
    case 0x5E/* ^ */:
    case 0x5F/* _ */:
    case 0x60/* ` */:
    case 0x7B/* { */:
    case 0x7C/* | */:
    case 0x7D/* } */:
    case 0x7E/* ~ */:
      return true;
    default:
      return false;
  }
}

// Hepler to unify [reference labels].
//
function normalizeReference(str) {
  // use .toUpperCase() instead of .toLowerCase()
  // here to avoid a conflict with Object.prototype
  // members (most notably, `__proto__`)
  return str.trim().replace(/\s+/g, ' ').toUpperCase();
}

////////////////////////////////////////////////////////////////////////////////

// Re-export libraries commonly used in both markdown-it and its plugins,
// so plugins won't have to depend on them explicitly, which reduces their
// bundled size (e.g. a browser build).
//
exports.lib                 = {};
exports.lib.mdurl           = require('mdurl');
exports.lib.ucmicro         = require('uc.micro');

exports.assign              = assign;
exports.isString            = isString;
exports.has                 = has;
exports.unescapeMd          = unescapeMd;
exports.unescapeAll         = unescapeAll;
exports.isValidEntityCode   = isValidEntityCode;
exports.fromCodePoint       = fromCodePoint;
// exports.replaceEntities     = replaceEntities;
exports.escapeHtml          = escapeHtml;
exports.arrayReplaceAt      = arrayReplaceAt;
exports.isSpace             = isSpace;
exports.isWhiteSpace        = isWhiteSpace;
exports.isMdAsciiPunct      = isMdAsciiPunct;
exports.isPunctChar         = isPunctChar;
exports.escapeRE            = escapeRE;
exports.normalizeReference  = normalizeReference;

},{"./entities":107,"mdurl":165,"uc.micro":171,"uc.micro/categories/P/regex":169}],112:[function(require,module,exports){
// Just a shortcut for bulk export
'use strict';


exports.parseLinkLabel       = require('./parse_link_label');
exports.parseLinkDestination = require('./parse_link_destination');
exports.parseLinkTitle       = require('./parse_link_title');

},{"./parse_link_destination":113,"./parse_link_label":114,"./parse_link_title":115}],113:[function(require,module,exports){
// Parse link destination
//
'use strict';


var unescapeAll   = require('../common/utils').unescapeAll;


module.exports = function parseLinkDestination(str, pos, max) {
  var code, level,
      lines = 0,
      start = pos,
      result = {
        ok: false,
        pos: 0,
        lines: 0,
        str: ''
      };

  if (str.charCodeAt(pos) === 0x3C /* < */) {
    pos++;
    while (pos < max) {
      code = str.charCodeAt(pos);
      if (code === 0x0A /* \n */) { return result; }
      if (code === 0x3E /* > */) {
        result.pos = pos + 1;
        result.str = unescapeAll(str.slice(start + 1, pos));
        result.ok = true;
        return result;
      }
      if (code === 0x5C /* \ */ && pos + 1 < max) {
        pos += 2;
        continue;
      }

      pos++;
    }

    // no closing '>'
    return result;
  }

  // this should be ... } else { ... branch

  level = 0;
  while (pos < max) {
    code = str.charCodeAt(pos);

    if (code === 0x20) { break; }

    // ascii control characters
    if (code < 0x20 || code === 0x7F) { break; }

    if (code === 0x5C /* \ */ && pos + 1 < max) {
      pos += 2;
      continue;
    }

    if (code === 0x28 /* ( */) {
      level++;
      if (level > 1) { break; }
    }

    if (code === 0x29 /* ) */) {
      level--;
      if (level < 0) { break; }
    }

    pos++;
  }

  if (start === pos) { return result; }

  result.str = unescapeAll(str.slice(start, pos));
  result.lines = lines;
  result.pos = pos;
  result.ok = true;
  return result;
};

},{"../common/utils":111}],114:[function(require,module,exports){
// Parse link label
//
// this function assumes that first character ("[") already matches;
// returns the end of the label
//
'use strict';

module.exports = function parseLinkLabel(state, start, disableNested) {
  var level, found, marker, prevPos,
      labelEnd = -1,
      max = state.posMax,
      oldPos = state.pos;

  state.pos = start + 1;
  level = 1;

  while (state.pos < max) {
    marker = state.src.charCodeAt(state.pos);
    if (marker === 0x5D /* ] */) {
      level--;
      if (level === 0) {
        found = true;
        break;
      }
    }

    prevPos = state.pos;
    state.md.inline.skipToken(state);
    if (marker === 0x5B /* [ */) {
      if (prevPos === state.pos - 1) {
        // increase level if we find text `[`, which is not a part of any token
        level++;
      } else if (disableNested) {
        state.pos = oldPos;
        return -1;
      }
    }
  }

  if (found) {
    labelEnd = state.pos;
  }

  // restore old state
  state.pos = oldPos;

  return labelEnd;
};

},{}],115:[function(require,module,exports){
// Parse link title
//
'use strict';


var unescapeAll = require('../common/utils').unescapeAll;


module.exports = function parseLinkTitle(str, pos, max) {
  var code,
      marker,
      lines = 0,
      start = pos,
      result = {
        ok: false,
        pos: 0,
        lines: 0,
        str: ''
      };

  if (pos >= max) { return result; }

  marker = str.charCodeAt(pos);

  if (marker !== 0x22 /* " */ && marker !== 0x27 /* ' */ && marker !== 0x28 /* ( */) { return result; }

  pos++;

  // if opening marker is "(", switch it to closing marker ")"
  if (marker === 0x28) { marker = 0x29; }

  while (pos < max) {
    code = str.charCodeAt(pos);
    if (code === marker) {
      result.pos = pos + 1;
      result.lines = lines;
      result.str = unescapeAll(str.slice(start + 1, pos));
      result.ok = true;
      return result;
    } else if (code === 0x0A) {
      lines++;
    } else if (code === 0x5C /* \ */ && pos + 1 < max) {
      pos++;
      if (str.charCodeAt(pos) === 0x0A) {
        lines++;
      }
    }

    pos++;
  }

  return result;
};

},{"../common/utils":111}],116:[function(require,module,exports){
// Main perser class

'use strict';


var utils        = require('./common/utils');
var helpers      = require('./helpers');
var Renderer     = require('./renderer');
var ParserCore   = require('./parser_core');
var ParserBlock  = require('./parser_block');
var ParserInline = require('./parser_inline');
var LinkifyIt    = require('linkify-it');
var mdurl        = require('mdurl');
var punycode     = require('punycode');


var config = {
  'default': require('./presets/default'),
  zero: require('./presets/zero'),
  commonmark: require('./presets/commonmark')
};

////////////////////////////////////////////////////////////////////////////////
//
// This validator can prohibit more than really needed to prevent XSS. It's a
// tradeoff to keep code simple and to be secure by default.
//
// If you need different setup - override validator method as you wish. Or
// replace it with dummy function and use external sanitizer.
//

var BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
var GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;

function validateLink(url) {
  // url should be normalized at this point, and existing entities are decoded
  var str = url.trim().toLowerCase();

  return BAD_PROTO_RE.test(str) ? (GOOD_DATA_RE.test(str) ? true : false) : true;
}

////////////////////////////////////////////////////////////////////////////////


var RECODE_HOSTNAME_FOR = [ 'http:', 'https:', 'mailto:' ];

function normalizeLink(url) {
  var parsed = mdurl.parse(url, true);

  if (parsed.hostname) {
    // Encode hostnames in urls like:
    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
    //
    // We don't encode unknown schemas, because it's likely that we encode
    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
    //
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = punycode.toASCII(parsed.hostname);
      } catch (er) { /**/ }
    }
  }

  return mdurl.encode(mdurl.format(parsed));
}

function normalizeLinkText(url) {
  var parsed = mdurl.parse(url, true);

  if (parsed.hostname) {
    // Encode hostnames in urls like:
    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
    //
    // We don't encode unknown schemas, because it's likely that we encode
    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
    //
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = punycode.toUnicode(parsed.hostname);
      } catch (er) { /**/ }
    }
  }

  return mdurl.decode(mdurl.format(parsed));
}


/**
 * class MarkdownIt
 *
 * Main parser/renderer class.
 *
 * ##### Usage
 *
 * ```javascript
 * // node.js, "classic" way:
 * var MarkdownIt = require('markdown-it'),
 *     md = new MarkdownIt();
 * var result = md.render('# markdown-it rulezz!');
 *
 * // node.js, the same, but with sugar:
 * var md = require('markdown-it')();
 * var result = md.render('# markdown-it rulezz!');
 *
 * // browser without AMD, added to "window" on script load
 * // Note, there are no dash.
 * var md = window.markdownit();
 * var result = md.render('# markdown-it rulezz!');
 * ```
 *
 * Single line rendering, without paragraph wrap:
 *
 * ```javascript
 * var md = require('markdown-it')();
 * var result = md.renderInline('__markdown-it__ rulezz!');
 * ```
 **/

/**
 * new MarkdownIt([presetName, options])
 * - presetName (String): optional, `commonmark` / `zero`
 * - options (Object)
 *
 * Creates parser instanse with given config. Can be called without `new`.
 *
 * ##### presetName
 *
 * MarkdownIt provides named presets as a convenience to quickly
 * enable/disable active syntax rules and options for common use cases.
 *
 * - ["commonmark"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/commonmark.js) -
 *   configures parser to strict [CommonMark](http://commonmark.org/) mode.
 * - [default](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/default.js) -
 *   similar to GFM, used when no preset name given. Enables all available rules,
 *   but still without html, typographer & autolinker.
 * - ["zero"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/zero.js) -
 *   all rules disabled. Useful to quickly setup your config via `.enable()`.
 *   For example, when you need only `bold` and `italic` markup and nothing else.
 *
 * ##### options:
 *
 * - __html__ - `false`. Set `true` to enable HTML tags in source. Be careful!
 *   That's not safe! You may need external sanitizer to protect output from XSS.
 *   It's better to extend features via plugins, instead of enabling HTML.
 * - __xhtmlOut__ - `false`. Set `true` to add '/' when closing single tags
 *   (`<br />`). This is needed only for full CommonMark compatibility. In real
 *   world you will need HTML output.
 * - __breaks__ - `false`. Set `true` to convert `\n` in paragraphs into `<br>`.
 * - __langPrefix__ - `language-`. CSS language class prefix for fenced blocks.
 *   Can be useful for external highlighters.
 * - __linkify__ - `false`. Set `true` to autoconvert URL-like text to links.
 * - __typographer__  - `false`. Set `true` to enable [some language-neutral
 *   replacement](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js) +
 *   quotes beautification (smartquotes).
 * - __quotes__ - `“”‘’`, String or Array. Double + single quotes replacement
 *   pairs, when typographer enabled and smartquotes on. For example, you can
 *   use `'«»„“'` for Russian, `'„“‚‘'` for German, and
 *   `['«\xA0', '\xA0»', '‹\xA0', '\xA0›']` for French (including nbsp).
 * - __highlight__ - `null`. Highlighter function for fenced code blocks.
 *   Highlighter `function (str, lang)` should return escaped HTML. It can also
 *   return empty string if the source was not changed and should be escaped externaly.
 *
 * ##### Example
 *
 * ```javascript
 * // commonmark mode
 * var md = require('markdown-it')('commonmark');
 *
 * // default mode
 * var md = require('markdown-it')();
 *
 * // enable everything
 * var md = require('markdown-it')({
 *   html: true,
 *   linkify: true,
 *   typographer: true
 * });
 * ```
 *
 * ##### Syntax highlighting
 *
 * ```js
 * var hljs = require('highlight.js') // https://highlightjs.org/
 *
 * var md = require('markdown-it')({
 *   highlight: function (str, lang) {
 *     if (lang && hljs.getLanguage(lang)) {
 *       try {
 *         return hljs.highlight(lang, str).value;
 *       } catch (__) {}
 *     }
 *
 *     try {
 *       return hljs.highlightAuto(str).value;
 *     } catch (__) {}
 *
 *     return ''; // use external default escaping
 *   }
 * });
 * ```
 **/
function MarkdownIt(presetName, options) {
  if (!(this instanceof MarkdownIt)) {
    return new MarkdownIt(presetName, options);
  }

  if (!options) {
    if (!utils.isString(presetName)) {
      options = presetName || {};
      presetName = 'default';
    }
  }

  /**
   * MarkdownIt#inline -> ParserInline
   *
   * Instance of [[ParserInline]]. You may need it to add new rules when
   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
   * [[MarkdownIt.enable]].
   **/
  this.inline = new ParserInline();

  /**
   * MarkdownIt#block -> ParserBlock
   *
   * Instance of [[ParserBlock]]. You may need it to add new rules when
   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
   * [[MarkdownIt.enable]].
   **/
  this.block = new ParserBlock();

  /**
   * MarkdownIt#core -> Core
   *
   * Instance of [[Core]] chain executor. You may need it to add new rules when
   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
   * [[MarkdownIt.enable]].
   **/
  this.core = new ParserCore();

  /**
   * MarkdownIt#renderer -> Renderer
   *
   * Instance of [[Renderer]]. Use it to modify output look. Or to add rendering
   * rules for new token types, generated by plugins.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * function myToken(tokens, idx, options, env, self) {
   *   //...
   *   return result;
   * };
   *
   * md.renderer.rules['my_token'] = myToken
   * ```
   *
   * See [[Renderer]] docs and [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js).
   **/
  this.renderer = new Renderer();

  /**
   * MarkdownIt#linkify -> LinkifyIt
   *
   * [linkify-it](https://github.com/markdown-it/linkify-it) instance.
   * Used by [linkify](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/linkify.js)
   * rule.
   **/
  this.linkify = new LinkifyIt();

  /**
   * MarkdownIt#validateLink(url) -> Boolean
   *
   * Link validation function. CommonMark allows too much in links. By default
   * we disable `javascript:`, `vbscript:`, `file:` schemas, and almost all `data:...` schemas
   * except some embedded image types.
   *
   * You can change this behaviour:
   *
   * ```javascript
   * var md = require('markdown-it')();
   * // enable everything
   * md.validateLink = function () { return true; }
   * ```
   **/
  this.validateLink = validateLink;

  /**
   * MarkdownIt#normalizeLink(url) -> String
   *
   * Function used to encode link url to a machine-readable format,
   * which includes url-encoding, punycode, etc.
   **/
  this.normalizeLink = normalizeLink;

  /**
   * MarkdownIt#normalizeLinkText(url) -> String
   *
   * Function used to decode link url to a human-readable format`
   **/
  this.normalizeLinkText = normalizeLinkText;


  // Expose utils & helpers for easy acces from plugins

  /**
   * MarkdownIt#utils -> utils
   *
   * Assorted utility functions, useful to write plugins. See details
   * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/common/utils.js).
   **/
  this.utils = utils;

  /**
   * MarkdownIt#helpers -> helpers
   *
   * Link components parser functions, useful to write plugins. See details
   * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/helpers).
   **/
  this.helpers = helpers;


  this.options = {};
  this.configure(presetName);

  if (options) { this.set(options); }
}


/** chainable
 * MarkdownIt.set(options)
 *
 * Set parser options (in the same format as in constructor). Probably, you
 * will never need it, but you can change options after constructor call.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')()
 *             .set({ html: true, breaks: true })
 *             .set({ typographer, true });
 * ```
 *
 * __Note:__ To achieve the best possible performance, don't modify a
 * `markdown-it` instance options on the fly. If you need multiple configurations
 * it's best to create multiple instances and initialize each with separate
 * config.
 **/
MarkdownIt.prototype.set = function (options) {
  utils.assign(this.options, options);
  return this;
};


/** chainable, internal
 * MarkdownIt.configure(presets)
 *
 * Batch load of all options and compenent settings. This is internal method,
 * and you probably will not need it. But if you with - see available presets
 * and data structure [here](https://github.com/markdown-it/markdown-it/tree/master/lib/presets)
 *
 * We strongly recommend to use presets instead of direct config loads. That
 * will give better compatibility with next versions.
 **/
MarkdownIt.prototype.configure = function (presets) {
  var self = this, presetName;

  if (utils.isString(presets)) {
    presetName = presets;
    presets = config[presetName];
    if (!presets) { throw new Error('Wrong `markdown-it` preset "' + presetName + '", check name'); }
  }

  if (!presets) { throw new Error('Wrong `markdown-it` preset, can\'t be empty'); }

  if (presets.options) { self.set(presets.options); }

  if (presets.components) {
    Object.keys(presets.components).forEach(function (name) {
      if (presets.components[name].rules) {
        self[name].ruler.enableOnly(presets.components[name].rules);
      }
      if (presets.components[name].rules2) {
        self[name].ruler2.enableOnly(presets.components[name].rules2);
      }
    });
  }
  return this;
};


/** chainable
 * MarkdownIt.enable(list, ignoreInvalid)
 * - list (String|Array): rule name or list of rule names to enable
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * Enable list or rules. It will automatically find appropriate components,
 * containing rules with given names. If rule not found, and `ignoreInvalid`
 * not set - throws exception.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')()
 *             .enable(['sub', 'sup'])
 *             .disable('smartquotes');
 * ```
 **/
MarkdownIt.prototype.enable = function (list, ignoreInvalid) {
  var result = [];

  if (!Array.isArray(list)) { list = [ list ]; }

  [ 'core', 'block', 'inline' ].forEach(function (chain) {
    result = result.concat(this[chain].ruler.enable(list, true));
  }, this);

  result = result.concat(this.inline.ruler2.enable(list, true));

  var missed = list.filter(function (name) { return result.indexOf(name) < 0; });

  if (missed.length && !ignoreInvalid) {
    throw new Error('MarkdownIt. Failed to enable unknown rule(s): ' + missed);
  }

  return this;
};


/** chainable
 * MarkdownIt.disable(list, ignoreInvalid)
 * - list (String|Array): rule name or list of rule names to disable.
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * The same as [[MarkdownIt.enable]], but turn specified rules off.
 **/
MarkdownIt.prototype.disable = function (list, ignoreInvalid) {
  var result = [];

  if (!Array.isArray(list)) { list = [ list ]; }

  [ 'core', 'block', 'inline' ].forEach(function (chain) {
    result = result.concat(this[chain].ruler.disable(list, true));
  }, this);

  result = result.concat(this.inline.ruler2.disable(list, true));

  var missed = list.filter(function (name) { return result.indexOf(name) < 0; });

  if (missed.length && !ignoreInvalid) {
    throw new Error('MarkdownIt. Failed to disable unknown rule(s): ' + missed);
  }
  return this;
};


/** chainable
 * MarkdownIt.use(plugin, params)
 *
 * Load specified plugin with given params into current parser instance.
 * It's just a sugar to call `plugin(md, params)` with curring.
 *
 * ##### Example
 *
 * ```javascript
 * var iterator = require('markdown-it-for-inline');
 * var md = require('markdown-it')()
 *             .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
 *               tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar');
 *             });
 * ```
 **/
MarkdownIt.prototype.use = function (plugin /*, params, ... */) {
  var args = [ this ].concat(Array.prototype.slice.call(arguments, 1));
  plugin.apply(plugin, args);
  return this;
};


/** internal
 * MarkdownIt.parse(src, env) -> Array
 * - src (String): source string
 * - env (Object): environment sandbox
 *
 * Parse input string and returns list of block tokens (special token type
 * "inline" will contain list of inline tokens). You should not call this
 * method directly, until you write custom renderer (for example, to produce
 * AST).
 *
 * `env` is used to pass data between "distributed" rules and return additional
 * metadata like reference info, needed for the renderer. It also can be used to
 * inject data in specific cases. Usually, you will be ok to pass `{}`,
 * and then pass updated object to renderer.
 **/
MarkdownIt.prototype.parse = function (src, env) {
  var state = new this.core.State(src, this, env);

  this.core.process(state);

  return state.tokens;
};


/**
 * MarkdownIt.render(src [, env]) -> String
 * - src (String): source string
 * - env (Object): environment sandbox
 *
 * Render markdown string into html. It does all magic for you :).
 *
 * `env` can be used to inject additional metadata (`{}` by default).
 * But you will not need it with high probability. See also comment
 * in [[MarkdownIt.parse]].
 **/
MarkdownIt.prototype.render = function (src, env) {
  env = env || {};

  return this.renderer.render(this.parse(src, env), this.options, env);
};


/** internal
 * MarkdownIt.parseInline(src, env) -> Array
 * - src (String): source string
 * - env (Object): environment sandbox
 *
 * The same as [[MarkdownIt.parse]] but skip all block rules. It returns the
 * block tokens list with the single `inline` element, containing parsed inline
 * tokens in `children` property. Also updates `env` object.
 **/
MarkdownIt.prototype.parseInline = function (src, env) {
  var state = new this.core.State(src, this, env);

  state.inlineMode = true;
  this.core.process(state);

  return state.tokens;
};


/**
 * MarkdownIt.renderInline(src [, env]) -> String
 * - src (String): source string
 * - env (Object): environment sandbox
 *
 * Similar to [[MarkdownIt.render]] but for single paragraph content. Result
 * will NOT be wrapped into `<p>` tags.
 **/
MarkdownIt.prototype.renderInline = function (src, env) {
  env = env || {};

  return this.renderer.render(this.parseInline(src, env), this.options, env);
};


module.exports = MarkdownIt;

},{"./common/utils":111,"./helpers":112,"./parser_block":117,"./parser_core":118,"./parser_inline":119,"./presets/commonmark":120,"./presets/default":121,"./presets/zero":122,"./renderer":123,"linkify-it":160,"mdurl":165,"punycode":15}],117:[function(require,module,exports){
/** internal
 * class ParserBlock
 *
 * Block-level tokenizer.
 **/
'use strict';


var Ruler           = require('./ruler');


var _rules = [
  // First 2 params - rule name & source. Secondary array - list of rules,
  // which can be terminated by this one.
  [ 'table',      require('./rules_block/table'),      [ 'paragraph', 'reference' ] ],
  [ 'code',       require('./rules_block/code') ],
  [ 'fence',      require('./rules_block/fence'),      [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
  [ 'blockquote', require('./rules_block/blockquote'), [ 'paragraph', 'reference', 'list' ] ],
  [ 'hr',         require('./rules_block/hr'),         [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
  [ 'list',       require('./rules_block/list'),       [ 'paragraph', 'reference', 'blockquote' ] ],
  [ 'reference',  require('./rules_block/reference') ],
  [ 'heading',    require('./rules_block/heading'),    [ 'paragraph', 'reference', 'blockquote' ] ],
  [ 'lheading',   require('./rules_block/lheading') ],
  [ 'html_block', require('./rules_block/html_block'), [ 'paragraph', 'reference', 'blockquote' ] ],
  [ 'paragraph',  require('./rules_block/paragraph') ]
];


/**
 * new ParserBlock()
 **/
function ParserBlock() {
  /**
   * ParserBlock#ruler -> Ruler
   *
   * [[Ruler]] instance. Keep configuration of block rules.
   **/
  this.ruler = new Ruler();

  for (var i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1], { alt: (_rules[i][2] || []).slice() });
  }
}


// Generate tokens for input range
//
ParserBlock.prototype.tokenize = function (state, startLine, endLine) {
  var ok, i,
      rules = this.ruler.getRules(''),
      len = rules.length,
      line = startLine,
      hasEmptyLines = false,
      maxNesting = state.md.options.maxNesting;

  while (line < endLine) {
    state.line = line = state.skipEmptyLines(line);
    if (line >= endLine) { break; }

    // Termination condition for nested calls.
    // Nested calls currently used for blockquotes & lists
    if (state.sCount[line] < state.blkIndent) { break; }

    // If nesting level exceeded - skip tail to the end. That's not ordinary
    // situation and we should not care about content.
    if (state.level >= maxNesting) {
      state.line = endLine;
      break;
    }

    // Try all possible rules.
    // On success, rule should:
    //
    // - update `state.line`
    // - update `state.tokens`
    // - return true

    for (i = 0; i < len; i++) {
      ok = rules[i](state, line, endLine, false);
      if (ok) { break; }
    }

    // set state.tight iff we had an empty line before current tag
    // i.e. latest empty line should not count
    state.tight = !hasEmptyLines;

    // paragraph might "eat" one newline after it in nested lists
    if (state.isEmpty(state.line - 1)) {
      hasEmptyLines = true;
    }

    line = state.line;

    if (line < endLine && state.isEmpty(line)) {
      hasEmptyLines = true;
      line++;

      // two empty lines should stop the parser in list mode
      if (line < endLine && state.parentType === 'list' && state.isEmpty(line)) { break; }
      state.line = line;
    }
  }
};


/**
 * ParserBlock.parse(str, md, env, outTokens)
 *
 * Process input string and push block tokens into `outTokens`
 **/
ParserBlock.prototype.parse = function (src, md, env, outTokens) {
  var state;

  if (!src) { return []; }

  state = new this.State(src, md, env, outTokens);

  this.tokenize(state, state.line, state.lineMax);
};


ParserBlock.prototype.State = require('./rules_block/state_block');


module.exports = ParserBlock;

},{"./ruler":124,"./rules_block/blockquote":125,"./rules_block/code":126,"./rules_block/fence":127,"./rules_block/heading":128,"./rules_block/hr":129,"./rules_block/html_block":130,"./rules_block/lheading":131,"./rules_block/list":132,"./rules_block/paragraph":133,"./rules_block/reference":134,"./rules_block/state_block":135,"./rules_block/table":136}],118:[function(require,module,exports){
/** internal
 * class Core
 *
 * Top-level rules executor. Glues block/inline parsers and does intermediate
 * transformations.
 **/
'use strict';


var Ruler  = require('./ruler');


var _rules = [
  [ 'normalize',      require('./rules_core/normalize')      ],
  [ 'block',          require('./rules_core/block')          ],
  [ 'inline',         require('./rules_core/inline')         ],
  [ 'linkify',        require('./rules_core/linkify')        ],
  [ 'replacements',   require('./rules_core/replacements')   ],
  [ 'smartquotes',    require('./rules_core/smartquotes')    ]
];


/**
 * new Core()
 **/
function Core() {
  /**
   * Core#ruler -> Ruler
   *
   * [[Ruler]] instance. Keep configuration of core rules.
   **/
  this.ruler = new Ruler();

  for (var i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1]);
  }
}


/**
 * Core.process(state)
 *
 * Executes core chain rules.
 **/
Core.prototype.process = function (state) {
  var i, l, rules;

  rules = this.ruler.getRules('');

  for (i = 0, l = rules.length; i < l; i++) {
    rules[i](state);
  }
};

Core.prototype.State = require('./rules_core/state_core');


module.exports = Core;

},{"./ruler":124,"./rules_core/block":137,"./rules_core/inline":138,"./rules_core/linkify":139,"./rules_core/normalize":140,"./rules_core/replacements":141,"./rules_core/smartquotes":142,"./rules_core/state_core":143}],119:[function(require,module,exports){
/** internal
 * class ParserInline
 *
 * Tokenizes paragraph content.
 **/
'use strict';


var Ruler           = require('./ruler');


////////////////////////////////////////////////////////////////////////////////
// Parser rules

var _rules = [
  [ 'text',            require('./rules_inline/text') ],
  [ 'newline',         require('./rules_inline/newline') ],
  [ 'escape',          require('./rules_inline/escape') ],
  [ 'backticks',       require('./rules_inline/backticks') ],
  [ 'strikethrough',   require('./rules_inline/strikethrough').tokenize ],
  [ 'emphasis',        require('./rules_inline/emphasis').tokenize ],
  [ 'link',            require('./rules_inline/link') ],
  [ 'image',           require('./rules_inline/image') ],
  [ 'autolink',        require('./rules_inline/autolink') ],
  [ 'html_inline',     require('./rules_inline/html_inline') ],
  [ 'entity',          require('./rules_inline/entity') ]
];

var _rules2 = [
  [ 'balance_pairs',   require('./rules_inline/balance_pairs') ],
  [ 'strikethrough',   require('./rules_inline/strikethrough').postProcess ],
  [ 'emphasis',        require('./rules_inline/emphasis').postProcess ],
  [ 'text_collapse',   require('./rules_inline/text_collapse') ]
];


/**
 * new ParserInline()
 **/
function ParserInline() {
  var i;

  /**
   * ParserInline#ruler -> Ruler
   *
   * [[Ruler]] instance. Keep configuration of inline rules.
   **/
  this.ruler = new Ruler();

  for (i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1]);
  }

  /**
   * ParserInline#ruler2 -> Ruler
   *
   * [[Ruler]] instance. Second ruler used for post-processing
   * (e.g. in emphasis-like rules).
   **/
  this.ruler2 = new Ruler();

  for (i = 0; i < _rules2.length; i++) {
    this.ruler2.push(_rules2[i][0], _rules2[i][1]);
  }
}


// Skip single token by running all rules in validation mode;
// returns `true` if any rule reported success
//
ParserInline.prototype.skipToken = function (state) {
  var i, pos = state.pos,
      rules = this.ruler.getRules(''),
      len = rules.length,
      maxNesting = state.md.options.maxNesting,
      cache = state.cache;


  if (typeof cache[pos] !== 'undefined') {
    state.pos = cache[pos];
    return;
  }

  /*istanbul ignore else*/
  if (state.level < maxNesting) {
    for (i = 0; i < len; i++) {
      if (rules[i](state, true)) {
        cache[pos] = state.pos;
        return;
      }
    }
  }

  state.pos++;
  cache[pos] = state.pos;
};


// Generate tokens for input range
//
ParserInline.prototype.tokenize = function (state) {
  var ok, i,
      rules = this.ruler.getRules(''),
      len = rules.length,
      end = state.posMax,
      maxNesting = state.md.options.maxNesting;

  while (state.pos < end) {
    // Try all possible rules.
    // On success, rule should:
    //
    // - update `state.pos`
    // - update `state.tokens`
    // - return true

    if (state.level < maxNesting) {
      for (i = 0; i < len; i++) {
        ok = rules[i](state, false);
        if (ok) { break; }
      }
    }

    if (ok) {
      if (state.pos >= end) { break; }
      continue;
    }

    state.pending += state.src[state.pos++];
  }

  if (state.pending) {
    state.pushPending();
  }
};


/**
 * ParserInline.parse(str, md, env, outTokens)
 *
 * Process input string and push inline tokens into `outTokens`
 **/
ParserInline.prototype.parse = function (str, md, env, outTokens) {
  var i, rules, len;
  var state = new this.State(str, md, env, outTokens);

  this.tokenize(state);

  rules = this.ruler2.getRules('');
  len = rules.length;

  for (i = 0; i < len; i++) {
    rules[i](state);
  }
};


ParserInline.prototype.State = require('./rules_inline/state_inline');


module.exports = ParserInline;

},{"./ruler":124,"./rules_inline/autolink":144,"./rules_inline/backticks":145,"./rules_inline/balance_pairs":146,"./rules_inline/emphasis":147,"./rules_inline/entity":148,"./rules_inline/escape":149,"./rules_inline/html_inline":150,"./rules_inline/image":151,"./rules_inline/link":152,"./rules_inline/newline":153,"./rules_inline/state_inline":154,"./rules_inline/strikethrough":155,"./rules_inline/text":156,"./rules_inline/text_collapse":157}],120:[function(require,module,exports){
// Commonmark default options

'use strict';


module.exports = {
  options: {
    html:         true,         // Enable HTML tags in source
    xhtmlOut:     true,         // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkify:      false,        // autoconvert URL-like texts to links

    // Enable some language-neutral replacements + quotes beautification
    typographer:  false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

    // Highlighter function. Should return escaped HTML,
    // or '' if input not changed
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,

    maxNesting:   20            // Internal protection, recursion limit
  },

  components: {

    core: {
      rules: [
        'normalize',
        'block',
        'inline'
      ]
    },

    block: {
      rules: [
        'blockquote',
        'code',
        'fence',
        'heading',
        'hr',
        'html_block',
        'lheading',
        'list',
        'reference',
        'paragraph'
      ]
    },

    inline: {
      rules: [
        'autolink',
        'backticks',
        'emphasis',
        'entity',
        'escape',
        'html_inline',
        'image',
        'link',
        'newline',
        'text'
      ],
      rules2: [
        'balance_pairs',
        'emphasis',
        'text_collapse'
      ]
    }
  }
};

},{}],121:[function(require,module,exports){
// markdown-it default options

'use strict';


module.exports = {
  options: {
    html:         false,        // Enable HTML tags in source
    xhtmlOut:     false,        // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkify:      false,        // autoconvert URL-like texts to links

    // Enable some language-neutral replacements + quotes beautification
    typographer:  false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

    // Highlighter function. Should return escaped HTML,
    // or '' if input not changed
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,

    maxNesting:   20            // Internal protection, recursion limit
  },

  components: {

    core: {},
    block: {},
    inline: {}
  }
};

},{}],122:[function(require,module,exports){
// "Zero" preset, with nothing enabled. Useful for manual configuring of simple
// modes. For example, to parse bold/italic only.

'use strict';


module.exports = {
  options: {
    html:         false,        // Enable HTML tags in source
    xhtmlOut:     false,        // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkify:      false,        // autoconvert URL-like texts to links

    // Enable some language-neutral replacements + quotes beautification
    typographer:  false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

    // Highlighter function. Should return escaped HTML,
    // or '' if input not changed
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,

    maxNesting:   20            // Internal protection, recursion limit
  },

  components: {

    core: {
      rules: [
        'normalize',
        'block',
        'inline'
      ]
    },

    block: {
      rules: [
        'paragraph'
      ]
    },

    inline: {
      rules: [
        'text'
      ],
      rules2: [
        'balance_pairs',
        'text_collapse'
      ]
    }
  }
};

},{}],123:[function(require,module,exports){
/**
 * class Renderer
 *
 * Generates HTML from parsed token stream. Each instance has independent
 * copy of rules. Those can be rewritten with ease. Also, you can add new
 * rules if you create plugin and adds new token types.
 **/
'use strict';


var assign          = require('./common/utils').assign;
var unescapeAll     = require('./common/utils').unescapeAll;
var escapeHtml      = require('./common/utils').escapeHtml;


////////////////////////////////////////////////////////////////////////////////

var default_rules = {};


default_rules.code_inline = function (tokens, idx /*, options, env */) {
  return '<code>' + escapeHtml(tokens[idx].content) + '</code>';
};


default_rules.code_block = function (tokens, idx /*, options, env */) {
  return '<pre><code>' + escapeHtml(tokens[idx].content) + '</code></pre>\n';
};


default_rules.fence = function (tokens, idx, options, env, slf) {
  var token = tokens[idx],
      info = token.info ? unescapeAll(token.info).trim() : '',
      langName = '',
      highlighted;

  if (info) {
    langName = info.split(/\s+/g)[0];
    token.attrPush([ 'class', options.langPrefix + langName ]);
  }

  if (options.highlight) {
    highlighted = options.highlight(token.content, langName) || escapeHtml(token.content);
  } else {
    highlighted = escapeHtml(token.content);
  }

  return  '<pre><code' + slf.renderAttrs(token) + '>'
        + highlighted
        + '</code></pre>\n';
};


default_rules.image = function (tokens, idx, options, env, slf) {
  var token = tokens[idx];

  // "alt" attr MUST be set, even if empty. Because it's mandatory and
  // should be placed on proper position for tests.
  //
  // Replace content with actual value

  token.attrs[token.attrIndex('alt')][1] =
    slf.renderInlineAsText(token.children, options, env);

  return slf.renderToken(tokens, idx, options);
};


default_rules.hardbreak = function (tokens, idx, options /*, env */) {
  return options.xhtmlOut ? '<br />\n' : '<br>\n';
};
default_rules.softbreak = function (tokens, idx, options /*, env */) {
  return options.breaks ? (options.xhtmlOut ? '<br />\n' : '<br>\n') : '\n';
};


default_rules.text = function (tokens, idx /*, options, env */) {
  return escapeHtml(tokens[idx].content);
};


default_rules.html_block = function (tokens, idx /*, options, env */) {
  return tokens[idx].content;
};
default_rules.html_inline = function (tokens, idx /*, options, env */) {
  return tokens[idx].content;
};


/**
 * new Renderer()
 *
 * Creates new [[Renderer]] instance and fill [[Renderer#rules]] with defaults.
 **/
function Renderer() {

  /**
   * Renderer#rules -> Object
   *
   * Contains render rules for tokens. Can be updated and extended.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.renderer.rules.strong_open  = function () { return '<b>'; };
   * md.renderer.rules.strong_close = function () { return '</b>'; };
   *
   * var result = md.renderInline(...);
   * ```
   *
   * Each rule is called as independed static function with fixed signature:
   *
   * ```javascript
   * function my_token_render(tokens, idx, options, env, renderer) {
   *   // ...
   *   return renderedHTML;
   * }
   * ```
   *
   * See [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js)
   * for more details and examples.
   **/
  this.rules = assign({}, default_rules);
}


/**
 * Renderer.renderAttrs(token) -> String
 *
 * Render token attributes to string.
 **/
Renderer.prototype.renderAttrs = function renderAttrs(token) {
  var i, l, result;

  if (!token.attrs) { return ''; }

  result = '';

  for (i = 0, l = token.attrs.length; i < l; i++) {
    result += ' ' + escapeHtml(token.attrs[i][0]) + '="' + escapeHtml(token.attrs[i][1]) + '"';
  }

  return result;
};


/**
 * Renderer.renderToken(tokens, idx, options) -> String
 * - tokens (Array): list of tokens
 * - idx (Numbed): token index to render
 * - options (Object): params of parser instance
 *
 * Default token renderer. Can be overriden by custom function
 * in [[Renderer#rules]].
 **/
Renderer.prototype.renderToken = function renderToken(tokens, idx, options) {
  var nextToken,
      result = '',
      needLf = false,
      token = tokens[idx];

  // Tight list paragraphs
  if (token.hidden) {
    return '';
  }

  // Insert a newline between hidden paragraph and subsequent opening
  // block-level tag.
  //
  // For example, here we should insert a newline before blockquote:
  //  - a
  //    >
  //
  if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
    result += '\n';
  }

  // Add token name, e.g. `<img`
  result += (token.nesting === -1 ? '</' : '<') + token.tag;

  // Encode attributes, e.g. `<img src="foo"`
  result += this.renderAttrs(token);

  // Add a slash for self-closing tags, e.g. `<img src="foo" /`
  if (token.nesting === 0 && options.xhtmlOut) {
    result += ' /';
  }

  // Check if we need to add a newline after this tag
  if (token.block) {
    needLf = true;

    if (token.nesting === 1) {
      if (idx + 1 < tokens.length) {
        nextToken = tokens[idx + 1];

        if (nextToken.type === 'inline' || nextToken.hidden) {
          // Block-level tag containing an inline tag.
          //
          needLf = false;

        } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
          // Opening tag + closing tag of the same type. E.g. `<li></li>`.
          //
          needLf = false;
        }
      }
    }
  }

  result += needLf ? '>\n' : '>';

  return result;
};


/**
 * Renderer.renderInline(tokens, options, env) -> String
 * - tokens (Array): list on block tokens to renter
 * - options (Object): params of parser instance
 * - env (Object): additional data from parsed input (references, for example)
 *
 * The same as [[Renderer.render]], but for single token of `inline` type.
 **/
Renderer.prototype.renderInline = function (tokens, options, env) {
  var type,
      result = '',
      rules = this.rules;

  for (var i = 0, len = tokens.length; i < len; i++) {
    type = tokens[i].type;

    if (typeof rules[type] !== 'undefined') {
      result += rules[type](tokens, i, options, env, this);
    } else {
      result += this.renderToken(tokens, i, options);
    }
  }

  return result;
};


/** internal
 * Renderer.renderInlineAsText(tokens, options, env) -> String
 * - tokens (Array): list on block tokens to renter
 * - options (Object): params of parser instance
 * - env (Object): additional data from parsed input (references, for example)
 *
 * Special kludge for image `alt` attributes to conform CommonMark spec.
 * Don't try to use it! Spec requires to show `alt` content with stripped markup,
 * instead of simple escaping.
 **/
Renderer.prototype.renderInlineAsText = function (tokens, options, env) {
  var result = '',
      rules = this.rules;

  for (var i = 0, len = tokens.length; i < len; i++) {
    if (tokens[i].type === 'text') {
      result += rules.text(tokens, i, options, env, this);
    } else if (tokens[i].type === 'image') {
      result += this.renderInlineAsText(tokens[i].children, options, env);
    }
  }

  return result;
};


/**
 * Renderer.render(tokens, options, env) -> String
 * - tokens (Array): list on block tokens to renter
 * - options (Object): params of parser instance
 * - env (Object): additional data from parsed input (references, for example)
 *
 * Takes token stream and generates HTML. Probably, you will never need to call
 * this method directly.
 **/
Renderer.prototype.render = function (tokens, options, env) {
  var i, len, type,
      result = '',
      rules = this.rules;

  for (i = 0, len = tokens.length; i < len; i++) {
    type = tokens[i].type;

    if (type === 'inline') {
      result += this.renderInline(tokens[i].children, options, env);
    } else if (typeof rules[type] !== 'undefined') {
      result += rules[tokens[i].type](tokens, i, options, env, this);
    } else {
      result += this.renderToken(tokens, i, options, env);
    }
  }

  return result;
};

module.exports = Renderer;

},{"./common/utils":111}],124:[function(require,module,exports){
/**
 * class Ruler
 *
 * Helper class, used by [[MarkdownIt#core]], [[MarkdownIt#block]] and
 * [[MarkdownIt#inline]] to manage sequences of functions (rules):
 *
 * - keep rules in defined order
 * - assign the name to each rule
 * - enable/disable rules
 * - add/replace rules
 * - allow assign rules to additional named chains (in the same)
 * - cacheing lists of active rules
 *
 * You will not need use this class directly until write plugins. For simple
 * rules control use [[MarkdownIt.disable]], [[MarkdownIt.enable]] and
 * [[MarkdownIt.use]].
 **/
'use strict';


/**
 * new Ruler()
 **/
function Ruler() {
  // List of added rules. Each element is:
  //
  // {
  //   name: XXX,
  //   enabled: Boolean,
  //   fn: Function(),
  //   alt: [ name2, name3 ]
  // }
  //
  this.__rules__ = [];

  // Cached rule chains.
  //
  // First level - chain name, '' for default.
  // Second level - diginal anchor for fast filtering by charcodes.
  //
  this.__cache__ = null;
}

////////////////////////////////////////////////////////////////////////////////
// Helper methods, should not be used directly


// Find rule index by name
//
Ruler.prototype.__find__ = function (name) {
  for (var i = 0; i < this.__rules__.length; i++) {
    if (this.__rules__[i].name === name) {
      return i;
    }
  }
  return -1;
};


// Build rules lookup cache
//
Ruler.prototype.__compile__ = function () {
  var self = this;
  var chains = [ '' ];

  // collect unique names
  self.__rules__.forEach(function (rule) {
    if (!rule.enabled) { return; }

    rule.alt.forEach(function (altName) {
      if (chains.indexOf(altName) < 0) {
        chains.push(altName);
      }
    });
  });

  self.__cache__ = {};

  chains.forEach(function (chain) {
    self.__cache__[chain] = [];
    self.__rules__.forEach(function (rule) {
      if (!rule.enabled) { return; }

      if (chain && rule.alt.indexOf(chain) < 0) { return; }

      self.__cache__[chain].push(rule.fn);
    });
  });
};


/**
 * Ruler.at(name, fn [, options])
 * - name (String): rule name to replace.
 * - fn (Function): new rule function.
 * - options (Object): new rule options (not mandatory).
 *
 * Replace rule by name with new function & options. Throws error if name not
 * found.
 *
 * ##### Options:
 *
 * - __alt__ - array with names of "alternate" chains.
 *
 * ##### Example
 *
 * Replace existing typorgapher replacement rule with new one:
 *
 * ```javascript
 * var md = require('markdown-it')();
 *
 * md.core.ruler.at('replacements', function replace(state) {
 *   //...
 * });
 * ```
 **/
Ruler.prototype.at = function (name, fn, options) {
  var index = this.__find__(name);
  var opt = options || {};

  if (index === -1) { throw new Error('Parser rule not found: ' + name); }

  this.__rules__[index].fn = fn;
  this.__rules__[index].alt = opt.alt || [];
  this.__cache__ = null;
};


/**
 * Ruler.before(beforeName, ruleName, fn [, options])
 * - beforeName (String): new rule will be added before this one.
 * - ruleName (String): name of added rule.
 * - fn (Function): rule function.
 * - options (Object): rule options (not mandatory).
 *
 * Add new rule to chain before one with given name. See also
 * [[Ruler.after]], [[Ruler.push]].
 *
 * ##### Options:
 *
 * - __alt__ - array with names of "alternate" chains.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')();
 *
 * md.block.ruler.before('paragraph', 'my_rule', function replace(state) {
 *   //...
 * });
 * ```
 **/
Ruler.prototype.before = function (beforeName, ruleName, fn, options) {
  var index = this.__find__(beforeName);
  var opt = options || {};

  if (index === -1) { throw new Error('Parser rule not found: ' + beforeName); }

  this.__rules__.splice(index, 0, {
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};


/**
 * Ruler.after(afterName, ruleName, fn [, options])
 * - afterName (String): new rule will be added after this one.
 * - ruleName (String): name of added rule.
 * - fn (Function): rule function.
 * - options (Object): rule options (not mandatory).
 *
 * Add new rule to chain after one with given name. See also
 * [[Ruler.before]], [[Ruler.push]].
 *
 * ##### Options:
 *
 * - __alt__ - array with names of "alternate" chains.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')();
 *
 * md.inline.ruler.after('text', 'my_rule', function replace(state) {
 *   //...
 * });
 * ```
 **/
Ruler.prototype.after = function (afterName, ruleName, fn, options) {
  var index = this.__find__(afterName);
  var opt = options || {};

  if (index === -1) { throw new Error('Parser rule not found: ' + afterName); }

  this.__rules__.splice(index + 1, 0, {
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};

/**
 * Ruler.push(ruleName, fn [, options])
 * - ruleName (String): name of added rule.
 * - fn (Function): rule function.
 * - options (Object): rule options (not mandatory).
 *
 * Push new rule to the end of chain. See also
 * [[Ruler.before]], [[Ruler.after]].
 *
 * ##### Options:
 *
 * - __alt__ - array with names of "alternate" chains.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')();
 *
 * md.core.ruler.push('my_rule', function replace(state) {
 *   //...
 * });
 * ```
 **/
Ruler.prototype.push = function (ruleName, fn, options) {
  var opt = options || {};

  this.__rules__.push({
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};


/**
 * Ruler.enable(list [, ignoreInvalid]) -> Array
 * - list (String|Array): list of rule names to enable.
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * Enable rules with given names. If any rule name not found - throw Error.
 * Errors can be disabled by second param.
 *
 * Returns list of found rule names (if no exception happened).
 *
 * See also [[Ruler.disable]], [[Ruler.enableOnly]].
 **/
Ruler.prototype.enable = function (list, ignoreInvalid) {
  if (!Array.isArray(list)) { list = [ list ]; }

  var result = [];

  // Search by name and enable
  list.forEach(function (name) {
    var idx = this.__find__(name);

    if (idx < 0) {
      if (ignoreInvalid) { return; }
      throw new Error('Rules manager: invalid rule name ' + name);
    }
    this.__rules__[idx].enabled = true;
    result.push(name);
  }, this);

  this.__cache__ = null;
  return result;
};


/**
 * Ruler.enableOnly(list [, ignoreInvalid])
 * - list (String|Array): list of rule names to enable (whitelist).
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * Enable rules with given names, and disable everything else. If any rule name
 * not found - throw Error. Errors can be disabled by second param.
 *
 * See also [[Ruler.disable]], [[Ruler.enable]].
 **/
Ruler.prototype.enableOnly = function (list, ignoreInvalid) {
  if (!Array.isArray(list)) { list = [ list ]; }

  this.__rules__.forEach(function (rule) { rule.enabled = false; });

  this.enable(list, ignoreInvalid);
};


/**
 * Ruler.disable(list [, ignoreInvalid]) -> Array
 * - list (String|Array): list of rule names to disable.
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * Disable rules with given names. If any rule name not found - throw Error.
 * Errors can be disabled by second param.
 *
 * Returns list of found rule names (if no exception happened).
 *
 * See also [[Ruler.enable]], [[Ruler.enableOnly]].
 **/
Ruler.prototype.disable = function (list, ignoreInvalid) {
  if (!Array.isArray(list)) { list = [ list ]; }

  var result = [];

  // Search by name and disable
  list.forEach(function (name) {
    var idx = this.__find__(name);

    if (idx < 0) {
      if (ignoreInvalid) { return; }
      throw new Error('Rules manager: invalid rule name ' + name);
    }
    this.__rules__[idx].enabled = false;
    result.push(name);
  }, this);

  this.__cache__ = null;
  return result;
};


/**
 * Ruler.getRules(chainName) -> Array
 *
 * Return array of active functions (rules) for given chain name. It analyzes
 * rules configuration, compiles caches if not exists and returns result.
 *
 * Default chain name is `''` (empty string). It can't be skipped. That's
 * done intentionally, to keep signature monomorphic for high speed.
 **/
Ruler.prototype.getRules = function (chainName) {
  if (this.__cache__ === null) {
    this.__compile__();
  }

  // Chain can be empty, if rules disabled. But we still have to return Array.
  return this.__cache__[chainName] || [];
};

module.exports = Ruler;

},{}],125:[function(require,module,exports){
// Block quotes

'use strict';

var isSpace = require('../common/utils').isSpace;


module.exports = function blockquote(state, startLine, endLine, silent) {
  var nextLine, lastLineEmpty, oldTShift, oldSCount, oldBMarks, oldIndent, oldParentType, lines, initial, offset, ch,
      terminatorRules, token,
      i, l, terminate,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  // check the block quote marker
  if (state.src.charCodeAt(pos++) !== 0x3E/* > */) { return false; }

  // we know that it's going to be a valid blockquote,
  // so no point trying to find the end of it in silent mode
  if (silent) { return true; }

  // skip one optional space (but not tab, check cmark impl) after '>'
  if (state.src.charCodeAt(pos) === 0x20) { pos++; }

  oldIndent = state.blkIndent;
  state.blkIndent = 0;

  // skip spaces after ">" and re-calculate offset
  initial = offset = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);

  oldBMarks = [ state.bMarks[startLine] ];
  state.bMarks[startLine] = pos;

  while (pos < max) {
    ch = state.src.charCodeAt(pos);

    if (isSpace(ch)) {
      if (ch === 0x09) {
        offset += 4 - offset % 4;
      } else {
        offset++;
      }
    } else {
      break;
    }

    pos++;
  }

  lastLineEmpty = pos >= max;

  oldSCount = [ state.sCount[startLine] ];
  state.sCount[startLine] = offset - initial;

  oldTShift = [ state.tShift[startLine] ];
  state.tShift[startLine] = pos - state.bMarks[startLine];

  terminatorRules = state.md.block.ruler.getRules('blockquote');

  // Search the end of the block
  //
  // Block ends with either:
  //  1. an empty line outside:
  //     ```
  //     > test
  //
  //     ```
  //  2. an empty line inside:
  //     ```
  //     >
  //     test
  //     ```
  //  3. another tag
  //     ```
  //     > test
  //      - - -
  //     ```
  for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < oldIndent) { break; }

    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (pos >= max) {
      // Case 1: line is not inside the blockquote, and this line is empty.
      break;
    }

    if (state.src.charCodeAt(pos++) === 0x3E/* > */) {
      // This line is inside the blockquote.

      // skip one optional space (but not tab, check cmark impl) after '>'
      if (state.src.charCodeAt(pos) === 0x20) { pos++; }

      // skip spaces after ">" and re-calculate offset
      initial = offset = state.sCount[nextLine] + pos - (state.bMarks[nextLine] + state.tShift[nextLine]);

      oldBMarks.push(state.bMarks[nextLine]);
      state.bMarks[nextLine] = pos;

      while (pos < max) {
        ch = state.src.charCodeAt(pos);

        if (isSpace(ch)) {
          if (ch === 0x09) {
            offset += 4 - offset % 4;
          } else {
            offset++;
          }
        } else {
          break;
        }

        pos++;
      }

      lastLineEmpty = pos >= max;

      oldSCount.push(state.sCount[nextLine]);
      state.sCount[nextLine] = offset - initial;

      oldTShift.push(state.tShift[nextLine]);
      state.tShift[nextLine] = pos - state.bMarks[nextLine];
      continue;
    }

    // Case 2: line is not inside the blockquote, and the last line was empty.
    if (lastLineEmpty) { break; }

    // Case 3: another tag found.
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) { break; }

    oldBMarks.push(state.bMarks[nextLine]);
    oldTShift.push(state.tShift[nextLine]);
    oldSCount.push(state.sCount[nextLine]);

    // A negative indentation means that this is a paragraph continuation
    //
    state.sCount[nextLine] = -1;
  }

  oldParentType = state.parentType;
  state.parentType = 'blockquote';

  token        = state.push('blockquote_open', 'blockquote', 1);
  token.markup = '>';
  token.map    = lines = [ startLine, 0 ];

  state.md.block.tokenize(state, startLine, nextLine);

  token        = state.push('blockquote_close', 'blockquote', -1);
  token.markup = '>';

  state.parentType = oldParentType;
  lines[1] = state.line;

  // Restore original tShift; this might not be necessary since the parser
  // has already been here, but just to make sure we can do that.
  for (i = 0; i < oldTShift.length; i++) {
    state.bMarks[i + startLine] = oldBMarks[i];
    state.tShift[i + startLine] = oldTShift[i];
    state.sCount[i + startLine] = oldSCount[i];
  }
  state.blkIndent = oldIndent;

  return true;
};

},{"../common/utils":111}],126:[function(require,module,exports){
// Code block (4 spaces padded)

'use strict';


module.exports = function code(state, startLine, endLine/*, silent*/) {
  var nextLine, last, token;

  if (state.sCount[startLine] - state.blkIndent < 4) { return false; }

  last = nextLine = startLine + 1;

  while (nextLine < endLine) {
    if (state.isEmpty(nextLine)) {
      nextLine++;
      continue;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      nextLine++;
      last = nextLine;
      continue;
    }
    break;
  }

  state.line = nextLine;

  token         = state.push('code_block', 'code', 0);
  token.content = state.getLines(startLine, last, 4 + state.blkIndent, true);
  token.map     = [ startLine, state.line ];

  return true;
};

},{}],127:[function(require,module,exports){
// fences (``` lang, ~~~ lang)

'use strict';


module.exports = function fence(state, startLine, endLine, silent) {
  var marker, len, params, nextLine, mem, token, markup,
      haveEndMarker = false,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  if (pos + 3 > max) { return false; }

  marker = state.src.charCodeAt(pos);

  if (marker !== 0x7E/* ~ */ && marker !== 0x60 /* ` */) {
    return false;
  }

  // scan marker length
  mem = pos;
  pos = state.skipChars(pos, marker);

  len = pos - mem;

  if (len < 3) { return false; }

  markup = state.src.slice(mem, pos);
  params = state.src.slice(pos, max);

  if (params.indexOf('`') >= 0) { return false; }

  // Since start is found, we can report success here in validation mode
  if (silent) { return true; }

  // search end of block
  nextLine = startLine;

  for (;;) {
    nextLine++;
    if (nextLine >= endLine) {
      // unclosed block should be autoclosed by end of document.
      // also block seems to be autoclosed by end of parent
      break;
    }

    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (pos < max && state.sCount[nextLine] < state.blkIndent) {
      // non-empty line with negative indent should stop the list:
      // - ```
      //  test
      break;
    }

    if (state.src.charCodeAt(pos) !== marker) { continue; }

    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      // closing fence should be indented less than 4 spaces
      continue;
    }

    pos = state.skipChars(pos, marker);

    // closing code fence must be at least as long as the opening one
    if (pos - mem < len) { continue; }

    // make sure tail has spaces only
    pos = state.skipSpaces(pos);

    if (pos < max) { continue; }

    haveEndMarker = true;
    // found!
    break;
  }

  // If a fence has heading spaces, they should be removed from its inner block
  len = state.sCount[startLine];

  state.line = nextLine + (haveEndMarker ? 1 : 0);

  token         = state.push('fence', 'code', 0);
  token.info    = params;
  token.content = state.getLines(startLine + 1, nextLine, len, true);
  token.markup  = markup;
  token.map     = [ startLine, state.line ];

  return true;
};

},{}],128:[function(require,module,exports){
// heading (#, ##, ...)

'use strict';

var isSpace = require('../common/utils').isSpace;


module.exports = function heading(state, startLine, endLine, silent) {
  var ch, level, tmp, token,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  ch  = state.src.charCodeAt(pos);

  if (ch !== 0x23/* # */ || pos >= max) { return false; }

  // count heading level
  level = 1;
  ch = state.src.charCodeAt(++pos);
  while (ch === 0x23/* # */ && pos < max && level <= 6) {
    level++;
    ch = state.src.charCodeAt(++pos);
  }

  if (level > 6 || (pos < max && ch !== 0x20/* space */)) { return false; }

  if (silent) { return true; }

  // Let's cut tails like '    ###  ' from the end of string

  max = state.skipSpacesBack(max, pos);
  tmp = state.skipCharsBack(max, 0x23, pos); // #
  if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) {
    max = tmp;
  }

  state.line = startLine + 1;

  token        = state.push('heading_open', 'h' + String(level), 1);
  token.markup = '########'.slice(0, level);
  token.map    = [ startLine, state.line ];

  token          = state.push('inline', '', 0);
  token.content  = state.src.slice(pos, max).trim();
  token.map      = [ startLine, state.line ];
  token.children = [];

  token        = state.push('heading_close', 'h' + String(level), -1);
  token.markup = '########'.slice(0, level);

  return true;
};

},{"../common/utils":111}],129:[function(require,module,exports){
// Horizontal rule

'use strict';

var isSpace = require('../common/utils').isSpace;


module.exports = function hr(state, startLine, endLine, silent) {
  var marker, cnt, ch, token,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  marker = state.src.charCodeAt(pos++);

  // Check hr marker
  if (marker !== 0x2A/* * */ &&
      marker !== 0x2D/* - */ &&
      marker !== 0x5F/* _ */) {
    return false;
  }

  // markers can be mixed with spaces, but there should be at least 3 of them

  cnt = 1;
  while (pos < max) {
    ch = state.src.charCodeAt(pos++);
    if (ch !== marker && !isSpace(ch)) { return false; }
    if (ch === marker) { cnt++; }
  }

  if (cnt < 3) { return false; }

  if (silent) { return true; }

  state.line = startLine + 1;

  token        = state.push('hr', 'hr', 0);
  token.map    = [ startLine, state.line ];
  token.markup = Array(cnt + 1).join(String.fromCharCode(marker));

  return true;
};

},{"../common/utils":111}],130:[function(require,module,exports){
// HTML block

'use strict';


var block_names = require('../common/html_blocks');
var HTML_OPEN_CLOSE_TAG_RE = require('../common/html_re').HTML_OPEN_CLOSE_TAG_RE;

// An array of opening and corresponding closing sequences for html tags,
// last argument defines whether it can terminate a paragraph or not
//
var HTML_SEQUENCES = [
  [ /^<(script|pre|style)(?=(\s|>|$))/i, /<\/(script|pre|style)>/i, true ],
  [ /^<!--/,        /-->/,   true ],
  [ /^<\?/,         /\?>/,   true ],
  [ /^<![A-Z]/,     />/,     true ],
  [ /^<!\[CDATA\[/, /\]\]>/, true ],
  [ new RegExp('^</?(' + block_names.join('|') + ')(?=(\\s|/?>|$))', 'i'), /^$/, true ],
  [ new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + '\\s*$'),  /^$/, false ]
];


module.exports = function html_block(state, startLine, endLine, silent) {
  var i, nextLine, token, lineText,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  if (!state.md.options.html) { return false; }

  if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false; }

  lineText = state.src.slice(pos, max);

  for (i = 0; i < HTML_SEQUENCES.length; i++) {
    if (HTML_SEQUENCES[i][0].test(lineText)) { break; }
  }

  if (i === HTML_SEQUENCES.length) { return false; }

  if (silent) {
    // true if this sequence can be a terminator, false otherwise
    return HTML_SEQUENCES[i][2];
  }

  nextLine = startLine + 1;

  // If we are here - we detected HTML block.
  // Let's roll down till block end.
  if (!HTML_SEQUENCES[i][1].test(lineText)) {
    for (; nextLine < endLine; nextLine++) {
      if (state.sCount[nextLine] < state.blkIndent) { break; }

      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];
      lineText = state.src.slice(pos, max);

      if (HTML_SEQUENCES[i][1].test(lineText)) {
        if (lineText.length !== 0) { nextLine++; }
        break;
      }
    }
  }

  state.line = nextLine;

  token         = state.push('html_block', '', 0);
  token.map     = [ startLine, nextLine ];
  token.content = state.getLines(startLine, nextLine, state.blkIndent, true);

  return true;
};

},{"../common/html_blocks":108,"../common/html_re":109}],131:[function(require,module,exports){
// lheading (---, ===)

'use strict';


module.exports = function lheading(state, startLine, endLine/*, silent*/) {
  var marker, pos, max, token, level,
      next = startLine + 1;

  if (next >= endLine) { return false; }
  if (state.sCount[next] < state.blkIndent) { return false; }

  // Scan next line

  if (state.sCount[next] - state.blkIndent > 3) { return false; }

  pos = state.bMarks[next] + state.tShift[next];
  max = state.eMarks[next];

  if (pos >= max) { return false; }

  marker = state.src.charCodeAt(pos);

  if (marker !== 0x2D/* - */ && marker !== 0x3D/* = */) { return false; }

  pos = state.skipChars(pos, marker);

  pos = state.skipSpaces(pos);

  if (pos < max) { return false; }

  pos = state.bMarks[startLine] + state.tShift[startLine];

  state.line = next + 1;
  level = (marker === 0x3D/* = */ ? 1 : 2);

  token          = state.push('heading_open', 'h' + String(level), 1);
  token.markup   = String.fromCharCode(marker);
  token.map      = [ startLine, state.line ];

  token          = state.push('inline', '', 0);
  token.content  = state.src.slice(pos, state.eMarks[startLine]).trim();
  token.map      = [ startLine, state.line - 1 ];
  token.children = [];

  token          = state.push('heading_close', 'h' + String(level), -1);
  token.markup   = String.fromCharCode(marker);

  return true;
};

},{}],132:[function(require,module,exports){
// Lists

'use strict';

var isSpace = require('../common/utils').isSpace;


// Search `[-+*][\n ]`, returns next pos arter marker on success
// or -1 on fail.
function skipBulletListMarker(state, startLine) {
  var marker, pos, max, ch;

  pos = state.bMarks[startLine] + state.tShift[startLine];
  max = state.eMarks[startLine];

  marker = state.src.charCodeAt(pos++);
  // Check bullet
  if (marker !== 0x2A/* * */ &&
      marker !== 0x2D/* - */ &&
      marker !== 0x2B/* + */) {
    return -1;
  }

  if (pos < max) {
    ch = state.src.charCodeAt(pos);

    if (!isSpace(ch)) {
      // " -test " - is not a list item
      return -1;
    }
  }

  return pos;
}

// Search `\d+[.)][\n ]`, returns next pos arter marker on success
// or -1 on fail.
function skipOrderedListMarker(state, startLine) {
  var ch,
      start = state.bMarks[startLine] + state.tShift[startLine],
      pos = start,
      max = state.eMarks[startLine];

  // List marker should have at least 2 chars (digit + dot)
  if (pos + 1 >= max) { return -1; }

  ch = state.src.charCodeAt(pos++);

  if (ch < 0x30/* 0 */ || ch > 0x39/* 9 */) { return -1; }

  for (;;) {
    // EOL -> fail
    if (pos >= max) { return -1; }

    ch = state.src.charCodeAt(pos++);

    if (ch >= 0x30/* 0 */ && ch <= 0x39/* 9 */) {

      // List marker should have no more than 9 digits
      // (prevents integer overflow in browsers)
      if (pos - start >= 10) { return -1; }

      continue;
    }

    // found valid marker
    if (ch === 0x29/* ) */ || ch === 0x2e/* . */) {
      break;
    }

    return -1;
  }


  if (pos < max) {
    ch = state.src.charCodeAt(pos);

    if (!isSpace(ch)) {
      // " 1.test " - is not a list item
      return -1;
    }
  }
  return pos;
}

function markTightParagraphs(state, idx) {
  var i, l,
      level = state.level + 2;

  for (i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
    if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
      state.tokens[i + 2].hidden = true;
      state.tokens[i].hidden = true;
      i += 2;
    }
  }
}


module.exports = function list(state, startLine, endLine, silent) {
  var nextLine,
      initial,
      offset,
      indent,
      oldTShift,
      oldIndent,
      oldLIndent,
      oldTight,
      oldParentType,
      start,
      posAfterMarker,
      ch,
      pos,
      max,
      indentAfterMarker,
      markerValue,
      markerCharCode,
      isOrdered,
      contentStart,
      listTokIdx,
      prevEmptyEnd,
      listLines,
      itemLines,
      tight = true,
      terminatorRules,
      token,
      i, l, terminate;

  // Detect list type and position after marker
  if ((posAfterMarker = skipOrderedListMarker(state, startLine)) >= 0) {
    isOrdered = true;
  } else if ((posAfterMarker = skipBulletListMarker(state, startLine)) >= 0) {
    isOrdered = false;
  } else {
    return false;
  }

  // We should terminate list on style change. Remember first one to compare.
  markerCharCode = state.src.charCodeAt(posAfterMarker - 1);

  // For validation mode we can terminate immediately
  if (silent) { return true; }

  // Start list
  listTokIdx = state.tokens.length;

  if (isOrdered) {
    start = state.bMarks[startLine] + state.tShift[startLine];
    markerValue = Number(state.src.substr(start, posAfterMarker - start - 1));

    token       = state.push('ordered_list_open', 'ol', 1);
    if (markerValue !== 1) {
      token.attrs = [ [ 'start', markerValue ] ];
    }

  } else {
    token       = state.push('bullet_list_open', 'ul', 1);
  }

  token.map    = listLines = [ startLine, 0 ];
  token.markup = String.fromCharCode(markerCharCode);

  //
  // Iterate list items
  //

  nextLine = startLine;
  prevEmptyEnd = false;
  terminatorRules = state.md.block.ruler.getRules('list');

  while (nextLine < endLine) {
    pos = posAfterMarker;
    max = state.eMarks[nextLine];

    initial = offset = state.sCount[nextLine] + posAfterMarker - (state.bMarks[startLine] + state.tShift[startLine]);

    while (pos < max) {
      ch = state.src.charCodeAt(pos);

      if (isSpace(ch)) {
        if (ch === 0x09) {
          offset += 4 - offset % 4;
        } else {
          offset++;
        }
      } else {
        break;
      }

      pos++;
    }

    contentStart = pos;

    if (contentStart >= max) {
      // trimming space in "-    \n  3" case, indent is 1 here
      indentAfterMarker = 1;
    } else {
      indentAfterMarker = offset - initial;
    }

    // If we have more than 4 spaces, the indent is 1
    // (the rest is just indented code block)
    if (indentAfterMarker > 4) { indentAfterMarker = 1; }

    // "  -  test"
    //  ^^^^^ - calculating total length of this thing
    indent = initial + indentAfterMarker;

    // Run subparser & write tokens
    token        = state.push('list_item_open', 'li', 1);
    token.markup = String.fromCharCode(markerCharCode);
    token.map    = itemLines = [ startLine, 0 ];

    oldIndent = state.blkIndent;
    oldTight = state.tight;
    oldTShift = state.tShift[startLine];
    oldLIndent = state.sCount[startLine];
    oldParentType = state.parentType;
    state.blkIndent = indent;
    state.tight = true;
    state.parentType = 'list';
    state.tShift[startLine] = contentStart - state.bMarks[startLine];
    state.sCount[startLine] = offset;

    state.md.block.tokenize(state, startLine, endLine, true);

    // If any of list item is tight, mark list as tight
    if (!state.tight || prevEmptyEnd) {
      tight = false;
    }
    // Item become loose if finish with empty line,
    // but we should filter last element, because it means list finish
    prevEmptyEnd = (state.line - startLine) > 1 && state.isEmpty(state.line - 1);

    state.blkIndent = oldIndent;
    state.tShift[startLine] = oldTShift;
    state.sCount[startLine] = oldLIndent;
    state.tight = oldTight;
    state.parentType = oldParentType;

    token        = state.push('list_item_close', 'li', -1);
    token.markup = String.fromCharCode(markerCharCode);

    nextLine = startLine = state.line;
    itemLines[1] = nextLine;
    contentStart = state.bMarks[startLine];

    if (nextLine >= endLine) { break; }

    if (state.isEmpty(nextLine)) {
      break;
    }

    //
    // Try to check if list is terminated or continued.
    //
    if (state.sCount[nextLine] < state.blkIndent) { break; }

    // fail if terminating block found
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) { break; }

    // fail if list has another type
    if (isOrdered) {
      posAfterMarker = skipOrderedListMarker(state, nextLine);
      if (posAfterMarker < 0) { break; }
    } else {
      posAfterMarker = skipBulletListMarker(state, nextLine);
      if (posAfterMarker < 0) { break; }
    }

    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) { break; }
  }

  // Finilize list
  if (isOrdered) {
    token = state.push('ordered_list_close', 'ol', -1);
  } else {
    token = state.push('bullet_list_close', 'ul', -1);
  }
  token.markup = String.fromCharCode(markerCharCode);

  listLines[1] = nextLine;
  state.line = nextLine;

  // mark paragraphs tight if needed
  if (tight) {
    markTightParagraphs(state, listTokIdx);
  }

  return true;
};

},{"../common/utils":111}],133:[function(require,module,exports){
// Paragraph

'use strict';


module.exports = function paragraph(state, startLine/*, endLine*/) {
  var content, terminate, i, l, token,
      nextLine = startLine + 1,
      terminatorRules = state.md.block.ruler.getRules('paragraph'),
      endLine = state.lineMax;

  // jump line-by-line until empty one or EOF
  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    // this would be a code block normally, but after paragraph
    // it's considered a lazy continuation regardless of what's there
    if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }

    // quirk for blockquotes, this line should already be checked by that rule
    if (state.sCount[nextLine] < 0) { continue; }

    // Some tags can terminate paragraph without empty line.
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) { break; }
  }

  content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();

  state.line = nextLine;

  token          = state.push('paragraph_open', 'p', 1);
  token.map      = [ startLine, state.line ];

  token          = state.push('inline', '', 0);
  token.content  = content;
  token.map      = [ startLine, state.line ];
  token.children = [];

  token          = state.push('paragraph_close', 'p', -1);

  return true;
};

},{}],134:[function(require,module,exports){
'use strict';


var parseLinkDestination = require('../helpers/parse_link_destination');
var parseLinkTitle       = require('../helpers/parse_link_title');
var normalizeReference   = require('../common/utils').normalizeReference;
var isSpace              = require('../common/utils').isSpace;


module.exports = function reference(state, startLine, _endLine, silent) {
  var ch,
      destEndPos,
      destEndLineNo,
      endLine,
      href,
      i,
      l,
      label,
      labelEnd,
      res,
      start,
      str,
      terminate,
      terminatorRules,
      title,
      lines = 0,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine],
      nextLine = startLine + 1;

  if (state.src.charCodeAt(pos) !== 0x5B/* [ */) { return false; }

  // Simple check to quickly interrupt scan on [link](url) at the start of line.
  // Can be useful on practice: https://github.com/markdown-it/markdown-it/issues/54
  while (++pos < max) {
    if (state.src.charCodeAt(pos) === 0x5D /* ] */ &&
        state.src.charCodeAt(pos - 1) !== 0x5C/* \ */) {
      if (pos + 1 === max) { return false; }
      if (state.src.charCodeAt(pos + 1) !== 0x3A/* : */) { return false; }
      break;
    }
  }

  endLine = state.lineMax;

  // jump line-by-line until empty one or EOF
  terminatorRules = state.md.block.ruler.getRules('reference');

  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    // this would be a code block normally, but after paragraph
    // it's considered a lazy continuation regardless of what's there
    if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }

    // quirk for blockquotes, this line should already be checked by that rule
    if (state.sCount[nextLine] < 0) { continue; }

    // Some tags can terminate paragraph without empty line.
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) { break; }
  }

  str = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
  max = str.length;

  for (pos = 1; pos < max; pos++) {
    ch = str.charCodeAt(pos);
    if (ch === 0x5B /* [ */) {
      return false;
    } else if (ch === 0x5D /* ] */) {
      labelEnd = pos;
      break;
    } else if (ch === 0x0A /* \n */) {
      lines++;
    } else if (ch === 0x5C /* \ */) {
      pos++;
      if (pos < max && str.charCodeAt(pos) === 0x0A) {
        lines++;
      }
    }
  }

  if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 0x3A/* : */) { return false; }

  // [label]:   destination   'title'
  //         ^^^ skip optional whitespace here
  for (pos = labelEnd + 2; pos < max; pos++) {
    ch = str.charCodeAt(pos);
    if (ch === 0x0A) {
      lines++;
    } else if (isSpace(ch)) {
      /*eslint no-empty:0*/
    } else {
      break;
    }
  }

  // [label]:   destination   'title'
  //            ^^^^^^^^^^^ parse this
  res = parseLinkDestination(str, pos, max);
  if (!res.ok) { return false; }

  href = state.md.normalizeLink(res.str);
  if (!state.md.validateLink(href)) { return false; }

  pos = res.pos;
  lines += res.lines;

  // save cursor state, we could require to rollback later
  destEndPos = pos;
  destEndLineNo = lines;

  // [label]:   destination   'title'
  //                       ^^^ skipping those spaces
  start = pos;
  for (; pos < max; pos++) {
    ch = str.charCodeAt(pos);
    if (ch === 0x0A) {
      lines++;
    } else if (isSpace(ch)) {
      /*eslint no-empty:0*/
    } else {
      break;
    }
  }

  // [label]:   destination   'title'
  //                          ^^^^^^^ parse this
  res = parseLinkTitle(str, pos, max);
  if (pos < max && start !== pos && res.ok) {
    title = res.str;
    pos = res.pos;
    lines += res.lines;
  } else {
    title = '';
    pos = destEndPos;
    lines = destEndLineNo;
  }

  // skip trailing spaces until the rest of the line
  while (pos < max) {
    ch = str.charCodeAt(pos);
    if (!isSpace(ch)) { break; }
    pos++;
  }

  if (pos < max && str.charCodeAt(pos) !== 0x0A) {
    if (title) {
      // garbage at the end of the line after title,
      // but it could still be a valid reference if we roll back
      title = '';
      pos = destEndPos;
      lines = destEndLineNo;
      while (pos < max) {
        ch = str.charCodeAt(pos);
        if (!isSpace(ch)) { break; }
        pos++;
      }
    }
  }

  if (pos < max && str.charCodeAt(pos) !== 0x0A) {
    // garbage at the end of the line
    return false;
  }

  label = normalizeReference(str.slice(1, labelEnd));
  if (!label) {
    // CommonMark 0.20 disallows empty labels
    return false;
  }

  // Reference can not terminate anything. This check is for safety only.
  /*istanbul ignore if*/
  if (silent) { return true; }

  if (typeof state.env.references === 'undefined') {
    state.env.references = {};
  }
  if (typeof state.env.references[label] === 'undefined') {
    state.env.references[label] = { title: title, href: href };
  }

  state.line = startLine + lines + 1;
  return true;
};

},{"../common/utils":111,"../helpers/parse_link_destination":113,"../helpers/parse_link_title":115}],135:[function(require,module,exports){
// Parser state class

'use strict';

var Token = require('../token');
var isSpace = require('../common/utils').isSpace;


function StateBlock(src, md, env, tokens) {
  var ch, s, start, pos, len, indent, offset, indent_found;

  this.src = src;

  // link to parser instance
  this.md     = md;

  this.env = env;

  //
  // Internal state vartiables
  //

  this.tokens = tokens;

  this.bMarks = [];  // line begin offsets for fast jumps
  this.eMarks = [];  // line end offsets for fast jumps
  this.tShift = [];  // offsets of the first non-space characters (tabs not expanded)
  this.sCount = [];  // indents for each line (tabs expanded)

  // block parser variables
  this.blkIndent  = 0; // required block content indent
                       // (for example, if we are in list)
  this.line       = 0; // line index in src
  this.lineMax    = 0; // lines count
  this.tight      = false;  // loose/tight mode for lists
  this.parentType = 'root'; // if `list`, block parser stops on two newlines
  this.ddIndent   = -1; // indent of the current dd block (-1 if there isn't any)

  this.level = 0;

  // renderer
  this.result = '';

  // Create caches
  // Generate markers.
  s = this.src;
  indent_found = false;

  for (start = pos = indent = offset = 0, len = s.length; pos < len; pos++) {
    ch = s.charCodeAt(pos);

    if (!indent_found) {
      if (isSpace(ch)) {
        indent++;

        if (ch === 0x09) {
          offset += 4 - offset % 4;
        } else {
          offset++;
        }
        continue;
      } else {
        indent_found = true;
      }
    }

    if (ch === 0x0A || pos === len - 1) {
      if (ch !== 0x0A) { pos++; }
      this.bMarks.push(start);
      this.eMarks.push(pos);
      this.tShift.push(indent);
      this.sCount.push(offset);

      indent_found = false;
      indent = 0;
      offset = 0;
      start = pos + 1;
    }
  }

  // Push fake entry to simplify cache bounds checks
  this.bMarks.push(s.length);
  this.eMarks.push(s.length);
  this.tShift.push(0);
  this.sCount.push(0);

  this.lineMax = this.bMarks.length - 1; // don't count last fake line
}

// Push new token to "stream".
//
StateBlock.prototype.push = function (type, tag, nesting) {
  var token = new Token(type, tag, nesting);
  token.block = true;

  if (nesting < 0) { this.level--; }
  token.level = this.level;
  if (nesting > 0) { this.level++; }

  this.tokens.push(token);
  return token;
};

StateBlock.prototype.isEmpty = function isEmpty(line) {
  return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
};

StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
  for (var max = this.lineMax; from < max; from++) {
    if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
      break;
    }
  }
  return from;
};

// Skip spaces from given position.
StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
  var ch;

  for (var max = this.src.length; pos < max; pos++) {
    ch = this.src.charCodeAt(pos);
    if (!isSpace(ch)) { break; }
  }
  return pos;
};

// Skip spaces from given position in reverse.
StateBlock.prototype.skipSpacesBack = function skipSpacesBack(pos, min) {
  if (pos <= min) { return pos; }

  while (pos > min) {
    if (!isSpace(this.src.charCodeAt(--pos))) { return pos + 1; }
  }
  return pos;
};

// Skip char codes from given position
StateBlock.prototype.skipChars = function skipChars(pos, code) {
  for (var max = this.src.length; pos < max; pos++) {
    if (this.src.charCodeAt(pos) !== code) { break; }
  }
  return pos;
};

// Skip char codes reverse from given position - 1
StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code, min) {
  if (pos <= min) { return pos; }

  while (pos > min) {
    if (code !== this.src.charCodeAt(--pos)) { return pos + 1; }
  }
  return pos;
};

// cut lines range from source.
StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
  var i, lineIndent, ch, first, last, queue, lineStart,
      line = begin;

  if (begin >= end) {
    return '';
  }

  queue = new Array(end - begin);

  for (i = 0; line < end; line++, i++) {
    lineIndent = 0;
    lineStart = first = this.bMarks[line];

    if (line + 1 < end || keepLastLF) {
      // No need for bounds check because we have fake entry on tail.
      last = this.eMarks[line] + 1;
    } else {
      last = this.eMarks[line];
    }

    while (first < last && lineIndent < indent) {
      ch = this.src.charCodeAt(first);

      if (isSpace(ch)) {
        if (ch === 0x09) {
          lineIndent += 4 - lineIndent % 4;
        } else {
          lineIndent++;
        }
      } else if (first - lineStart < this.tShift[line]) {
        // patched tShift masked characters to look like spaces (blockquotes, list markers)
        lineIndent++;
      } else {
        break;
      }

      first++;
    }

    queue[i] = this.src.slice(first, last);
  }

  return queue.join('');
};

// re-export Token class to use in block rules
StateBlock.prototype.Token = Token;


module.exports = StateBlock;

},{"../common/utils":111,"../token":158}],136:[function(require,module,exports){
// GFM table, non-standard

'use strict';


function getLine(state, line) {
  var pos = state.bMarks[line] + state.blkIndent,
      max = state.eMarks[line];

  return state.src.substr(pos, max - pos);
}

function escapedSplit(str) {
  var result = [],
      pos = 0,
      max = str.length,
      ch,
      escapes = 0,
      lastPos = 0,
      backTicked = false,
      lastBackTick = 0;

  ch  = str.charCodeAt(pos);

  while (pos < max) {
    if (ch === 0x60/* ` */ && (escapes % 2 === 0)) {
      backTicked = !backTicked;
      lastBackTick = pos;
    } else if (ch === 0x7c/* | */ && (escapes % 2 === 0) && !backTicked) {
      result.push(str.substring(lastPos, pos));
      lastPos = pos + 1;
    } else if (ch === 0x5c/* \ */) {
      escapes++;
    } else {
      escapes = 0;
    }

    pos++;

    // If there was an un-closed backtick, go back to just after
    // the last backtick, but as if it was a normal character
    if (pos === max && backTicked) {
      backTicked = false;
      pos = lastBackTick + 1;
    }

    ch = str.charCodeAt(pos);
  }

  result.push(str.substring(lastPos));

  return result;
}


module.exports = function table(state, startLine, endLine, silent) {
  var ch, lineText, pos, i, nextLine, rows, token,
      aligns, t, tableLines, tbodyLines;

  // should have at least three lines
  if (startLine + 2 > endLine) { return false; }

  nextLine = startLine + 1;

  if (state.sCount[nextLine] < state.blkIndent) { return false; }

  // first character of the second line should be '|' or '-'

  pos = state.bMarks[nextLine] + state.tShift[nextLine];
  if (pos >= state.eMarks[nextLine]) { return false; }

  ch = state.src.charCodeAt(pos);
  if (ch !== 0x7C/* | */ && ch !== 0x2D/* - */ && ch !== 0x3A/* : */) { return false; }

  lineText = getLine(state, startLine + 1);
  if (!/^[-:| ]+$/.test(lineText)) { return false; }

  rows = lineText.split('|');
  if (rows.length < 2) { return false; }
  aligns = [];
  for (i = 0; i < rows.length; i++) {
    t = rows[i].trim();
    if (!t) {
      // allow empty columns before and after table, but not in between columns;
      // e.g. allow ` |---| `, disallow ` ---||--- `
      if (i === 0 || i === rows.length - 1) {
        continue;
      } else {
        return false;
      }
    }

    if (!/^:?-+:?$/.test(t)) { return false; }
    if (t.charCodeAt(t.length - 1) === 0x3A/* : */) {
      aligns.push(t.charCodeAt(0) === 0x3A/* : */ ? 'center' : 'right');
    } else if (t.charCodeAt(0) === 0x3A/* : */) {
      aligns.push('left');
    } else {
      aligns.push('');
    }
  }

  lineText = getLine(state, startLine).trim();
  if (lineText.indexOf('|') === -1) { return false; }
  rows = escapedSplit(lineText.replace(/^\||\|$/g, ''));
  if (aligns.length !== rows.length) { return false; }
  if (silent) { return true; }

  token     = state.push('table_open', 'table', 1);
  token.map = tableLines = [ startLine, 0 ];

  token     = state.push('thead_open', 'thead', 1);
  token.map = [ startLine, startLine + 1 ];

  token     = state.push('tr_open', 'tr', 1);
  token.map = [ startLine, startLine + 1 ];

  for (i = 0; i < rows.length; i++) {
    token          = state.push('th_open', 'th', 1);
    token.map      = [ startLine, startLine + 1 ];
    if (aligns[i]) {
      token.attrs  = [ [ 'style', 'text-align:' + aligns[i] ] ];
    }

    token          = state.push('inline', '', 0);
    token.content  = rows[i].trim();
    token.map      = [ startLine, startLine + 1 ];
    token.children = [];

    token          = state.push('th_close', 'th', -1);
  }

  token     = state.push('tr_close', 'tr', -1);
  token     = state.push('thead_close', 'thead', -1);

  token     = state.push('tbody_open', 'tbody', 1);
  token.map = tbodyLines = [ startLine + 2, 0 ];

  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < state.blkIndent) { break; }

    lineText = getLine(state, nextLine).trim();
    if (lineText.indexOf('|') === -1) { break; }
    rows = escapedSplit(lineText.replace(/^\||\|$/g, ''));

    // set number of columns to number of columns in header row
    rows.length = aligns.length;

    token = state.push('tr_open', 'tr', 1);
    for (i = 0; i < rows.length; i++) {
      token          = state.push('td_open', 'td', 1);
      if (aligns[i]) {
        token.attrs  = [ [ 'style', 'text-align:' + aligns[i] ] ];
      }

      token          = state.push('inline', '', 0);
      token.content  = rows[i] ? rows[i].trim() : '';
      token.children = [];

      token          = state.push('td_close', 'td', -1);
    }
    token = state.push('tr_close', 'tr', -1);
  }
  token = state.push('tbody_close', 'tbody', -1);
  token = state.push('table_close', 'table', -1);

  tableLines[1] = tbodyLines[1] = nextLine;
  state.line = nextLine;
  return true;
};

},{}],137:[function(require,module,exports){
'use strict';


module.exports = function block(state) {
  var token;

  if (state.inlineMode) {
    token          = new state.Token('inline', '', 0);
    token.content  = state.src;
    token.map      = [ 0, 1 ];
    token.children = [];
    state.tokens.push(token);
  } else {
    state.md.block.parse(state.src, state.md, state.env, state.tokens);
  }
};

},{}],138:[function(require,module,exports){
'use strict';

module.exports = function inline(state) {
  var tokens = state.tokens, tok, i, l;

  // Parse inlines
  for (i = 0, l = tokens.length; i < l; i++) {
    tok = tokens[i];
    if (tok.type === 'inline') {
      state.md.inline.parse(tok.content, state.md, state.env, tok.children);
    }
  }
};

},{}],139:[function(require,module,exports){
// Replace link-like texts with link nodes.
//
// Currently restricted by `md.validateLink()` to http/https/ftp
//
'use strict';


var arrayReplaceAt = require('../common/utils').arrayReplaceAt;


function isLinkOpen(str) {
  return /^<a[>\s]/i.test(str);
}
function isLinkClose(str) {
  return /^<\/a\s*>/i.test(str);
}


module.exports = function linkify(state) {
  var i, j, l, tokens, token, currentToken, nodes, ln, text, pos, lastPos,
      level, htmlLinkLevel, url, fullUrl, urlText,
      blockTokens = state.tokens,
      links;

  if (!state.md.options.linkify) { return; }

  for (j = 0, l = blockTokens.length; j < l; j++) {
    if (blockTokens[j].type !== 'inline' ||
        !state.md.linkify.pretest(blockTokens[j].content)) {
      continue;
    }

    tokens = blockTokens[j].children;

    htmlLinkLevel = 0;

    // We scan from the end, to keep position when new tags added.
    // Use reversed logic in links start/end match
    for (i = tokens.length - 1; i >= 0; i--) {
      currentToken = tokens[i];

      // Skip content of markdown links
      if (currentToken.type === 'link_close') {
        i--;
        while (tokens[i].level !== currentToken.level && tokens[i].type !== 'link_open') {
          i--;
        }
        continue;
      }

      // Skip content of html tag links
      if (currentToken.type === 'html_inline') {
        if (isLinkOpen(currentToken.content) && htmlLinkLevel > 0) {
          htmlLinkLevel--;
        }
        if (isLinkClose(currentToken.content)) {
          htmlLinkLevel++;
        }
      }
      if (htmlLinkLevel > 0) { continue; }

      if (currentToken.type === 'text' && state.md.linkify.test(currentToken.content)) {

        text = currentToken.content;
        links = state.md.linkify.match(text);

        // Now split string to nodes
        nodes = [];
        level = currentToken.level;
        lastPos = 0;

        for (ln = 0; ln < links.length; ln++) {

          url = links[ln].url;
          fullUrl = state.md.normalizeLink(url);
          if (!state.md.validateLink(fullUrl)) { continue; }

          urlText = links[ln].text;

          // Linkifier might send raw hostnames like "example.com", where url
          // starts with domain name. So we prepend http:// in those cases,
          // and remove it afterwards.
          //
          if (!links[ln].schema) {
            urlText = state.md.normalizeLinkText('http://' + urlText).replace(/^http:\/\//, '');
          } else if (links[ln].schema === 'mailto:' && !/^mailto:/i.test(urlText)) {
            urlText = state.md.normalizeLinkText('mailto:' + urlText).replace(/^mailto:/, '');
          } else {
            urlText = state.md.normalizeLinkText(urlText);
          }

          pos = links[ln].index;

          if (pos > lastPos) {
            token         = new state.Token('text', '', 0);
            token.content = text.slice(lastPos, pos);
            token.level   = level;
            nodes.push(token);
          }

          token         = new state.Token('link_open', 'a', 1);
          token.attrs   = [ [ 'href', fullUrl ] ];
          token.level   = level++;
          token.markup  = 'linkify';
          token.info    = 'auto';
          nodes.push(token);

          token         = new state.Token('text', '', 0);
          token.content = urlText;
          token.level   = level;
          nodes.push(token);

          token         = new state.Token('link_close', 'a', -1);
          token.level   = --level;
          token.markup  = 'linkify';
          token.info    = 'auto';
          nodes.push(token);

          lastPos = links[ln].lastIndex;
        }
        if (lastPos < text.length) {
          token         = new state.Token('text', '', 0);
          token.content = text.slice(lastPos);
          token.level   = level;
          nodes.push(token);
        }

        // replace current node
        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
      }
    }
  }
};

},{"../common/utils":111}],140:[function(require,module,exports){
// Normalize input string

'use strict';


var NEWLINES_RE  = /\r[\n\u0085]|[\u2424\u2028\u0085]/g;
var NULL_RE      = /\u0000/g;


module.exports = function inline(state) {
  var str;

  // Normalize newlines
  str = state.src.replace(NEWLINES_RE, '\n');

  // Replace NULL characters
  str = str.replace(NULL_RE, '\uFFFD');

  state.src = str;
};

},{}],141:[function(require,module,exports){
// Simple typographyc replacements
//
// (c) (C) → ©
// (tm) (TM) → ™
// (r) (R) → ®
// +- → ±
// (p) (P) -> §
// ... → … (also ?.... → ?.., !.... → !..)
// ???????? → ???, !!!!! → !!!, `,,` → `,`
// -- → &ndash;, --- → &mdash;
//
'use strict';

// TODO:
// - fractionals 1/2, 1/4, 3/4 -> ½, ¼, ¾
// - miltiplication 2 x 4 -> 2 × 4

var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;

// Workaround for phantomjs - need regex without /g flag,
// or root check will fail every second time
var SCOPED_ABBR_TEST_RE = /\((c|tm|r|p)\)/i;

var SCOPED_ABBR_RE = /\((c|tm|r|p)\)/ig;
var SCOPED_ABBR = {
  'c': '©',
  'r': '®',
  'p': '§',
  'tm': '™'
};

function replaceFn(match, name) {
  return SCOPED_ABBR[name.toLowerCase()];
}

function replace_scoped(inlineTokens) {
  var i, token;

  for (i = inlineTokens.length - 1; i >= 0; i--) {
    token = inlineTokens[i];
    if (token.type === 'text') {
      token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
    }
  }
}

function replace_rare(inlineTokens) {
  var i, token;

  for (i = inlineTokens.length - 1; i >= 0; i--) {
    token = inlineTokens[i];
    if (token.type === 'text') {
      if (RARE_RE.test(token.content)) {
        token.content = token.content
                    .replace(/\+-/g, '±')
                    // .., ..., ....... -> …
                    // but ?..... & !..... -> ?.. & !..
                    .replace(/\.{2,}/g, '…').replace(/([?!])…/g, '$1..')
                    .replace(/([?!]){4,}/g, '$1$1$1').replace(/,{2,}/g, ',')
                    // em-dash
                    .replace(/(^|[^-])---([^-]|$)/mg, '$1\u2014$2')
                    // en-dash
                    .replace(/(^|\s)--(\s|$)/mg, '$1\u2013$2')
                    .replace(/(^|[^-\s])--([^-\s]|$)/mg, '$1\u2013$2');
      }
    }
  }
}


module.exports = function replace(state) {
  var blkIdx;

  if (!state.md.options.typographer) { return; }

  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {

    if (state.tokens[blkIdx].type !== 'inline') { continue; }

    if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) {
      replace_scoped(state.tokens[blkIdx].children);
    }

    if (RARE_RE.test(state.tokens[blkIdx].content)) {
      replace_rare(state.tokens[blkIdx].children);
    }

  }
};

},{}],142:[function(require,module,exports){
// Convert straight quotation marks to typographic ones
//
'use strict';


var isWhiteSpace   = require('../common/utils').isWhiteSpace;
var isPunctChar    = require('../common/utils').isPunctChar;
var isMdAsciiPunct = require('../common/utils').isMdAsciiPunct;

var QUOTE_TEST_RE = /['"]/;
var QUOTE_RE = /['"]/g;
var APOSTROPHE = '\u2019'; /* ’ */


function replaceAt(str, index, ch) {
  return str.substr(0, index) + ch + str.substr(index + 1);
}

function process_inlines(tokens, state) {
  var i, token, text, t, pos, max, thisLevel, item, lastChar, nextChar,
      isLastPunctChar, isNextPunctChar, isLastWhiteSpace, isNextWhiteSpace,
      canOpen, canClose, j, isSingle, stack, openQuote, closeQuote;

  stack = [];

  for (i = 0; i < tokens.length; i++) {
    token = tokens[i];

    thisLevel = tokens[i].level;

    for (j = stack.length - 1; j >= 0; j--) {
      if (stack[j].level <= thisLevel) { break; }
    }
    stack.length = j + 1;

    if (token.type !== 'text') { continue; }

    text = token.content;
    pos = 0;
    max = text.length;

    /*eslint no-labels:0,block-scoped-var:0*/
    OUTER:
    while (pos < max) {
      QUOTE_RE.lastIndex = pos;
      t = QUOTE_RE.exec(text);
      if (!t) { break; }

      canOpen = canClose = true;
      pos = t.index + 1;
      isSingle = (t[0] === "'");

      // treat begin/end of the line as a whitespace
      lastChar = t.index - 1 >= 0 ? text.charCodeAt(t.index - 1) : 0x20;
      nextChar = pos < max ? text.charCodeAt(pos) : 0x20;

      isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
      isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));

      isLastWhiteSpace = isWhiteSpace(lastChar);
      isNextWhiteSpace = isWhiteSpace(nextChar);

      if (isNextWhiteSpace) {
        canOpen = false;
      } else if (isNextPunctChar) {
        if (!(isLastWhiteSpace || isLastPunctChar)) {
          canOpen = false;
        }
      }

      if (isLastWhiteSpace) {
        canClose = false;
      } else if (isLastPunctChar) {
        if (!(isNextWhiteSpace || isNextPunctChar)) {
          canClose = false;
        }
      }

      if (nextChar === 0x22 /* " */ && t[0] === '"') {
        if (lastChar >= 0x30 /* 0 */ && lastChar <= 0x39 /* 9 */) {
          // special case: 1"" - count first quote as an inch
          canClose = canOpen = false;
        }
      }

      if (canOpen && canClose) {
        // treat this as the middle of the word
        canOpen = false;
        canClose = isNextPunctChar;
      }

      if (!canOpen && !canClose) {
        // middle of word
        if (isSingle) {
          token.content = replaceAt(token.content, t.index, APOSTROPHE);
        }
        continue;
      }

      if (canClose) {
        // this could be a closing quote, rewind the stack to get a match
        for (j = stack.length - 1; j >= 0; j--) {
          item = stack[j];
          if (stack[j].level < thisLevel) { break; }
          if (item.single === isSingle && stack[j].level === thisLevel) {
            item = stack[j];

            if (isSingle) {
              openQuote = state.md.options.quotes[2];
              closeQuote = state.md.options.quotes[3];
            } else {
              openQuote = state.md.options.quotes[0];
              closeQuote = state.md.options.quotes[1];
            }

            // replace token.content *before* tokens[item.token].content,
            // because, if they are pointing at the same token, replaceAt
            // could mess up indices when quote length != 1
            token.content = replaceAt(token.content, t.index, closeQuote);
            tokens[item.token].content = replaceAt(
              tokens[item.token].content, item.pos, openQuote);

            pos += closeQuote.length - 1;
            if (item.token === i) { pos += openQuote.length - 1; }

            text = token.content;
            max = text.length;

            stack.length = j;
            continue OUTER;
          }
        }
      }

      if (canOpen) {
        stack.push({
          token: i,
          pos: t.index,
          single: isSingle,
          level: thisLevel
        });
      } else if (canClose && isSingle) {
        token.content = replaceAt(token.content, t.index, APOSTROPHE);
      }
    }
  }
}


module.exports = function smartquotes(state) {
  /*eslint max-depth:0*/
  var blkIdx;

  if (!state.md.options.typographer) { return; }

  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {

    if (state.tokens[blkIdx].type !== 'inline' ||
        !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) {
      continue;
    }

    process_inlines(state.tokens[blkIdx].children, state);
  }
};

},{"../common/utils":111}],143:[function(require,module,exports){
// Core state object
//
'use strict';

var Token = require('../token');


function StateCore(src, md, env) {
  this.src = src;
  this.env = env;
  this.tokens = [];
  this.inlineMode = false;
  this.md = md; // link to parser instance
}

// re-export Token class to use in core rules
StateCore.prototype.Token = Token;


module.exports = StateCore;

},{"../token":158}],144:[function(require,module,exports){
// Process autolinks '<protocol:...>'

'use strict';

var url_schemas = require('../common/url_schemas');


/*eslint max-len:0*/
var EMAIL_RE    = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;
var AUTOLINK_RE = /^<([a-zA-Z.\-]{1,25}):([^<>\x00-\x20]*)>/;


module.exports = function autolink(state, silent) {
  var tail, linkMatch, emailMatch, url, fullUrl, token,
      pos = state.pos;

  if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false; }

  tail = state.src.slice(pos);

  if (tail.indexOf('>') < 0) { return false; }

  if (AUTOLINK_RE.test(tail)) {
    linkMatch = tail.match(AUTOLINK_RE);

    if (url_schemas.indexOf(linkMatch[1].toLowerCase()) < 0) { return false; }

    url = linkMatch[0].slice(1, -1);
    fullUrl = state.md.normalizeLink(url);
    if (!state.md.validateLink(fullUrl)) { return false; }

    if (!silent) {
      token         = state.push('link_open', 'a', 1);
      token.attrs   = [ [ 'href', fullUrl ] ];

      token         = state.push('text', '', 0);
      token.content = state.md.normalizeLinkText(url);

      token         = state.push('link_close', 'a', -1);
    }

    state.pos += linkMatch[0].length;
    return true;
  }

  if (EMAIL_RE.test(tail)) {
    emailMatch = tail.match(EMAIL_RE);

    url = emailMatch[0].slice(1, -1);
    fullUrl = state.md.normalizeLink('mailto:' + url);
    if (!state.md.validateLink(fullUrl)) { return false; }

    if (!silent) {
      token         = state.push('link_open', 'a', 1);
      token.attrs   = [ [ 'href', fullUrl ] ];
      token.markup  = 'autolink';
      token.info    = 'auto';

      token         = state.push('text', '', 0);
      token.content = state.md.normalizeLinkText(url);

      token         = state.push('link_close', 'a', -1);
      token.markup  = 'autolink';
      token.info    = 'auto';
    }

    state.pos += emailMatch[0].length;
    return true;
  }

  return false;
};

},{"../common/url_schemas":110}],145:[function(require,module,exports){
// Parse backticks

'use strict';

module.exports = function backtick(state, silent) {
  var start, max, marker, matchStart, matchEnd, token,
      pos = state.pos,
      ch = state.src.charCodeAt(pos);

  if (ch !== 0x60/* ` */) { return false; }

  start = pos;
  pos++;
  max = state.posMax;

  while (pos < max && state.src.charCodeAt(pos) === 0x60/* ` */) { pos++; }

  marker = state.src.slice(start, pos);

  matchStart = matchEnd = pos;

  while ((matchStart = state.src.indexOf('`', matchEnd)) !== -1) {
    matchEnd = matchStart + 1;

    while (matchEnd < max && state.src.charCodeAt(matchEnd) === 0x60/* ` */) { matchEnd++; }

    if (matchEnd - matchStart === marker.length) {
      if (!silent) {
        token         = state.push('code_inline', 'code', 0);
        token.markup  = marker;
        token.content = state.src.slice(pos, matchStart)
                                 .replace(/[ \n]+/g, ' ')
                                 .trim();
      }
      state.pos = matchEnd;
      return true;
    }
  }

  if (!silent) { state.pending += marker; }
  state.pos += marker.length;
  return true;
};

},{}],146:[function(require,module,exports){
// For each opening emphasis-like marker find a matching closing one
//
'use strict';


module.exports = function link_pairs(state) {
  var i, j, lastDelim, currDelim,
      delimiters = state.delimiters,
      max = state.delimiters.length;

  for (i = 0; i < max; i++) {
    lastDelim = delimiters[i];

    if (!lastDelim.close) { continue; }

    j = i - lastDelim.jump - 1;

    while (j >= 0) {
      currDelim = delimiters[j];

      if (currDelim.open &&
          currDelim.marker === lastDelim.marker &&
          currDelim.end < 0 &&
          currDelim.level === lastDelim.level) {

        lastDelim.jump = i - j;
        lastDelim.open = false;
        currDelim.end  = i;
        currDelim.jump = 0;
        break;
      }

      j -= currDelim.jump + 1;
    }
  }
};

},{}],147:[function(require,module,exports){
// Process *this* and _that_
//
'use strict';


// Insert each marker as a separate text token, and add it to delimiter list
//
module.exports.tokenize = function emphasis(state, silent) {
  var i, scanned, token,
      start = state.pos,
      marker = state.src.charCodeAt(start);

  if (silent) { return false; }

  if (marker !== 0x5F /* _ */ && marker !== 0x2A /* * */) { return false; }

  scanned = state.scanDelims(state.pos, marker === 0x2A);

  for (i = 0; i < scanned.length; i++) {
    token         = state.push('text', '', 0);
    token.content = String.fromCharCode(marker);

    state.delimiters.push({
      // Char code of the starting marker (number).
      //
      marker: marker,

      // An amount of characters before this one that's equivalent to
      // current one. In plain English: if this delimiter does not open
      // an emphasis, neither do previous `jump` characters.
      //
      // Used to skip sequences like "*****" in one step, for 1st asterisk
      // value will be 0, for 2nd it's 1 and so on.
      //
      jump:   i,

      // A position of the token this delimiter corresponds to.
      //
      token:  state.tokens.length - 1,

      // Token level.
      //
      level:  state.level,

      // If this delimiter is matched as a valid opener, `end` will be
      // equal to its position, otherwise it's `-1`.
      //
      end:    -1,

      // Boolean flags that determine if this delimiter could open or close
      // an emphasis.
      //
      open:   scanned.can_open,
      close:  scanned.can_close
    });
  }

  state.pos += scanned.length;

  return true;
};


// Walk through delimiter list and replace text tokens with tags
//
module.exports.postProcess = function emphasis(state) {
  var i,
      startDelim,
      endDelim,
      token,
      ch,
      isStrong,
      delimiters = state.delimiters,
      max = state.delimiters.length;

  for (i = 0; i < max; i++) {
    startDelim = delimiters[i];

    if (startDelim.marker !== 0x5F/* _ */ && startDelim.marker !== 0x2A/* * */) {
      continue;
    }

    // Process only opening markers
    if (startDelim.end === -1) {
      continue;
    }

    endDelim = delimiters[startDelim.end];

    // If the next delimiter has the same marker and is adjacent to this one,
    // merge those into one strong delimiter.
    //
    // `<em><em>whatever</em></em>` -> `<strong>whatever</strong>`
    //
    isStrong = i + 1 < max &&
               delimiters[i + 1].end === startDelim.end - 1 &&
               delimiters[i + 1].token === startDelim.token + 1 &&
               delimiters[startDelim.end - 1].token === endDelim.token - 1 &&
               delimiters[i + 1].marker === startDelim.marker;

    ch = String.fromCharCode(startDelim.marker);

    token         = state.tokens[startDelim.token];
    token.type    = isStrong ? 'strong_open' : 'em_open';
    token.tag     = isStrong ? 'strong' : 'em';
    token.nesting = 1;
    token.markup  = isStrong ? ch + ch : ch;
    token.content = '';

    token         = state.tokens[endDelim.token];
    token.type    = isStrong ? 'strong_close' : 'em_close';
    token.tag     = isStrong ? 'strong' : 'em';
    token.nesting = -1;
    token.markup  = isStrong ? ch + ch : ch;
    token.content = '';

    if (isStrong) {
      state.tokens[delimiters[i + 1].token].content = '';
      state.tokens[delimiters[startDelim.end - 1].token].content = '';
      i++;
    }
  }
};

},{}],148:[function(require,module,exports){
// Process html entity - &#123;, &#xAF;, &quot;, ...

'use strict';

var entities          = require('../common/entities');
var has               = require('../common/utils').has;
var isValidEntityCode = require('../common/utils').isValidEntityCode;
var fromCodePoint     = require('../common/utils').fromCodePoint;


var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,8}|[0-9]{1,8}));/i;
var NAMED_RE   = /^&([a-z][a-z0-9]{1,31});/i;


module.exports = function entity(state, silent) {
  var ch, code, match, pos = state.pos, max = state.posMax;

  if (state.src.charCodeAt(pos) !== 0x26/* & */) { return false; }

  if (pos + 1 < max) {
    ch = state.src.charCodeAt(pos + 1);

    if (ch === 0x23 /* # */) {
      match = state.src.slice(pos).match(DIGITAL_RE);
      if (match) {
        if (!silent) {
          code = match[1][0].toLowerCase() === 'x' ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
          state.pending += isValidEntityCode(code) ? fromCodePoint(code) : fromCodePoint(0xFFFD);
        }
        state.pos += match[0].length;
        return true;
      }
    } else {
      match = state.src.slice(pos).match(NAMED_RE);
      if (match) {
        if (has(entities, match[1])) {
          if (!silent) { state.pending += entities[match[1]]; }
          state.pos += match[0].length;
          return true;
        }
      }
    }
  }

  if (!silent) { state.pending += '&'; }
  state.pos++;
  return true;
};

},{"../common/entities":107,"../common/utils":111}],149:[function(require,module,exports){
// Proceess escaped chars and hardbreaks

'use strict';

var isSpace = require('../common/utils').isSpace;

var ESCAPED = [];

for (var i = 0; i < 256; i++) { ESCAPED.push(0); }

'\\!"#$%&\'()*+,./:;<=>?@[]^_`{|}~-'
  .split('').forEach(function(ch) { ESCAPED[ch.charCodeAt(0)] = 1; });


module.exports = function escape(state, silent) {
  var ch, pos = state.pos, max = state.posMax;

  if (state.src.charCodeAt(pos) !== 0x5C/* \ */) { return false; }

  pos++;

  if (pos < max) {
    ch = state.src.charCodeAt(pos);

    if (ch < 256 && ESCAPED[ch] !== 0) {
      if (!silent) { state.pending += state.src[pos]; }
      state.pos += 2;
      return true;
    }

    if (ch === 0x0A) {
      if (!silent) {
        state.push('hardbreak', 'br', 0);
      }

      pos++;
      // skip leading whitespaces from next line
      while (pos < max) {
        ch = state.src.charCodeAt(pos);
        if (!isSpace(ch)) { break; }
        pos++;
      }

      state.pos = pos;
      return true;
    }
  }

  if (!silent) { state.pending += '\\'; }
  state.pos++;
  return true;
};

},{"../common/utils":111}],150:[function(require,module,exports){
// Process html tags

'use strict';


var HTML_TAG_RE = require('../common/html_re').HTML_TAG_RE;


function isLetter(ch) {
  /*eslint no-bitwise:0*/
  var lc = ch | 0x20; // to lower case
  return (lc >= 0x61/* a */) && (lc <= 0x7a/* z */);
}


module.exports = function html_inline(state, silent) {
  var ch, match, max, token,
      pos = state.pos;

  if (!state.md.options.html) { return false; }

  // Check start
  max = state.posMax;
  if (state.src.charCodeAt(pos) !== 0x3C/* < */ ||
      pos + 2 >= max) {
    return false;
  }

  // Quick fail on second char
  ch = state.src.charCodeAt(pos + 1);
  if (ch !== 0x21/* ! */ &&
      ch !== 0x3F/* ? */ &&
      ch !== 0x2F/* / */ &&
      !isLetter(ch)) {
    return false;
  }

  match = state.src.slice(pos).match(HTML_TAG_RE);
  if (!match) { return false; }

  if (!silent) {
    token         = state.push('html_inline', '', 0);
    token.content = state.src.slice(pos, pos + match[0].length);
  }
  state.pos += match[0].length;
  return true;
};

},{"../common/html_re":109}],151:[function(require,module,exports){
// Process ![image](<src> "title")

'use strict';

var parseLinkLabel       = require('../helpers/parse_link_label');
var parseLinkDestination = require('../helpers/parse_link_destination');
var parseLinkTitle       = require('../helpers/parse_link_title');
var normalizeReference   = require('../common/utils').normalizeReference;
var isSpace              = require('../common/utils').isSpace;


module.exports = function image(state, silent) {
  var attrs,
      code,
      label,
      labelEnd,
      labelStart,
      pos,
      ref,
      res,
      title,
      token,
      tokens,
      start,
      href = '',
      oldPos = state.pos,
      max = state.posMax;

  if (state.src.charCodeAt(state.pos) !== 0x21/* ! */) { return false; }
  if (state.src.charCodeAt(state.pos + 1) !== 0x5B/* [ */) { return false; }

  labelStart = state.pos + 2;
  labelEnd = parseLinkLabel(state, state.pos + 1, false);

  // parser failed to find ']', so it's not a valid link
  if (labelEnd < 0) { return false; }

  pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 0x28/* ( */) {
    //
    // Inline link
    //

    // [link](  <href>  "title"  )
    //        ^^ skipping these spaces
    pos++;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (!isSpace(code) && code !== 0x0A) { break; }
    }
    if (pos >= max) { return false; }

    // [link](  <href>  "title"  )
    //          ^^^^^^ parsing link destination
    start = pos;
    res = parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok) {
      href = state.md.normalizeLink(res.str);
      if (state.md.validateLink(href)) {
        pos = res.pos;
      } else {
        href = '';
      }
    }

    // [link](  <href>  "title"  )
    //                ^^ skipping these spaces
    start = pos;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (!isSpace(code) && code !== 0x0A) { break; }
    }

    // [link](  <href>  "title"  )
    //                  ^^^^^^^ parsing link title
    res = parseLinkTitle(state.src, pos, state.posMax);
    if (pos < max && start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;

      // [link](  <href>  "title"  )
      //                         ^^ skipping these spaces
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (!isSpace(code) && code !== 0x0A) { break; }
      }
    } else {
      title = '';
    }

    if (pos >= max || state.src.charCodeAt(pos) !== 0x29/* ) */) {
      state.pos = oldPos;
      return false;
    }
    pos++;
  } else {
    //
    // Link reference
    //
    if (typeof state.env.references === 'undefined') { return false; }

    // [foo]  [bar]
    //      ^^ optional whitespace (can include newlines)
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (!isSpace(code) && code !== 0x0A) { break; }
    }

    if (pos < max && state.src.charCodeAt(pos) === 0x5B/* [ */) {
      start = pos + 1;
      pos = parseLinkLabel(state, pos);
      if (pos >= 0) {
        label = state.src.slice(start, pos++);
      } else {
        pos = labelEnd + 1;
      }
    } else {
      pos = labelEnd + 1;
    }

    // covers label === '' and label === undefined
    // (collapsed reference link and shortcut reference link respectively)
    if (!label) { label = state.src.slice(labelStart, labelEnd); }

    ref = state.env.references[normalizeReference(label)];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }

  //
  // We found the end of the link, and know for a fact it's a valid link;
  // so all that's left to do is to call tokenizer.
  //
  if (!silent) {
    state.md.inline.parse(
      state.src.slice(labelStart, labelEnd),
      state.md,
      state.env,
      tokens = []
    );

    token          = state.push('image', 'img', 0);
    token.attrs    = attrs = [ [ 'src', href ], [ 'alt', '' ] ];
    token.children = tokens;
    if (title) {
      attrs.push([ 'title', title ]);
    }
  }

  state.pos = pos;
  state.posMax = max;
  return true;
};

},{"../common/utils":111,"../helpers/parse_link_destination":113,"../helpers/parse_link_label":114,"../helpers/parse_link_title":115}],152:[function(require,module,exports){
// Process [link](<to> "stuff")

'use strict';

var parseLinkLabel       = require('../helpers/parse_link_label');
var parseLinkDestination = require('../helpers/parse_link_destination');
var parseLinkTitle       = require('../helpers/parse_link_title');
var normalizeReference   = require('../common/utils').normalizeReference;
var isSpace              = require('../common/utils').isSpace;


module.exports = function link(state, silent) {
  var attrs,
      code,
      label,
      labelEnd,
      labelStart,
      pos,
      res,
      ref,
      title,
      token,
      href = '',
      oldPos = state.pos,
      max = state.posMax,
      start = state.pos;

  if (state.src.charCodeAt(state.pos) !== 0x5B/* [ */) { return false; }

  labelStart = state.pos + 1;
  labelEnd = parseLinkLabel(state, state.pos, true);

  // parser failed to find ']', so it's not a valid link
  if (labelEnd < 0) { return false; }

  pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 0x28/* ( */) {
    //
    // Inline link
    //

    // [link](  <href>  "title"  )
    //        ^^ skipping these spaces
    pos++;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (!isSpace(code) && code !== 0x0A) { break; }
    }
    if (pos >= max) { return false; }

    // [link](  <href>  "title"  )
    //          ^^^^^^ parsing link destination
    start = pos;
    res = parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok) {
      href = state.md.normalizeLink(res.str);
      if (state.md.validateLink(href)) {
        pos = res.pos;
      } else {
        href = '';
      }
    }

    // [link](  <href>  "title"  )
    //                ^^ skipping these spaces
    start = pos;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (!isSpace(code) && code !== 0x0A) { break; }
    }

    // [link](  <href>  "title"  )
    //                  ^^^^^^^ parsing link title
    res = parseLinkTitle(state.src, pos, state.posMax);
    if (pos < max && start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;

      // [link](  <href>  "title"  )
      //                         ^^ skipping these spaces
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (!isSpace(code) && code !== 0x0A) { break; }
      }
    } else {
      title = '';
    }

    if (pos >= max || state.src.charCodeAt(pos) !== 0x29/* ) */) {
      state.pos = oldPos;
      return false;
    }
    pos++;
  } else {
    //
    // Link reference
    //
    if (typeof state.env.references === 'undefined') { return false; }

    // [foo]  [bar]
    //      ^^ optional whitespace (can include newlines)
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (!isSpace(code) && code !== 0x0A) { break; }
    }

    if (pos < max && state.src.charCodeAt(pos) === 0x5B/* [ */) {
      start = pos + 1;
      pos = parseLinkLabel(state, pos);
      if (pos >= 0) {
        label = state.src.slice(start, pos++);
      } else {
        pos = labelEnd + 1;
      }
    } else {
      pos = labelEnd + 1;
    }

    // covers label === '' and label === undefined
    // (collapsed reference link and shortcut reference link respectively)
    if (!label) { label = state.src.slice(labelStart, labelEnd); }

    ref = state.env.references[normalizeReference(label)];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }

  //
  // We found the end of the link, and know for a fact it's a valid link;
  // so all that's left to do is to call tokenizer.
  //
  if (!silent) {
    state.pos = labelStart;
    state.posMax = labelEnd;

    token        = state.push('link_open', 'a', 1);
    token.attrs  = attrs = [ [ 'href', href ] ];
    if (title) {
      attrs.push([ 'title', title ]);
    }

    state.md.inline.tokenize(state);

    token        = state.push('link_close', 'a', -1);
  }

  state.pos = pos;
  state.posMax = max;
  return true;
};

},{"../common/utils":111,"../helpers/parse_link_destination":113,"../helpers/parse_link_label":114,"../helpers/parse_link_title":115}],153:[function(require,module,exports){
// Proceess '\n'

'use strict';

module.exports = function newline(state, silent) {
  var pmax, max, pos = state.pos;

  if (state.src.charCodeAt(pos) !== 0x0A/* \n */) { return false; }

  pmax = state.pending.length - 1;
  max = state.posMax;

  // '  \n' -> hardbreak
  // Lookup in pending chars is bad practice! Don't copy to other rules!
  // Pending string is stored in concat mode, indexed lookups will cause
  // convertion to flat mode.
  if (!silent) {
    if (pmax >= 0 && state.pending.charCodeAt(pmax) === 0x20) {
      if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 0x20) {
        state.pending = state.pending.replace(/ +$/, '');
        state.push('hardbreak', 'br', 0);
      } else {
        state.pending = state.pending.slice(0, -1);
        state.push('softbreak', 'br', 0);
      }

    } else {
      state.push('softbreak', 'br', 0);
    }
  }

  pos++;

  // skip heading spaces for next line
  while (pos < max && state.src.charCodeAt(pos) === 0x20) { pos++; }

  state.pos = pos;
  return true;
};

},{}],154:[function(require,module,exports){
// Inline parser state

'use strict';


var Token          = require('../token');
var isWhiteSpace   = require('../common/utils').isWhiteSpace;
var isPunctChar    = require('../common/utils').isPunctChar;
var isMdAsciiPunct = require('../common/utils').isMdAsciiPunct;


function StateInline(src, md, env, outTokens) {
  this.src = src;
  this.env = env;
  this.md = md;
  this.tokens = outTokens;

  this.pos = 0;
  this.posMax = this.src.length;
  this.level = 0;
  this.pending = '';
  this.pendingLevel = 0;

  this.cache = {};        // Stores { start: end } pairs. Useful for backtrack
                          // optimization of pairs parse (emphasis, strikes).

  this.delimiters = [];   // Emphasis-like delimiters
}


// Flush pending text
//
StateInline.prototype.pushPending = function () {
  var token = new Token('text', '', 0);
  token.content = this.pending;
  token.level = this.pendingLevel;
  this.tokens.push(token);
  this.pending = '';
  return token;
};


// Push new token to "stream".
// If pending text exists - flush it as text token
//
StateInline.prototype.push = function (type, tag, nesting) {
  if (this.pending) {
    this.pushPending();
  }

  var token = new Token(type, tag, nesting);

  if (nesting < 0) { this.level--; }
  token.level = this.level;
  if (nesting > 0) { this.level++; }

  this.pendingLevel = this.level;
  this.tokens.push(token);
  return token;
};


// Scan a sequence of emphasis-like markers, and determine whether
// it can start an emphasis sequence or end an emphasis sequence.
//
//  - start - position to scan from (it should point at a valid marker);
//  - canSplitWord - determine if these markers can be found inside a word
//
StateInline.prototype.scanDelims = function (start, canSplitWord) {
  var pos = start, lastChar, nextChar, count, can_open, can_close,
      isLastWhiteSpace, isLastPunctChar,
      isNextWhiteSpace, isNextPunctChar,
      left_flanking = true,
      right_flanking = true,
      max = this.posMax,
      marker = this.src.charCodeAt(start);

  // treat beginning of the line as a whitespace
  lastChar = start > 0 ? this.src.charCodeAt(start - 1) : 0x20;

  while (pos < max && this.src.charCodeAt(pos) === marker) { pos++; }

  count = pos - start;

  // treat end of the line as a whitespace
  nextChar = pos < max ? this.src.charCodeAt(pos) : 0x20;

  isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
  isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));

  isLastWhiteSpace = isWhiteSpace(lastChar);
  isNextWhiteSpace = isWhiteSpace(nextChar);

  if (isNextWhiteSpace) {
    left_flanking = false;
  } else if (isNextPunctChar) {
    if (!(isLastWhiteSpace || isLastPunctChar)) {
      left_flanking = false;
    }
  }

  if (isLastWhiteSpace) {
    right_flanking = false;
  } else if (isLastPunctChar) {
    if (!(isNextWhiteSpace || isNextPunctChar)) {
      right_flanking = false;
    }
  }

  if (!canSplitWord) {
    can_open  = left_flanking  && (!right_flanking || isLastPunctChar);
    can_close = right_flanking && (!left_flanking  || isNextPunctChar);
  } else {
    can_open  = left_flanking;
    can_close = right_flanking;
  }

  return {
    can_open:  can_open,
    can_close: can_close,
    length:    count
  };
};


// re-export Token class to use in block rules
StateInline.prototype.Token = Token;


module.exports = StateInline;

},{"../common/utils":111,"../token":158}],155:[function(require,module,exports){
// ~~strike through~~
//
'use strict';


// Insert each marker as a separate text token, and add it to delimiter list
//
module.exports.tokenize = function strikethrough(state, silent) {
  var i, scanned, token, len, ch,
      start = state.pos,
      marker = state.src.charCodeAt(start);

  if (silent) { return false; }

  if (marker !== 0x7E/* ~ */) { return false; }

  scanned = state.scanDelims(state.pos, true);
  len = scanned.length;
  ch = String.fromCharCode(marker);

  if (len < 2) { return false; }

  if (len % 2) {
    token         = state.push('text', '', 0);
    token.content = ch;
    len--;
  }

  for (i = 0; i < len; i += 2) {
    token         = state.push('text', '', 0);
    token.content = ch + ch;

    state.delimiters.push({
      marker: marker,
      jump:   i,
      token:  state.tokens.length - 1,
      level:  state.level,
      end:    -1,
      open:   scanned.can_open,
      close:  scanned.can_close
    });
  }

  state.pos += scanned.length;

  return true;
};


// Walk through delimiter list and replace text tokens with tags
//
module.exports.postProcess = function strikethrough(state) {
  var i, j,
      startDelim,
      endDelim,
      token,
      loneMarkers = [],
      delimiters = state.delimiters,
      max = state.delimiters.length;

  for (i = 0; i < max; i++) {
    startDelim = delimiters[i];

    if (startDelim.marker !== 0x7E/* ~ */) {
      continue;
    }

    if (startDelim.end === -1) {
      continue;
    }

    endDelim = delimiters[startDelim.end];

    token         = state.tokens[startDelim.token];
    token.type    = 's_open';
    token.tag     = 's';
    token.nesting = 1;
    token.markup  = '~~';
    token.content = '';

    token         = state.tokens[endDelim.token];
    token.type    = 's_close';
    token.tag     = 's';
    token.nesting = -1;
    token.markup  = '~~';
    token.content = '';

    if (state.tokens[endDelim.token - 1].type === 'text' &&
        state.tokens[endDelim.token - 1].content === '~') {

      loneMarkers.push(endDelim.token - 1);
    }
  }

  // If a marker sequence has an odd number of characters, it's splitted
  // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
  // start of the sequence.
  //
  // So, we have to move all those markers after subsequent s_close tags.
  //
  while (loneMarkers.length) {
    i = loneMarkers.pop();
    j = i + 1;

    while (j < state.tokens.length && state.tokens[j].type === 's_close') {
      j++;
    }

    j--;

    if (i !== j) {
      token = state.tokens[j];
      state.tokens[j] = state.tokens[i];
      state.tokens[i] = token;
    }
  }
};

},{}],156:[function(require,module,exports){
// Skip text characters for text token, place those to pending buffer
// and increment current pos

'use strict';


// Rule to skip pure text
// '{}$%@~+=:' reserved for extentions

// !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~

// !!!! Don't confuse with "Markdown ASCII Punctuation" chars
// http://spec.commonmark.org/0.15/#ascii-punctuation-character
function isTerminatorChar(ch) {
  switch (ch) {
    case 0x0A/* \n */:
    case 0x21/* ! */:
    case 0x23/* # */:
    case 0x24/* $ */:
    case 0x25/* % */:
    case 0x26/* & */:
    case 0x2A/* * */:
    case 0x2B/* + */:
    case 0x2D/* - */:
    case 0x3A/* : */:
    case 0x3C/* < */:
    case 0x3D/* = */:
    case 0x3E/* > */:
    case 0x40/* @ */:
    case 0x5B/* [ */:
    case 0x5C/* \ */:
    case 0x5D/* ] */:
    case 0x5E/* ^ */:
    case 0x5F/* _ */:
    case 0x60/* ` */:
    case 0x7B/* { */:
    case 0x7D/* } */:
    case 0x7E/* ~ */:
      return true;
    default:
      return false;
  }
}

module.exports = function text(state, silent) {
  var pos = state.pos;

  while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
    pos++;
  }

  if (pos === state.pos) { return false; }

  if (!silent) { state.pending += state.src.slice(state.pos, pos); }

  state.pos = pos;

  return true;
};

// Alternative implementation, for memory.
//
// It costs 10% of performance, but allows extend terminators list, if place it
// to `ParcerInline` property. Probably, will switch to it sometime, such
// flexibility required.

/*
var TERMINATOR_RE = /[\n!#$%&*+\-:<=>@[\\\]^_`{}~]/;

module.exports = function text(state, silent) {
  var pos = state.pos,
      idx = state.src.slice(pos).search(TERMINATOR_RE);

  // first char is terminator -> empty text
  if (idx === 0) { return false; }

  // no terminator -> text till end of string
  if (idx < 0) {
    if (!silent) { state.pending += state.src.slice(pos); }
    state.pos = state.src.length;
    return true;
  }

  if (!silent) { state.pending += state.src.slice(pos, pos + idx); }

  state.pos += idx;

  return true;
};*/

},{}],157:[function(require,module,exports){
// Merge adjacent text nodes into one, and re-calculate all token levels
//
'use strict';


module.exports = function text_collapse(state) {
  var curr, last,
      level = 0,
      tokens = state.tokens,
      max = state.tokens.length;

  for (curr = last = 0; curr < max; curr++) {
    // re-calculate levels
    level += tokens[curr].nesting;
    tokens[curr].level = level;

    if (tokens[curr].type === 'text' &&
        curr + 1 < max &&
        tokens[curr + 1].type === 'text') {

      // collapse two adjacent text nodes
      tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
    } else {
      if (curr !== last) { tokens[last] = tokens[curr]; }

      last++;
    }
  }

  if (curr !== last) {
    tokens.length = last;
  }
};

},{}],158:[function(require,module,exports){
// Token class

'use strict';


/**
 * class Token
 **/

/**
 * new Token(type, tag, nesting)
 *
 * Create new token and fill passed properties.
 **/
function Token(type, tag, nesting) {
  /**
   * Token#type -> String
   *
   * Type of the token (string, e.g. "paragraph_open")
   **/
  this.type     = type;

  /**
   * Token#tag -> String
   *
   * html tag name, e.g. "p"
   **/
  this.tag      = tag;

  /**
   * Token#attrs -> Array
   *
   * Html attributes. Format: `[ [ name1, value1 ], [ name2, value2 ] ]`
   **/
  this.attrs    = null;

  /**
   * Token#map -> Array
   *
   * Source map info. Format: `[ line_begin, line_end ]`
   **/
  this.map      = null;

  /**
   * Token#nesting -> Number
   *
   * Level change (number in {-1, 0, 1} set), where:
   *
   * -  `1` means the tag is opening
   * -  `0` means the tag is self-closing
   * - `-1` means the tag is closing
   **/
  this.nesting  = nesting;

  /**
   * Token#level -> Number
   *
   * nesting level, the same as `state.level`
   **/
  this.level    = 0;

  /**
   * Token#children -> Array
   *
   * An array of child nodes (inline and img tokens)
   **/
  this.children = null;

  /**
   * Token#content -> String
   *
   * In a case of self-closing tag (code, html, fence, etc.),
   * it has contents of this tag.
   **/
  this.content  = '';

  /**
   * Token#markup -> String
   *
   * '*' or '_' for emphasis, fence string for fence, etc.
   **/
  this.markup   = '';

  /**
   * Token#info -> String
   *
   * fence infostring
   **/
  this.info     = '';

  /**
   * Token#meta -> Object
   *
   * A place for plugins to store an arbitrary data
   **/
  this.meta     = null;

  /**
   * Token#block -> Boolean
   *
   * True for block-level tokens, false for inline tokens.
   * Used in renderer to calculate line breaks
   **/
  this.block    = false;

  /**
   * Token#hidden -> Boolean
   *
   * If it's true, ignore this element when rendering. Used for tight lists
   * to hide paragraphs.
   **/
  this.hidden   = false;
}


/**
 * Token.attrIndex(name) -> Number
 *
 * Search attribute index by name.
 **/
Token.prototype.attrIndex = function attrIndex(name) {
  var attrs, i, len;

  if (!this.attrs) { return -1; }

  attrs = this.attrs;

  for (i = 0, len = attrs.length; i < len; i++) {
    if (attrs[i][0] === name) { return i; }
  }
  return -1;
};


/**
 * Token.attrPush(attrData)
 *
 * Add `[ name, value ]` attribute to list. Init attrs if necessary
 **/
Token.prototype.attrPush = function attrPush(attrData) {
  if (this.attrs) {
    this.attrs.push(attrData);
  } else {
    this.attrs = [ attrData ];
  }
};


module.exports = Token;

},{}],159:[function(require,module,exports){
module.exports={"Aacute":"\u00C1","aacute":"\u00E1","Abreve":"\u0102","abreve":"\u0103","ac":"\u223E","acd":"\u223F","acE":"\u223E\u0333","Acirc":"\u00C2","acirc":"\u00E2","acute":"\u00B4","Acy":"\u0410","acy":"\u0430","AElig":"\u00C6","aelig":"\u00E6","af":"\u2061","Afr":"\uD835\uDD04","afr":"\uD835\uDD1E","Agrave":"\u00C0","agrave":"\u00E0","alefsym":"\u2135","aleph":"\u2135","Alpha":"\u0391","alpha":"\u03B1","Amacr":"\u0100","amacr":"\u0101","amalg":"\u2A3F","amp":"&","AMP":"&","andand":"\u2A55","And":"\u2A53","and":"\u2227","andd":"\u2A5C","andslope":"\u2A58","andv":"\u2A5A","ang":"\u2220","ange":"\u29A4","angle":"\u2220","angmsdaa":"\u29A8","angmsdab":"\u29A9","angmsdac":"\u29AA","angmsdad":"\u29AB","angmsdae":"\u29AC","angmsdaf":"\u29AD","angmsdag":"\u29AE","angmsdah":"\u29AF","angmsd":"\u2221","angrt":"\u221F","angrtvb":"\u22BE","angrtvbd":"\u299D","angsph":"\u2222","angst":"\u00C5","angzarr":"\u237C","Aogon":"\u0104","aogon":"\u0105","Aopf":"\uD835\uDD38","aopf":"\uD835\uDD52","apacir":"\u2A6F","ap":"\u2248","apE":"\u2A70","ape":"\u224A","apid":"\u224B","apos":"'","ApplyFunction":"\u2061","approx":"\u2248","approxeq":"\u224A","Aring":"\u00C5","aring":"\u00E5","Ascr":"\uD835\uDC9C","ascr":"\uD835\uDCB6","Assign":"\u2254","ast":"*","asymp":"\u2248","asympeq":"\u224D","Atilde":"\u00C3","atilde":"\u00E3","Auml":"\u00C4","auml":"\u00E4","awconint":"\u2233","awint":"\u2A11","backcong":"\u224C","backepsilon":"\u03F6","backprime":"\u2035","backsim":"\u223D","backsimeq":"\u22CD","Backslash":"\u2216","Barv":"\u2AE7","barvee":"\u22BD","barwed":"\u2305","Barwed":"\u2306","barwedge":"\u2305","bbrk":"\u23B5","bbrktbrk":"\u23B6","bcong":"\u224C","Bcy":"\u0411","bcy":"\u0431","bdquo":"\u201E","becaus":"\u2235","because":"\u2235","Because":"\u2235","bemptyv":"\u29B0","bepsi":"\u03F6","bernou":"\u212C","Bernoullis":"\u212C","Beta":"\u0392","beta":"\u03B2","beth":"\u2136","between":"\u226C","Bfr":"\uD835\uDD05","bfr":"\uD835\uDD1F","bigcap":"\u22C2","bigcirc":"\u25EF","bigcup":"\u22C3","bigodot":"\u2A00","bigoplus":"\u2A01","bigotimes":"\u2A02","bigsqcup":"\u2A06","bigstar":"\u2605","bigtriangledown":"\u25BD","bigtriangleup":"\u25B3","biguplus":"\u2A04","bigvee":"\u22C1","bigwedge":"\u22C0","bkarow":"\u290D","blacklozenge":"\u29EB","blacksquare":"\u25AA","blacktriangle":"\u25B4","blacktriangledown":"\u25BE","blacktriangleleft":"\u25C2","blacktriangleright":"\u25B8","blank":"\u2423","blk12":"\u2592","blk14":"\u2591","blk34":"\u2593","block":"\u2588","bne":"=\u20E5","bnequiv":"\u2261\u20E5","bNot":"\u2AED","bnot":"\u2310","Bopf":"\uD835\uDD39","bopf":"\uD835\uDD53","bot":"\u22A5","bottom":"\u22A5","bowtie":"\u22C8","boxbox":"\u29C9","boxdl":"\u2510","boxdL":"\u2555","boxDl":"\u2556","boxDL":"\u2557","boxdr":"\u250C","boxdR":"\u2552","boxDr":"\u2553","boxDR":"\u2554","boxh":"\u2500","boxH":"\u2550","boxhd":"\u252C","boxHd":"\u2564","boxhD":"\u2565","boxHD":"\u2566","boxhu":"\u2534","boxHu":"\u2567","boxhU":"\u2568","boxHU":"\u2569","boxminus":"\u229F","boxplus":"\u229E","boxtimes":"\u22A0","boxul":"\u2518","boxuL":"\u255B","boxUl":"\u255C","boxUL":"\u255D","boxur":"\u2514","boxuR":"\u2558","boxUr":"\u2559","boxUR":"\u255A","boxv":"\u2502","boxV":"\u2551","boxvh":"\u253C","boxvH":"\u256A","boxVh":"\u256B","boxVH":"\u256C","boxvl":"\u2524","boxvL":"\u2561","boxVl":"\u2562","boxVL":"\u2563","boxvr":"\u251C","boxvR":"\u255E","boxVr":"\u255F","boxVR":"\u2560","bprime":"\u2035","breve":"\u02D8","Breve":"\u02D8","brvbar":"\u00A6","bscr":"\uD835\uDCB7","Bscr":"\u212C","bsemi":"\u204F","bsim":"\u223D","bsime":"\u22CD","bsolb":"\u29C5","bsol":"\\","bsolhsub":"\u27C8","bull":"\u2022","bullet":"\u2022","bump":"\u224E","bumpE":"\u2AAE","bumpe":"\u224F","Bumpeq":"\u224E","bumpeq":"\u224F","Cacute":"\u0106","cacute":"\u0107","capand":"\u2A44","capbrcup":"\u2A49","capcap":"\u2A4B","cap":"\u2229","Cap":"\u22D2","capcup":"\u2A47","capdot":"\u2A40","CapitalDifferentialD":"\u2145","caps":"\u2229\uFE00","caret":"\u2041","caron":"\u02C7","Cayleys":"\u212D","ccaps":"\u2A4D","Ccaron":"\u010C","ccaron":"\u010D","Ccedil":"\u00C7","ccedil":"\u00E7","Ccirc":"\u0108","ccirc":"\u0109","Cconint":"\u2230","ccups":"\u2A4C","ccupssm":"\u2A50","Cdot":"\u010A","cdot":"\u010B","cedil":"\u00B8","Cedilla":"\u00B8","cemptyv":"\u29B2","cent":"\u00A2","centerdot":"\u00B7","CenterDot":"\u00B7","cfr":"\uD835\uDD20","Cfr":"\u212D","CHcy":"\u0427","chcy":"\u0447","check":"\u2713","checkmark":"\u2713","Chi":"\u03A7","chi":"\u03C7","circ":"\u02C6","circeq":"\u2257","circlearrowleft":"\u21BA","circlearrowright":"\u21BB","circledast":"\u229B","circledcirc":"\u229A","circleddash":"\u229D","CircleDot":"\u2299","circledR":"\u00AE","circledS":"\u24C8","CircleMinus":"\u2296","CirclePlus":"\u2295","CircleTimes":"\u2297","cir":"\u25CB","cirE":"\u29C3","cire":"\u2257","cirfnint":"\u2A10","cirmid":"\u2AEF","cirscir":"\u29C2","ClockwiseContourIntegral":"\u2232","CloseCurlyDoubleQuote":"\u201D","CloseCurlyQuote":"\u2019","clubs":"\u2663","clubsuit":"\u2663","colon":":","Colon":"\u2237","Colone":"\u2A74","colone":"\u2254","coloneq":"\u2254","comma":",","commat":"@","comp":"\u2201","compfn":"\u2218","complement":"\u2201","complexes":"\u2102","cong":"\u2245","congdot":"\u2A6D","Congruent":"\u2261","conint":"\u222E","Conint":"\u222F","ContourIntegral":"\u222E","copf":"\uD835\uDD54","Copf":"\u2102","coprod":"\u2210","Coproduct":"\u2210","copy":"\u00A9","COPY":"\u00A9","copysr":"\u2117","CounterClockwiseContourIntegral":"\u2233","crarr":"\u21B5","cross":"\u2717","Cross":"\u2A2F","Cscr":"\uD835\uDC9E","cscr":"\uD835\uDCB8","csub":"\u2ACF","csube":"\u2AD1","csup":"\u2AD0","csupe":"\u2AD2","ctdot":"\u22EF","cudarrl":"\u2938","cudarrr":"\u2935","cuepr":"\u22DE","cuesc":"\u22DF","cularr":"\u21B6","cularrp":"\u293D","cupbrcap":"\u2A48","cupcap":"\u2A46","CupCap":"\u224D","cup":"\u222A","Cup":"\u22D3","cupcup":"\u2A4A","cupdot":"\u228D","cupor":"\u2A45","cups":"\u222A\uFE00","curarr":"\u21B7","curarrm":"\u293C","curlyeqprec":"\u22DE","curlyeqsucc":"\u22DF","curlyvee":"\u22CE","curlywedge":"\u22CF","curren":"\u00A4","curvearrowleft":"\u21B6","curvearrowright":"\u21B7","cuvee":"\u22CE","cuwed":"\u22CF","cwconint":"\u2232","cwint":"\u2231","cylcty":"\u232D","dagger":"\u2020","Dagger":"\u2021","daleth":"\u2138","darr":"\u2193","Darr":"\u21A1","dArr":"\u21D3","dash":"\u2010","Dashv":"\u2AE4","dashv":"\u22A3","dbkarow":"\u290F","dblac":"\u02DD","Dcaron":"\u010E","dcaron":"\u010F","Dcy":"\u0414","dcy":"\u0434","ddagger":"\u2021","ddarr":"\u21CA","DD":"\u2145","dd":"\u2146","DDotrahd":"\u2911","ddotseq":"\u2A77","deg":"\u00B0","Del":"\u2207","Delta":"\u0394","delta":"\u03B4","demptyv":"\u29B1","dfisht":"\u297F","Dfr":"\uD835\uDD07","dfr":"\uD835\uDD21","dHar":"\u2965","dharl":"\u21C3","dharr":"\u21C2","DiacriticalAcute":"\u00B4","DiacriticalDot":"\u02D9","DiacriticalDoubleAcute":"\u02DD","DiacriticalGrave":"`","DiacriticalTilde":"\u02DC","diam":"\u22C4","diamond":"\u22C4","Diamond":"\u22C4","diamondsuit":"\u2666","diams":"\u2666","die":"\u00A8","DifferentialD":"\u2146","digamma":"\u03DD","disin":"\u22F2","div":"\u00F7","divide":"\u00F7","divideontimes":"\u22C7","divonx":"\u22C7","DJcy":"\u0402","djcy":"\u0452","dlcorn":"\u231E","dlcrop":"\u230D","dollar":"$","Dopf":"\uD835\uDD3B","dopf":"\uD835\uDD55","Dot":"\u00A8","dot":"\u02D9","DotDot":"\u20DC","doteq":"\u2250","doteqdot":"\u2251","DotEqual":"\u2250","dotminus":"\u2238","dotplus":"\u2214","dotsquare":"\u22A1","doublebarwedge":"\u2306","DoubleContourIntegral":"\u222F","DoubleDot":"\u00A8","DoubleDownArrow":"\u21D3","DoubleLeftArrow":"\u21D0","DoubleLeftRightArrow":"\u21D4","DoubleLeftTee":"\u2AE4","DoubleLongLeftArrow":"\u27F8","DoubleLongLeftRightArrow":"\u27FA","DoubleLongRightArrow":"\u27F9","DoubleRightArrow":"\u21D2","DoubleRightTee":"\u22A8","DoubleUpArrow":"\u21D1","DoubleUpDownArrow":"\u21D5","DoubleVerticalBar":"\u2225","DownArrowBar":"\u2913","downarrow":"\u2193","DownArrow":"\u2193","Downarrow":"\u21D3","DownArrowUpArrow":"\u21F5","DownBreve":"\u0311","downdownarrows":"\u21CA","downharpoonleft":"\u21C3","downharpoonright":"\u21C2","DownLeftRightVector":"\u2950","DownLeftTeeVector":"\u295E","DownLeftVectorBar":"\u2956","DownLeftVector":"\u21BD","DownRightTeeVector":"\u295F","DownRightVectorBar":"\u2957","DownRightVector":"\u21C1","DownTeeArrow":"\u21A7","DownTee":"\u22A4","drbkarow":"\u2910","drcorn":"\u231F","drcrop":"\u230C","Dscr":"\uD835\uDC9F","dscr":"\uD835\uDCB9","DScy":"\u0405","dscy":"\u0455","dsol":"\u29F6","Dstrok":"\u0110","dstrok":"\u0111","dtdot":"\u22F1","dtri":"\u25BF","dtrif":"\u25BE","duarr":"\u21F5","duhar":"\u296F","dwangle":"\u29A6","DZcy":"\u040F","dzcy":"\u045F","dzigrarr":"\u27FF","Eacute":"\u00C9","eacute":"\u00E9","easter":"\u2A6E","Ecaron":"\u011A","ecaron":"\u011B","Ecirc":"\u00CA","ecirc":"\u00EA","ecir":"\u2256","ecolon":"\u2255","Ecy":"\u042D","ecy":"\u044D","eDDot":"\u2A77","Edot":"\u0116","edot":"\u0117","eDot":"\u2251","ee":"\u2147","efDot":"\u2252","Efr":"\uD835\uDD08","efr":"\uD835\uDD22","eg":"\u2A9A","Egrave":"\u00C8","egrave":"\u00E8","egs":"\u2A96","egsdot":"\u2A98","el":"\u2A99","Element":"\u2208","elinters":"\u23E7","ell":"\u2113","els":"\u2A95","elsdot":"\u2A97","Emacr":"\u0112","emacr":"\u0113","empty":"\u2205","emptyset":"\u2205","EmptySmallSquare":"\u25FB","emptyv":"\u2205","EmptyVerySmallSquare":"\u25AB","emsp13":"\u2004","emsp14":"\u2005","emsp":"\u2003","ENG":"\u014A","eng":"\u014B","ensp":"\u2002","Eogon":"\u0118","eogon":"\u0119","Eopf":"\uD835\uDD3C","eopf":"\uD835\uDD56","epar":"\u22D5","eparsl":"\u29E3","eplus":"\u2A71","epsi":"\u03B5","Epsilon":"\u0395","epsilon":"\u03B5","epsiv":"\u03F5","eqcirc":"\u2256","eqcolon":"\u2255","eqsim":"\u2242","eqslantgtr":"\u2A96","eqslantless":"\u2A95","Equal":"\u2A75","equals":"=","EqualTilde":"\u2242","equest":"\u225F","Equilibrium":"\u21CC","equiv":"\u2261","equivDD":"\u2A78","eqvparsl":"\u29E5","erarr":"\u2971","erDot":"\u2253","escr":"\u212F","Escr":"\u2130","esdot":"\u2250","Esim":"\u2A73","esim":"\u2242","Eta":"\u0397","eta":"\u03B7","ETH":"\u00D0","eth":"\u00F0","Euml":"\u00CB","euml":"\u00EB","euro":"\u20AC","excl":"!","exist":"\u2203","Exists":"\u2203","expectation":"\u2130","exponentiale":"\u2147","ExponentialE":"\u2147","fallingdotseq":"\u2252","Fcy":"\u0424","fcy":"\u0444","female":"\u2640","ffilig":"\uFB03","fflig":"\uFB00","ffllig":"\uFB04","Ffr":"\uD835\uDD09","ffr":"\uD835\uDD23","filig":"\uFB01","FilledSmallSquare":"\u25FC","FilledVerySmallSquare":"\u25AA","fjlig":"fj","flat":"\u266D","fllig":"\uFB02","fltns":"\u25B1","fnof":"\u0192","Fopf":"\uD835\uDD3D","fopf":"\uD835\uDD57","forall":"\u2200","ForAll":"\u2200","fork":"\u22D4","forkv":"\u2AD9","Fouriertrf":"\u2131","fpartint":"\u2A0D","frac12":"\u00BD","frac13":"\u2153","frac14":"\u00BC","frac15":"\u2155","frac16":"\u2159","frac18":"\u215B","frac23":"\u2154","frac25":"\u2156","frac34":"\u00BE","frac35":"\u2157","frac38":"\u215C","frac45":"\u2158","frac56":"\u215A","frac58":"\u215D","frac78":"\u215E","frasl":"\u2044","frown":"\u2322","fscr":"\uD835\uDCBB","Fscr":"\u2131","gacute":"\u01F5","Gamma":"\u0393","gamma":"\u03B3","Gammad":"\u03DC","gammad":"\u03DD","gap":"\u2A86","Gbreve":"\u011E","gbreve":"\u011F","Gcedil":"\u0122","Gcirc":"\u011C","gcirc":"\u011D","Gcy":"\u0413","gcy":"\u0433","Gdot":"\u0120","gdot":"\u0121","ge":"\u2265","gE":"\u2267","gEl":"\u2A8C","gel":"\u22DB","geq":"\u2265","geqq":"\u2267","geqslant":"\u2A7E","gescc":"\u2AA9","ges":"\u2A7E","gesdot":"\u2A80","gesdoto":"\u2A82","gesdotol":"\u2A84","gesl":"\u22DB\uFE00","gesles":"\u2A94","Gfr":"\uD835\uDD0A","gfr":"\uD835\uDD24","gg":"\u226B","Gg":"\u22D9","ggg":"\u22D9","gimel":"\u2137","GJcy":"\u0403","gjcy":"\u0453","gla":"\u2AA5","gl":"\u2277","glE":"\u2A92","glj":"\u2AA4","gnap":"\u2A8A","gnapprox":"\u2A8A","gne":"\u2A88","gnE":"\u2269","gneq":"\u2A88","gneqq":"\u2269","gnsim":"\u22E7","Gopf":"\uD835\uDD3E","gopf":"\uD835\uDD58","grave":"`","GreaterEqual":"\u2265","GreaterEqualLess":"\u22DB","GreaterFullEqual":"\u2267","GreaterGreater":"\u2AA2","GreaterLess":"\u2277","GreaterSlantEqual":"\u2A7E","GreaterTilde":"\u2273","Gscr":"\uD835\uDCA2","gscr":"\u210A","gsim":"\u2273","gsime":"\u2A8E","gsiml":"\u2A90","gtcc":"\u2AA7","gtcir":"\u2A7A","gt":">","GT":">","Gt":"\u226B","gtdot":"\u22D7","gtlPar":"\u2995","gtquest":"\u2A7C","gtrapprox":"\u2A86","gtrarr":"\u2978","gtrdot":"\u22D7","gtreqless":"\u22DB","gtreqqless":"\u2A8C","gtrless":"\u2277","gtrsim":"\u2273","gvertneqq":"\u2269\uFE00","gvnE":"\u2269\uFE00","Hacek":"\u02C7","hairsp":"\u200A","half":"\u00BD","hamilt":"\u210B","HARDcy":"\u042A","hardcy":"\u044A","harrcir":"\u2948","harr":"\u2194","hArr":"\u21D4","harrw":"\u21AD","Hat":"^","hbar":"\u210F","Hcirc":"\u0124","hcirc":"\u0125","hearts":"\u2665","heartsuit":"\u2665","hellip":"\u2026","hercon":"\u22B9","hfr":"\uD835\uDD25","Hfr":"\u210C","HilbertSpace":"\u210B","hksearow":"\u2925","hkswarow":"\u2926","hoarr":"\u21FF","homtht":"\u223B","hookleftarrow":"\u21A9","hookrightarrow":"\u21AA","hopf":"\uD835\uDD59","Hopf":"\u210D","horbar":"\u2015","HorizontalLine":"\u2500","hscr":"\uD835\uDCBD","Hscr":"\u210B","hslash":"\u210F","Hstrok":"\u0126","hstrok":"\u0127","HumpDownHump":"\u224E","HumpEqual":"\u224F","hybull":"\u2043","hyphen":"\u2010","Iacute":"\u00CD","iacute":"\u00ED","ic":"\u2063","Icirc":"\u00CE","icirc":"\u00EE","Icy":"\u0418","icy":"\u0438","Idot":"\u0130","IEcy":"\u0415","iecy":"\u0435","iexcl":"\u00A1","iff":"\u21D4","ifr":"\uD835\uDD26","Ifr":"\u2111","Igrave":"\u00CC","igrave":"\u00EC","ii":"\u2148","iiiint":"\u2A0C","iiint":"\u222D","iinfin":"\u29DC","iiota":"\u2129","IJlig":"\u0132","ijlig":"\u0133","Imacr":"\u012A","imacr":"\u012B","image":"\u2111","ImaginaryI":"\u2148","imagline":"\u2110","imagpart":"\u2111","imath":"\u0131","Im":"\u2111","imof":"\u22B7","imped":"\u01B5","Implies":"\u21D2","incare":"\u2105","in":"\u2208","infin":"\u221E","infintie":"\u29DD","inodot":"\u0131","intcal":"\u22BA","int":"\u222B","Int":"\u222C","integers":"\u2124","Integral":"\u222B","intercal":"\u22BA","Intersection":"\u22C2","intlarhk":"\u2A17","intprod":"\u2A3C","InvisibleComma":"\u2063","InvisibleTimes":"\u2062","IOcy":"\u0401","iocy":"\u0451","Iogon":"\u012E","iogon":"\u012F","Iopf":"\uD835\uDD40","iopf":"\uD835\uDD5A","Iota":"\u0399","iota":"\u03B9","iprod":"\u2A3C","iquest":"\u00BF","iscr":"\uD835\uDCBE","Iscr":"\u2110","isin":"\u2208","isindot":"\u22F5","isinE":"\u22F9","isins":"\u22F4","isinsv":"\u22F3","isinv":"\u2208","it":"\u2062","Itilde":"\u0128","itilde":"\u0129","Iukcy":"\u0406","iukcy":"\u0456","Iuml":"\u00CF","iuml":"\u00EF","Jcirc":"\u0134","jcirc":"\u0135","Jcy":"\u0419","jcy":"\u0439","Jfr":"\uD835\uDD0D","jfr":"\uD835\uDD27","jmath":"\u0237","Jopf":"\uD835\uDD41","jopf":"\uD835\uDD5B","Jscr":"\uD835\uDCA5","jscr":"\uD835\uDCBF","Jsercy":"\u0408","jsercy":"\u0458","Jukcy":"\u0404","jukcy":"\u0454","Kappa":"\u039A","kappa":"\u03BA","kappav":"\u03F0","Kcedil":"\u0136","kcedil":"\u0137","Kcy":"\u041A","kcy":"\u043A","Kfr":"\uD835\uDD0E","kfr":"\uD835\uDD28","kgreen":"\u0138","KHcy":"\u0425","khcy":"\u0445","KJcy":"\u040C","kjcy":"\u045C","Kopf":"\uD835\uDD42","kopf":"\uD835\uDD5C","Kscr":"\uD835\uDCA6","kscr":"\uD835\uDCC0","lAarr":"\u21DA","Lacute":"\u0139","lacute":"\u013A","laemptyv":"\u29B4","lagran":"\u2112","Lambda":"\u039B","lambda":"\u03BB","lang":"\u27E8","Lang":"\u27EA","langd":"\u2991","langle":"\u27E8","lap":"\u2A85","Laplacetrf":"\u2112","laquo":"\u00AB","larrb":"\u21E4","larrbfs":"\u291F","larr":"\u2190","Larr":"\u219E","lArr":"\u21D0","larrfs":"\u291D","larrhk":"\u21A9","larrlp":"\u21AB","larrpl":"\u2939","larrsim":"\u2973","larrtl":"\u21A2","latail":"\u2919","lAtail":"\u291B","lat":"\u2AAB","late":"\u2AAD","lates":"\u2AAD\uFE00","lbarr":"\u290C","lBarr":"\u290E","lbbrk":"\u2772","lbrace":"{","lbrack":"[","lbrke":"\u298B","lbrksld":"\u298F","lbrkslu":"\u298D","Lcaron":"\u013D","lcaron":"\u013E","Lcedil":"\u013B","lcedil":"\u013C","lceil":"\u2308","lcub":"{","Lcy":"\u041B","lcy":"\u043B","ldca":"\u2936","ldquo":"\u201C","ldquor":"\u201E","ldrdhar":"\u2967","ldrushar":"\u294B","ldsh":"\u21B2","le":"\u2264","lE":"\u2266","LeftAngleBracket":"\u27E8","LeftArrowBar":"\u21E4","leftarrow":"\u2190","LeftArrow":"\u2190","Leftarrow":"\u21D0","LeftArrowRightArrow":"\u21C6","leftarrowtail":"\u21A2","LeftCeiling":"\u2308","LeftDoubleBracket":"\u27E6","LeftDownTeeVector":"\u2961","LeftDownVectorBar":"\u2959","LeftDownVector":"\u21C3","LeftFloor":"\u230A","leftharpoondown":"\u21BD","leftharpoonup":"\u21BC","leftleftarrows":"\u21C7","leftrightarrow":"\u2194","LeftRightArrow":"\u2194","Leftrightarrow":"\u21D4","leftrightarrows":"\u21C6","leftrightharpoons":"\u21CB","leftrightsquigarrow":"\u21AD","LeftRightVector":"\u294E","LeftTeeArrow":"\u21A4","LeftTee":"\u22A3","LeftTeeVector":"\u295A","leftthreetimes":"\u22CB","LeftTriangleBar":"\u29CF","LeftTriangle":"\u22B2","LeftTriangleEqual":"\u22B4","LeftUpDownVector":"\u2951","LeftUpTeeVector":"\u2960","LeftUpVectorBar":"\u2958","LeftUpVector":"\u21BF","LeftVectorBar":"\u2952","LeftVector":"\u21BC","lEg":"\u2A8B","leg":"\u22DA","leq":"\u2264","leqq":"\u2266","leqslant":"\u2A7D","lescc":"\u2AA8","les":"\u2A7D","lesdot":"\u2A7F","lesdoto":"\u2A81","lesdotor":"\u2A83","lesg":"\u22DA\uFE00","lesges":"\u2A93","lessapprox":"\u2A85","lessdot":"\u22D6","lesseqgtr":"\u22DA","lesseqqgtr":"\u2A8B","LessEqualGreater":"\u22DA","LessFullEqual":"\u2266","LessGreater":"\u2276","lessgtr":"\u2276","LessLess":"\u2AA1","lesssim":"\u2272","LessSlantEqual":"\u2A7D","LessTilde":"\u2272","lfisht":"\u297C","lfloor":"\u230A","Lfr":"\uD835\uDD0F","lfr":"\uD835\uDD29","lg":"\u2276","lgE":"\u2A91","lHar":"\u2962","lhard":"\u21BD","lharu":"\u21BC","lharul":"\u296A","lhblk":"\u2584","LJcy":"\u0409","ljcy":"\u0459","llarr":"\u21C7","ll":"\u226A","Ll":"\u22D8","llcorner":"\u231E","Lleftarrow":"\u21DA","llhard":"\u296B","lltri":"\u25FA","Lmidot":"\u013F","lmidot":"\u0140","lmoustache":"\u23B0","lmoust":"\u23B0","lnap":"\u2A89","lnapprox":"\u2A89","lne":"\u2A87","lnE":"\u2268","lneq":"\u2A87","lneqq":"\u2268","lnsim":"\u22E6","loang":"\u27EC","loarr":"\u21FD","lobrk":"\u27E6","longleftarrow":"\u27F5","LongLeftArrow":"\u27F5","Longleftarrow":"\u27F8","longleftrightarrow":"\u27F7","LongLeftRightArrow":"\u27F7","Longleftrightarrow":"\u27FA","longmapsto":"\u27FC","longrightarrow":"\u27F6","LongRightArrow":"\u27F6","Longrightarrow":"\u27F9","looparrowleft":"\u21AB","looparrowright":"\u21AC","lopar":"\u2985","Lopf":"\uD835\uDD43","lopf":"\uD835\uDD5D","loplus":"\u2A2D","lotimes":"\u2A34","lowast":"\u2217","lowbar":"_","LowerLeftArrow":"\u2199","LowerRightArrow":"\u2198","loz":"\u25CA","lozenge":"\u25CA","lozf":"\u29EB","lpar":"(","lparlt":"\u2993","lrarr":"\u21C6","lrcorner":"\u231F","lrhar":"\u21CB","lrhard":"\u296D","lrm":"\u200E","lrtri":"\u22BF","lsaquo":"\u2039","lscr":"\uD835\uDCC1","Lscr":"\u2112","lsh":"\u21B0","Lsh":"\u21B0","lsim":"\u2272","lsime":"\u2A8D","lsimg":"\u2A8F","lsqb":"[","lsquo":"\u2018","lsquor":"\u201A","Lstrok":"\u0141","lstrok":"\u0142","ltcc":"\u2AA6","ltcir":"\u2A79","lt":"<","LT":"<","Lt":"\u226A","ltdot":"\u22D6","lthree":"\u22CB","ltimes":"\u22C9","ltlarr":"\u2976","ltquest":"\u2A7B","ltri":"\u25C3","ltrie":"\u22B4","ltrif":"\u25C2","ltrPar":"\u2996","lurdshar":"\u294A","luruhar":"\u2966","lvertneqq":"\u2268\uFE00","lvnE":"\u2268\uFE00","macr":"\u00AF","male":"\u2642","malt":"\u2720","maltese":"\u2720","Map":"\u2905","map":"\u21A6","mapsto":"\u21A6","mapstodown":"\u21A7","mapstoleft":"\u21A4","mapstoup":"\u21A5","marker":"\u25AE","mcomma":"\u2A29","Mcy":"\u041C","mcy":"\u043C","mdash":"\u2014","mDDot":"\u223A","measuredangle":"\u2221","MediumSpace":"\u205F","Mellintrf":"\u2133","Mfr":"\uD835\uDD10","mfr":"\uD835\uDD2A","mho":"\u2127","micro":"\u00B5","midast":"*","midcir":"\u2AF0","mid":"\u2223","middot":"\u00B7","minusb":"\u229F","minus":"\u2212","minusd":"\u2238","minusdu":"\u2A2A","MinusPlus":"\u2213","mlcp":"\u2ADB","mldr":"\u2026","mnplus":"\u2213","models":"\u22A7","Mopf":"\uD835\uDD44","mopf":"\uD835\uDD5E","mp":"\u2213","mscr":"\uD835\uDCC2","Mscr":"\u2133","mstpos":"\u223E","Mu":"\u039C","mu":"\u03BC","multimap":"\u22B8","mumap":"\u22B8","nabla":"\u2207","Nacute":"\u0143","nacute":"\u0144","nang":"\u2220\u20D2","nap":"\u2249","napE":"\u2A70\u0338","napid":"\u224B\u0338","napos":"\u0149","napprox":"\u2249","natural":"\u266E","naturals":"\u2115","natur":"\u266E","nbsp":"\u00A0","nbump":"\u224E\u0338","nbumpe":"\u224F\u0338","ncap":"\u2A43","Ncaron":"\u0147","ncaron":"\u0148","Ncedil":"\u0145","ncedil":"\u0146","ncong":"\u2247","ncongdot":"\u2A6D\u0338","ncup":"\u2A42","Ncy":"\u041D","ncy":"\u043D","ndash":"\u2013","nearhk":"\u2924","nearr":"\u2197","neArr":"\u21D7","nearrow":"\u2197","ne":"\u2260","nedot":"\u2250\u0338","NegativeMediumSpace":"\u200B","NegativeThickSpace":"\u200B","NegativeThinSpace":"\u200B","NegativeVeryThinSpace":"\u200B","nequiv":"\u2262","nesear":"\u2928","nesim":"\u2242\u0338","NestedGreaterGreater":"\u226B","NestedLessLess":"\u226A","NewLine":"\n","nexist":"\u2204","nexists":"\u2204","Nfr":"\uD835\uDD11","nfr":"\uD835\uDD2B","ngE":"\u2267\u0338","nge":"\u2271","ngeq":"\u2271","ngeqq":"\u2267\u0338","ngeqslant":"\u2A7E\u0338","nges":"\u2A7E\u0338","nGg":"\u22D9\u0338","ngsim":"\u2275","nGt":"\u226B\u20D2","ngt":"\u226F","ngtr":"\u226F","nGtv":"\u226B\u0338","nharr":"\u21AE","nhArr":"\u21CE","nhpar":"\u2AF2","ni":"\u220B","nis":"\u22FC","nisd":"\u22FA","niv":"\u220B","NJcy":"\u040A","njcy":"\u045A","nlarr":"\u219A","nlArr":"\u21CD","nldr":"\u2025","nlE":"\u2266\u0338","nle":"\u2270","nleftarrow":"\u219A","nLeftarrow":"\u21CD","nleftrightarrow":"\u21AE","nLeftrightarrow":"\u21CE","nleq":"\u2270","nleqq":"\u2266\u0338","nleqslant":"\u2A7D\u0338","nles":"\u2A7D\u0338","nless":"\u226E","nLl":"\u22D8\u0338","nlsim":"\u2274","nLt":"\u226A\u20D2","nlt":"\u226E","nltri":"\u22EA","nltrie":"\u22EC","nLtv":"\u226A\u0338","nmid":"\u2224","NoBreak":"\u2060","NonBreakingSpace":"\u00A0","nopf":"\uD835\uDD5F","Nopf":"\u2115","Not":"\u2AEC","not":"\u00AC","NotCongruent":"\u2262","NotCupCap":"\u226D","NotDoubleVerticalBar":"\u2226","NotElement":"\u2209","NotEqual":"\u2260","NotEqualTilde":"\u2242\u0338","NotExists":"\u2204","NotGreater":"\u226F","NotGreaterEqual":"\u2271","NotGreaterFullEqual":"\u2267\u0338","NotGreaterGreater":"\u226B\u0338","NotGreaterLess":"\u2279","NotGreaterSlantEqual":"\u2A7E\u0338","NotGreaterTilde":"\u2275","NotHumpDownHump":"\u224E\u0338","NotHumpEqual":"\u224F\u0338","notin":"\u2209","notindot":"\u22F5\u0338","notinE":"\u22F9\u0338","notinva":"\u2209","notinvb":"\u22F7","notinvc":"\u22F6","NotLeftTriangleBar":"\u29CF\u0338","NotLeftTriangle":"\u22EA","NotLeftTriangleEqual":"\u22EC","NotLess":"\u226E","NotLessEqual":"\u2270","NotLessGreater":"\u2278","NotLessLess":"\u226A\u0338","NotLessSlantEqual":"\u2A7D\u0338","NotLessTilde":"\u2274","NotNestedGreaterGreater":"\u2AA2\u0338","NotNestedLessLess":"\u2AA1\u0338","notni":"\u220C","notniva":"\u220C","notnivb":"\u22FE","notnivc":"\u22FD","NotPrecedes":"\u2280","NotPrecedesEqual":"\u2AAF\u0338","NotPrecedesSlantEqual":"\u22E0","NotReverseElement":"\u220C","NotRightTriangleBar":"\u29D0\u0338","NotRightTriangle":"\u22EB","NotRightTriangleEqual":"\u22ED","NotSquareSubset":"\u228F\u0338","NotSquareSubsetEqual":"\u22E2","NotSquareSuperset":"\u2290\u0338","NotSquareSupersetEqual":"\u22E3","NotSubset":"\u2282\u20D2","NotSubsetEqual":"\u2288","NotSucceeds":"\u2281","NotSucceedsEqual":"\u2AB0\u0338","NotSucceedsSlantEqual":"\u22E1","NotSucceedsTilde":"\u227F\u0338","NotSuperset":"\u2283\u20D2","NotSupersetEqual":"\u2289","NotTilde":"\u2241","NotTildeEqual":"\u2244","NotTildeFullEqual":"\u2247","NotTildeTilde":"\u2249","NotVerticalBar":"\u2224","nparallel":"\u2226","npar":"\u2226","nparsl":"\u2AFD\u20E5","npart":"\u2202\u0338","npolint":"\u2A14","npr":"\u2280","nprcue":"\u22E0","nprec":"\u2280","npreceq":"\u2AAF\u0338","npre":"\u2AAF\u0338","nrarrc":"\u2933\u0338","nrarr":"\u219B","nrArr":"\u21CF","nrarrw":"\u219D\u0338","nrightarrow":"\u219B","nRightarrow":"\u21CF","nrtri":"\u22EB","nrtrie":"\u22ED","nsc":"\u2281","nsccue":"\u22E1","nsce":"\u2AB0\u0338","Nscr":"\uD835\uDCA9","nscr":"\uD835\uDCC3","nshortmid":"\u2224","nshortparallel":"\u2226","nsim":"\u2241","nsime":"\u2244","nsimeq":"\u2244","nsmid":"\u2224","nspar":"\u2226","nsqsube":"\u22E2","nsqsupe":"\u22E3","nsub":"\u2284","nsubE":"\u2AC5\u0338","nsube":"\u2288","nsubset":"\u2282\u20D2","nsubseteq":"\u2288","nsubseteqq":"\u2AC5\u0338","nsucc":"\u2281","nsucceq":"\u2AB0\u0338","nsup":"\u2285","nsupE":"\u2AC6\u0338","nsupe":"\u2289","nsupset":"\u2283\u20D2","nsupseteq":"\u2289","nsupseteqq":"\u2AC6\u0338","ntgl":"\u2279","Ntilde":"\u00D1","ntilde":"\u00F1","ntlg":"\u2278","ntriangleleft":"\u22EA","ntrianglelefteq":"\u22EC","ntriangleright":"\u22EB","ntrianglerighteq":"\u22ED","Nu":"\u039D","nu":"\u03BD","num":"#","numero":"\u2116","numsp":"\u2007","nvap":"\u224D\u20D2","nvdash":"\u22AC","nvDash":"\u22AD","nVdash":"\u22AE","nVDash":"\u22AF","nvge":"\u2265\u20D2","nvgt":">\u20D2","nvHarr":"\u2904","nvinfin":"\u29DE","nvlArr":"\u2902","nvle":"\u2264\u20D2","nvlt":"<\u20D2","nvltrie":"\u22B4\u20D2","nvrArr":"\u2903","nvrtrie":"\u22B5\u20D2","nvsim":"\u223C\u20D2","nwarhk":"\u2923","nwarr":"\u2196","nwArr":"\u21D6","nwarrow":"\u2196","nwnear":"\u2927","Oacute":"\u00D3","oacute":"\u00F3","oast":"\u229B","Ocirc":"\u00D4","ocirc":"\u00F4","ocir":"\u229A","Ocy":"\u041E","ocy":"\u043E","odash":"\u229D","Odblac":"\u0150","odblac":"\u0151","odiv":"\u2A38","odot":"\u2299","odsold":"\u29BC","OElig":"\u0152","oelig":"\u0153","ofcir":"\u29BF","Ofr":"\uD835\uDD12","ofr":"\uD835\uDD2C","ogon":"\u02DB","Ograve":"\u00D2","ograve":"\u00F2","ogt":"\u29C1","ohbar":"\u29B5","ohm":"\u03A9","oint":"\u222E","olarr":"\u21BA","olcir":"\u29BE","olcross":"\u29BB","oline":"\u203E","olt":"\u29C0","Omacr":"\u014C","omacr":"\u014D","Omega":"\u03A9","omega":"\u03C9","Omicron":"\u039F","omicron":"\u03BF","omid":"\u29B6","ominus":"\u2296","Oopf":"\uD835\uDD46","oopf":"\uD835\uDD60","opar":"\u29B7","OpenCurlyDoubleQuote":"\u201C","OpenCurlyQuote":"\u2018","operp":"\u29B9","oplus":"\u2295","orarr":"\u21BB","Or":"\u2A54","or":"\u2228","ord":"\u2A5D","order":"\u2134","orderof":"\u2134","ordf":"\u00AA","ordm":"\u00BA","origof":"\u22B6","oror":"\u2A56","orslope":"\u2A57","orv":"\u2A5B","oS":"\u24C8","Oscr":"\uD835\uDCAA","oscr":"\u2134","Oslash":"\u00D8","oslash":"\u00F8","osol":"\u2298","Otilde":"\u00D5","otilde":"\u00F5","otimesas":"\u2A36","Otimes":"\u2A37","otimes":"\u2297","Ouml":"\u00D6","ouml":"\u00F6","ovbar":"\u233D","OverBar":"\u203E","OverBrace":"\u23DE","OverBracket":"\u23B4","OverParenthesis":"\u23DC","para":"\u00B6","parallel":"\u2225","par":"\u2225","parsim":"\u2AF3","parsl":"\u2AFD","part":"\u2202","PartialD":"\u2202","Pcy":"\u041F","pcy":"\u043F","percnt":"%","period":".","permil":"\u2030","perp":"\u22A5","pertenk":"\u2031","Pfr":"\uD835\uDD13","pfr":"\uD835\uDD2D","Phi":"\u03A6","phi":"\u03C6","phiv":"\u03D5","phmmat":"\u2133","phone":"\u260E","Pi":"\u03A0","pi":"\u03C0","pitchfork":"\u22D4","piv":"\u03D6","planck":"\u210F","planckh":"\u210E","plankv":"\u210F","plusacir":"\u2A23","plusb":"\u229E","pluscir":"\u2A22","plus":"+","plusdo":"\u2214","plusdu":"\u2A25","pluse":"\u2A72","PlusMinus":"\u00B1","plusmn":"\u00B1","plussim":"\u2A26","plustwo":"\u2A27","pm":"\u00B1","Poincareplane":"\u210C","pointint":"\u2A15","popf":"\uD835\uDD61","Popf":"\u2119","pound":"\u00A3","prap":"\u2AB7","Pr":"\u2ABB","pr":"\u227A","prcue":"\u227C","precapprox":"\u2AB7","prec":"\u227A","preccurlyeq":"\u227C","Precedes":"\u227A","PrecedesEqual":"\u2AAF","PrecedesSlantEqual":"\u227C","PrecedesTilde":"\u227E","preceq":"\u2AAF","precnapprox":"\u2AB9","precneqq":"\u2AB5","precnsim":"\u22E8","pre":"\u2AAF","prE":"\u2AB3","precsim":"\u227E","prime":"\u2032","Prime":"\u2033","primes":"\u2119","prnap":"\u2AB9","prnE":"\u2AB5","prnsim":"\u22E8","prod":"\u220F","Product":"\u220F","profalar":"\u232E","profline":"\u2312","profsurf":"\u2313","prop":"\u221D","Proportional":"\u221D","Proportion":"\u2237","propto":"\u221D","prsim":"\u227E","prurel":"\u22B0","Pscr":"\uD835\uDCAB","pscr":"\uD835\uDCC5","Psi":"\u03A8","psi":"\u03C8","puncsp":"\u2008","Qfr":"\uD835\uDD14","qfr":"\uD835\uDD2E","qint":"\u2A0C","qopf":"\uD835\uDD62","Qopf":"\u211A","qprime":"\u2057","Qscr":"\uD835\uDCAC","qscr":"\uD835\uDCC6","quaternions":"\u210D","quatint":"\u2A16","quest":"?","questeq":"\u225F","quot":"\"","QUOT":"\"","rAarr":"\u21DB","race":"\u223D\u0331","Racute":"\u0154","racute":"\u0155","radic":"\u221A","raemptyv":"\u29B3","rang":"\u27E9","Rang":"\u27EB","rangd":"\u2992","range":"\u29A5","rangle":"\u27E9","raquo":"\u00BB","rarrap":"\u2975","rarrb":"\u21E5","rarrbfs":"\u2920","rarrc":"\u2933","rarr":"\u2192","Rarr":"\u21A0","rArr":"\u21D2","rarrfs":"\u291E","rarrhk":"\u21AA","rarrlp":"\u21AC","rarrpl":"\u2945","rarrsim":"\u2974","Rarrtl":"\u2916","rarrtl":"\u21A3","rarrw":"\u219D","ratail":"\u291A","rAtail":"\u291C","ratio":"\u2236","rationals":"\u211A","rbarr":"\u290D","rBarr":"\u290F","RBarr":"\u2910","rbbrk":"\u2773","rbrace":"}","rbrack":"]","rbrke":"\u298C","rbrksld":"\u298E","rbrkslu":"\u2990","Rcaron":"\u0158","rcaron":"\u0159","Rcedil":"\u0156","rcedil":"\u0157","rceil":"\u2309","rcub":"}","Rcy":"\u0420","rcy":"\u0440","rdca":"\u2937","rdldhar":"\u2969","rdquo":"\u201D","rdquor":"\u201D","rdsh":"\u21B3","real":"\u211C","realine":"\u211B","realpart":"\u211C","reals":"\u211D","Re":"\u211C","rect":"\u25AD","reg":"\u00AE","REG":"\u00AE","ReverseElement":"\u220B","ReverseEquilibrium":"\u21CB","ReverseUpEquilibrium":"\u296F","rfisht":"\u297D","rfloor":"\u230B","rfr":"\uD835\uDD2F","Rfr":"\u211C","rHar":"\u2964","rhard":"\u21C1","rharu":"\u21C0","rharul":"\u296C","Rho":"\u03A1","rho":"\u03C1","rhov":"\u03F1","RightAngleBracket":"\u27E9","RightArrowBar":"\u21E5","rightarrow":"\u2192","RightArrow":"\u2192","Rightarrow":"\u21D2","RightArrowLeftArrow":"\u21C4","rightarrowtail":"\u21A3","RightCeiling":"\u2309","RightDoubleBracket":"\u27E7","RightDownTeeVector":"\u295D","RightDownVectorBar":"\u2955","RightDownVector":"\u21C2","RightFloor":"\u230B","rightharpoondown":"\u21C1","rightharpoonup":"\u21C0","rightleftarrows":"\u21C4","rightleftharpoons":"\u21CC","rightrightarrows":"\u21C9","rightsquigarrow":"\u219D","RightTeeArrow":"\u21A6","RightTee":"\u22A2","RightTeeVector":"\u295B","rightthreetimes":"\u22CC","RightTriangleBar":"\u29D0","RightTriangle":"\u22B3","RightTriangleEqual":"\u22B5","RightUpDownVector":"\u294F","RightUpTeeVector":"\u295C","RightUpVectorBar":"\u2954","RightUpVector":"\u21BE","RightVectorBar":"\u2953","RightVector":"\u21C0","ring":"\u02DA","risingdotseq":"\u2253","rlarr":"\u21C4","rlhar":"\u21CC","rlm":"\u200F","rmoustache":"\u23B1","rmoust":"\u23B1","rnmid":"\u2AEE","roang":"\u27ED","roarr":"\u21FE","robrk":"\u27E7","ropar":"\u2986","ropf":"\uD835\uDD63","Ropf":"\u211D","roplus":"\u2A2E","rotimes":"\u2A35","RoundImplies":"\u2970","rpar":")","rpargt":"\u2994","rppolint":"\u2A12","rrarr":"\u21C9","Rrightarrow":"\u21DB","rsaquo":"\u203A","rscr":"\uD835\uDCC7","Rscr":"\u211B","rsh":"\u21B1","Rsh":"\u21B1","rsqb":"]","rsquo":"\u2019","rsquor":"\u2019","rthree":"\u22CC","rtimes":"\u22CA","rtri":"\u25B9","rtrie":"\u22B5","rtrif":"\u25B8","rtriltri":"\u29CE","RuleDelayed":"\u29F4","ruluhar":"\u2968","rx":"\u211E","Sacute":"\u015A","sacute":"\u015B","sbquo":"\u201A","scap":"\u2AB8","Scaron":"\u0160","scaron":"\u0161","Sc":"\u2ABC","sc":"\u227B","sccue":"\u227D","sce":"\u2AB0","scE":"\u2AB4","Scedil":"\u015E","scedil":"\u015F","Scirc":"\u015C","scirc":"\u015D","scnap":"\u2ABA","scnE":"\u2AB6","scnsim":"\u22E9","scpolint":"\u2A13","scsim":"\u227F","Scy":"\u0421","scy":"\u0441","sdotb":"\u22A1","sdot":"\u22C5","sdote":"\u2A66","searhk":"\u2925","searr":"\u2198","seArr":"\u21D8","searrow":"\u2198","sect":"\u00A7","semi":";","seswar":"\u2929","setminus":"\u2216","setmn":"\u2216","sext":"\u2736","Sfr":"\uD835\uDD16","sfr":"\uD835\uDD30","sfrown":"\u2322","sharp":"\u266F","SHCHcy":"\u0429","shchcy":"\u0449","SHcy":"\u0428","shcy":"\u0448","ShortDownArrow":"\u2193","ShortLeftArrow":"\u2190","shortmid":"\u2223","shortparallel":"\u2225","ShortRightArrow":"\u2192","ShortUpArrow":"\u2191","shy":"\u00AD","Sigma":"\u03A3","sigma":"\u03C3","sigmaf":"\u03C2","sigmav":"\u03C2","sim":"\u223C","simdot":"\u2A6A","sime":"\u2243","simeq":"\u2243","simg":"\u2A9E","simgE":"\u2AA0","siml":"\u2A9D","simlE":"\u2A9F","simne":"\u2246","simplus":"\u2A24","simrarr":"\u2972","slarr":"\u2190","SmallCircle":"\u2218","smallsetminus":"\u2216","smashp":"\u2A33","smeparsl":"\u29E4","smid":"\u2223","smile":"\u2323","smt":"\u2AAA","smte":"\u2AAC","smtes":"\u2AAC\uFE00","SOFTcy":"\u042C","softcy":"\u044C","solbar":"\u233F","solb":"\u29C4","sol":"/","Sopf":"\uD835\uDD4A","sopf":"\uD835\uDD64","spades":"\u2660","spadesuit":"\u2660","spar":"\u2225","sqcap":"\u2293","sqcaps":"\u2293\uFE00","sqcup":"\u2294","sqcups":"\u2294\uFE00","Sqrt":"\u221A","sqsub":"\u228F","sqsube":"\u2291","sqsubset":"\u228F","sqsubseteq":"\u2291","sqsup":"\u2290","sqsupe":"\u2292","sqsupset":"\u2290","sqsupseteq":"\u2292","square":"\u25A1","Square":"\u25A1","SquareIntersection":"\u2293","SquareSubset":"\u228F","SquareSubsetEqual":"\u2291","SquareSuperset":"\u2290","SquareSupersetEqual":"\u2292","SquareUnion":"\u2294","squarf":"\u25AA","squ":"\u25A1","squf":"\u25AA","srarr":"\u2192","Sscr":"\uD835\uDCAE","sscr":"\uD835\uDCC8","ssetmn":"\u2216","ssmile":"\u2323","sstarf":"\u22C6","Star":"\u22C6","star":"\u2606","starf":"\u2605","straightepsilon":"\u03F5","straightphi":"\u03D5","strns":"\u00AF","sub":"\u2282","Sub":"\u22D0","subdot":"\u2ABD","subE":"\u2AC5","sube":"\u2286","subedot":"\u2AC3","submult":"\u2AC1","subnE":"\u2ACB","subne":"\u228A","subplus":"\u2ABF","subrarr":"\u2979","subset":"\u2282","Subset":"\u22D0","subseteq":"\u2286","subseteqq":"\u2AC5","SubsetEqual":"\u2286","subsetneq":"\u228A","subsetneqq":"\u2ACB","subsim":"\u2AC7","subsub":"\u2AD5","subsup":"\u2AD3","succapprox":"\u2AB8","succ":"\u227B","succcurlyeq":"\u227D","Succeeds":"\u227B","SucceedsEqual":"\u2AB0","SucceedsSlantEqual":"\u227D","SucceedsTilde":"\u227F","succeq":"\u2AB0","succnapprox":"\u2ABA","succneqq":"\u2AB6","succnsim":"\u22E9","succsim":"\u227F","SuchThat":"\u220B","sum":"\u2211","Sum":"\u2211","sung":"\u266A","sup1":"\u00B9","sup2":"\u00B2","sup3":"\u00B3","sup":"\u2283","Sup":"\u22D1","supdot":"\u2ABE","supdsub":"\u2AD8","supE":"\u2AC6","supe":"\u2287","supedot":"\u2AC4","Superset":"\u2283","SupersetEqual":"\u2287","suphsol":"\u27C9","suphsub":"\u2AD7","suplarr":"\u297B","supmult":"\u2AC2","supnE":"\u2ACC","supne":"\u228B","supplus":"\u2AC0","supset":"\u2283","Supset":"\u22D1","supseteq":"\u2287","supseteqq":"\u2AC6","supsetneq":"\u228B","supsetneqq":"\u2ACC","supsim":"\u2AC8","supsub":"\u2AD4","supsup":"\u2AD6","swarhk":"\u2926","swarr":"\u2199","swArr":"\u21D9","swarrow":"\u2199","swnwar":"\u292A","szlig":"\u00DF","Tab":"\t","target":"\u2316","Tau":"\u03A4","tau":"\u03C4","tbrk":"\u23B4","Tcaron":"\u0164","tcaron":"\u0165","Tcedil":"\u0162","tcedil":"\u0163","Tcy":"\u0422","tcy":"\u0442","tdot":"\u20DB","telrec":"\u2315","Tfr":"\uD835\uDD17","tfr":"\uD835\uDD31","there4":"\u2234","therefore":"\u2234","Therefore":"\u2234","Theta":"\u0398","theta":"\u03B8","thetasym":"\u03D1","thetav":"\u03D1","thickapprox":"\u2248","thicksim":"\u223C","ThickSpace":"\u205F\u200A","ThinSpace":"\u2009","thinsp":"\u2009","thkap":"\u2248","thksim":"\u223C","THORN":"\u00DE","thorn":"\u00FE","tilde":"\u02DC","Tilde":"\u223C","TildeEqual":"\u2243","TildeFullEqual":"\u2245","TildeTilde":"\u2248","timesbar":"\u2A31","timesb":"\u22A0","times":"\u00D7","timesd":"\u2A30","tint":"\u222D","toea":"\u2928","topbot":"\u2336","topcir":"\u2AF1","top":"\u22A4","Topf":"\uD835\uDD4B","topf":"\uD835\uDD65","topfork":"\u2ADA","tosa":"\u2929","tprime":"\u2034","trade":"\u2122","TRADE":"\u2122","triangle":"\u25B5","triangledown":"\u25BF","triangleleft":"\u25C3","trianglelefteq":"\u22B4","triangleq":"\u225C","triangleright":"\u25B9","trianglerighteq":"\u22B5","tridot":"\u25EC","trie":"\u225C","triminus":"\u2A3A","TripleDot":"\u20DB","triplus":"\u2A39","trisb":"\u29CD","tritime":"\u2A3B","trpezium":"\u23E2","Tscr":"\uD835\uDCAF","tscr":"\uD835\uDCC9","TScy":"\u0426","tscy":"\u0446","TSHcy":"\u040B","tshcy":"\u045B","Tstrok":"\u0166","tstrok":"\u0167","twixt":"\u226C","twoheadleftarrow":"\u219E","twoheadrightarrow":"\u21A0","Uacute":"\u00DA","uacute":"\u00FA","uarr":"\u2191","Uarr":"\u219F","uArr":"\u21D1","Uarrocir":"\u2949","Ubrcy":"\u040E","ubrcy":"\u045E","Ubreve":"\u016C","ubreve":"\u016D","Ucirc":"\u00DB","ucirc":"\u00FB","Ucy":"\u0423","ucy":"\u0443","udarr":"\u21C5","Udblac":"\u0170","udblac":"\u0171","udhar":"\u296E","ufisht":"\u297E","Ufr":"\uD835\uDD18","ufr":"\uD835\uDD32","Ugrave":"\u00D9","ugrave":"\u00F9","uHar":"\u2963","uharl":"\u21BF","uharr":"\u21BE","uhblk":"\u2580","ulcorn":"\u231C","ulcorner":"\u231C","ulcrop":"\u230F","ultri":"\u25F8","Umacr":"\u016A","umacr":"\u016B","uml":"\u00A8","UnderBar":"_","UnderBrace":"\u23DF","UnderBracket":"\u23B5","UnderParenthesis":"\u23DD","Union":"\u22C3","UnionPlus":"\u228E","Uogon":"\u0172","uogon":"\u0173","Uopf":"\uD835\uDD4C","uopf":"\uD835\uDD66","UpArrowBar":"\u2912","uparrow":"\u2191","UpArrow":"\u2191","Uparrow":"\u21D1","UpArrowDownArrow":"\u21C5","updownarrow":"\u2195","UpDownArrow":"\u2195","Updownarrow":"\u21D5","UpEquilibrium":"\u296E","upharpoonleft":"\u21BF","upharpoonright":"\u21BE","uplus":"\u228E","UpperLeftArrow":"\u2196","UpperRightArrow":"\u2197","upsi":"\u03C5","Upsi":"\u03D2","upsih":"\u03D2","Upsilon":"\u03A5","upsilon":"\u03C5","UpTeeArrow":"\u21A5","UpTee":"\u22A5","upuparrows":"\u21C8","urcorn":"\u231D","urcorner":"\u231D","urcrop":"\u230E","Uring":"\u016E","uring":"\u016F","urtri":"\u25F9","Uscr":"\uD835\uDCB0","uscr":"\uD835\uDCCA","utdot":"\u22F0","Utilde":"\u0168","utilde":"\u0169","utri":"\u25B5","utrif":"\u25B4","uuarr":"\u21C8","Uuml":"\u00DC","uuml":"\u00FC","uwangle":"\u29A7","vangrt":"\u299C","varepsilon":"\u03F5","varkappa":"\u03F0","varnothing":"\u2205","varphi":"\u03D5","varpi":"\u03D6","varpropto":"\u221D","varr":"\u2195","vArr":"\u21D5","varrho":"\u03F1","varsigma":"\u03C2","varsubsetneq":"\u228A\uFE00","varsubsetneqq":"\u2ACB\uFE00","varsupsetneq":"\u228B\uFE00","varsupsetneqq":"\u2ACC\uFE00","vartheta":"\u03D1","vartriangleleft":"\u22B2","vartriangleright":"\u22B3","vBar":"\u2AE8","Vbar":"\u2AEB","vBarv":"\u2AE9","Vcy":"\u0412","vcy":"\u0432","vdash":"\u22A2","vDash":"\u22A8","Vdash":"\u22A9","VDash":"\u22AB","Vdashl":"\u2AE6","veebar":"\u22BB","vee":"\u2228","Vee":"\u22C1","veeeq":"\u225A","vellip":"\u22EE","verbar":"|","Verbar":"\u2016","vert":"|","Vert":"\u2016","VerticalBar":"\u2223","VerticalLine":"|","VerticalSeparator":"\u2758","VerticalTilde":"\u2240","VeryThinSpace":"\u200A","Vfr":"\uD835\uDD19","vfr":"\uD835\uDD33","vltri":"\u22B2","vnsub":"\u2282\u20D2","vnsup":"\u2283\u20D2","Vopf":"\uD835\uDD4D","vopf":"\uD835\uDD67","vprop":"\u221D","vrtri":"\u22B3","Vscr":"\uD835\uDCB1","vscr":"\uD835\uDCCB","vsubnE":"\u2ACB\uFE00","vsubne":"\u228A\uFE00","vsupnE":"\u2ACC\uFE00","vsupne":"\u228B\uFE00","Vvdash":"\u22AA","vzigzag":"\u299A","Wcirc":"\u0174","wcirc":"\u0175","wedbar":"\u2A5F","wedge":"\u2227","Wedge":"\u22C0","wedgeq":"\u2259","weierp":"\u2118","Wfr":"\uD835\uDD1A","wfr":"\uD835\uDD34","Wopf":"\uD835\uDD4E","wopf":"\uD835\uDD68","wp":"\u2118","wr":"\u2240","wreath":"\u2240","Wscr":"\uD835\uDCB2","wscr":"\uD835\uDCCC","xcap":"\u22C2","xcirc":"\u25EF","xcup":"\u22C3","xdtri":"\u25BD","Xfr":"\uD835\uDD1B","xfr":"\uD835\uDD35","xharr":"\u27F7","xhArr":"\u27FA","Xi":"\u039E","xi":"\u03BE","xlarr":"\u27F5","xlArr":"\u27F8","xmap":"\u27FC","xnis":"\u22FB","xodot":"\u2A00","Xopf":"\uD835\uDD4F","xopf":"\uD835\uDD69","xoplus":"\u2A01","xotime":"\u2A02","xrarr":"\u27F6","xrArr":"\u27F9","Xscr":"\uD835\uDCB3","xscr":"\uD835\uDCCD","xsqcup":"\u2A06","xuplus":"\u2A04","xutri":"\u25B3","xvee":"\u22C1","xwedge":"\u22C0","Yacute":"\u00DD","yacute":"\u00FD","YAcy":"\u042F","yacy":"\u044F","Ycirc":"\u0176","ycirc":"\u0177","Ycy":"\u042B","ycy":"\u044B","yen":"\u00A5","Yfr":"\uD835\uDD1C","yfr":"\uD835\uDD36","YIcy":"\u0407","yicy":"\u0457","Yopf":"\uD835\uDD50","yopf":"\uD835\uDD6A","Yscr":"\uD835\uDCB4","yscr":"\uD835\uDCCE","YUcy":"\u042E","yucy":"\u044E","yuml":"\u00FF","Yuml":"\u0178","Zacute":"\u0179","zacute":"\u017A","Zcaron":"\u017D","zcaron":"\u017E","Zcy":"\u0417","zcy":"\u0437","Zdot":"\u017B","zdot":"\u017C","zeetrf":"\u2128","ZeroWidthSpace":"\u200B","Zeta":"\u0396","zeta":"\u03B6","zfr":"\uD835\uDD37","Zfr":"\u2128","ZHcy":"\u0416","zhcy":"\u0436","zigrarr":"\u21DD","zopf":"\uD835\uDD6B","Zopf":"\u2124","Zscr":"\uD835\uDCB5","zscr":"\uD835\uDCCF","zwj":"\u200D","zwnj":"\u200C"}
},{}],160:[function(require,module,exports){
'use strict';


////////////////////////////////////////////////////////////////////////////////
// Helpers

// Merge objects
//
function assign(obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);

  sources.forEach(function (source) {
    if (!source) { return; }

    Object.keys(source).forEach(function (key) {
      obj[key] = source[key];
    });
  });

  return obj;
}

function _class(obj) { return Object.prototype.toString.call(obj); }
function isString(obj) { return _class(obj) === '[object String]'; }
function isObject(obj) { return _class(obj) === '[object Object]'; }
function isRegExp(obj) { return _class(obj) === '[object RegExp]'; }
function isFunction(obj) { return _class(obj) === '[object Function]'; }


function escapeRE (str) { return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&'); }

////////////////////////////////////////////////////////////////////////////////


var defaultOptions = {
  fuzzyLink: true,
  fuzzyEmail: true,
  fuzzyIP: false
};


function isOptionsObj(obj) {
  return Object.keys(obj || {}).reduce(function (acc, k) {
    return acc || defaultOptions.hasOwnProperty(k);
  }, false);
}


var defaultSchemas = {
  'http:': {
    validate: function (text, pos, self) {
      var tail = text.slice(pos);

      if (!self.re.http) {
        // compile lazily, because "host"-containing variables can change on tlds update.
        self.re.http =  new RegExp(
          '^\\/\\/' + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path, 'i'
        );
      }
      if (self.re.http.test(tail)) {
        return tail.match(self.re.http)[0].length;
      }
      return 0;
    }
  },
  'https:':  'http:',
  'ftp:':    'http:',
  '//':      {
    validate: function (text, pos, self) {
      var tail = text.slice(pos);

      if (!self.re.no_http) {
      // compile lazily, becayse "host"-containing variables can change on tlds update.
        self.re.no_http =  new RegExp(
          '^' + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path, 'i'
        );
      }

      if (self.re.no_http.test(tail)) {
        // should not be `://`, that protects from errors in protocol name
        if (pos >= 3 && text[pos - 3] === ':') { return 0; }
        return tail.match(self.re.no_http)[0].length;
      }
      return 0;
    }
  },
  'mailto:': {
    validate: function (text, pos, self) {
      var tail = text.slice(pos);

      if (!self.re.mailto) {
        self.re.mailto =  new RegExp(
          '^' + self.re.src_email_name + '@' + self.re.src_host_strict, 'i'
        );
      }
      if (self.re.mailto.test(tail)) {
        return tail.match(self.re.mailto)[0].length;
      }
      return 0;
    }
  }
};

/*eslint-disable max-len*/

// RE pattern for 2-character tlds (autogenerated by ./support/tlds_2char_gen.js)
var tlds_2ch_src_re = 'a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]';

// DON'T try to make PRs with changes. Extend TLDs with LinkifyIt.tlds() instead
var tlds_default = 'biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф'.split('|');

/*eslint-enable max-len*/

////////////////////////////////////////////////////////////////////////////////

function resetScanCache(self) {
  self.__index__ = -1;
  self.__text_cache__   = '';
}

function createValidator(re) {
  return function (text, pos) {
    var tail = text.slice(pos);

    if (re.test(tail)) {
      return tail.match(re)[0].length;
    }
    return 0;
  };
}

function createNormalizer() {
  return function (match, self) {
    self.normalize(match);
  };
}

// Schemas compiler. Build regexps.
//
function compile(self) {

  // Load & clone RE patterns.
  var re = self.re = assign({}, require('./lib/re'));

  // Define dynamic patterns
  var tlds = self.__tlds__.slice();

  if (!self.__tlds_replaced__) {
    tlds.push(tlds_2ch_src_re);
  }
  tlds.push(re.src_xn);

  re.src_tlds = tlds.join('|');

  function untpl(tpl) { return tpl.replace('%TLDS%', re.src_tlds); }

  re.email_fuzzy      = RegExp(untpl(re.tpl_email_fuzzy), 'i');
  re.link_fuzzy       = RegExp(untpl(re.tpl_link_fuzzy), 'i');
  re.link_no_ip_fuzzy = RegExp(untpl(re.tpl_link_no_ip_fuzzy), 'i');
  re.host_fuzzy_test  = RegExp(untpl(re.tpl_host_fuzzy_test), 'i');

  //
  // Compile each schema
  //

  var aliases = [];

  self.__compiled__ = {}; // Reset compiled data

  function schemaError(name, val) {
    throw new Error('(LinkifyIt) Invalid schema "' + name + '": ' + val);
  }

  Object.keys(self.__schemas__).forEach(function (name) {
    var val = self.__schemas__[name];

    // skip disabled methods
    if (val === null) { return; }

    var compiled = { validate: null, link: null };

    self.__compiled__[name] = compiled;

    if (isObject(val)) {
      if (isRegExp(val.validate)) {
        compiled.validate = createValidator(val.validate);
      } else if (isFunction(val.validate)) {
        compiled.validate = val.validate;
      } else {
        schemaError(name, val);
      }

      if (isFunction(val.normalize)) {
        compiled.normalize = val.normalize;
      } else if (!val.normalize) {
        compiled.normalize = createNormalizer();
      } else {
        schemaError(name, val);
      }

      return;
    }

    if (isString(val)) {
      aliases.push(name);
      return;
    }

    schemaError(name, val);
  });

  //
  // Compile postponed aliases
  //

  aliases.forEach(function (alias) {
    if (!self.__compiled__[self.__schemas__[alias]]) {
      // Silently fail on missed schemas to avoid errons on disable.
      // schemaError(alias, self.__schemas__[alias]);
      return;
    }

    self.__compiled__[alias].validate =
      self.__compiled__[self.__schemas__[alias]].validate;
    self.__compiled__[alias].normalize =
      self.__compiled__[self.__schemas__[alias]].normalize;
  });

  //
  // Fake record for guessed links
  //
  self.__compiled__[''] = { validate: null, normalize: createNormalizer() };

  //
  // Build schema condition
  //
  var slist = Object.keys(self.__compiled__)
                      .filter(function(name) {
                        // Filter disabled & fake schemas
                        return name.length > 0 && self.__compiled__[name];
                      })
                      .map(escapeRE)
                      .join('|');
  // (?!_) cause 1.5x slowdown
  self.re.schema_test   = RegExp('(^|(?!_)(?:>|' + re.src_ZPCc + '))(' + slist + ')', 'i');
  self.re.schema_search = RegExp('(^|(?!_)(?:>|' + re.src_ZPCc + '))(' + slist + ')', 'ig');

  self.re.pretest       = RegExp(
                            '(' + self.re.schema_test.source + ')|' +
                            '(' + self.re.host_fuzzy_test.source + ')|' +
                            '@',
                            'i');

  //
  // Cleanup
  //

  resetScanCache(self);
}

/**
 * class Match
 *
 * Match result. Single element of array, returned by [[LinkifyIt#match]]
 **/
function Match(self, shift) {
  var start = self.__index__,
      end   = self.__last_index__,
      text  = self.__text_cache__.slice(start, end);

  /**
   * Match#schema -> String
   *
   * Prefix (protocol) for matched string.
   **/
  this.schema    = self.__schema__.toLowerCase();
  /**
   * Match#index -> Number
   *
   * First position of matched string.
   **/
  this.index     = start + shift;
  /**
   * Match#lastIndex -> Number
   *
   * Next position after matched string.
   **/
  this.lastIndex = end + shift;
  /**
   * Match#raw -> String
   *
   * Matched string.
   **/
  this.raw       = text;
  /**
   * Match#text -> String
   *
   * Notmalized text of matched string.
   **/
  this.text      = text;
  /**
   * Match#url -> String
   *
   * Normalized url of matched string.
   **/
  this.url       = text;
}

function createMatch(self, shift) {
  var match = new Match(self, shift);

  self.__compiled__[match.schema].normalize(match, self);

  return match;
}


/**
 * class LinkifyIt
 **/

/**
 * new LinkifyIt(schemas, options)
 * - schemas (Object): Optional. Additional schemas to validate (prefix/validator)
 * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
 *
 * Creates new linkifier instance with optional additional schemas.
 * Can be called without `new` keyword for convenience.
 *
 * By default understands:
 *
 * - `http(s)://...` , `ftp://...`, `mailto:...` & `//...` links
 * - "fuzzy" links and emails (example.com, foo@bar.com).
 *
 * `schemas` is an object, where each key/value describes protocol/rule:
 *
 * - __key__ - link prefix (usually, protocol name with `:` at the end, `skype:`
 *   for example). `linkify-it` makes shure that prefix is not preceeded with
 *   alphanumeric char and symbols. Only whitespaces and punctuation allowed.
 * - __value__ - rule to check tail after link prefix
 *   - _String_ - just alias to existing rule
 *   - _Object_
 *     - _validate_ - validator function (should return matched length on success),
 *       or `RegExp`.
 *     - _normalize_ - optional function to normalize text & url of matched result
 *       (for example, for @twitter mentions).
 *
 * `options`:
 *
 * - __fuzzyLink__ - recognige URL-s without `http(s):` prefix. Default `true`.
 * - __fuzzyIP__ - allow IPs in fuzzy links above. Can conflict with some texts
 *   like version numbers. Default `false`.
 * - __fuzzyEmail__ - recognize emails without `mailto:` prefix.
 *
 **/
function LinkifyIt(schemas, options) {
  if (!(this instanceof LinkifyIt)) {
    return new LinkifyIt(schemas, options);
  }

  if (!options) {
    if (isOptionsObj(schemas)) {
      options = schemas;
      schemas = {};
    }
  }

  this.__opts__           = assign({}, defaultOptions, options);

  // Cache last tested result. Used to skip repeating steps on next `match` call.
  this.__index__          = -1;
  this.__last_index__     = -1; // Next scan position
  this.__schema__         = '';
  this.__text_cache__     = '';

  this.__schemas__        = assign({}, defaultSchemas, schemas);
  this.__compiled__       = {};

  this.__tlds__           = tlds_default;
  this.__tlds_replaced__  = false;

  this.re = {};

  compile(this);
}


/** chainable
 * LinkifyIt#add(schema, definition)
 * - schema (String): rule name (fixed pattern prefix)
 * - definition (String|RegExp|Object): schema definition
 *
 * Add new rule definition. See constructor description for details.
 **/
LinkifyIt.prototype.add = function add(schema, definition) {
  this.__schemas__[schema] = definition;
  compile(this);
  return this;
};


/** chainable
 * LinkifyIt#set(options)
 * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
 *
 * Set recognition options for links without schema.
 **/
LinkifyIt.prototype.set = function set(options) {
  this.__opts__ = assign(this.__opts__, options);
  return this;
};


/**
 * LinkifyIt#test(text) -> Boolean
 *
 * Searches linkifiable pattern and returns `true` on success or `false` on fail.
 **/
LinkifyIt.prototype.test = function test(text) {
  // Reset scan cache
  this.__text_cache__ = text;
  this.__index__      = -1;

  if (!text.length) { return false; }

  var m, ml, me, len, shift, next, re, tld_pos, at_pos;

  // try to scan for link with schema - that's the most simple rule
  if (this.re.schema_test.test(text)) {
    re = this.re.schema_search;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      len = this.testSchemaAt(text, m[2], re.lastIndex);
      if (len) {
        this.__schema__     = m[2];
        this.__index__      = m.index + m[1].length;
        this.__last_index__ = m.index + m[0].length + len;
        break;
      }
    }
  }

  if (this.__opts__.fuzzyLink && this.__compiled__['http:']) {
    // guess schemaless links
    tld_pos = text.search(this.re.host_fuzzy_test);
    if (tld_pos >= 0) {
      // if tld is located after found link - no need to check fuzzy pattern
      if (this.__index__ < 0 || tld_pos < this.__index__) {
        if ((ml = text.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) !== null) {

          shift = ml.index + ml[1].length;

          if (this.__index__ < 0 || shift < this.__index__) {
            this.__schema__     = '';
            this.__index__      = shift;
            this.__last_index__ = ml.index + ml[0].length;
          }
        }
      }
    }
  }

  if (this.__opts__.fuzzyEmail && this.__compiled__['mailto:']) {
    // guess schemaless emails
    at_pos = text.indexOf('@');
    if (at_pos >= 0) {
      // We can't skip this check, because this cases are possible:
      // 192.168.1.1@gmail.com, my.in@example.com
      if ((me = text.match(this.re.email_fuzzy)) !== null) {

        shift = me.index + me[1].length;
        next  = me.index + me[0].length;

        if (this.__index__ < 0 || shift < this.__index__ ||
            (shift === this.__index__ && next > this.__last_index__)) {
          this.__schema__     = 'mailto:';
          this.__index__      = shift;
          this.__last_index__ = next;
        }
      }
    }
  }

  return this.__index__ >= 0;
};


/**
 * LinkifyIt#pretest(text) -> Boolean
 *
 * Very quick check, that can give false positives. Returns true if link MAY BE
 * can exists. Can be used for speed optimization, when you need to check that
 * link NOT exists.
 **/
LinkifyIt.prototype.pretest = function pretest(text) {
  return this.re.pretest.test(text);
};


/**
 * LinkifyIt#testSchemaAt(text, name, position) -> Number
 * - text (String): text to scan
 * - name (String): rule (schema) name
 * - position (Number): text offset to check from
 *
 * Similar to [[LinkifyIt#test]] but checks only specific protocol tail exactly
 * at given position. Returns length of found pattern (0 on fail).
 **/
LinkifyIt.prototype.testSchemaAt = function testSchemaAt(text, schema, pos) {
  // If not supported schema check requested - terminate
  if (!this.__compiled__[schema.toLowerCase()]) {
    return 0;
  }
  return this.__compiled__[schema.toLowerCase()].validate(text, pos, this);
};


/**
 * LinkifyIt#match(text) -> Array|null
 *
 * Returns array of found link descriptions or `null` on fail. We strongly
 * to use [[LinkifyIt#test]] first, for best speed.
 *
 * ##### Result match description
 *
 * - __schema__ - link schema, can be empty for fuzzy links, or `//` for
 *   protocol-neutral  links.
 * - __index__ - offset of matched text
 * - __lastIndex__ - index of next char after mathch end
 * - __raw__ - matched text
 * - __text__ - normalized text
 * - __url__ - link, generated from matched text
 **/
LinkifyIt.prototype.match = function match(text) {
  var shift = 0, result = [];

  // Try to take previous element from cache, if .test() called before
  if (this.__index__ >= 0 && this.__text_cache__ === text) {
    result.push(createMatch(this, shift));
    shift = this.__last_index__;
  }

  // Cut head if cache was used
  var tail = shift ? text.slice(shift) : text;

  // Scan string until end reached
  while (this.test(tail)) {
    result.push(createMatch(this, shift));

    tail = tail.slice(this.__last_index__);
    shift += this.__last_index__;
  }

  if (result.length) {
    return result;
  }

  return null;
};


/** chainable
 * LinkifyIt#tlds(list [, keepOld]) -> this
 * - list (Array): list of tlds
 * - keepOld (Boolean): merge with current list if `true` (`false` by default)
 *
 * Load (or merge) new tlds list. Those are user for fuzzy links (without prefix)
 * to avoid false positives. By default this algorythm used:
 *
 * - hostname with any 2-letter root zones are ok.
 * - biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф
 *   are ok.
 * - encoded (`xn--...`) root zones are ok.
 *
 * If list is replaced, then exact match for 2-chars root zones will be checked.
 **/
LinkifyIt.prototype.tlds = function tlds(list, keepOld) {
  list = Array.isArray(list) ? list : [ list ];

  if (!keepOld) {
    this.__tlds__ = list.slice();
    this.__tlds_replaced__ = true;
    compile(this);
    return this;
  }

  this.__tlds__ = this.__tlds__.concat(list)
                                  .sort()
                                  .filter(function(el, idx, arr) {
                                    return el !== arr[idx - 1];
                                  })
                                  .reverse();

  compile(this);
  return this;
};

/**
 * LinkifyIt#normalize(match)
 *
 * Default normalizer (if schema does not define it's own).
 **/
LinkifyIt.prototype.normalize = function normalize(match) {

  // Do minimal possible changes by default. Need to collect feedback prior
  // to move forward https://github.com/markdown-it/linkify-it/issues/1

  if (!match.schema) { match.url = 'http://' + match.url; }

  if (match.schema === 'mailto:' && !/^mailto:/i.test(match.url)) {
    match.url = 'mailto:' + match.url;
  }
};


module.exports = LinkifyIt;

},{"./lib/re":161}],161:[function(require,module,exports){
'use strict';

// Use direct extract instead of `regenerate` to reduse browserified size
var src_Any = exports.src_Any = require('uc.micro/properties/Any/regex').source;
var src_Cc  = exports.src_Cc = require('uc.micro/categories/Cc/regex').source;
var src_Z   = exports.src_Z  = require('uc.micro/categories/Z/regex').source;
var src_P   = exports.src_P  = require('uc.micro/categories/P/regex').source;

// \p{\Z\P\Cc\CF} (white spaces + control + format + punctuation)
var src_ZPCc = exports.src_ZPCc = [ src_Z, src_P, src_Cc ].join('|');

// \p{\Z\Cc} (white spaces + control)
var src_ZCc = exports.src_ZCc = [ src_Z, src_Cc ].join('|');

// All possible word characters (everything without punctuation, spaces & controls)
// Defined via punctuation & spaces to save space
// Should be something like \p{\L\N\S\M} (\w but without `_`)
var src_pseudo_letter       = '(?:(?!' + src_ZPCc + ')' + src_Any + ')';
// The same as abothe but without [0-9]
var src_pseudo_letter_non_d = '(?:(?![0-9]|' + src_ZPCc + ')' + src_Any + ')';

////////////////////////////////////////////////////////////////////////////////

var src_ip4 = exports.src_ip4 =

  '(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';

exports.src_auth    = '(?:(?:(?!' + src_ZCc + ').)+@)?';

var src_port = exports.src_port =

  '(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?';

var src_host_terminator = exports.src_host_terminator =

  '(?=$|' + src_ZPCc + ')(?!-|_|:\\d|\\.-|\\.(?!$|' + src_ZPCc + '))';

var src_path = exports.src_path =

  '(?:' +
    '[/?#]' +
      '(?:' +
        '(?!' + src_ZCc + '|[()[\\]{}.,"\'?!\\-]).|' +
        '\\[(?:(?!' + src_ZCc + '|\\]).)*\\]|' +
        '\\((?:(?!' + src_ZCc + '|[)]).)*\\)|' +
        '\\{(?:(?!' + src_ZCc + '|[}]).)*\\}|' +
        '\\"(?:(?!' + src_ZCc + '|["]).)+\\"|' +
        "\\'(?:(?!" + src_ZCc + "|[']).)+\\'|" +
        "\\'(?=" + src_pseudo_letter + ').|' +  // allow `I'm_king` if no pair found
        '\\.{2,3}[a-zA-Z0-9%/]|' + // github has ... in commit range links. Restrict to
                                   // - english
                                   // - percent-encoded
                                   // - parts of file path
                                   // until more examples found.
        '\\.(?!' + src_ZCc + '|[.]).|' +
        '\\-(?!--(?:[^-]|$))(?:-*)|' +  // `---` => long dash, terminate
        '\\,(?!' + src_ZCc + ').|' +      // allow `,,,` in paths
        '\\!(?!' + src_ZCc + '|[!]).|' +
        '\\?(?!' + src_ZCc + '|[?]).' +
      ')+' +
    '|\\/' +
  ')?';

var src_email_name = exports.src_email_name =

  '[\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]+';

var src_xn = exports.src_xn =

  'xn--[a-z0-9\\-]{1,59}';

// More to read about domain names
// http://serverfault.com/questions/638260/

var src_domain_root = exports.src_domain_root =

  // Can't have digits and dashes
  '(?:' +
    src_xn +
    '|' +
    src_pseudo_letter_non_d + '{1,63}' +
  ')';

var src_domain = exports.src_domain =

  '(?:' +
    src_xn +
    '|' +
    '(?:' + src_pseudo_letter + ')' +
    '|' +
    // don't allow `--` in domain names, because:
    // - that can conflict with markdown &mdash; / &ndash;
    // - nobody use those anyway
    '(?:' + src_pseudo_letter + '(?:-(?!-)|' + src_pseudo_letter + '){0,61}' + src_pseudo_letter + ')' +
  ')';

var src_host = exports.src_host =

  '(?:' +
    src_ip4 +
  '|' +
    '(?:(?:(?:' + src_domain + ')\\.)*' + src_domain_root + ')' +
  ')';

var tpl_host_fuzzy = exports.tpl_host_fuzzy =

  '(?:' +
    src_ip4 +
  '|' +
    '(?:(?:(?:' + src_domain + ')\\.)+(?:%TLDS%))' +
  ')';

var tpl_host_no_ip_fuzzy = exports.tpl_host_no_ip_fuzzy =

  '(?:(?:(?:' + src_domain + ')\\.)+(?:%TLDS%))';

exports.src_host_strict =

  src_host + src_host_terminator;

var tpl_host_fuzzy_strict = exports.tpl_host_fuzzy_strict =

  tpl_host_fuzzy + src_host_terminator;

exports.src_host_port_strict =

  src_host + src_port + src_host_terminator;

var tpl_host_port_fuzzy_strict = exports.tpl_host_port_fuzzy_strict =

  tpl_host_fuzzy + src_port + src_host_terminator;

var tpl_host_port_no_ip_fuzzy_strict = exports.tpl_host_port_no_ip_fuzzy_strict =

  tpl_host_no_ip_fuzzy + src_port + src_host_terminator;


////////////////////////////////////////////////////////////////////////////////
// Main rules

// Rude test fuzzy links by host, for quick deny
exports.tpl_host_fuzzy_test =

  'localhost|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:' + src_ZPCc + '|$))';

exports.tpl_email_fuzzy =

    '(^|>|' + src_ZCc + ')(' + src_email_name + '@' + tpl_host_fuzzy_strict + ')';

exports.tpl_link_fuzzy =
    // Fuzzy link can't be prepended with .:/\- and non punctuation.
    // but can start with > (markdown blockquote)
    '(^|(?![.:/\\-_@])(?:[$+<=>^`|]|' + src_ZPCc + '))' +
    '((?![$+<=>^`|])' + tpl_host_port_fuzzy_strict + src_path + ')';

exports.tpl_link_no_ip_fuzzy =
    // Fuzzy link can't be prepended with .:/\- and non punctuation.
    // but can start with > (markdown blockquote)
    '(^|(?![.:/\\-_@])(?:[$+<=>^`|]|' + src_ZPCc + '))' +
    '((?![$+<=>^`|])' + tpl_host_port_no_ip_fuzzy_strict + src_path + ')';

},{"uc.micro/categories/Cc/regex":167,"uc.micro/categories/P/regex":169,"uc.micro/categories/Z/regex":170,"uc.micro/properties/Any/regex":172}],162:[function(require,module,exports){

'use strict';


/* eslint-disable no-bitwise */

var decodeCache = {};

function getDecodeCache(exclude) {
  var i, ch, cache = decodeCache[exclude];
  if (cache) { return cache; }

  cache = decodeCache[exclude] = [];

  for (i = 0; i < 128; i++) {
    ch = String.fromCharCode(i);
    cache.push(ch);
  }

  for (i = 0; i < exclude.length; i++) {
    ch = exclude.charCodeAt(i);
    cache[ch] = '%' + ('0' + ch.toString(16).toUpperCase()).slice(-2);
  }

  return cache;
}


// Decode percent-encoded string.
//
function decode(string, exclude) {
  var cache;

  if (typeof exclude !== 'string') {
    exclude = decode.defaultChars;
  }

  cache = getDecodeCache(exclude);

  return string.replace(/(%[a-f0-9]{2})+/gi, function(seq) {
    var i, l, b1, b2, b3, b4, chr,
        result = '';

    for (i = 0, l = seq.length; i < l; i += 3) {
      b1 = parseInt(seq.slice(i + 1, i + 3), 16);

      if (b1 < 0x80) {
        result += cache[b1];
        continue;
      }

      if ((b1 & 0xE0) === 0xC0 && (i + 3 < l)) {
        // 110xxxxx 10xxxxxx
        b2 = parseInt(seq.slice(i + 4, i + 6), 16);

        if ((b2 & 0xC0) === 0x80) {
          chr = ((b1 << 6) & 0x7C0) | (b2 & 0x3F);

          if (chr < 0x80) {
            result += '\ufffd\ufffd';
          } else {
            result += String.fromCharCode(chr);
          }

          i += 3;
          continue;
        }
      }

      if ((b1 & 0xF0) === 0xE0 && (i + 6 < l)) {
        // 1110xxxx 10xxxxxx 10xxxxxx
        b2 = parseInt(seq.slice(i + 4, i + 6), 16);
        b3 = parseInt(seq.slice(i + 7, i + 9), 16);

        if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
          chr = ((b1 << 12) & 0xF000) | ((b2 << 6) & 0xFC0) | (b3 & 0x3F);

          if (chr < 0x800 || (chr >= 0xD800 && chr <= 0xDFFF)) {
            result += '\ufffd\ufffd\ufffd';
          } else {
            result += String.fromCharCode(chr);
          }

          i += 6;
          continue;
        }
      }

      if ((b1 & 0xF8) === 0xF0 && (i + 9 < l)) {
        // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx
        b2 = parseInt(seq.slice(i + 4, i + 6), 16);
        b3 = parseInt(seq.slice(i + 7, i + 9), 16);
        b4 = parseInt(seq.slice(i + 10, i + 12), 16);

        if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80 && (b4 & 0xC0) === 0x80) {
          chr = ((b1 << 18) & 0x1C0000) | ((b2 << 12) & 0x3F000) | ((b3 << 6) & 0xFC0) | (b4 & 0x3F);

          if (chr < 0x10000 || chr > 0x10FFFF) {
            result += '\ufffd\ufffd\ufffd\ufffd';
          } else {
            chr -= 0x10000;
            result += String.fromCharCode(0xD800 + (chr >> 10), 0xDC00 + (chr & 0x3FF));
          }

          i += 9;
          continue;
        }
      }

      result += '\ufffd';
    }

    return result;
  });
}


decode.defaultChars   = ';/?:@&=+$,#';
decode.componentChars = '';


module.exports = decode;

},{}],163:[function(require,module,exports){

'use strict';


var encodeCache = {};


// Create a lookup array where anything but characters in `chars` string
// and alphanumeric chars is percent-encoded.
//
function getEncodeCache(exclude) {
  var i, ch, cache = encodeCache[exclude];
  if (cache) { return cache; }

  cache = encodeCache[exclude] = [];

  for (i = 0; i < 128; i++) {
    ch = String.fromCharCode(i);

    if (/^[0-9a-z]$/i.test(ch)) {
      // always allow unencoded alphanumeric characters
      cache.push(ch);
    } else {
      cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
    }
  }

  for (i = 0; i < exclude.length; i++) {
    cache[exclude.charCodeAt(i)] = exclude[i];
  }

  return cache;
}


// Encode unsafe characters with percent-encoding, skipping already
// encoded sequences.
//
//  - string       - string to encode
//  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
//  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
//
function encode(string, exclude, keepEscaped) {
  var i, l, code, nextCode, cache,
      result = '';

  if (typeof exclude !== 'string') {
    // encode(string, keepEscaped)
    keepEscaped  = exclude;
    exclude = encode.defaultChars;
  }

  if (typeof keepEscaped === 'undefined') {
    keepEscaped = true;
  }

  cache = getEncodeCache(exclude);

  for (i = 0, l = string.length; i < l; i++) {
    code = string.charCodeAt(i);

    if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
      if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
        result += string.slice(i, i + 3);
        i += 2;
        continue;
      }
    }

    if (code < 128) {
      result += cache[code];
      continue;
    }

    if (code >= 0xD800 && code <= 0xDFFF) {
      if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
        nextCode = string.charCodeAt(i + 1);
        if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
          result += encodeURIComponent(string[i] + string[i + 1]);
          i++;
          continue;
        }
      }
      result += '%EF%BF%BD';
      continue;
    }

    result += encodeURIComponent(string[i]);
  }

  return result;
}

encode.defaultChars   = ";/?:@&=+$,-_.!~*'()#";
encode.componentChars = "-_.!~*'()";


module.exports = encode;

},{}],164:[function(require,module,exports){

'use strict';


module.exports = function format(url) {
  var result = '';

  result += url.protocol || '';
  result += url.slashes ? '//' : '';
  result += url.auth ? url.auth + '@' : '';

  if (url.hostname && url.hostname.indexOf(':') !== -1) {
    // ipv6 address
    result += '[' + url.hostname + ']';
  } else {
    result += url.hostname || '';
  }

  result += url.port ? ':' + url.port : '';
  result += url.pathname || '';
  result += url.search || '';
  result += url.hash || '';

  return result;
};

},{}],165:[function(require,module,exports){
'use strict';


module.exports.encode = require('./encode');
module.exports.decode = require('./decode');
module.exports.format = require('./format');
module.exports.parse  = require('./parse');

},{"./decode":162,"./encode":163,"./format":164,"./parse":166}],166:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

//
// Changes from joyent/node:
//
// 1. No leading slash in paths,
//    e.g. in `url.parse('http://foo?bar')` pathname is ``, not `/`
//
// 2. Backslashes are not replaced with slashes,
//    so `http:\\example.org\` is treated like a relative path
//
// 3. Trailing colon is treated like a part of the path,
//    i.e. in `http://example.org:foo` pathname is `:foo`
//
// 4. Nothing is URL-encoded in the resulting object,
//    (in joyent/node some chars in auth and paths are encoded)
//
// 5. `url.parse()` does not have `parseQueryString` argument
//
// 6. Removed extraneous result properties: `host`, `path`, `query`, etc.,
//    which can be constructed using other parts of the url.
//


function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.pathname = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = [ '<', '>', '"', '`', ' ', '\r', '\n', '\t' ],

    // RFC 2396: characters not allowed for various reasons.
    unwise = [ '{', '}', '|', '\\', '^', '`' ].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = [ '\'' ].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = [ '%', '/', '?', ';', '#' ].concat(autoEscape),
    hostEndingChars = [ '/', '?', '#' ],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    /* eslint-disable no-script-url */
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    };
    /* eslint-enable no-script-url */

function urlParse(url, slashesDenoteHost) {
  if (url && url instanceof Url) { return url; }

  var u = new Url();
  u.parse(url, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, slashesDenoteHost) {
  var i, l, lowerProto, hec, slashes,
      rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    lowerProto = proto.toLowerCase();
    this.protocol = proto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (i = 0; i < hostEndingChars.length; i++) {
      hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
        hostEnd = hec;
      }
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = auth;
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (i = 0; i < nonHostChars.length; i++) {
      hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
        hostEnd = hec;
      }
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1) {
      hostEnd = rest.length;
    }

    if (rest[hostEnd - 1] === ':') { hostEnd--; }
    var host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost(host);

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) { continue; }
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    }

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
    }
  }

  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    rest = rest.slice(0, qm);
  }
  if (rest) { this.pathname = rest; }
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '';
  }

  return this;
};

Url.prototype.parseHost = function(host) {
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) { this.hostname = host; }
};

module.exports = urlParse;

},{}],167:[function(require,module,exports){
module.exports=/[\0-\x1F\x7F-\x9F]/
},{}],168:[function(require,module,exports){
module.exports=/[\xAD\u0600-\u0605\u061C\u06DD\u070F\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804\uDCBD|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/
},{}],169:[function(require,module,exports){
module.exports=/[!-#%-\*,-/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDE38-\uDE3D]|\uD805[\uDCC6\uDDC1-\uDDC9\uDE41-\uDE43]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F/
},{}],170:[function(require,module,exports){
module.exports=/[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/
},{}],171:[function(require,module,exports){

module.exports.Any = require('./properties/Any/regex');
module.exports.Cc  = require('./categories/Cc/regex');
module.exports.Cf  = require('./categories/Cf/regex');
module.exports.P   = require('./categories/P/regex');
module.exports.Z   = require('./categories/Z/regex');

},{"./categories/Cc/regex":167,"./categories/Cf/regex":168,"./categories/P/regex":169,"./categories/Z/regex":170,"./properties/Any/regex":172}],172:[function(require,module,exports){
module.exports=/[\0-\uD7FF\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF]/
},{}],173:[function(require,module,exports){
(function (global){
"use strict";

(function (e) {
  if ("function" == typeof bootstrap) bootstrap("rendermathinelement", e);else if ("object" == typeof exports) module.exports = e();else if ("function" == typeof define && define.amd) define(e);else if ("undefined" != typeof ses) {
    if (!ses.ok()) return;ses.makeRenderMathInElement = e;
  } else "undefined" != typeof window ? window.renderMathInElement = e() : global.renderMathInElement = e();
})(function () {
  var e, t, r, n, a;return (function i(e, t, r) {
    function n(o, l) {
      if (!t[o]) {
        if (!e[o]) {
          var f = typeof require == "function" && require;if (!l && f) {
            return f(o, !0);
          }if (a) {
            return a(o, !0);
          }throw new Error("Cannot find module '" + o + "'");
        }var s = t[o] = { exports: {} };e[o][0].call(s.exports, function (t) {
          var r = e[o][1][t];return n(r ? r : t);
        }, s, s.exports, i, e, t, r);
      }return t[o].exports;
    }var a = typeof require == "function" && require;for (var o = 0; o < r.length; o++) n(r[o]);return n;
  })({ 1: [function (e, t, r) {
      var n = e("./splitAtDelimiters");var a = function a(e, t) {
        var r = [{ type: "text", data: e }];for (var a = 0; a < t.length; a++) {
          var i = t[a];r = n(r, i.left, i.right, i.display || false);
        }return r;
      };var i = function i(e, t) {
        var r = a(e, t);var n = document.createDocumentFragment();for (var i = 0; i < r.length; i++) {
          if (r[i].type === "text") {
            n.appendChild(document.createTextNode(r[i].data));
          } else {
            var o = document.createElement("span");var l = r[i].data;katex.render(l, o, { displayMode: r[i].display });n.appendChild(o);
          }
        }return n;
      };var o = (function (_o) {
        function o(_x, _x2, _x3) {
          return _o.apply(this, arguments);
        }

        o.toString = function () {
          return _o.toString();
        };

        return o;
      })(function (e, t, r) {
        for (var n = 0; n < e.childNodes.length; n++) {
          var a = e.childNodes[n];if (a.nodeType === 3) {
            var l = i(a.textContent, t);n += l.childNodes.length - 1;e.replaceChild(l, a);
          } else if (a.nodeType === 1) {
            var f = r.indexOf(a.nodeName.toLowerCase()) === -1;if (f) {
              o(a, t, r);
            }
          } else {}
        }
      });var l = { delimiters: [{ left: "$$", right: "$$", display: true }, { left: "\\[", right: "\\]", display: true }, { left: "\\(", right: "\\)", display: false }], ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"] };var f = function f(e) {
        var t, r;for (var n = 1, a = arguments.length; n < a; n++) {
          t = arguments[n];for (r in t) {
            if (Object.prototype.hasOwnProperty.call(t, r)) {
              e[r] = t[r];
            }
          }
        }return e;
      };var s = function s(e, t) {
        if (!e) {
          throw new Error("No element provided to render");
        }t = f({}, l, t);o(e, t.delimiters, t.ignoredTags);
      };t.exports = s;
    }, { "./splitAtDelimiters": 2 }], 2: [function (e, t, r) {
      var n = function n(e, t, r) {
        var n = r;var a = 0;var i = e.length;while (n < t.length) {
          var o = t[n];if (a <= 0 && t.slice(n, n + i) === e) {
            return n;
          } else if (o === "\\") {
            n++;
          } else if (o === "{") {
            a++;
          } else if (o === "}") {
            a--;
          }n++;
        }return -1;
      };var a = (function (_a) {
        function a(_x4, _x5, _x6, _x7) {
          return _a.apply(this, arguments);
        }

        a.toString = function () {
          return _a.toString();
        };

        return a;
      })(function (e, t, r, a) {
        var i = [];for (var o = 0; o < e.length; o++) {
          if (e[o].type === "text") {
            var l = e[o].data;var f = true;var s = 0;var d;d = l.indexOf(t);if (d !== -1) {
              s = d;i.push({ type: "text", data: l.slice(0, s) });f = false;
            }while (true) {
              if (f) {
                d = l.indexOf(t, s);if (d === -1) {
                  break;
                }i.push({ type: "text", data: l.slice(s, d) });s = d;
              } else {
                d = n(r, l, s + t.length);if (d === -1) {
                  break;
                }i.push({ type: "math", data: l.slice(s + t.length, d), display: a });s = d + r.length;
              }f = !f;
            }i.push({ type: "text", data: l.slice(s) });
          } else {
            i.push(e[o]);
          }
        }return i;
      });t.exports = a;
    }, {}] }, {}, [1])(1);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[14]);
