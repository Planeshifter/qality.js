# BROWSERIFY & BABELIFY #

BROWSERIFY ?= ./node_modules/.bin/browserify
BABELIFY ?= ./node_modules/babelify
BABEL ?= ./node_modules/.bin/babel
UGLIFY ?= ./node_modules/.bin/uglifyjs
WATCH ?= ./node_modules/.bin/watch
HTTP_SERVER ?= ./node_modules/.bin/http-server

# JSHINT #

JSHINT ?= ./node_modules/.bin/jshint
JSHINT_REPORTER ?= ./node_modules/jshint-stylish/stylish.js

# Browser #

BROWSER ?=  xdg-open

# Build folder #
BUILDDIR ?= build

# Dist folder #
DIST ?= dist

# Deploy #

.PHONY: deploy

deploy:	build
	mkdir $(BUILDDIR)
	mkdir $(BUILDDIR)/$(DIST)
	cp -r img/ $(BUILDDIR)/img
	cp -r css/ $(BUILDDIR)/css
	cp index.html $(BUILDDIR)/index.html
	cp CNAME $(BUILDDIR)/CNAME
	cp $(DIST)/QAwriter.min.js $(BUILDDIR)/$(DIST)/QAwriter.min.js
	cd ./build && \
	git init . && \
	git add . && \
	git commit -m "deploy page"; \
	git push "https://github.com/Planeshifter/qality.js.git" master:gh-pages --force && \
	rm -rf .git
	rm -rf build

# Build process #

.PHONY: build

build: build-reader build-writer build-node

build-reader:
	$(BROWSERIFY) lib/reader.js -t $(BABELIFY) --outfile $(DIST)/QAreader.js
	$(UGLIFY) $(DIST)/QAreader.js --compress --output $(DIST)/QAreader.min.js

build-writer:
	$(BROWSERIFY) lib/writer.js -t $(BABELIFY) --outfile $(DIST)/QAwriter.js
	$(UGLIFY) $(DIST)/QAwriter.js --compress --output $(DIST)/QAwriter.min.js

build-node:
	$(BABEL) lib/ -o index.js

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

clean-build:
	rm -rf build

# PRINT #
.PHONY: print-%

print-%:
	@echo $*=$($*)
