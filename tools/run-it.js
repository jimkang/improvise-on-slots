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

if (process.argv.length > 2) {
  var method = process.argv[2];
}

var improvise = Improvise({ wordnikAPIKey: config.wordnik.apiKey });

var opts = {
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
