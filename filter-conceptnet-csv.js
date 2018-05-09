/* global __dirname, process */

var fs = require('fs');
var split = require('split');

if (process.argv.length < 4) {
  console.log(
    'Usage: node tools/sort-csv-by-concept.js <conceptnet-assertions-5.6.0.csv> <relationship type, e.g. /r/PartOf> > relmap.ndjson'
  );
  process.exit();
}

var relationshipsByConcept = {};
var relationshipsFile = process.argv[2];
var relationshipType = process.argv[3];

fs
  .createReadStream(relationshipsFile)
  .pipe(split())
  .on('data', storeRelationship)
  .on('end', printDictEntries);

function storeRelationship(line) {
  var [uri, relation, start, end, info] = line.split('\t');
  if (relation === relationshipType) {
    debugger;
    // addValueToRelationshipMap(start, end);
    // addValueToRelationshipMap(end, start);
  }
}

function addValueToRelationshipMap(start, end) {
  const srcProp = useEmittingToReceivingDirection ? 'start' : 'end';
  const targetProp = useEmittingToReceivingDirection ? 'end' : 'start';
  const sourcesProp = useEmittingToReceivingDirection
    ? 'emittingConcepts'
    : 'receivingConcepts';
  const targetsProp = useEmittingToReceivingDirection
    ? 'receivingConcepts'
    : 'emittingConcepts';

  const src = start;
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
