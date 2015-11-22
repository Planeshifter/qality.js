/* global renderMathInElement */
'use strict';

// MODULES //

const getMaxPoints = require( './getMaxPoints.js' ),
	$ = require( 'jquery' ),
	sum = require( 'compute-sum' ),
	MarkdownIt = require( 'markdown-it' ),
	md = new MarkdownIt(),
	katex = require( 'katex' );


// APPEND RESULT PAGE //

/**
* FUNCTION: appendResultPage()
*	Generate result page after quiz is finished and append to DIV.
*
* @returns {Void}
*/
function appendResultPage() {
	/* jshint validthis:true */
	var self = this;
	var nodes = this.sequence.nodes;
	var res = {
		points: 0,
		text: ``,
		right_answers: 0,
		questions: nodes.length
	};
	for ( let i = 0; i < nodes.length; i++ ) {
		var actual = nodes[i];
		res.text += `<h3>Question ${i}:</h3> ${md.render( actual.question )}`;
		switch( actual.type ) {
		case "multiple_choice":
			var maxPoints = sum( actual.answers, {
				accessor: (x) => x.points
			});
			res.text +=
				`<ul>
					${actual.answers.map( (o, i ) => {
						var color;
						if ( actual.chosen === i ) {
							if ( actual.chosen === actual.right_value ) {
								color = 'green';
							} else {
								color = 'darkred';
							}
							return `<li style="color:${color};">${o.text} (${o.points}/${maxPoints} points)</li>`;
						}
						return `<li>${o.text}</li>`;
					}).join('')}
				</ul>`;
			if ( actual.chosen === actual.right_value ) {
				res.right_answers += 1;
			}
			var answer = actual.answers[ actual.chosen ];
			if ( answer )  {
				res.points += parseInt( answer.points );
				if ( answer.assessment !== "ASSESSMENT" ) {
					res.text += `${answer.assessment}`;
				}
			} else {
				res.points += 0;
			}
		break;
		case "input":
			if ( actual.given_answer === actual.right_answer ) {
				res.points += actual.points;
				res.right_answers += 1;
			}
		break;
		}
	}
	res.max = getMaxPoints( nodes );
	res.percentage = res.points / res.max;
	var s =
		`<div class = "result"><h1>RESULT</h1>
			<div id = "assessment">
			<h3>You have answered <span class = "phigh">${res.right_answers}</span> of <span class = "phigh">${res.questions}</span> questions correctly</h3>
				<h3>You have reached <span class = "phigh">${res.points}</span> of <span class = "phigh">${res.max}</span> points</h3>
				<h3>Percentage: <span class = "phigh">${(res.percentage*100).toFixed(2)}%</span></h3>
				<h3><span class = "pcaps">Evaluation</span></h3><h3>${this.getEvaluation( res.percentage )}</h3>
				<h3><span class = "pcaps">Assessment</span></h3><div class = "Assessment">${res.text}</div>
			</div>
		</div>`;
	$( this.div ).append( s );
	renderMathInElement( document.body, self.mathOptions );
} // end FUNCTION appendResultPage()


// EXPORTS //

module.exports = appendResultPage;
