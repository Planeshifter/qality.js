'use strict';

// MODULES //

const $ = require( 'jquery' ),
	download = require( 'download' );


// SHOW FILE //

/**
* FUNCTION: showFile( text )
*	Displays an uploaded JSON file cotaining a qality surver / quiz.
*
* @param {String} text - JSON string
* @returns {Void}
*/
function showFile( text ) {
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
} // end FUNCTION showFile()


// EXPORTS //

module.exports = showFile;
