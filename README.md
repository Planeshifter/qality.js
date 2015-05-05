[![NPM version][npm-image]][npm-url]
[![Bower version][bower-image]][bower-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Dependencies][dependencies-image]][dependencies-url]

# QAlity.js

> Multiple-Choice QA System for JavaScript

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

## Usage:

### Running the Editor

A hosted version of the editor is accessible under the following link: [QAlity Frontend](http://qality.philipp-burckhardt.com/). 

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
