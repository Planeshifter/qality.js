'use strict';

// MODULES //

const $ = require( 'jquery');
const Examination = require( './../../exam' );


// FUNCTIONS //

var Assessment = require( './../index.js' );


// INIT //

/**
* FUNCTION: init()
*	Initialize the editor window and attach all event handlers.
*
* @returns {Void}
*/
function init() {
	/* jshint validthis:true */
	var self = this;
	window.editor = this;

	self.sequence = new Assessment.Sequence();
	self.evaluation = new Assessment.Evaluation();

	window.onkeydown = self.keydown;

	var offset = 100/3;
	var s =
		`<div id = "fixed_body">
			<div class = "toolbar">
				<div title = "new multiple choice element" class = "tool" id = "multiple_choice">Multiple Choice</div>
				<div class = "tool" id = "input">Input</div>
				<div title = "load file" class = "load" id  = "load"><img src = "img/box.svg"/></div>
				<div title = "evaluation" class = "evaluation" id  = "evaluation"><img src = "img/survey.svg"/></div>
				<div title = "preview" class = "player" id  = "player"><img src = "img/play.svg"/></div>
				<div title = "json output" class = "graphic_tool" id  = "json"><img src = "img/file.svg"/></div>
			</div>
			<div id = "evaluation_form" class = "evaluation_form">
				<div id = "exit"><img src = "img/exit.svg"/></div>
				<h1>EVALUATION</h1>
				<textarea id = "evaluation_text" rows="4" cols="50"></textarea>
				<div class = "tools">
					<div id = "plus_range" class = "tool"><img src = "img/plus.svg"/></div>
					<div class = "legend">NEW EVALUATION RANGE</div>
				</div>
				<div title = "click me to see the related text" class = "range">
				<div id = "left_legend">0 %</div>
				<div id = "right_legend">100 %</div>`;
		for (var n = 1; n < 3; n++) {
			var off = offset * n;
			var nr  = n -1;
			var id = "txt_" + nr;
			s +=
				`<div no = "${nr}" class = "seperator" style="left:${off}%" >
					<div id = "${id}" textfield= "${nr}" class = "textfield">${off.toFixed(2)}</div>
				</div>`;
		}
	s +=
		`</div>
		</div>
			<div class = "area"></div>
			<div class = "sequence">
				<div id="sequence-inner"></div>
			</div>
		</div>`;

	$("body").append(s);

	var h = (window.innerHeight - 120) + "px";
	$("#evaluation_form").css("height", h);

	$(".evaluation_form #exit").click( function onClick(){
		self.hide_evaluation_form();
	});
	$(".evaluation_form .range").click(function(event){
		var ev = event.pageX - $(this).position().left;
		var perc = ev / $(this).width();
		self.evaluation.show_form( perc );
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

	$("#json").click( function onClick(){
		var qa = {
			'sequence': self.sequence,
			'evaluation': self.evaluation
		};
		var s = JSON.stringify(qa);
		self.show_json_file(s);
	});

	$("#evaluation").click( function onClick(){
		self.show_evaluation_form();
	});

	$("#load").click( function onClick(){
		self.load_file();
	});

	$("#player").click( function onClick(){
		var qa = {
			sequence: self.sequence,
			evaluation: self.evaluation
		};
		var opts = {
			div: 'qapreview',
			exit: true
		};
		$("#qapreview").show();
		window.session = new Examination( qa, opts );
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

		window.editor.activeID = no;

		var $node = $(".node");
		$node.unbind('mouseover');
		$node.mouseover(function(){
			window.editor.active_element = this;
		});
		$node.unbind('mouseout');
			window.editor.active_element = null;
		$node.mouseout(function(){
		});
		$node.unbind('click');
		$node.click( function(){
			$(".node").removeClass("active_node");
			$(this).addClass("active_node");
			var id = parseInt( $(this).attr("no"), 10 );
			self.activeID = id;
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
		window.editor.activeID = no;
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

	$("#alternative").click( function onClick(){
		$(".node").removeClass("active_node");
		var no = self.sequence.nodes.length;
		self.sequence.nodes.push( new Assessment.Alternative(self.sequence.nodes.length) );
		var id = "node_" + no;
		var s = `<div id = "${id}" class = "node active_node" no = "${no}"><img src = "img/choice.svg"/></div>`;
		$("#sequence-inner").append( s );
		if ( self.sequence.nodes.length > Math.floor(window.innerWidth / 76) ) {
			$("#sequence-inner").css({
				"width" : $("#sequence-inner").width()  + 76
			});
		}
		$(".node").unbind( 'click' );
		$(".node").click( function onClick() {
			$(".node").removeClass("active_node");
			$(this).addClass("active_node");
			var id = parseInt( $(this).attr("no") );
			self.sequence.nodes[id].paint_node();
		});
	});
} // end FUNCTION init()


// EXPORTS //

module.exports = init;
