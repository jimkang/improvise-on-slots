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
var curry = require('lodash.curry');
var Wordnok = require('wordnok').createWordnok;
var canonicalizer = require('canonicalizer');
var range = require('d3-array').range;
var iscool = require('iscool')();
var request = require('request');

var allCategoriesOffsets = jsonfile.readFileSync(
  __dirname + '/data/categories-line-offsets.json'
);
var partsLineOffsets = jsonfile.readFileSync(
  __dirname + '/data/parts-categories-line-offsets.json'
);

var prefixesOfTheUnusable = ['Category:', 'File:', 'Template:', 'User:'];

const allCategoriesLineCount = 1242340;
const partsCategoriesLineCount = 39;

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

function Improvise({ seed, wordnikAPIKey }) {
  var probable;

  if (seed) {
    probable = createProbable({ random: seedrandom(seed) });
  } else {
    probable = createProbable();
  }

  var improvMethodKits = {
    'wikipedia-categories': {
      getASet: GetASetOfWikipediaPages({
        categoryFile: 'categories.txt',
        lineOffsets: allCategoriesOffsets,
        numberOfLinesInFile: allCategoriesLineCount
      }),
      fillSlots,
      getTitleForSlots,
      valueType: 'enum'
    },
    'wikipedia-parts-categories': {
      getASet: GetASetOfWikipediaPages({
        categoryFile: 'parts-categories.txt',
        lineOffsets: partsLineOffsets,
        numberOfLinesInFile: partsCategoriesLineCount,
        minKeysToSlotsRatio: 1 / 50
      }),
      fillSlots,
      getTitleForSlots,
      valueType: 'enum'
    },
    'related-words': {
      getASet: getASetOfRelatedWords,
      fillSlots,
      getTitleForSlots: getTitleForRelatedWords,
      valueType: 'enum'
    },
    'verbal-rating-of-keys': {
      getASet: GetASetOfRatings({ theme: 'rating', verbal: true }),
      fillSlots,
      getTitleForSlots: getTitleForKeyRatings,
      valueType: 'enum'
    },
    'verbal-rating-of-topic': {
      getASet: GetASetOfRatings({ verbal: true, themePartOfSpeech: 'noun' }),
      fillSlots,
      getTitleForSlots: getTitleForRatings,
      valueType: 'enum'
    },
    // This one doesn't seem very good?
    'counts-of-topic': {
      getASet: GetASetOfRatings({ verbal: false, themePartOfSpeech: 'noun' }),
      fillSlots: fillSlotsInOrder,
      getTitleForSlots: getTitleForCounts,
      valueType: 'quantity'
    },
    'ranking-of-keys': {
      getASet: GetASetOfRatings({
        verbal: false,
        ranking: true,
        themePartOfSpeech: 'adjective'
      }),
      fillSlots: fillSlotsInOrder,
      getTitleForSlots: getTitleForRankings,
      valueType: 'ranking'
    }
  };

  var methodTable = probable.createTableFromSizes([
    [3, 'wikipedia-categories'],
    [2, 'wikipedia-parts-categories'],
    [5, 'related-words'],
    [3, 'verbal-rating-of-keys'],
    [4, 'verbal-rating-of-topic'],
    // [5, 'counts-of-topic'],
    [3, 'ranking-of-keys']
  ]);

  var mediawiki = new MediaWiki({
    protocol: 'https',
    server: 'en.wikipedia.org',
    path: '/w',
    debug: false
  });

  var wordnok = Wordnok({ apiKey: wordnikAPIKey });

  return improvise;

  function improvise(
    { keys, keyType, method, relateValuesToKeys },
    improviseDone
  ) {
    var tries = 0;
    const maxTries = 20;
    if (!method) {
      method = methodTable.roll();
    }
    var improvKit = improvMethodKits[method];
    var getASet = improvKit.getASet;
    getASet(keys, decideOnResult);

    function decideOnResult(error, result) {
      tries += 1;
      if (error) {
        console.error(error);

        if (tries <= maxTries) {
          console.error(`Tried to get titles ${tries} times. Retrying.`);
          callNextTick(getASet, keys, decideOnResult);
        } else {
          improviseDone(new VError(error, 'Reached max attempts.'));
        }
      } else {
        let slots = improvKit.fillSlots(keys, result.values);
        improviseDone(null, {
          theme: result.theme,
          title: improvKit.getTitleForSlots(keyType, result.theme),
          valueType: improvKit.valueType,
          slots
        });
      }
    }
  }

  function GetASetOfWikipediaPages({
    categoryFile,
    lineOffsets,
    numberOfLinesInFile,
    minKeysToSlotsRatio = 0.3
  }) {
    return getASetOfWikipediaPages;

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
        if (
          filteredPages.length <
            Math.round(keys.length * minKeysToSlotsRatio) ||
          filteredPages.length < 2
        ) {
          callNextTick(
            done,
            new Error(`Not enough suitable pages found in ${category}.`)
          );
        } else {
          callNextTick(done, null, {
            theme: category,
            values: pluck(filteredPages, 'title')
          });
        }
      }
    }

    function pickRandomWikipediaCategory(done) {
      var fromLine = probable.roll(numberOfLinesInFile);

      lineChomper.chomp(
        __dirname + '/data/' + categoryFile,
        {
          lineOffsets,
          fromLine,
          lineCount: 1
        },
        sb(passLine, done)
      );

      function passLine(lines) {
        if (!lines || !Array.isArray(lines) || lines.length < 1) {
          done(
            new Error('Could not get valid line for line number ' + fromLine)
          );
        } else {
          done(null, lines[0]);
        }
      }
    }
  }

  function getASetOfRelatedWords(keys, getDone) {
    var baseWord;

    waterfall(
      [curry(getTopicWord)('noun'), saveBase, getRelatedWords, passWords],
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

  function GetASetOfRatings({
    theme,
    themePartOfSpeech = 'noun',
    verbal,
    ranking = false
  }) {
    return getASetOfRatings;

    function getASetOfRatings(keys, getDone) {
      if (!theme) {
        getTopicWord(themePartOfSpeech, sb(proceedWithTopic, getDone));
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
          values = range(keys.length).map(getNumericRating);
        }

        getDone(null, { theme: topic, values });

        function getNumericRating() {
          return probable.rollDie(100);
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

  function getTitleForSlots(keyType, theme) {
    // TODO: Probable table. Adjectives, "what are" "which ___ do ___ love the most?"
    return `Favorite ${theme} by ${keyType}`;
  }

  function getTitleForRelatedWords(keyType, theme) {
    return `What word does each ${keyType} prefer to use to refer to "${
      theme
    }"?`;
  }

  function getTitleForCounts(keyType, theme) {
    return `${canonicalizer.getSingularAndPluralForms(theme)[1]} in each ${
      keyType
    }`;
  }

  function getTitleForRatings(keyType, theme) {
    return `What do the ${
      canonicalizer.getSingularAndPluralForms(keyType)[1]
    } think of ${canonicalizer.getSingularAndPluralForms(theme)[1]}?`;
  }

  function getTitleForKeyRatings(keyType) {
    return `The ${canonicalizer.getSingularAndPluralForms(keyType)[1]}`;
  }

  function getTitleForRankings(keyType, theme) {
    return `What are the most ${theme} ${
      canonicalizer.getSingularAndPluralForms(keyType)[1]
    }? Here they are ranked!`;
  }

  function getTopicWord(partOfSpeech, done) {
    var reqOpts = {
      method: 'GET',
      url:
        'http://api.wordnik.com:80/v4/words.json/randomWords?' +
        'hasDictionaryDef=false&' +
        `includePartOfSpeech=${partOfSpeech}&` +
        'excludePartOfSpeech=proper-noun&' +
        'minCorpusCount=1000&maxCorpusCount=-1&' +
        'minDictionaryCount=1&maxDictionaryCount=-1&' +
        'minLength=3&maxLength=-1&' +
        'api_key=' +
        wordnikAPIKey,
      json: true
    };
    request(reqOpts, sb(pickWord, done));

    function pickWord(res, wordObjects) {
      var okWords = pluck(wordObjects, 'word').filter(iscool);
      done(null, probable.pickFromArray(okWords));
    }
  }
}

function pageIsOK(page) {
  if (page && page.title) {
    return !prefixesOfTheUnusable.some(isInTitle);
  }
  return false;

  function isInTitle(prefix) {
    return page.title.indexOf(prefix) === 0;
  }
}

module.exports = Improvise;
