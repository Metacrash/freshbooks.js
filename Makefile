test:
	@./node_modules/.bin/mocha -t 10000 -R list $(FILE)

test-docs:
	make test REPORTER=doc \
		| cat docs/head.html - docs/tail.html \
		> docs/test.html

.PHONY: test test-docs install
