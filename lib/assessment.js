/* global renderMathInElement */
'use strict';

const $ = require( 'jquery' );
const MarkdownIt = require('markdown-it');
var md = new MarkdownIt();

require('jquery-ui');


/* global TimelineMax: true */
require("gsap-tween-max");

require('katex-auto-render');

// private editor variable
var _editor;

const Examination = require( './exam.js');

var Assessment = {};

Assessment.Alternative   = function() {
	var self = this;

	this.type 		= "alternative";
	this.question 	= "QUESTION";

	this.paint_node = function() {
		alert("NEU");
	};


	this.init = function() {

	};

	self.init();
};


Assessment.Input = function(no) {

	var self 				= this;
	this.id					= no;
	this.type				= "input";

	this.question			= "UNKNOWN QUESTION";
	this.right_answer		= "unknown";

	this.transition_in      = "dynamic";
	this.transition_out     = "dynamic";

	this.points             = 1;
	this.duration           = 0;

	window.Input            = this;

	this.mathOptions = [
		{left: "$$", right: "$$", display: true},
		{left: "\\[", right: "\\]", display: true},
		{left: "\\(", right: "\\)", display: false},
	];

	this.init = function() {

		// _input = this;

		var s =
			`<div class = "input">
				<div class = "toolbar">
					<div title = "setting" class = "tool" id  = "setting"><img src = "img/setting.svg"/></div>
				</div>
				<div class = "question">${self.question}</div>
				<hr>
				<div class = "legend">ANSWER</div>
				<input id = "input_answer" name="vorname" type="text" value="${self.right_answer}">
			</div>`;

		$(".area").html(s);

		self.selected_options();

        self.show_setting();

		$(".input .tool").click(function() {
			self.show_setting();
		});

        $(".input #input_answer").change(function() {
            self.right_answer = $(this).val();
        });

	};


	this.set_option = function(obj, type) {

		switch(type) {
			case 0:
				self.transition_in = obj.value;
			break;

			case 1:
				self.transition_out = obj.value;
			break;
		}

	};


	this.selected_options = function() {

		$("#Transition_In").val(self.transition_in);
		$("#Transition_Out").val(self.transition_out);

	};

	this.show_setting = function() {

		if ( !self.setting ) {

			$(".setting").remove();

			var s =
				`<div class = "setting">
					<div id = "exit"><img src = "img/exit.svg"/></div>
					<div id = "entries">
						<div class = "label">QUESTION</div>
						<textarea id = "node_question" rows="4" cols="50">${self.question}</textarea>
						<div class = "label">TRANSITION_IN</div>
					    <select name = selector id = "Transition_In" onchange="window.Input.set_option(this, 0);">
							<option selected = "selected">static</option>
							<option>dynamic</option>
							<option>top_down</option>
							<option>bottom_up</option>
						</select>
						<div class = "label">TRANSITION_OUT</div>
					    <select name = selector id = "Transition_Out" onchange="window.Input.set_option(this, 1);">
							<option selected = "selected">static</option>
							<option>dynamic</option>
							<option>top_down</option>
							<option>bottom_up</option>
					    </select>
						<div class = "label">POINTS</div>
						<input id = "node_points" name="vorname" type="text" value="${self.points}">
						<div class = "label">BACKGROUND IMAGE</div>
						<input id = "node_background" name="vorname" type="text" value="none">
						<div class = "label">DURATION - if bigger than 0, it is timed</div>
						<input id = "node_duration" name="vorname" type="text" value="${self.duration}">
					</div>
					<div id = "submit">SUBMIT</div>
					<div id = "delete">DELETE</div>
				</div>`;

			$(".area").append(s);

			self.selected_options();

			$(".setting #exit").click(function(){
				$(".setting").fadeOut(100, function(){
					$(".setting").remove();
					});
				});

			$(".setting #delete").click(function(){

				var name = "#node_" + self.id;
				_editor.active_element = $(name);
				_editor.delete_element();

				$(".setting").fadeOut();

				});

			$(".setting #node_question").keyup(function() {
				var v = $(this).val();
				$(".question").html(md.render(v) );
				renderMathInElement( document.body, self.mathOptions );
			});

			$(".setting #submit").click(function(){

				self.question   = $("#node_question").val();
				self.duration   = $("#node_duration").val();

				self.background = $("#node_background").val();
				self.points     = parseInt ( $("#node_points").val() );

				$(".question").html(md.render( self.question) );
				renderMathInElement( document.body, self.mathOptions );
				$(".setting").fadeOut();

				});
		}

	};

	this.paint_node = function() {

		var s =
			`<div class = "input">
				<div class = "toolbar">
					<div title = "setting" class = "tool" id  = "setting"><img src = "img/setting.svg"/></div>
				</div>
				<div class = "question">QUESTION</div>
				<hr>
				<div class = "legend">ANSWER</div>
				<input id = "input_answer" name="vorname" type="text" value="${self.right_answer}">
			</div>`;

		$(".area").html(s);

		$(".question").html( md.render(self.question) );
		renderMathInElement( document.body, self.mathOptions );

        self.interaction();

	};

	this.interaction = function() {

	$(".input .tool").click(function() {
		self.show_setting();
	});

	$(".input #input_answer").change(function() {
		self.right_answer = $(this).val();
	});

	};

	self.init();

};


