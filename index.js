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

var lineOffsets = jsonfile.readFileSync(
  __dirname + '/data/categories-line-offsets.json'
);

const categoriesLineCount = 1698389;

function Improvise({ seed }) {
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

  return improvise;

  function improvise({ keys, method, relateValuesToKeys }, improviseDone) {
    if (method === 'wikipedia-categories') {
      improviseWiki({ keys, relateValuesToKeys }, improviseDone);
    } else {
    }
  }

  function improviseWiki({ keys, relateValuesToKeys }, improviseDone) {
    var tries = 0;
    const maxTries = 10;
    getASetOfWikipediaPages(decideOnResult);

    function decideOnResult(error, result) {
      if (error) {
        if (tries < maxTries) {
          console.error(error);
          console.error(`Tried to get titles ${tries} times. Retrying.`);
          tries += 1;
          callNextTick(getASetOfWikipediaPages, decideOnResult);
        } else {
          improviseDone(new VError(error, 'Reached max attempts.'));
        }
      } else {
        assignTitlesToKeys(result);
      }
    }

    function assignTitlesToKeys(result) {
      var titles = pluck(result.pages, 'title');
      var slots = {};
      keys.forEach(assignSlot);
      improviseDone(null, { theme: result.category, slots });

      function assignSlot(key) {
        slots[key] = probable.pickFromArray(titles);
      }
    }
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
        console.log('category:', category);
        callNextTick(done, null, category);
      }
    }

    function passCategoryPages(pages, done) {
      console.log('pages', pages);
      var filteredPages = pages.filter(pageIsOK);
      if (filteredPages.length < 2) {
        callNextTick(done, new Error(`Not enough suitable pages found in ${category}.`));
      } else {
        callNextTick(done, null, { category, pages: filteredPages });
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
}

function pageIsOK(page) {
  return page && page.title && page.title.indexOf('Category:') === -1;
}

module.exports = Improvise;

