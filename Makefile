# BROWSERIFY & BABELIFY #

BROWSERIFY ?= ./node_modules/.bin/browserify
BABELIFY ?= ./node_modules/babelify
UGLIFY ?= ./node_modules/.bin/uglifyjs
WATCH ?= ./node_modules/.bin/watch
HTTP_SERVER ?= ./node_modules/.bin/http-server

# JSHINT #

JSHINT ?= ./node_modules/.bin/jshint
JSHINT_REPORTER ?= ./node_modules/jshint-stylish/stylish.js

# Browser #

BROWSER ?=  xdg-open

# Build process #

.PHONY: build

build:
	$(BROWSERIFY) lib/writer.js -t $(BABELIFY) --outfile QAwriter.js
	$(UGLIFY) QAwriter.js --compress --output QAwriter.min.js
	$(BROWSERIFY) lib/reader.js -t $(BABELIFY) --outfile QAreader.js
	$(UGLIFY) QAreader.js --compress --output QAreader.min.js

# Start server #

.PHONY: server

server:
	$(BROWSER) "http://localhost:8000"
	$(HTTP_SERVER) -p 8000

# Watch for file changes #

.PHONY: watch

watch:
	    $(WATCH) "make build" lib/


# Lint #

.PHONY: lint lint-jshint

lint: lint-jshint

lint-jshint: node_modules
	$(JSHINT) \
		--reporter $(JSHINT_REPORTER) \
		./

# Installing node_modules:
.PHONY: install

install:
	npm install

# CLEAN #
.PHONY: clean

clean:
	rm bundle.js
	rm bundle.min.js
