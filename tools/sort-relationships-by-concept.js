/* global __dirname, process */

var fs = require('fs');
var ndjson = require('ndjson');

if (process.argv.length < 3) {
  console.log(
    'Usage: node tools/sort-relationships-by-concept.js <relationships.ndjson> > relationships-by-concept.ndjson'
  );
  process.exit();
}

var relationshipsByConcept = {};
var relationshipsFile = process.argv[2];

fs
  .createReadStream(relationshipsFile)
  // .pipe(process.stdout)
  .pipe(ndjson.parse())
  .on('data', storeRelationship)
  .on('end', printDictEntries);

function storeRelationship(entry) {
  addValueToRelationshipMap(true, entry);
  addValueToRelationshipMap(false, entry);
  debugger;
}

function addValueToRelationshipMap(useEmittingToReceivingDirection, entry) {
  const srcProp = useEmittingToReceivingDirection ? 'start' : 'end';
  const targetProp = useEmittingToReceivingDirection ? 'end' : 'start';
  const sourcesProp = useEmittingToReceivingDirection
    ? 'emittingConcepts'
    : 'receivingConcepts';
  const targetsProp = useEmittingToReceivingDirection
    ? 'receivingConcepts'
    : 'emittingConcepts';

  const src = entry[srcProp].label;
  const target = entry[targetProp].label;

  var value = relationshipsByConcept[src];
  if (!value) {
    value = {
      concept: src,
      rel: entry.rel.label
    };
    value[targetsProp] = [];
    value[sourcesProp] = [];
    relationshipsByConcept[src] = value;
  }
  if (value[targetsProp].indexOf(target) === -1) {
    value[targetsProp].push(target);
  }
}

function printDictEntries() {
  for (var concept in relationshipsByConcept) {
    let entry = relationshipsByConcept[concept];
    if (
      entry.receivingConcepts.length > 1 ||
      entry.emittingConcepts.length > 1
    ) {
      console.log(JSON.stringify(entry));
    }
  }
}
