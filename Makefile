# BROWSERIFY & BABELIFY #

BROWSERIFY ?= ./node_modules/.bin/browserify
BABELIFY ?= ./node_modules/babelify
UGLIFY ?= ./node_modules/.bin/uglifyjs
WATCH ?= ./node_modules/.bin/watch

# JSHINT #

JSHINT ?= ./node_modules/.bin/jshint
JSHINT_REPORTER ?= ./node_modules/jshint-stylish/stylish.js

# Build process #

.PHONY: build

build:
	$(BROWSERIFY) lib/main.js -t $(BABELIFY) --outfile bundle.js
	$(UGLIFY) bundle.js --compress --output bundle.min.js

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
