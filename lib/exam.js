'use strict';


const $ = require( 'jquery' );
const MarkdownIt = require('markdown-it');
var md = new MarkdownIt();

require('jquery-ui');
/* global TimelineMax: true */
require("gsap-tween-max");

var Examination = {};

Examination.Session = function(obj) {
    window.examination = this; // self.reference
	// _session = this;
	this.sequence = JSON.parse(obj.sequence);

	var self = this;
	var it   = 0;

	this.dynamic_change = function(node) {

		var name = "node_item_" + node.id;

		/// Animation //
		var el = document.getElementById(name);
		var tl = new TimelineMax({  });
		tl.pause();

		tl.to(el, 0, {
					 left: '-100%',
					 opacity: 1,
					 }, "start" );

		if (node.id > 0) {

			var fname = "node_item_" + (node.id - 1);
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
		var name = "node_item_" + node.id;

		/// Animation //
		var el = document.getElementById(name);
		var tl = new TimelineMax({  });
		tl.pause();

		tl.to(el, 0, {
			 top: '-100%',
			 opacity: 0,
		}, "start" );

		if (node.id > 0) {

			var fname = "node_item_" + (node.id - 1);
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
		var name = "node_item_" + node.id;

		/// Animation //
		var el = document.getElementById(name);
		var tl = new TimelineMax({  });
		tl.pause();

		tl.to(el, 0, {
					 top: '100%',
					 opacity: 0,
					 }, "start" );

		if (node.id > 0) {

			var fname = "node_item_" + (node.id - 1);
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

	this.multiple_choice = function(node) {
		var s = "";

		var name = "node_item_" + node.id;
		var form = "node_form_" + node.id;


		s += '<div id = "' + name + '" class = "node_area">';
		s += '<div class = "mc_question">' + md.render( node.question)  + '</div>';

		s += '<div id = "answers">';


		s += '<form id = "' + form + '" name = "' + form + '">';

		for (var i = 0; i < node.answers.length; i++) {

			s += '<div class = "mc_answer">';

			s += '<input class = "clicked_answer" type="radio" name="mpanswers" value="' + i + '">';
			s += node.answers[i].text + '</div>';
		}

		s += '</form>';


		s += '</div>';
        
        // TIMER 
        var timer = "timer_" + node.id;
        if (node.duration > 0) s += '<div id = "' + timer + '" class = "timer"></div>';
        // END TIMER

		s += '</div>';


		$(self.div).append(s);


        if (node.duration > 0) self.set_timer(node);

		self.page_change(node);


		/////////////////////////////////////


		$(".clicked_answer").click(function(){

			var actual_form = document.getElementById(form);
			node.chosen = parseInt( actual_form.mpanswers.value) ;

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
		  	}
		  }

		res.max = self.get_max_points();

		res.percentage = res.points / res.max;

		var s = "";
		s += '<div class = "result">';

		s += "<h1>Here is the result</h1>";

		s += '<div id = "assessment">';

		s += '<h3>Maximal Points ' + res.max + '</h3>';
		s += '<h3>You have reached ' + res.points + '</h3>';

		s += '<h3>Percentage ' + (res.percentage*100).toFixed(2) + ' %</h3>';

		s += '<h3>Evaluation ' + self.get_evaluation(res.percentage) + '</h3>';

		s += '<h3>Assessment ' + res.text + '</h3>';


		s += '</div>';


		s += '</div>';

		$(self.div).append(s);

	};

	this.get_evaluation = function(percentage) {

		for (var i = 0; i < self.sequence.evaluation.ranges.length; i++) {
			var r = self.sequence.evaluation.ranges[i];

		      if ( percentage > r.start && percentage <= r.end ) {


                    return r.text;
                    }



		}
		return "no evaluation";
	};


    this.refresh_time = function() {
        
        var t = "#timer_" + self.timed_node.id;
        self.timed_node.actual_time -= 50;
        
        var sec  = parseInt( self.timed_node.actual_time / 1000);
        var msec = (self.timed_node.actual_time % 1000)/10;
        
        if (sec < 10) sec = "0" + sec;
        if (msec < 10) msec = "0" + msec;
        
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
       }
       else {
            self.result();
            }
            
    }         

    this.set_timer = function(node) {
     
     var t = "#timer_" + node.id;
     node.actual_time = node.duration * 1000;
     $(t).html("20:00");
     
     self.timed_node = node;
     
     var w = "window.examination.refresh_time()";
     
     self.interval = window.setInterval(w, 100);    
     };
    


	this.play_node = function(node) {	    
	    window.NODE = node;
	    
	   
	    
		switch(node.type) {
			case "multiple_choice":
			    console.log("multiple_choice");
				self.multiple_choice(node);
			break;
		}
	};

	this.play = function() {
		self.play_node ( self.sequence.nodes[it] );
	};

	this.init = function() {

		window._exam = this;

		if ( !obj.div ) {

			self.div = "#exam_panel";

			var s = '<div id = "exam_panel"><div id = "exit"><img src= "img/exit.svg"/></div>';

			s += '</div>';

			$("body").append(s);

			$("#exam_panel #exit").click(function(){
				$("#exam_panel").fadeOut(200, function(){
					$("#exam_panel").remove();
				});
			});

		}

		self.play();

	};

	self.init();
};

module.exports = exports = Examination;
