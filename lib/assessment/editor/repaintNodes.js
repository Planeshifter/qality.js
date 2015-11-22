'use strict';

// MODULES //

const $ = require( 'jquery' );


// REPAINT NODES //

/**
* FUNCTION: repaintNodes()
*	Repaints all nodes of the current qality survey / quiz.
*
* @returns {Void}
*/
function repaintNodes() {
	/* jshint validthis:true */
	var self = this;
	$(".node").remove();
	// Reset width of sequence-inner
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
	$node.mouseover( function onMouseover() {
		window.editor.active_element = this;
	});
	$node.mouseout( function onMouseout() {
		window.editor.active_element = null;
	});
	$node.click( function onClick() {
		$(".node").removeClass("active_node");
		$(this).addClass("active_node");
		self.activeID = parseInt( $(this).attr("no"), 10 );
		self.sequence.nodes[self.activeID].paint_node();
	});
} // end FUNCTION repaintNodes()


// EXPORTS //

module.exports = repaintNodes;
