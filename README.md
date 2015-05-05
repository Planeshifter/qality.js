[![NPM version][npm-image]][npm-url]
[![Bower version][bower-image]][bower-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Dependencies][dependencies-image]][dependencies-url]

# QAlity.js

> Multiple-Choice QA System for JavaScript

![editor] (http://burckhardt.ludicmedia.de/Quiz02.png)

## Features:

- **Versatile**: Several question types: *multiple choice*, *input fields*, *timed and untimed questions*
- **Evaluation system**: Provide result scores and targeted feedback
- **Animations**: customizable animations based on the performant [gsap](http://greensock.com/gsap) library
- **Visual Editor**: create quizzes interactively using a visual frontend
- **Markdown support**: implemented via [markdown-it](https://markdown-it.github.io/)
- **Math support**: blazingly fast rendering via [KaTeX](http://khan.github.io/KaTeX/)
- **Customizable Design**: change appearance of all elements via CSS

## Installation:

#### CDN

Include the following two lines in your `head` and you are ready to go:
```html
<script src="https://cdn.rawgit.com/Planeshifter/qality.js/master/dist/QAreader.min.js"</script>
<link href="https://cdn.rawgit.com/Planeshifter/qality.js/master/css/exam.css" media="screen" rel="stylesheet" type="text/css"/>
```

See the following minimal working example:
```html
<!DOCTYPE html>
<html>
  <head>
      <script src="https://cdn.rawgit.com/Planeshifter/qality.js/master/dist/QAreader.min.js"></script>
      <link href="https://cdn.rawgit.com/Planeshifter/qality.js/master/css/exam.css" media="screen" rel="stylesheet" type="text/css"/>
  </head>
  <body>
    <script>
        new QAlity({"sequence":{"nodes":[{"id":0,"type":"input","question":"Who is the current president of the United States?","right_answer":"Barack Obama","transition_in":"dynamic","transition_out":"dynamic","points":1,"duration":"0","mathOptions":[{"left":"$$","right":"$$","display":true},{"left":"\\[","right":"\\]","display":true},{"left":"\\(","right":"\\)","display":false}],"background":"none"}]},"evaluation":{"seperator":[{"start":0.33,"id":0},{"start":0.66,"id":1}],"sorted":[],"ranges":[{"id":0,"text":"RANGE 1","start":0,"end":0.33},{"id":1,"text":"RANGE 2","start":0.33,"end":0.66},{"id":2,"text":"RANGE 3","start":0.66,"end":1}]}},
        {"div":"quizHolder"});
    </script>
    <div id = "quizHolder"></div>
  </body>
</html>
```

#### npm

```bash
npm install qality
```

Use [browserify](https://github.com/substack/node-browserify) and render a quiz with only a few lines:

```javascript
var QAlity = require( 'qality' );

new QAlity(<qa object>, {
  "div":"<div to render to>"
}, <optional callback>);
```

#### bower

```
bower install qality
```

Require the necessary files in your `index.html` document:

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Load QA Reader, which exposes constructor function QAlity to the window object -->
    <script src="bower_components/qality/dist/QAreader.min.js"></script>
    <!-- Load the standard CSS or provide your own -->
    <link href="bower_components/qality/css/exam.css" media="screen"
      rel="stylesheet" type="text/css"/>
  </head>
  <body>
    <!-- your code comes here -->
  </body>
</html>
```

## Usage:

### Running the Editor

A hosted version of the editor is accessible under the following link: [QAlity Frontend](http://qality.philipp-burckhardt.com/).

![editor] (http://burckhardt.ludicmedia.de/Quiz01.png)

To run your own version, clone this repository and run

```bash
make build
```

to compile the JavaScript necessary for running the frontend. The command

```bash
make server
```

starts a server at port 8000 and should automatically open the frontend in a browser.

### API

## Tests:

---
### License

[MIT](http://opensource.org/licenses/MIT)

### Icon Credits

- "Wrench" by Calvin Goodman
- "Network" by José Campos
- "Survey" by Ann Fandrey
- "Close" by Mateo Zlatar
- "Play" by Mike Rowe
- "Add" by Vittorio Maria Vecchi
- "Upload" by Thomas Le Bas
- "Text" by Zyad Basheer
- "Survey" by Icons8
- "Marker" by Anton Gajdosik
- "Box" by Arthur Schmitt

[npm-image]: https://badge.fury.io/js/qality.svg
[npm-url]: http://badge.fury.io/js/qality

[bower-image]:  https://img.shields.io/bower/v/qality.svg
[bower-url]: https://github.com/Planeshifter/qality.js.git

[travis-image]: https://travis-ci.org/Planeshifter/qality.js.svg
[travis-url]: https://travis-ci.org/Planeshifter/qality.js

[coveralls-image]: https://img.shields.io/coveralls/Planeshifter/qality.js/master.svg
[coveralls-url]: https://coveralls.io/r/Planeshifter/qality.js?branch=master

[dependencies-image]: http://img.shields.io/david/Planeshifter/qality.js.svg
[dependencies-url]: https://david-dm.org/Planeshifter/qality.js

### Copyright

Copyright &copy; 2015. Philipp Burckhardt.