Assessment.MultipleChoice = function(no) {

	var self 				= this;
	this.id					= no;
	this.type 				= "multiple_choice";
	this.right_value		= -1;
	this.question 			= "QUESTION";
	this.transition_in		= "dynamic";
	this.transition_out		= "dynamic";
	this.answers 			= [];

	this.duration           = 0;

	this.get_value = function() {

		var rates = document.getElementsByName('mpanswers');
		var rate_value;
		for( var i = 0; i < rates.length; i++ ) {
			if ( rates[i].checked ) {
				rate_value = rates[i].value;
			}
		 }
		return rate_value;

	};

	this.show_setting = function() {

		if ( !self.setting ) {
			// self.setting = true;

			$(".setting").remove();
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

			$(".area").append(s);

			self.selected_options();

			$(".setting #exit").click(function(){
				$(".setting").fadeOut(200, function(){
					$(".setting").remove();
					});
			});

			$(".setting #delete").click(function(){

				var name = "#node_" + self.id;
				_editor.active_element = $(name);
				_editor.delete_element();

				$(".setting").fadeOut();

			});

			$(".setting #node_question").keyup(function() {
				var v = $(this).val();
				$(".question").html(md.render(v) );
				renderMathInElement( document.body, self.mathOptions );
			});

			$(".setting #submit").click(function(){

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

	};

	this.set_option = function(obj, type) {

		switch(type) {
			case 0:
				self.transition_in = obj.value;
			break;

			case 1:
				self.transition_out = obj.value;
			break;
		}

	};

	this.selected_options = function() {

		console.log("SELECTED");
		$("#Transition_In").val(self.transition_in);
		$("#Transition_Out").val(self.transition_out);

	};

	this.answer_prompt = function(text, no) {

		var temp = self.answers[no];

		if ( !self.prompt ) {
			self.prompt = true;

			var s =
				`<div class = "prompt">
					<div id = "exit"><img src = "img/exit.svg"/></div>
					<div class = "label">TEXT</div>
					<input id = "temporal" name="vorname" type="text" value="${temp.text}">
					<div class = "label">ORAL ASSESSMENT</div>
					<input id = "assessment" name="vorname" type="text" value="${temp.assessment}">
					<div class = "label">POINTS</div>
					<input id = "points" name="vorname" type="text" value="${temp.points}">
					<div class = "submit">SUBMIT</div>
					<div class = "delete">DELETE</div>
				</div>`;

			$(".area").append(s);

			self.submit_interaction(no);

		} else {

			$(".prompt").fadeIn();

			$("#temporal").val(temp.text);
			$("#points").val(temp.points);
			$("#assessment").val(temp.assessment);

			self.submit_interaction(no);

		}

	};

	this.submit_interaction = function(no) {

		$(".prompt #exit").click(function() {
			$(".prompt").fadeOut();
		});

		$(".submit").unbind('click');
		$(".submit").click(function(){

			self.answers[no].text 			= $("#temporal").val();
			self.answers[no].points 		= parseInt ( $("#points").val() );
			self.answers[no].assessment		= $("#assessment").val();
			$(self.element).html( $("#temporal").val() );

			$(".prompt").fadeOut();

		});

	    $(".delete").unbind('click');
		$(".delete").click(function() {

			self.answers = self.answers.filter( (o, i) => i !== no );
			self.paint_node();
			$(".prompt").fadeOut();

		});

	};

	this.interaction = function() {
		$(".mpanswer").unbind('click');
		$(".mpanswer").click(function(){
			self.right_value = parseInt( this.value );
		});

		$(".label").unbind('click');

		$(".label").click(function(){

			var val = parseInt( $(this).attr("no") );

			console.log("VALUE " + val);

			self.element = this;

			var x = $(this).html();
			self.answer_prompt(x, val);

		});
	};


    // funktioniert noch nicht ganz
    //

    this.paint_node = function() {

            self.setting = null;
            $(".setting").remove();

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
					})}
					</form>
					</div>
				</div>`;

        $(".area").html(s);

        if (self.right_value !== -1) {
            document.PossibleAnswers.mpanswers[self.right_value].checked = true;
        }

        $(".question").html( md.render(self.question) );
		renderMathInElement( document.body, self.mathOptions );

        self.interaction();

        $("#setting").unbind('click');
        $("#setting").click(function() {
            self.show_setting();
        });

        $("#plus").unbind('click');
        $("#plus").click(function() {

            var no = document.getElementsByName('mpanswers').length;
            var name = "A_" + no;

            var x = {  text: name, points: 0, assessment: "ASSESSMENT" };
            self.answers.push(x);

            var s =
				`<input type="radio" name="mpanswers" value="${no}">
            	<span class = "label" no = "${no}">${name}</span><br>`;

			$("#PossibleAnswers").append(s);

            self.interaction();

        });

    };


	this.old_paint_node = function() {


		$(".setting").remove();

		$(".question").html( md.render(self.question) );
		renderMathInElement( document.body, self.mathOptions );

		var s = "";

		for (var i = 0; i < self.answers.length; i++) {
			s += '<input class = "mpanswer" type="radio" name="mpanswers" value="' + i + '">';
			s += '<span class = "label" no = "' + i + '">' + self.answers[i].text + '</span><br>';
		}

		$("#PossibleAnswers").html(s);

		if (self.right_value !== -1) {
			document.PossibleAnswers.mpanswers[self.right_value].checked = true;
		}

		self.interaction();

		$("#setting").unbind('click');
		$("#setting").click(function() {
			self.show_setting();
		});

		$("#plus").unbind('click');
		$("#plus").click(function() {

			var no = document.getElementsByName('mpanswers').length;
			var name = "A_" + no;

			var x = {  text: name, points: 0, assessment: "ASSESSMENT" };
			self.answers.push(x);

		  	var s = '<input type="radio" name="mpanswers" value="' + no + '">';
		  	s += '<span class = "label" no = "' + no +'">' + name + '</span><br>';
		  	$("#PossibleAnswers").append(s);

			self.interaction();

		});

	};

	this.init = function() {
		window._multiple_choice = this;

		var x = {  text: "A_0", points: 1, assessment: "ASSESSMENT" };
		self.answers.push(x);

		var y = {  text: "A_1", points: 1, assessment: "ASSESSMENT" };
		self.answers.push(y);

		var s =
			`<div class = "multiple_choice">
				<div class = "toolbar">
					<div title = "add option" class = "tool" id  = "plus"><img src = "img/plus.svg"/></div>
					<div title = "setting" class = "tool" id  = "setting"><img src = "img/setting.svg"/></div>
				</div>
				<div class = "question">QUESTION</div>
				<div class = "answers">
					<form name = "PossibleAnswers" id = "PossibleAnswers">
						<input class = "mpanswer" type="radio" name="mpanswers" value="0"><span class = "label" no = "0">A_0</span><br>
						<input class = "mpanswer" type="radio" name="mpanswers" value="1"><span class = "label" no = "1">A_1</span><br>
					</form>
				</div>
			</div>`;

		$(".area").html(s);

		self.interaction();
		self.get_value();
		self.show_setting();

		$("#setting").click(function() {
			self.show_setting();
		});

		$(".question").click(function() {
			self.show_setting();
		});

		$(".mpanswer").click(function() {
			// alert("ANTWORT");
			self.right_value = parseInt( this.value );
		});

		$("#plus").click(function() {

			var no = document.getElementsByName('mpanswers').length;
			var name = "A_" + no;

			var x = {  text: name, points: 0, assessment: "ASSESSMENT" };
			self.answers.push(x);

			var s =
				`<input class = "mpanswer" type="radio" name="mpanswers" value="${no}">
				<span class = "label" no = "${no}">${name}</span><br>`;

			$("#PossibleAnswers").append(s);

			self.interaction();

		});

	};

	self.init();
};

Assessment.Sequence = function() {
	var self = this;

	this.nodes = [];

	this.init = function() {
		//alert("SEQUENZ");
	};

	self.init();
};


Assessment.Evaluation = function() {

	this.seperator = [];
	this.sorted    = [];

	this.ranges	   = [];

	var self = this;

	this.update_marker = function(number, perc) {
		for (var i = 0; i < self.seperator.length; i++) {
			if ( self.seperator[i].id === number) {
				self.temporary = self.seperator[i].start;
				self.seperator[i].start = perc.toFixed(2);
			}
		}
		self.set_ranges();
	};

	this.get_range = function(percentage) {

		var p = percentage;

		for (var i = 0; i < self.ranges.length; i++) {
			if ( p > self.ranges[i].start && p < self.ranges[i].end ) {
				return self.ranges[i];
			}
		}

	};


	this.show_form = function(percentage) {
		$(".evaluation_form #evaluation_text").show();
		var r = self.get_range(percentage);

		$(".evaluation_form #evaluation_text").attr("no", r.id);
		$(".evaluation_form #evaluation_text").val( r.text );

		$(".evaluation_form #evaluation_text").keydown( function() {
			var no = parseInt ( $(this).attr("no") );

			console.log("Nummer" + no);
			self.ranges[no].text = $(this).val();
		});

	};

	this.set_ranges = function() {
		var list = [];
		for (var i = 0; i < self.seperator.length; i++)
			{
			list.push( self.seperator[i].start);
			}

		function sortNumber(a,b) {
    		return a - b;
		}

		list.sort(sortNumber);

		self.sorted = list;

		self.evaluation_ranges(list);
	};

	this.evaluation_ranges = function(list) {

		for (var i = 0; i < self.ranges.length; i++) {
			var r = self.ranges[i];

			// alert(list[i]);

			if (i === 0) {
				r.end = parseFloat (list[0] );
			} else {
				r.start = parseFloat( list[i-1] );
				if ( !list[i] ) {
					r.end = 1.00;
				} else {
					r.end   = parseFloat ( list[i] );
				}
			}
		}

	};

	this.reset_ranges = function() {
		var fin = self.ranges[self.ranges.length-2];
		fin.end = 0.90;
	};

	this.init = function() {
		self.seperator.push( { start: 0.33, id: 0});
		self.seperator.push({ start: 0.66, id: 1 });

		self.ranges.push( {  id: 0, text: "RANGE 1", start: 0.00, end: 0.33   }  );
		self.ranges.push( {  id: 1, text: "RANGE 2", start: 0.33, end: 0.66   }  );
		self.ranges.push( {  id: 2, text: "RANGE 3", start: 0.66, end: 1.00 }  );
	};

	self.init();
};


Assessment.Editor = function() {
	var self = this;

	window.editor = this;

	this.sequence = null;
	this.activeID = null;

	this.keydown = function(event){
		console.log(event.keyCode);

		switch( event.keyCode ) {

			case 8:
				 if (self.active_element) {
				 	self.delete_element();
				 }
			break;

			case 37:
				if (self.active_sequence) {
					self.previous_node();
				}
			break;

			case 39:
				if (self.active_sequence) {
					self.next_node();
				}
			break;

		}
	};


	this.delete_element = function() {
		var no = self.activeID;

		console.log("ACTIVE_ID " + no);

		var list = [];
		for (var i = 0; i < self.sequence.nodes.length; i++) {
			if ( i !== no ) {
				list.push( self.sequence.nodes[i] );
			}
		}

		for (var j = 0; j < list.length; j++) {
			list[j].id = j;
		}

		$(".sequence-inner").html("");

		self.sequence.nodes = list;
		self.repaint_nodes();

		if ( self.sequence.nodes.length > 0 ) {
			self.sequence.nodes[0].paint_node();
			$("#node_0").addClass("active_node");
		}
		else {
			$(".question").remove();
			$(".answers").remove();
		}

	};


	this.repaint_nodes = function(){
		$(".node").remove();

		// reset width of sequence-inner
		$("#sequence-inner").css({
			"width" : window.innerWidth
		});

		for (var i = 0; i < self.sequence.nodes.length; i++) {

			var id = "node_" + i;
			var node = self.sequence.nodes[i];
			var img = "img/";

			switch (node.type) {
				case "multiple_choice":
				 img += "multiple.svg";
				break;

				case "alternative":
				 img += "choice.svg";
				break;

				case "input":
				 img += "input2.svg";
				break;

				default:
				 alert(node.type);
				break;
			}

			var s = '<div id = "' + id + '" class = "node" no = "' + i + '"><img src = "' + img + '"/></div>';
			$("#sequence-inner").append(s);
			if ( (i + 1) > Math.floor(window.innerWidth / 76) ) {
				$("#sequence-inner").css({
					"width" : $("#sequence-inner").width()  + 76
				});
			}
		}

		var $node = $(".node");
		$node.mouseover( function() {
			_editor.active_element = this;
		});
		$node.mouseout( function() {
			_editor.active_element = null;
		});

		$node.click( function() {
			$(".node").removeClass("active_node");
			$(this).addClass("active_node");
			self.activeID = parseInt( $(this).attr("no") );

			self.sequence.nodes[self.activeID].paint_node();
		});
	};


	this.next_node = function() {
	  if (self.sequence.nodes.length > self.activeID) {
       $(".node").removeClass("active_node");
       self.activeID += 1;
       self.sequence.nodes[self.activeID].paint_node();

       var n = "#node_" + self.activeID;
       $(n).addClass("active_node");
	   }
	};

	this.previous_node = function() {

		if (self.activeID > 0) {
			$(".node").removeClass("active_node");
			self.activeID -= 1;

			self.sequence.nodes[self.activeID].paint_node();
			var n = "#node_" + self.activeID;
			$(n).addClass("active_node");
		}

	};

	this.hide_evaluation_form = function() {

		var el = document.getElementById("evaluation_form");
		var tl = new TimelineMax({  });
		tl.pause();

		tl.to(el, 1, {
					 left: '100%',
					 opacity: 1,
					 }, "go" );

		tl.play();

	};


	this.show_evaluation_form = function() {
		var el = document.getElementById("evaluation_form");
		var tl = new TimelineMax({  });
		tl.pause();

		tl.to(el, 0, {
					 left: '-100%',
					 opacity: 1,
					 }, "start" );


		tl.to(el, 1, {
					 left: '0',
					 opacity: 1,
					 }, "go" );

		tl.play();
	};

	this.draggable_markers = function() {

	$('.seperator').draggable({

	        axis : "x",

	        start : function(event, ui) {

			},

	        drag : function(event, ui){
				var nr = parseInt( $(this).attr("no") );

				self.act_marker = self.evaluation.seperator[nr]; // the reference to the marker
	        },


	        stop : function(event, ui) {

				var width = $(".evaluation_form .range").width();
				var number = parseInt( $(this).attr("no") );

				var pos = $(this).position().left;
				if (pos < 0) {
					$(this).css("left", "1%");  // if it goes into the negative range


				}
				if (pos > width ) {
					$(this).css("left", "99%");


				}

				var perc = pos/width;

                // Update des Textfeldes
                var p = (perc*100).toFixed(2);
                console.log(p);

                var div = "#txt_" + number;
                $(div).html(p);
                ///

				if (perc < 0 || perc > 1) {
					var p;
					if (perc < 0) {
						p = '1.00';
					} else {
						p = '99.00';
					}
					var div = "#txt_" + number;
					$(div).html(p);
                }

				self.evaluation.update_marker(number, perc);
        	}

		});

	};

    this.randomColor = function(min_lightness, opacity) {
		var range = 255 - min_lightness;
		var col = {};
		col.r = parseInt( parseInt(Math.random() * range) + min_lightness );
		col.g = parseInt (parseInt(Math.random() * range)  + min_lightness );
		col.b = parseInt (parseInt(Math.random() * range)  + min_lightness );
		col.a = opacity;

		var s = "rgba(" + col.r + "," + col.g + "," + col.b + "," + col.a + ")";
		return s;
    };


		this.show_json_file = function(text) {

			var s =
				`<div id = "json_file">
						<div id = "exit"><img src = "img/exit.svg"/></div>
						<div id = "json_text">${text}</div>
						<div id="download" class="myButton" download="" href="#">download</div>
					</div>`;

			$("body").append(s);

			$("#json_file #exit").click(function(){
				$("#json_file").fadeOut(200, function() {
					$("#json_file").remove();
				});
			});


			$("#download").click(function() {

				download(text, "QA.json", "text/plain");

			});

		};

    this.load_file = function() {

		var s =
			`<div id = "load_file">
				<div id = "exit"><img src = "img/exit.svg"></div>
				<input id= "fileInput" type="file" class="fileInput">
				<img id = "Backing" src = "img/box.svg"/>
				<hr/>
				<div class = "label">COPY PASTE JSON</div>
				<textarea id = "json_paste" rows="4" cols="50"></textarea>
				<div id = "submit">SUBMIT</div>
			</div>`;

		$("body").append(s);

		$("#load_file #exit").click(function(){
			$("#load_file").fadeOut(200, function() {
				$("#load_file").remove();
			});
		});

		$("#json_paste").change(function(){
			// alert("hier ändert sich was");
		});

		$("#load_file #submit").click(function(){

			var text      = $("#json_paste").val();
			self.clear_sequence();
			var temp     = JSON.parse(text);
			self.create_sequence(temp);

			self.repaint_nodes();

			if ( self.sequence.nodes[0] ) {
				self.sequence.nodes[0].paint_node();
				$("#node_0").addClass("active_node");
			}

			$("#load_file").fadeOut(200, function() {
				$("#load_file").remove();
			});
		});

		$(".fileInput").change(function() {

			console.log("Hier ändert sich was ...");

			var reader = new FileReader();

			reader.onload = function() {
				var text     = reader.result;

				self.clear_sequence();
				var temp     = JSON.parse(text);
				self.create_sequence(temp);

				self.repaint_nodes();

				if ( self.sequence.nodes[0] ) {
					self.sequence.nodes[0].paint_node();
					$("#node_0").addClass("active_node");
				}

				$("#load_file").fadeOut(200, function() {
					$("#load_file").remove();
				});

			};

			var fileUpload = document.getElementById("fileInput").files[0];
			reader.readAsText(fileUpload);
	    });

    };

    this.create_sequence = function(qa) {

		var temp = qa.sequence;
		// self.evaluation = qa.evaluation;
		self.evaluation.sorted		= qa.evaluation.sorted;
		self.evaluation.ranges		= qa.evaluation.ranges;
		self.evaluation.seperator = qa.evaluation.seperator;

		self.repaint_evaluation_form();


        for (var i = 0; i < temp.nodes.length; i++)
            {
            switch(temp.nodes[i].type)
                {
                case "multiple_choice":

                    var no = self.sequence.nodes.length;
                    self.sequence.nodes.push( new Assessment.MultipleChoice(self.sequence.nodes.length) );
                    self.sequence.nodes[no].right_value     = temp.nodes[i].right_value;
                    self.sequence.nodes[no].question        = temp.nodes[i].question;
                    self.sequence.nodes[no].transition_in   = temp.nodes[i].transition_in;
                    self.sequence.nodes[no].transition_out  = temp.nodes[i].transition_out;
                    self.sequence.nodes[no].duration        = temp.nodes[i].duration;

                    self.sequence.nodes[no].answers        = temp.nodes[i].answers;


                break;

                case "input":
                  var no = self.sequence.nodes.length;
                   self.sequence.nodes.push( new Assessment.Input(self.sequence.nodes.length) );
                   self.sequence.nodes[no].right_answer    = temp.nodes[i].right_answer;
                   self.sequence.nodes[no].question        = temp.nodes[i].question;
                   self.sequence.nodes[no].transition_in   = temp.nodes[i].transition_in;
                   self.sequence.nodes[no].transition_out  = temp.nodes[i].transition_out;
                   self.sequence.nodes[no].duration        = temp.nodes[i].duration;

                   self.sequence.nodes[no].points           = temp.nodes[i].points;

                break;
                }

            }
    };


	this.clear_sequence = function() {

		$(".node").remove();
		$(".area").html("");
		self.sequence.nodes = [];

	};


	this.repaint_evaluation_form = function() {

		// alert("sollte das Formular neu malen");
		$(".seperator").remove();

		var k = self.evaluation.ranges.length;

		var offset = 100/k;
		var s = ``;

		for (var n = 0; n < k-1; n++) {

			var off = offset * n;
			var pzt = self.evaluation.ranges[n].end * 100;
			var id = "txt_" + n;

			s +=
				`<div no = "${n}" class = "seperator" style="left:${pzt}%" >
					<div id = "${id}" textfield= "${n}" class = "textfield">${pzt.toFixed(2)}</div>
				</div>`;
		}

		$(".range").append(s);

		self.draggable_markers();


	};


	this.init = function() {
		_editor = this;

		self.sequence 		= new Assessment.Sequence();
		self.evaluation		= new Assessment.Evaluation();

		window.onkeydown = self.keydown;

            var s = '<div id = "fixed_body">';

		    s += '<div class = "toolbar">';

			s += '<div title = "new multiple choice element" class = "tool" id = "multiple_choice">';
			s += "Multiple Choice";
			s += '</div>';


			s += '<div class = "tool" id = "input">';
			s += "Input";
			s += '</div>';

            /*
			s += '<div class = "tool" id = "alternative">';
			s += "Alternative";
			s += '</div>';
			*/
            s += '<div title = "load file" class = "load" id  = "load"><img src = "img/box.svg"/></div>';
		    s += '<div title = "evaluation" class = "evaluation" id  = "evaluation"><img src = "img/survey.svg"/></div>';
		    s += '<div title = "preview" class = "player" id  = "player"><img src = "img/play.svg"/></div>';
		    s += '<div title = "json output" class = "graphic_tool" id  = "json"><img src = "img/file.svg"/></div>';

		s += '</div>';

		s += '<div id = "evaluation_form" class = "evaluation_form">';
			s += '<div id = "exit"><img src = "img/exit.svg"/></div>';

			s += '<h1>EVALUATION</h1>';

			s += '<textarea id = "evaluation_text" rows="4" cols="50">';
			s += '</textarea>';


			s += '<div class = "tools">';
			  s += '<div id = "plus_range" class = "tool"><img src = "img/plus.svg"/>';
			  s += '</div>';

              s += '<div class = "legend">NEW EVALUATION RANGE</div>';

			s += '</div>';




			var offset = 100/3;

			s += '<div title = "click me to see the related text" class = "range">';


			s += '<div id = "left_legend">0 %</div>';
            s += '<div id = "right_legend">100 %</div>';


			for (var n = 1; n < 3; n++) {

				var off = offset * n;
				var nr  = n -1;

				s += '<div no = "' + nr + '" class = "seperator" style="left:' + off + '%" >';
				    var id = "txt_" + nr;

				    s += '<div id = "' + id + '" textfield= "' + nr + '" class = "textfield">' + off.toFixed(2) + '</div>';

				s += '</div>';
			}


            /*
            for (var k = 0; k < 3; k++) {
                var col = self.randomColor(80, 1);

                s += '<div range = "' + k + '" class = "eval_range" style="background: ' + col + '">';

                    // s += '<div class = "peak"></div>';


                s += '</div>';
            }
            */


			s += '</div>';

		s += '</div>';

		s += '<div class = "area">';
		s += '</div>';


		s += '<div class = "sequence">';
			s += '<div id="sequence-inner"></div>';
		s += '</div>';

        s += '</div>';


		$("body").append(s);

        var h = (window.innerHeight - 120) + "px";
        $("#evaluation_form").css("height", h);



		$(".evaluation_form #exit").click(function(){
			self.hide_evaluation_form();
		});

		$(".evaluation_form .range").click(function(event){
			var ev = event.pageX - $(this).position().left;
			var perc = ev / $(this).width();
			self.evaluation.show_form(perc);
		});

		$(".evaluation_form #plus_range").click(function(){

			var nr = self.evaluation.seperator.length;

			var s = '<div no = "' + nr + '" class = "seperator" style="left:90%" >';

			  var id = "txt_" + nr;
              s += '<div id = "' + id + '" textfield= "' + nr + '" class = "textfield">90.00</div>';

	        s += '</div>';

			$(".evaluation_form .range").append(s);

			var t = "RANGE " + (nr+2);

			self.evaluation.seperator.push( { id: nr, start: 0.90 } );
			self.evaluation.ranges.push( { id: (nr+1), start: 0.90, end: 1.00, text: t } );

			self.evaluation.reset_ranges();


			self.draggable_markers();
		});

		self.draggable_markers();

		$("#json").click(function(){

			var qa = {
				'sequence': self.sequence,
				'evaluation': self.evaluation
			};

			var s = JSON.stringify(qa);

			self.show_json_file(s);


		});

		$("#evaluation").click(function(){
			self.show_evaluation_form();
		});

		$("#load").click(function(){
			self.load_file();
		});

		$("#player").click(function(){

			var qa = {
				sequence: self.sequence,
				evaluation: self.evaluation
			};

			var opts = {
				div: 'qapreview',
				exit: true
			};

			$("#qapreview").show();

			new Examination.Session(qa, opts);

		});

		$("#multiple_choice").click(function(){

			$(".node").removeClass("active_node");
			var no = self.sequence.nodes.length;
			self.sequence.nodes.push( new Assessment.MultipleChoice(self.sequence.nodes.length) );

			var id = "node_" + no;
			var s = '<div id = "' + id + '" class = "node active_node" no = "' + no + '"><img src = "img/multiple.svg"/></div>';
			$("#sequence-inner").append(s);
			if ( self.sequence.nodes.length > Math.floor(window.innerWidth / 76) ) {
				$("#sequence-inner").css({
					"width" : $("#sequence-inner").width()  + 76
				});
			}


			_editor.activeID = no;

			var $node = $(".node");
			$node.unbind('mouseover');
			$node.mouseover(function(){
				_editor.active_element = this;
			});

			$node.unbind('mouseout');
			$node.mouseout(function(){
				_editor.active_element = null;
			});

			$node.unbind('click');
			$node.click( function(){
				$(".node").removeClass("active_node");
				$(this).addClass("active_node");

				var id = parseInt( $(this).attr("no") );

				self.sequence.nodes[id].paint_node();

			});

		});

		$("#input").click(function(){
			$(".node").removeClass("active_node");
			var no = self.sequence.nodes.length;
			self.sequence.nodes.push( new Assessment.Input(self.sequence.nodes.length) );

			var id = "node_" + no;

			var s = `<div id = "${id}" class = "node active_node" no = "${no}"><img src = "img/input2.svg"/></div>`;
			$("#sequence-inner").append(s);
			if ( self.sequence.nodes.length > Math.floor(window.innerWidth / 76) ) {
				$("#sequence-inner").css({
					"width" : $("#sequence-inner").width()  + 76
				});
			}

			var $node = $(".node");

			$node.unbind('click');
            $node.click( function(){
                $(".node").removeClass("active_node");
                $(this).addClass("active_node");

                var id = parseInt( $(this).attr("no") );

                self.sequence.nodes[id].paint_node();

            });


		});

		$(".sequence").mouseover(function() {
			self.active_sequence = true;
		});

		$(".sequence").mouseout(function() {
			self.active_sequence = false;
		});

		$("#alternative").click(function(){

			$(".node").removeClass("active_node");
			var no = self.sequence.nodes.length;
			self.sequence.nodes.push( new Assessment.Alternative(self.sequence.nodes.length) );
			var id = "node_" + no;

			var s = `<div id = "${id}" class = "node active_node" no = "${no}"><img src = "img/choice.svg"/></div>`;

			$("#sequence-inner").append(s);
			if ( self.sequence.nodes.length > Math.floor(window.innerWidth / 76) ) {
				$("#sequence-inner").css({
					"width" : $("#sequence-inner").width()  + 76
				});
			}

			$(".node").unbind('click');
			$(".node").click( function() {
				$(".node").removeClass("active_node");
				$(this).addClass("active_node");

				var id = parseInt( $(this).attr("no") );

				self.sequence.nodes[id].paint_node();
			});
		});
	};

	self.init();
};

module.exports = exports = Assessment;
