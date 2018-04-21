/* global process */

var Improvise = require('../index');
var config = require('../config');

var states = [
  'AK',
  'AL',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY'
];

var methods = [
  'wikipedia-categories',
  'related-words',
  'verbal-rating-of-keys',
  'verbal-rating-of-topic',
  'counts-of-topic',
  'ranking-of-keys'
];

if (process.argv.length > 2) {
  var method = process.argv[2];
  if (!isNaN(method)) {
    method = methods[method];
  }
} else {
  console.log('Usage: node tools/run-it.js <method number, 0-5>');
  process.exit();
}

var improvise = Improvise({ wordnikAPIKey: config.wordnik.apiKey });

var opts = {
  keyType: 'state',
  keys: states,
  method: method || 'wikipedia-categories'
};
improvise(opts, logResult);

function logResult(error, dict) {
  if (error) {
    console.log(error);
  } else {
    console.log(dict);
  }
}
