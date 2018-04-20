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

  var mediawiki = new MediaWiki({
    protocol: 'https',
    server: 'en.wikipedia.org',
    path: '/w',
    debug: false
  });

  var wordnok = Wordnok({ apiKey: wordnikAPIKey });

  return improvise;

  function improvise({ keys, method, relateValuesToKeys }, improviseDone) {
    if (method === 'wikipedia-categories') {
      improviseWiki({ keys, relateValuesToKeys }, improviseDone);
    } else {
      improviseRelatedWords({ keys, relateValuesToKeys }, improviseDone);
    }
  }

  function improviseWithSetGetter({ keys, relateValuesToKeys, getASet }, improviseDone) {
    var tries = 0;
    const maxTries = 10;
    getASet(decideOnResult);

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
        improviseDone(null, { theme: result.theme, slots: fillSlots(keys, result.values) });
      }
    }
  }

  function improviseWiki({ keys, relateValuesToKeys }, improviseDone) {
    improviseWithSetGetter({ keys, relateValuesToKeys, getASet: getASetOfWikipediaPages }, improviseDone);
  }

  function improviseRelatedWords({ keys, relateValuesToKeys }, improviseDone) {
    improviseWithSetGetter({ keys, relateValuesToKeys, getASet: getASetOfRelatedWords }, improviseDone);
  }

  function getASetOfWikipediaPages(getDone) {
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

  function getASetOfRelatedWords(getDone) { 
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

  function fillSlots(keys, values) {
    var slots = {};
    keys.forEach(assignSlot);
    return slots;

    function assignSlot(key) {
      slots[key] = probable.pickFromArray(values);
    }
  }
}

function pageIsOK(page) {
  return page && page.title && page.title.indexOf('Category:') === -1;
}

module.exports = Improvise;

