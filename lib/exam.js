Examination = {};

Examination.Session = function(obj) {
	this.sequence = JSON.parse(obj.sequence);

	var self = this;
	var it   = 0;

	this.multiple_choice = function(node) {
		var s = "";

		s += '<div class = "mc_question">' + node.question + '</div>';

		s += '<div id = "answers">';

		for (var i = 0; i < node.answers.length; i++)
			{

			s += '<div class = "mc_answer">';

			s += '<input class = "clicked_answer" type="radio" name="mpanswers" value="' + i + '">';
			s += node.answers[i].text + '</div>';
			}


		s += '</div>';


		$(self.div).append(s);

		$(".clicked_answer").click(function(){
			it ++;

			beta = self.sequence.nodes[it];

			if  (it < self.sequence.nodes.length) self.play_node(beta);
			else alert ("BIN FERTIG");
		});



		if (! node.transition) node.transition = "default";

		switch(node.transition) {
			default:
			 	 
			break;
		}

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

			var s = '<div id = "exam_panel"><div id = "exit"><img src= "img/exit.svg"></div></div>';


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
