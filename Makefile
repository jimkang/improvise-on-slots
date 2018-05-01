test:
	node tests/improvise-tests.js

pushall:
	git push origin master && npm publish

prettier:
	prettier --single-quote --write "**/*.js"

build-category-file-offsets:
	node node_modules/.bin/get-file-line-offsets-in-json data/categories.txt > data/categories-line-offsets.json
	node node_modules/.bin/get-file-line-offsets-in-json data/parts-categories.txt > data/parts-categories-line-offsets.json

save-part-of-relationships:
	node tools/get-conceptnet-relationship.js PartOf > data/conceptnet/partof-relationships.json

save-has-a-relationships:
	node tools/get-conceptnet-relationship.js HasA > data/conceptnet/partof-relationships.json

save-used-for-relationships:
	node tools/get-conceptnet-relationship.js UsedFor > data/conceptnet/partof-relationships.json
save-capable-of-relationships:
	node tools/get-conceptnet-relationship.js CapableOf > data/conceptnet/partof-relationships.json
save-at-location-relationships:
	node tools/get-conceptnet-relationship.js AtLocation > data/conceptnet/partof-relationships.json
save-causes-relationships:
	node tools/get-conceptnet-relationship.js Causes > data/conceptnet/partof-relationships.json

# TODO: The rest.
