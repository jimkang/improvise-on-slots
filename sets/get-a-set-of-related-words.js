var values = require('lodash.values');
var flatten = require('lodash.flatten');
var pick = require('lodash.pick');
var curry = require('lodash.curry');
var Wordnok = require('wordnok').createWordnok;
var waterfall = require('async-waterfall');
var callNextTick = require('call-next-tick');
var getTopicWord = require('../get-topic-word');
var canonicalizer = require('canonicalizer');
var iscool = require('iscool')();

var favoredRelatedWordTypes = [
  'synonym',
  'variant',
  'equivalent',
  'related-word',
  'etymologically-related-term',
  'hypernym',
  'hyponym',
  'same-context'
];

function GetASetOfRelatedWords({ wordnikAPIKey }) {
  var wordnok = Wordnok({ apiKey: wordnikAPIKey });
  return getASetOfRelatedWords;

  function getASetOfRelatedWords(keys, getDone) {
    var baseWord;

    waterfall(
      [
        curry(getTopicWord)(wordnikAPIKey, 'noun'),
        saveBase,
        getRelatedWords,
        passWords
      ],
      getDone
    );

    function saveBase(word, done) {
      baseWord = canonicalizer.getSingularAndPluralForms(word)[0];
      callNextTick(done);
    }

    function getRelatedWords(done) {
      wordnok.getRelatedWords({ word: baseWord }, done);
    }

    function passWords(wordDict, done) {
      var words = flatten(
        values(pick.apply(pick, [wordDict].concat(favoredRelatedWordTypes)))
      );
      var filteredWords = words.filter(iscool);
      if (filteredWords.length < 2) {
        callNextTick(
          done,
          new Error(`Not enough suitable words found for ${baseWord}.`)
        );
      } else {
        callNextTick(done, null, { theme: baseWord, values: filteredWords });
      }
    }
  }
}

module.exports = GetASetOfRelatedWords;
