var test = require('tape');
var Improvise = require('../index');
var assertNoError = require('assert-no-error');

const seed = 'seed';

var testCases = [
  {
    opts: {
      keys: ['IL', 'MA', 'CA'],
      method: 'wikipedia-categories'
    },
    expected: {
      theme: 'Sports venues in Coimbra District',
      slots: {
        IL: 'Centro de Estágios da Académica',
        MA: 'Coimbra University Stadium',
        CA: 'Pavilhão Multidesportos Dr. Mário Mexia'
      }
    }
  },
  {
    opts: {
      keys: ['Bonus Cat', 'Dr. Wily', 'Smidgeo', 'SmallCat Labs'],
      method: 'related-words',
      relateValuesToKeys: false
    },
    expected: {
      theme: '',
      slots: {
        'Bonus Cat': '',
        'Dr. Wily': '',
        Smidgeo: '',
        'SmallCat Labs': ''
      }
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
    var improvise = Improvise({ seed });
    improvise(testCase.opts, checkResult);

    function checkResult(error, dict) {
      assertNoError(t.ok, error, 'No error while improvising.');
      t.deepEqual(dict, testCase.expected, 'Result is correct.');
      t.end();
    }
  }
}
