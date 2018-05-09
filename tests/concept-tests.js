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
      method: 'conceptnet-PartOf'
    },
    expected: {
      theme: 'part of Sao Tome and Principe',
      title: 'Favorite part of Sao Tome and Principe by state',
      valueType: 'enum',
      slots: { IL: 'Principe', MA: 'Principe', CA: 'Sao Tome' }
    }
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
