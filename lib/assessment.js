Assessment = {};

Assessment.Alternative   = function(no) {
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
	
	this.init = function() {
		
		_input = this;	
		
		 
		var s = '<div class = "input">';

		s += '<div class = "toolbar">';
		    	s += '<div title = "setting" class = "tool" id  = "setting"><img src = "img/setting.svg"/></div>';
		s += '</div>';

		s += '<div class = "question">QUESTION</div>';

		s += '</div>';

		$(".area").html(s);
		
		$(".input .tool").click(function() {
			self.show_setting();
		});
		
		
	};
	
	
	this.show_setting = function() {
		if (!self.setting) {
			// self.setting = true;

			var s = '<div class = "setting">';
			s += '<div id = "exit"><img src = "img/exit.svg"/></div>';

			s += '<div id = "entries">';

				s += '<div class = "label">' + self.question + '</div>';
				s += '<input id = "node_question" name="vorname" type="text" value="' + self.question + '">';

				s += '<div class = "label">TRANSITION_IN</div>';
			    s += '<select name = selector id = "Transition_In" onchange="_multiple_choice.set_option(this, 0);">';
				s += '<option selected = "selected">static</option>';
				s += '<option>dynamic</option>';
				s += '<option>top_down</option>';
				s += '<option>bottom_up</option>';
			    s += '</select>';


				s += '<div class = "label">TRANSITION_OUT</div>';
			    s += '<select name = selector id = "Transition_Out" onchange="_multiple_choice.set_option(this, 1);">';
				s += '<option selected = "selected">static</option>';
				s += '<option>dynamic</option>';
				s += '<option>top_down</option>';
				s += '<option>bottom_up</option>';
			    s += '</select>';


				s += '<div class = "label">BACKGROUND IMAGE</div>';
				s += '<input id = "node_background" name="vorname" type="text" value="none">';

				s += '<div class = "label">DURATION - if bigger than 0, it is timed</div>';
				s += '<input id = "node_background" name="vorname" type="text" value="0">';

			s += '</div>';

			s += '<div id = "submit">SUBMIT</div>';
			s += '<div id = "delete">DELETE</div>';


			s += '</div>';

			$(".area").append(s);

			// self.selected_options();

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


			$(".setting #submit").click(function(){

				self.question = $("#node_question").val();
				$(".question").html(self.question);
				$(".setting").fadeOut();

				});
		} else {
			$(".setting").fadeIn();
		}


	};
	
	
	this.paint_node = function() {

		var s = "";
		
		var s = '<div class = "input">';

		s += '<div class = "toolbar">';
		    	s += '<div title = "setting" class = "tool" id  = "setting"><img src = "img/setting.svg"/></div>';
		s += '</div>';


		s += '</div>';

		$(".area").html(s);


	};
	
	
	this.interaction = function() {
		alert("sollte den Knoten malen");
	}
	
	
	
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

	this.get_value = function() {
		var rates = document.getElementsByName('mpanswers');
		var rate_value;
		for(var i = 0; i < rates.length; i++){
	    	if(rates[i].checked){
	        	rate_value = rates[i].value;
	    	}
		  }
		return rate_value;
	};

	this.show_setting = function() {
		if (!self.setting) {
			// self.setting = true;

			var s = '<div class = "setting">';
			s += '<div id = "exit"><img src = "img/exit.svg"/></div>';

			s += '<div id = "entries">';

				s += '<div class = "label">QUESTION</div>';
				s += '<input id = "node_question" name="vorname" type="text" value="' + self.question + '">';

				s += '<div class = "label">TRANSITION_IN</div>';
			    s += '<select name = selector id = "Transition_In" onchange="_multiple_choice.set_option(this, 0);">';
				s += '<option selected = "selected">static</option>';
				s += '<option>dynamic</option>';
				s += '<option>top_down</option>';
				s += '<option>bottom_up</option>';
			    s += '</select>';


				s += '<div class = "label">TRANSITION_OUT</div>';
			    s += '<select name = selector id = "Transition_Out" onchange="_multiple_choice.set_option(this, 1);">';
				s += '<option selected = "selected">static</option>';
				s += '<option>dynamic</option>';
				s += '<option>top_down</option>';
				s += '<option>bottom_up</option>';
			    s += '</select>';


				s += '<div class = "label">BACKGROUND IMAGE</div>';
				s += '<input id = "node_background" name="vorname" type="text" value="none">';

				s += '<div class = "label">DURATION - if bigger than 0, it is timed</div>';
				s += '<input id = "node_background" name="vorname" type="text" value="0">';

			s += '</div>';

			s += '<div id = "submit">SUBMIT</div>';
			s += '<div id = "delete">DELETE</div>';


			s += '</div>';

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


			$(".setting #submit").click(function(){

				self.question = $("#node_question").val();
				$(".question").html(self.question);
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
		temp = self.answers[no];

		if (!self.prompt) {
			self.prompt = true;

			var s = '<div class = "prompt">';

			s += '<div id = "exit"><img src = "img/exit.svg"/></div>';


			s += '<div class = "label">TEXT</div>';
			s += '<input id = "temporal" name="vorname" type="text" value="' + temp.text + '">';


			s += '<div class = "label">ORAL ASSESSMENT</div>';
			s += '<input id = "assessment" name="vorname" type="text" value="' + temp.assessment + '">';


			s += '<div class = "label">POINTS</div>';
			s += '<input id = "points" name="vorname" type="text" value="' + temp.points + '">';


			s += '<div class = "submit">SUBMIT</div>';
			s += '<div class = "delete">DELETE</div>';


			s += '</div>';


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

			self.answers = self.answers.filter( function(o, i) {
				return i !== no;
			});

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

	this.paint_node = function() {
		// $(".question").html("QUESTION");

		// I had to comment this line out; why was the prompt removed here?
		// $(".prompt").remove();
		$(".setting").remove();

		$(".question").html(self.question);

		var s = "";

		for (var i = 0; i < self.answers.length; i++) {
			s += '<input class = "mpanswer" type="radio" name="mpanswers" value="' + i + '">';
			s += '<span class = "label" no = "' + i + '">' + self.answers[i].text + '</span><br>';
		}

		$("#PossibleAnswers").html(s);

		if (self.right_value != -1) {
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
		_multiple_choice = this;

		var x = {  text: "A_0", points: 1, assessment: "ASSESSMENT" };
		self.answers.push(x);

		var y = {  text: "A_1", points: 1, assessment: "ASSESSMENT" };
		self.answers.push(y);

		var s = '<div class = "multiple_choice">';

			s += '<div class = "toolbar">';
		    	s += '<div title = "add option" class = "tool" id  = "plus"><img src = "img/plus.svg"/></div>';
		    	s += '<div title = "setting" class = "tool" id  = "setting"><img src = "img/setting.svg"/></div>';

		    s += '</div>';

			s += '<div class = "question">QUESTION</div>';

			s += '<div class = "answers">';

			s += '<form name = "PossibleAnswers" id = "PossibleAnswers">';
			    s += '<input class = "mpanswer" type="radio" name="mpanswers" value="0">';
			    s += '<span class = "label" no = "0">A_0</span><br>';

			    s += '<input class = "mpanswer" type="radio" name="mpanswers" value="1">';
			    s += '<span class = "label" no = "1">A_1</span><br>';
			s += '</form>';

			s += '</div>';

		s += '</div>';

		$(".area").html(s);

		self.interaction();
		self.get_value();

		$("#setting").click(function() {
			self.show_setting();
		});

		$(".question").click(function() {
			self.show_setting();
		});

		$(".mpanswer").click(function() {
			alert("ANTWORT");
			self.right_value = parseInt( this.value );
		});

		$("#plus").click(function() {

			var no = document.getElementsByName('mpanswers').length;
			var name = "A_" + no;

			var x = {  text: name, points: 0, assessment: "ASSESSMENT" };
			self.answers.push(x);


		  	var s = '<input class = "mpanswer" type="radio" name="mpanswers" value="' + no + '">';
		  	s += '<span class = "label" no = "' + no +'">' + name + '</span><br>';
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


Assessment.Editor = function() {
	var self = this;

	this.sequence = null;
	this.activeID = null;

	this.keydown = function(event){
		console.log(event.keyCode);
		switch(event.keyCode) {
			case 8:
				 if (self.active_element) {
				 	self.delete_element();
				 }
			break;
		}
	};


	this.delete_element = function() {
		var no = self.activeID;

		console.log("ACTIVE_ID " + no);


		var list = [];
		for (var i = 0; i < self.sequence.nodes.length; i++) {
			if (i != no) {
				list.push( self.sequence.nodes[i] );
			}
		}

		for (var j = 0; j < list.length; j++) {
			list[j].id = j;
		}


		$(".sequence").html("");

		self.sequence.nodes = list;
		self.repaint_nodes();
		
		if (self.sequence.nodes.length > 0) {
			self.sequence.nodes[0].paint_node();
			$("#node_0").addClass("active_node");
			}
		else
			{
			$(".question").remove();	
			$(".answers").remove();	
			} 
			
	};


	this.repaint_nodes = function(){
		$(".node").remove();

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
				 img += "input.svg";
				break;

				default:
				 alert(node.type);
				break;
			}

			var s = '<div id = "' + id + '" class = "node" no = "' + i + '"><img src = "' + img + '"/></div>';
			$(".sequence").append(s);

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



	this.init = function() {
		_editor = this;
		self.sequence = new Assessment.Sequence();

		window.onkeydown = self.keydown;


		var s = '<div class = "toolbar">';

			s += '<div class = "tool" id = "multiple_choice">';
			s += "Multiple Choice";
			s += '</div>';

			/*
			s += '<div class = "tool" id = "input">';
			s += "Input";
			s += '</div>';
		
			
			s += '<div class = "tool" id = "alternative">';
			s += "Alternative";
			s += '</div>';
			*/

		    s += '<div class = "player" id  = "player"><img src = "img/play.svg"/></div>';
		    s += '<div class = "graphic_tool" id  = "json"><img src = "img/file.svg"/></div>';

		s += '</div>';

		s += '<div class = "area">';
		s += '</div>';


		s += '<div class = "sequence">';
		s += '</div>';

		$("body").append(s);

		$("#json").click(function(){
			var s = JSON.stringify(self.sequence);
			alert(s);

		});


		$("#player").click(function(){
			var s = JSON.stringify(self.sequence);
			var o = { sequence: s };

			// var s = JSON.stringify( {"nodes":[{"type":"multiple_choice","question":"Wer ist früher geboren?","transition_in":"static","transition_out":"dynamic","answers":[{"text":"Beethoven","points":"0","assessment":"ASSESSMENT"},{"text":"Bach","points":"10","assessment":"ASSESSMENT"}],"element":{},"prompt":true},{"type":"multiple_choice","question":"Wie heißen die Einwohner Frankreichs","transition_in":"static","transition_out":"dynamic","answers":[{"text":"Franken","points":"0","assessment":"ASSESSMENT"},{"text":"Franzosen","points":"10","assessment":"ASSESSMENT"}],"element":{},"prompt":true},{"type":"multiple_choice","question":"Welche Partei wählen Sie?","transition_in":"static","transition_out":"dynamic","answers":[{"text":"CDU","points":"77","assessment":"ASSESSMENT"},{"text":"SPD","points":"88","assessment":"ASSESSMENT"},{"text":"Grüne / Bündnis 90","points":"0","assessment":"ASSESSMENT"},{"text":"Die Linke","points":"0","assessment":"ASSESSMENT"},{"text":"AFD","points":"0","assessment":"ASSESSMENT"},{"text":"FDP","points":"0","assessment":"ASSESSMENT"}],"element":{},"prompt":true}]} );
			// var o = { sequence: s };
			var exam = new Examination.Session(o);

		});

		$("#multiple_choice").click(function(){

			$(".node").removeClass("active_node");
			var no = self.sequence.nodes.length;
			self.sequence.nodes.push( new Assessment.MultipleChoice(self.sequence.nodes.length) );

			var id = "node_" + no;

			var s = '<div id = "' + id + '" class = "node active_node" no = "' + no + '"><img src = "img/multiple.svg"/></div>';
			$(".sequence").append(s);
			
			_editor.activeID = no;
			

			$(".node").unbind('mouseover');
			$(".node").mouseover(function(){
				_editor.active_element = this;
			});

			$(".node").unbind('mouseout');
			$(".node").mouseout(function(){
				_editor.active_element = null;
			});


			$(".node").unbind('click');
			$(".node").click( function(){
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

			var s = '<div id = "' + id + '" class = "node active_node" no = "' + no + '"><img src = "img/input2.svg"/></div>';
			$(".sequence").append(s);
		});


		$("#alternative").click(function(){

			$(".node").removeClass("active_node");
			var no = self.sequence.nodes.length;
			self.sequence.nodes.push( new Assessment.Alternative(self.sequence.nodes.length) );
			var id = "node_" + no;

			var s = '<div id = "' + id + '" class = "node active_node" no = "' + no + '"><img src = "img/choice.svg"/></div>';
			$(".sequence").append(s);


			$(".node").unbind('click');
			$(".node").click( function(){
			$(".node").removeClass("active_node");
			$(this).addClass("active_node");

			var id = parseInt( $(this).attr("no") );

			self.sequence.nodes[id].paint_node();

			});
		});
	};

	self.init();
};
