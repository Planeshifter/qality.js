Examination = {};

Examination.Session = function(obj) {
	_session = this; 
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
			
		};
					 
					 
					 
		tl.to(el, 1, {
					 left: '0', 
					 opacity: 1,
					 }, "go" );    	
		
		tl.play();	
		
		
	};
	


	this.page_change = function(node) {
	
	
		if (! node.transition_in) node.transition_in = "default";

		switch(node.transition_in) {
			
			case "static":
			 
			break;
			
			case "dynamic":
			  self.dynamic_change(node);
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
		s += '<div class = "mc_question">' + node.question + '</div>';

		s += '<div id = "answers">';


		s += '<form id = "' + form + '" name = "' + form + '">';
		
		for (var i = 0; i < node.answers.length; i++)
			{

			s += '<div class = "mc_answer">';

			s += '<input class = "clicked_answer" type="radio" name="mpanswers" value="' + i + '">';
			s += node.answers[i].text + '</div>';
			}

		s += '</form>';


		s += '</div>';
		
		s += '</div>';


		$(self.div).append(s);
		
		self.page_change(node);
			   

		/////////////////////////////////////
		
		
		$(".clicked_answer").click(function(){
			
			actual_form = document.getElementById(form);
			node.chosen = parseInt( actual_form.mpanswers.value) ;
			
			
			
			it ++;

			beta = self.sequence.nodes[it];

			if  (it < self.sequence.nodes.length) self.play_node(beta);
			else 
				{
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
					if (actual.answers[j].points > tmax) tmax = actual.answers[j].points; 
					
				};
				
				maximal += tmax;
				
				break;
				}
		
		
		}
		
	return maximal;
	};


	this.result = function() {
		
		res = { points: 0, text: [] };
		
		for (var i = 0; i < self.sequence.nodes.length; i++) {
			
		  var actual =  self.sequence.nodes[i];
		  
		  switch(actual.type) {
		  		
		  		case "multiple_choice":
				  	var answer = actual.answers[actual.chosen];
				   	res.points += parseInt( answer.points );
				  	if (answer.assessment != "ASSESSMENT") res.text.push ( answer.assessment);
			  
			  	break;
		  	}
		  }
				
		res.max = self.get_max_points();		
				
				
		var s = "";
		s += '<div class = "result">';
		
		s += "<h1>Here is the result</h1>";
		
		s += '<div id = "assessment">';
		
		s += '<h3>Maximal Points ' + res.max + '</h3>';
		s += '<h3>You have reached ' + res.points + '</h3>';
		s += '<h3>Assessment ' + res.text + '</h3>';
								
		s += '</div>';
				
				
		s += '</div>';
		
		$(self.div).append(s);
		
	};



	


	this.play_node = function(node) {
		switch(node.type)
			{
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
		if (! obj.div)
			{
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
