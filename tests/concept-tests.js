var test = require('tape');
var Improvise = require('../index');
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
    expected: 'randomized'
  },
  {
    opts: {
      keyType: 'state',
      keys: ['IL', 'MA', 'CA'],
      method: 'conceptnet-HasLastSubevent'
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
      if (error) {
        console.log('Error', error);
        // Errors are OK; sometimes slots just cannot be filled.
        t.end();
        return;
      }
      console.log('Result:', dict);
      t.ok(dict.theme, 'Result has theme.');
      t.ok(dict.slots, 'Result has slots.');
      t.ok(dict.valueType, 'Result valueType.');
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
