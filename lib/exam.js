/* global renderMathInElement */
'use strict';

const $ = require( 'jquery' );
const MarkdownIt = require('markdown-it');
var md = new MarkdownIt();

/* global TimelineMax: true */
require("gsap-tween-max");

const katex = require( 'katex' );
require('katex-auto-render');

var Examination = {};


Examination.ResponsiveDesign = function() {
  var self = this;

  this.hrs = [600, 800, 1024, 1280, 1400, 1900];  // horizontal ranges



  this.horizontal_setting = function() {

    self.HR = 0;

    for (var i = 0; i < self.hrs.length; i++) {
      if (self.width > self.hrs[i])
          self.HR = i;
      }

    switch(self.HR)
        {
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

    if (self.width > self.height) self.horizontal_setting();
    else                          self.vertical_setting();



    };


  self.init();
  };




Examination.Session = function(qa, opts, callback) {

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
	var it   = 0;

	this.dynamic_change = function(node) {

		var name =  self.opts.div + "_node_item_" + node.id;

		/// Animation //
		var el = document.getElementById(name);
		var tl = new TimelineMax({  });
		tl.pause();

		tl.to(el, 0, {
					 left: '-100%',
					 opacity: 1,
					 }, "start" );

		if (node.id > 0) {

			var fname = self.opts.div + "_node_item_" + (node.id - 1);
			var former = document.getElementById(fname);

			tl.to(former, 1, {
				left: '100%',
			}, "go" );

		}

		tl.to(el, 1, {
					 left: '0',
					 opacity: 1,
					 }, "go" );

		tl.play();

	};

	this.top_down_change = function(node) {
		var name = self.opts.div + "_node_item_" + node.id;

		/// Animation //
		var el = document.getElementById(name);
		var tl = new TimelineMax({  });
		tl.pause();

		tl.to(el, 0, {
			 top: '-100%',
			 opacity: 0,
		}, "start" );

		if (node.id > 0) {

			var fname = self.opts.div + "_node_item_" + (node.id - 1);
			var former = document.getElementById(fname);

			tl.to(former, 1, {
						 top: '100%',
						 }, "go" );

		}

		tl.to(el, 1, {
					 top: '0',
					 opacity: 1,
					 }, "go" );

		tl.play();
	};


	this.bottom_up_change = function(node) {
		var name = self.opts.div + "_node_item_" + node.id;

		/// Animation //
		var el = document.getElementById(name);
		var tl = new TimelineMax({  });
		tl.pause();

		tl.to(el, 0, {
					 top: '100%',
					 opacity: 0,
					 }, "start" );

		if (node.id > 0) {

			var fname = self.opts.div + "_node_item_" + (node.id - 1);
			var former = document.getElementById(fname);

			tl.to(former, 1, {
						 top: '-100%',
						 }, "go" );

		}



		tl.to(el, 1, {
					 top: '0',
					 opacity: 1,
					 }, "go" );

		tl.play();
	};


	this.page_change = function(node) {

		if ( !node.transition_in ) {
			node.transition_in = "default";
		}

		switch(node.transition_in) {

			case "static":

			break;

			case "dynamic":
			  self.dynamic_change(node);
			break;

			case "top_down":
			  self.top_down_change(node);
			break;

			case "bottom_up":
			  self.bottom_up_change(node);
			break;

			default:

			break;
		}

	};

	this.input = function(node) {
	    var s = "";

	    var name = self.opts.div + "_node_item_" + node.id;

	    s += `<div id = "${name}" class = "node_area">`;
        s += `<div class = "mc_question">${md.render( node.question)}</div>`;

        var ip_name = self.opts.div + "_ip_input_" + node.id;

        s += '<input class = "ip_input" name="vorname" type="text" value="TYPE IN YOUR ANSWER - confirm with RETURN">';

        // TIMER
        var timer = "timer_" + node.id;


        if ( node.duration > 0 ) {
            s += `<div id = "${timer}" class = "timer"></div>`;
        }
        // END TIMER

        s += '</div>';


        $(self.div).append(s);
        renderMathInElement( document.body, self.mathOptions );

        if (node.duration > 0) {
            self.set_timer(node);
        }

        var ipdiv = "#" + name + " .ip_input";


        $(ipdiv).click(function() {
           $(this).val("");
        });

        $(ipdiv).change(function() {
            node.given_answer = $(this).val();

            if (node.duration > 0) {
                self.deactivate_timer(node);
            }

            self.decision(node);
        });

	};


	this.multiple_choice = function(node) {
		var s = "";

		var name = self.opts.div + "_node_item_" + node.id;
		var form = self.opts.div + "_node_form_" + node.id;


		s += '<div id = "' + name + '" class = "node_area">';
		s += '<div class = "mc_question">' + md.render( node.question)  + '</div>';

		s += '<div id = "' + self.opts.div + '_answers">';

		s += '<form id = "' + form + '" name = "' + form + '">';

		for (var i = 0; i < node.answers.length; i++) {

			s += '<div class = "mc_answer">';
			s += '<input class = "clicked_answer" type="radio" name="mpanswers" value="' + i + '">';
			s += '<div class = "answer">' + node.answers[i].text + '</div>';
      s += '</div>';

		}

		s += '</form>';

		s += '</div>';

        // TIMER
        var timer = "timer_" + node.id;
        if ( node.duration > 0 ) {
            s += '<div id = "' + timer + '" class = "timer"></div>';
        }
        // END TIMER

		s += '</div>';


		$(self.div).append(s);
        renderMathInElement( document.body, self.mathOptions );

        if (node.duration > 0) {
            self.set_timer(node);
        }

		self.page_change(node);


		/////////////////////////////////////


		$("#" + self.opts.div + " .clicked_answer").click(function(){

			var actual_form = document.getElementById(form);
			node.chosen = parseInt( actual_form.mpanswers.value) ;

            self.deactivate_timer(node);

			it ++;

			var beta = self.sequence.nodes[it];

			if  (it < self.sequence.nodes.length) {
				self.play_node(beta);
			}
			else {
				self.result();
			}
		});

	};

	this.get_max_points = function() {

		var maximal = 0;

		for (var i = 0; i < self.sequence.nodes.length; i++) {

			var actual =  self.sequence.nodes[i];
			switch(actual.type) {

				case "multiple_choice":
				var tmax = 0;

				for (var j = 0; j < actual.answers.length; j++) {
					if ( actual.answers[j].points > tmax ) {
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
	};


	this.result = function() {

		var res = { points: 0, text: [] };

		for (var i = 0; i < self.sequence.nodes.length; i++) {

		  var actual =  self.sequence.nodes[i];

		  switch(actual.type) {
		  		case "multiple_choice":
				  	var answer = actual.answers[actual.chosen];
				  	if (answer)  {
				   	res.points += parseInt( answer.points );
				  	if (answer.assessment !== "ASSESSMENT") {
						res.text.push ( answer.assessment);
					   }
					}
					else
					   {
					   res.points += 0;
					   }

			  	break;

			  	case "input":
			  	  // alert( actual.given_answer);
                if ( actual.given_answer === actual.right_answer ) {
                    res.points += actual.points;
                }
			  	break;
		  	}
		  }

		res.max = self.get_max_points();

		res.percentage = res.points / res.max;

		var s =
            `<div class = "result"><h1>RESULT</h1>
                <div id = "assessment">
        		    <h3>You have reached <span class = "phigh">${res.points}</span> of <span class = "phigh">${res.max}</span> points</h3>
            		<h3>Percentage: <span class = "phigh">${(res.percentage*100).toFixed(2)}%</span></h3>
            		<h3><span class = "pcaps">Evaluation</span></h3><div class = "Evaluation">${self.get_evaluation(res.percentage)}</div>
            		<h3><span class = "pcaps">Assessment</span></h3><div class = "Assessment">${res.text}</div>
                </div>
            </div>`;

		$(self.div).append(s);

	};

	this.get_evaluation = function(percentage) {

		for (var i = 0; i < self.evaluation.ranges.length; i++) {
			var r = self.evaluation.ranges[i];

		    if ( percentage > r.start && percentage <= r.end ) {
                return r.text;
            }

		}
		return "no evaluation";
	};

    this.deactivate_timer = function(node) {
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
        if (self.timed_node.actual_time <= 0 )
            {
            window.clearInterval(self.interval);
            self.decision(self.timed_node);

            }

        $(t).html(s);
    };



    self.decision = function(node) {

        node.chosen = -1;
        it ++;

        var beta = self.sequence.nodes[it];

        if  (it < self.sequence.nodes.length) {
            self.play_node(beta);
        } else {
            self.result();
        }

    };


    this.set_timer = function(node) {
        var t = "#timer_" + node.id;
        node.actual_time = node.duration * 1000;
        $(t).html("20:00");

        self.timed_node = node;
        self.interval = window.setInterval(self.refresh_time, 100);
    };


	this.play_node = function(node) {

		switch(node.type) {
			case "multiple_choice":
			    console.log("multiple_choice");
				self.multiple_choice(node);
			break;

			case "input":
			    // alert("Hier kommt ein Input");
			    self.input(node);
			break;
		}
	};

	this.play = function() {
		self.play_node ( self.sequence.nodes[it] );
	};

    this.injectCSS = function() {

        var cssPath;

        if ( self.opts.css === undefined || self.opts.css === '' ) {
            cssPath = './css/exam.css';
        }

        var cssExam = '<link href="' + cssPath + '" media="screen" rel="stylesheet" type="text/css" />';
        $('head').append(cssExam);

        var cssKatex = '<link href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.3.0/katex.min.css" media="screen" rel="stylesheet" type="text/css" />';
        $('head').append(cssKatex);

    };

	this.init = function() {

    self.responsive = new Examination.ResponsiveDesign();

		window._exam = this;

        $(document).ready(function(){

            // inject exam.css
            self.injectCSS();

            var s = '<div id = "exam_panel" class="exam_panel"></div>';
            $("#" + self.opts.div).append(s);

            self.div =  "#" + self.opts.div + " .exam_panel";

            if (self.opts.exit === true) {
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

module.exports = exports = Examination;
