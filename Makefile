.PHONY: test test-debug start

# test task variables
MOCHA = node_modules/.bin/mocha
MOCHA_OPTS = -R spec
SPEC_DIR = spec
SPECS = $(shell find $(SPEC_DIR) -name '*.spec.js')

# css task variables
LESSC = node_modules/.bin/lessc
LESS_DIR = public/less
CSS_DIR = public/css
LESS_FILES = $(wildcard $(LESS_DIR)/*.less)
CSS_FILES = $(patsubst $(LESS_DIR)/%.less, $(CSS_DIR)/%.css, $(LESS_FILES))

# build tasks

build:
	@npm install
	@bower install

clean:
	@rm -rf node_modules
	@rm -rf bower_components
	@rm -f $(CSS_DIR)/*.css

# server start tasks

dev: less
	@node app.js

# test tasks

test:
	@$(MOCHA) $(MOCHA_OPTS) $(SPECS)

test-debug:
	@$(MOCHA) debug $(MOCHA_OPTS) $(SPECS)

# resource preparation tasks

less: $(CSS_FILES)

$(CSS_DIR)/%.css: $(LESS_DIR)/%.less
	$(LESSC) $< > $@
