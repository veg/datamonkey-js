REPORTER = dot

tests:
  @NODE_ENV=tests ./node_modules/mocha/bin/mocha \
    --reporter $(REPORTER) \

tests-w:
  @NODE_ENV=tests ./node_modules/mocha/bin/mocha \
    --reporter $(REPORTER) \
    --growl \
    --watch

.PHONY: tests tests-w
