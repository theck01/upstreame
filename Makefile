# test task variables
MOCHA = node_modules/.bin/mocha
MOCHA_OPTS = -R dot
SPEC_DIR = spec
SPECS = $(shell find $(SPEC_DIR) -name '*.spec.js')

# css task variables
LESSC = node_modules/.bin/lessc
LESS_DIR = public/less
CSS_DIR = public/css
LESS_FILES = $(wildcard $(LESS_DIR)/*.less)
CSS_FILES = $(patsubst $(LESS_DIR)/%.less, $(CSS_DIR)/%.css, $(LESS_FILES))

# minify task variables
RJS = node_modules/.bin/r.js
BUILD_DIR = build
MINIFIED_DIR = public/scripts/dist
JS_FILES = $(shell find public/scripts -name "*.js" -not -path \
					 "public/scripts/dist/*")
BUILD_FILES = $(wildcard $(BUILD_DIR)/*.js)
MINIFIED_FILES = $(patsubst $(BUILD_DIR)/%.js, $(MINIFIED_DIR)/%.min.js, \
								 $(BUILD_FILES))

.PHONY: test test-debug dev dev-debug production

# build tasks

build: install less minify

clean:
	@rm -rf node_modules
	@rm -rf bower_components
	@rm -f $(CSS_FILES)
	@rm -f $(MINIFIED_FILES)

install:
	@npm install
	@bower install

less: install $(CSS_FILES)

$(CSS_DIR)/%.css: $(LESS_DIR)/%.less
	$(LESSC) $< > $@

minify: install $(MINIFIED_FILES)

$(MINIFIED_DIR)/%.min.js: $(BUILD_DIR)/%.js $(JS_FILES)
	@node $(RJS) -o $<

# server start tasks

dev: less
	@node app.js

dev-debug: less
	@node debug app.js

production: less minify
	@NODE_ENV=production node app.js

# test tasks

test: install
	@$(MOCHA) $(MOCHA_OPTS) $(SPECS)

test-debug: install
	@$(MOCHA) debug $(MOCHA_OPTS) $(SPECS)
