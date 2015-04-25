# BROWSERIFY & BABELIFY #

BROWSERIFY ?= ./node_modules/.bin/browserify
BABELIFY ?= ./node_modules/babelify
UGLIFY ?= ./node_modules/.bin/uglifyjs

.PHONY: build

build: bundle.js
	$(UGLIFY) bundle.js --compress --output bundle.min.js

bundle.js:
	$(BROWSERIFY) lib/main.js -t $(BABELIFY) --outfile bundle.js
