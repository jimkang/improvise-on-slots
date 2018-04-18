test:
	node tests/improvise-tests.js

pushall:
	git push origin master && npm publish

prettier:
	prettier --single-quote --write "**/*.js"

build-category-file-offsets:
	node node_modules/.bin/get-file-line-offsets-in-json data/categories.txt > data/categories-line-offsets.json

