GETOFFSETS = node_modules/.bin/get-file-line-offsets-in-json 

test:
	node tests/improvise-tests.js

pushall:
	git push origin master && npm publish

prettier:
	prettier --single-quote --write "**/*.js"

build-relmaps:
	node tools/make-relationship-maps.js data/conceptnet/conceptnet-assertions-5.6.0-subset.ndjson data/conceptnet

build-file-offsets:
	node $(GETOFFSETS) data/categories.txt > data/categories-line-offsets.json
	node $(GETOFFSETS) data/parts-categories.txt > data/parts-categories-line-offsets.json
	node $(GETOFFSETS) data/conceptnet/AtLocation-relmaps.ndjson > data/conceptnet/AtLocation-relmaps-offsets.json
	node $(GETOFFSETS) data/conceptnet/CapableOf-relmaps.ndjson > data/conceptnet/CapableOf-relmaps-offsets.json
	node $(GETOFFSETS) data/conceptnet/Causes-relmaps.ndjson > data/conceptnet/Causes-relmaps-offsets.json
	node $(GETOFFSETS) data/conceptnet/HasA-relmaps.ndjson > data/conceptnet/HasA-relmaps-offsets.json
	node $(GETOFFSETS) data/conceptnet/PartOf-relmaps.ndjson > data/conceptnet/PartOf-relmaps-offsets.json
	node $(GETOFFSETS) data/conceptnet/UsedFor-relmaps.ndjson > data/conceptnet/UsedFor-relmaps-offsets.json

#save-part-of-relationships:
#	node tools/get-conceptnet-relationship.js PartOf > data/conceptnet/PartOf-relationships.json
#

data/conceptnet/conceptnet-assertions-5.6.0-subset.ndjson:
	# Assertions file can be downloaded from here: https://github.com/commonsense/conceptnet5/wiki/Downloads
	node tools/filter-conceptnet-csv.js ~/Downloads/conceptnet-assertions-5.6.0.csv > data/conceptnet/conceptnet-assertions-5.6.0-subset.ndjson
