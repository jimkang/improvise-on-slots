GETOFFSETS = node_modules/.bin/get-file-line-offsets-in-json 

test:
	node tests/improvise-tests.js

pushall:
	git push origin master && npm publish

prettier:
	prettier --single-quote --write "**/*.js"

build-file-offsets:
	node $(GETOFFSETS) data/categories.txt > data/categories-line-offsets.json
	node $(GETOFFSETS) data/parts-categories.txt > data/parts-categories-line-offsets.json
	node $(GETOFFSETS) data/conceptnet/atlocation-relmaps.ndjson > data/conceptnet/atlocation-relmaps-offsets.json
	node $(GETOFFSETS) data/conceptnet/capableof-relmaps.ndjson > data/conceptnet/capableof-relmaps-offsets.json
	node $(GETOFFSETS) data/conceptnet/causes-relmaps.ndjson > data/conceptnet/causes-relmaps-offsets.json
	node $(GETOFFSETS) data/conceptnet/hasa-relmaps.ndjson > data/conceptnet/hasa-relmaps-offsets.json
	node $(GETOFFSETS) data/conceptnet/partof-relmaps.ndjson > data/conceptnet/partof-relmaps-offsets.json
	node $(GETOFFSETS) data/conceptnet/usedfor-relmaps.ndjson > data/conceptnet/usedfor-relmaps-offsets.json

#save-part-of-relationships:
#	node tools/get-conceptnet-relationship.js PartOf > data/conceptnet/partof-relationships.json
