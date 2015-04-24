# BROWSERIFY & BABELIFY #

BROWSERIFY ?= ./node_modules/.bin/browserify
BABELIFY ?= ./node_modules/babelify

.PHONY: build

build:
	$(BROWSERIFY) lib/main.js $(BABELIFY) --outfile bundle.js
