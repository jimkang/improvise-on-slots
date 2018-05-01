/* global __dirname */

var seedrandom = require('seedrandom');
var createProbable = require('probable').createProbable;
var callNextTick = require('call-next-tick');
var VError = require('verror');
var canonicalizer = require('canonicalizer');
var jsonfile = require('jsonfile');
var GetASetOfWikipediaPages = require('./sets/get-a-set-of-wikipedia-pages');
var GetASetOfRelatedWords = require('./sets/get-a-set-of-related-words');
var GetASetOfRatings = require('./sets/get-a-set-of-ratings');
var GetASetOfConcepts = require('./sets/get-a-set-of-concepts');

var allCategoriesOffsets = jsonfile.readFileSync(
  __dirname + '/data/categories-line-offsets.json'
);
var partsLineOffsets = jsonfile.readFileSync(
  __dirname + '/data/parts-categories-line-offsets.json'
);

const allCategoriesLineCount = 1242340;
const partsCategoriesLineCount = 39;

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
        numberOfLinesInFile: allCategoriesLineCount,
        probable
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
        minKeysToSlotsRatio: 1 / 50,
        probable
      }),
      fillSlots,
      getTitleForSlots,
      valueType: 'enum'
    },
    'related-words': {
      getASet: GetASetOfRelatedWords({ wordnikAPIKey }),
      fillSlots,
      getTitleForSlots: getTitleForRelatedWords,
      valueType: 'enum'
    },
    'verbal-rating-of-keys': {
      getASet: GetASetOfRatings({
        theme: 'rating',
        verbal: true,
        probable,
        wordnikAPIKey
      }),
      fillSlots,
      getTitleForSlots: getTitleForKeyRatings,
      valueType: 'enum'
    },
    'verbal-rating-of-topic': {
      getASet: GetASetOfRatings({
        verbal: true,
        themePartOfSpeech: 'noun',
        probable,
        wordnikAPIKey
      }),
      fillSlots,
      getTitleForSlots: getTitleForRatings,
      valueType: 'enum'
    },
    // This one doesn't seem very good?
    'counts-of-topic': {
      getASet: GetASetOfRatings({
        verbal: false,
        themePartOfSpeech: 'noun',
        probable,
        wordnikAPIKey
      }),
      fillSlots: fillSlotsInOrder,
      getTitleForSlots: getTitleForCounts,
      valueType: 'quantity'
    },
    'ranking-of-keys': {
      getASet: GetASetOfRatings({
        verbal: false,
        ranking: true,
        themePartOfSpeech: 'adjective',
        probable,
        wordnikAPIKey
      }),
      fillSlots: fillSlotsInOrder,
      getTitleForSlots: getTitleForRankings,
      valueType: 'ranking'
    },
    'conceptnet-parts': {
      getASet: GetASetOfConcepts({ probable, relationshipPath: 'r/PartOf' }),
      fillSlots,
      getTitleForSlots,
      valueType: 'enum'
    }
  };

  var methodTable = probable.createTableFromSizes([
    [4, 'wikipedia-categories'],
    [1, 'wikipedia-parts-categories'],
    [4, 'related-words'],
    [2, 'verbal-rating-of-keys'],
    [7, 'verbal-rating-of-topic'],
    // [5, 'counts-of-topic'],
    [1, 'ranking-of-keys']
  ]);

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
    return `What word does each ${keyType} use for "${theme}"?`;
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
    return `Current ratings of the ${
      canonicalizer.getSingularAndPluralForms(keyType)[1]
    }`;
  }

  function getTitleForRankings(keyType, theme) {
    return `What are the most ${theme} ${
      canonicalizer.getSingularAndPluralForms(keyType)[1]
    }? Here they are ranked!`;
  }
}

module.exports = Improvise;
