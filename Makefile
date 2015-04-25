# BROWSERIFY & BABELIFY #

BROWSERIFY ?= ./node_modules/.bin/browserify
BABELIFY ?= ./node_modules/babelify
UGLIFY ?= ./node_modules/.bin/uglifyjs
WATCH ?= ./node_modules/.bin/watch

# Build process #

.PHONY: build

build: bundle.js
	$(UGLIFY) bundle.js --compress --output bundle.min.js

bundle.js:
	$(BROWSERIFY) lib/main.js -t $(BABELIFY) --outfile bundle.js

# Watch for file changes #

.PHONY: watch

watch:
	    $(WATCH) "make build" lib/

# Installing node_modules:
.PHONY: install

install:
	npm install

# CLEAN #
.PHONY: clean

clean:
	rm bundle.js
	rm bundle.min.js
