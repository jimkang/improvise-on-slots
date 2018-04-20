/* global __dirname */

var seedrandom = require('seedrandom');
var createProbable = require('probable').createProbable;
var MediaWiki = require('nodemw');
var sb = require('standard-bail')();
var lineChomper = require('line-chomper');
var jsonfile = require('jsonfile');
var waterfall = require('async-waterfall');
var callNextTick = require('call-next-tick');
var VError = require('verror');
var pluck = require('lodash.pluck');
var values = require('lodash.values');
var flatten = require('lodash.flatten');
var pick = require('lodash.pick');
var Wordnok = require('wordnok').createWordnok;
var canonicalizer = require('canonicalizer');
var range = require('d3-array').range;
var iscool = require('iscool')();

var lineOffsets = jsonfile.readFileSync(
  __dirname + '/data/categories-line-offsets.json'
);

const categoriesLineCount = 1698389;
var favoredRelatedWordTypes = ['synonym', 'variant', 'equivalent', 'related-word', 'etymologically-related-term', 'hypernym', 'hyponym', 'same-context'];

function Improvise({ seed, wordnikAPIKey }) {
  var probable;

  if (seed) {
    probable = createProbable({ random: seedrandom(seed) });
  } else {
    probable = createProbable();
  }

  var improvMethodKits = {
    'wikipedia-categories': {
      getASet: getASetOfWikipediaPages,
      fillSlots
    },
    'related-words': {
      getASet: getASetOfRelatedWords,
      fillSlots
    },
    'verbal-rating-of-keys': {
      getASet: GetASetOfRatings({ theme: 'rating', verbal: true }),
      fillSlots
    },
    'verbal-rating-of-topic': {
      getASet: GetASetOfRatings({ verbal: true }),
      fillSlots
    },
    'numeric-rating-of-topic': {
      getASet: GetASetOfRatings({ verbal: false }),
      fillSlots: fillSlotsInOrder
    },
    'ranking-of-keys': {
      getASet: GetASetOfRatings({ verbal: false, ranking: true }),
      fillSlots: fillSlotsInOrder
    }
  };

  var mediawiki = new MediaWiki({
    protocol: 'https',
    server: 'en.wikipedia.org',
    path: '/w',
    debug: false
  });

  var wordnok = Wordnok({ apiKey: wordnikAPIKey });

  return improvise;

  function improvise({ keys, method, relateValuesToKeys }, improviseDone) {
    var tries = 0;
    const maxTries = 10;
    var improvKit = improvMethodKits[method];
    var getASet = improvKit.getASet;
    getASet(keys, decideOnResult);

    function decideOnResult(error, result) {
      if (error) {
        if (tries < maxTries) {
          console.error(error);
          console.error(`Tried to get titles ${tries} times. Retrying.`);
          tries += 1;
          callNextTick(getASet, decideOnResult);
        } else {
          improviseDone(new VError(error, 'Reached max attempts.'));
        }
      } else {
        improviseDone(null, { theme: result.theme, slots: improvKit.fillSlots(keys, result.values) });
      }
    }
  }

  function getASetOfWikipediaPages(keys, getDone) {
    var category;

    waterfall(
      [
        pickRandomWikipediaCategory,
        saveCategory,
        mediawiki.getPagesInCategory.bind(mediawiki),
        passCategoryPages
      ],
      getDone
    );

    function saveCategory(theCategory, done) {
      if (theCategory.indexOf(' stubs') === theCategory.length - 6) {
        callNextTick(done, new Error('Stub category.'));
      } else {
        category = theCategory;
        callNextTick(done, null, category);
      }
    }

    function passCategoryPages(pages, done) {
      var filteredPages = pages.filter(pageIsOK);
      if (filteredPages.length < 2) {
        callNextTick(done, new Error(`Not enough suitable pages found in ${category}.`));
      } else {
        callNextTick(done, null, { theme: category, values: pluck(filteredPages, 'title') });
      }
    }
  }

  function pickRandomWikipediaCategory(done) {
    var fromLine = probable.roll(categoriesLineCount);

    lineChomper.chomp(
      __dirname + '/data/categories.txt',
      {
        lineOffsets,
        fromLine,
        lineCount: 1 
      },
      sb(passLine, done)
    );

    function passLine(lines) {
      if (!lines || !Array.isArray(lines) || lines.length < 1) {
        done(new Error('Could not get valid line for line number ' + fromLine
        ));
      }
      else {
        done(null, lines[0]);
      }
    }
  }

  function getASetOfRelatedWords(keys, getDone) { 
    var baseWord;

    waterfall(
      [
        wordnok.getTopic,
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
      var words = flatten(values(pick.apply(pick, [wordDict].concat(favoredRelatedWordTypes))));
      var filteredWords = words.filter(iscool);
      if (filteredWords.length < 2) {
        callNextTick(done, new Error(`Not enough suitable words found for ${baseWord}.`));
      } else {
        callNextTick(done, null, { theme: baseWord, values: filteredWords });
      }
    }
  }

  function GetASetOfRatings({ theme, verbal, ranking = false }) {
    return getASetOfRatings;

    function getASetOfRatings(keys, getDone) { 
      if (!theme) {
        wordnok.getTopic(sb(proceedWithTopic, getDone));
      } else {
        callNextTick(proceedWithTopic, theme);
      }

      function proceedWithTopic(topic) {
        var values;
        if (ranking) {
          values = probable.shuffle(range(1, keys.length + 1));
        } else if (verbal) {
          // TODO: Other verbal ratings.
          values = ['good', 'ok', 'shit'];
        } else {
          var floor = 1000000 - probable.roll(2000000);
          var span = probable.rollDie(2000000);
          values = range(keys.length).map(getNumericRating);
        }

        getDone(null, { theme: topic, values });

        function getNumericRating() {
          return floor + probable.rollDie(span);
        }
      }
    }
  }

  function fillSlots(keys, values) {
    var slots = {};
    keys.forEach(assignSlot);
    return slots;

    function assignSlot(key) {
      slots[key] = probable.pickFromArray(values);
    }
  }
  
  function fillSlotsInOrder(keys, values) {
    var slots = {};
    keys.forEach(assignSlot);
    return slots;

    function assignSlot(key, i) {
      slots[key] = values[i];
    }
  }
}

function pageIsOK(page) {
  return page && page.title && page.title.indexOf('Category:') === -1;
}

module.exports = Improvise;

