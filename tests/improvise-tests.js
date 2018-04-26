var test = require('tape');
var Improvise = require('../index');
var assertNoError = require('assert-no-error');
var values = require('lodash.values');
var config = require('../config');

const seed = 'test';

var testCases = [
  {
    opts: {
      keyType: 'state',
      keys: ['IL', 'MA', 'CA'],
      method: 'wikipedia-categories'
    },
    expected: {
      theme: 'Historic districts in Newberry County, South Carolina',
      title:
        'Favorite Historic districts in Newberry County, South Carolina by state',
      valueType: 'enum',
      slots: {
        IL: 'West Boundary Street Historic District',
        MA: 'Harrington Street Historic District',
        CA: 'Harrington Street Historic District'
      }
    }
  },
  {
    opts: {
      keyType: 'cat',
      keys: ['Bonus Cat', 'Dr. Wily', 'Smidgeo', 'SmallCat Labs'],
      method: 'related-words',
      relateValuesToKeys: false
    },
    expected: 'randomized'
  },
  {
    opts: {
      keyType: 'country',
      keys: ['Canada', 'Mexico', 'US'],
      method: 'verbal-rating-of-keys'
    },
    expected: {
      theme: 'rating',
      title: 'Current ratings of the countries',
      valueType: 'enum',
      slots: {
        Canada: 'subscribes to newsletter',
        Mexico: 'subscribes to newsletter',
        US: 'tasty'
      }
    }
  },

  {
    opts: {
      keyType: 'country',
      keys: ['Canada', 'Mexico', 'US'],
      method: 'verbal-rating-of-topic'
    },
    expected: 'randomized'
  },
  {
    opts: {
      keyType: 'country',
      keys: ['Canada', 'Mexico', 'US'],
      method: 'counts-of-topic'
    },
    expected: 'randomized'
  },
  {
    opts: {
      keyType: 'country',
      keys: ['Canada', 'Mexico', 'US'],
      method: 'ranking-of-keys'
    },
    expected: 'randomized'
  },
  {
    opts: {
      keyType: 'country',
      keys: ['Canada', 'Mexico', 'US'],
      method: 'counts-of-topic'
    },
    expected: 'randomized'
  },
  {
    opts: {
      keyType: 'Wu-Tang Clan member',
      keys: [
        'RZA',
        'GZA',
        'Inspectah Deck',
        'Masta Killa',
        'U-God',
        "Ol' Dirty Bastard",
        'Method Man',
        'Raekwon',
        'Ghostface Killah'
      ],
      method: 'related-words'
    },
    expected: 'randomized'
  }
];

testCases.forEach(runTest);

function runTest(testCase) {
  test(
    `${testCase.opts.method}, relate: ${testCase.opts.relateValuesToKeys}`,
    improviseTest
  );

  function improviseTest(t) {
    var improvise = Improvise({ seed, wordnikAPIKey: config.wordnik.apiKey });
    improvise(testCase.opts, checkResult);

    function checkResult(error, dict) {
      assertNoError(t.ok, error, 'No error while improvising.');
      console.log('Result:', dict);
      t.ok(dict.theme, 'Result has theme.');
      t.ok(dict.slots, 'Result has slots.');
      t.equal(
        Object.keys(dict.slots).length,
        testCase.opts.keys.length,
        'Result has correct number of keys.'
      );
      values(dict.slots).forEach(checkValue);

      if (testCase.expected !== 'randomized') {
        t.deepEqual(dict, testCase.expected, 'Result is correct.');
      }
      t.end();
    }

    function checkValue(value) {
      t.ok(value, 'Slot value is not empty.');
    }
  }
}
