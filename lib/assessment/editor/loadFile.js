'use strict';

// MODULES //

const $ = require( 'jquery' );


// LOAD FILE //

/**
* FUNCTION: loadFile()
*	Upload qality JSON file to import existing project.
*
* @returns {Void}
*/
function loadFile() {
	/* jshint validthis:true */
	var self = this;
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

	$("body").append( s );

	$("#load_file #exit").click( function onClick() {
		$("#load_file").fadeOut(200, function() {
			$("#load_file").remove();
		});
	});

	$("#json_paste").change( function onChange() {
		// alert("hier ändert sich was");
	});

	$("#load_file #submit").click( function onClick() {
		var text      = $("#json_paste").val();
		self.clear_sequence();
		var temp     = JSON.parse(text);
		self.create_sequence(temp);
		self.repaint_nodes();
		if ( self.sequence.nodes[0] ) {
			self.sequence.nodes[0].paint_node();
			$("#node_0").addClass("active_node");
		}
		$("#load_file").fadeOut(200, function onFadeOut() {
			$("#load_file").remove();
		});
	});

	$(".fileInput").change( function onChange() {
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
		var fileUpload = document.getElementById( "fileInput" ).files[0];
		reader.readAsText(fileUpload);
	});
} // end FUNCTION loadFile()


// EXPORTS //

module.exports = loadFile;
