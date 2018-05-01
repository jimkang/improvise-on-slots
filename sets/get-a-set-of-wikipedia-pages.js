/* global __dirname */

var callNextTick = require('call-next-tick');
var waterfall = require('async-waterfall');
var MediaWiki = require('nodemw');
var pluck = require('lodash.pluck');
var lineChomper = require('line-chomper');
var sb = require('standard-bail')();

var prefixesOfTheUnusable = ['Category:', 'File:', 'Template:', 'User:'];

function GetASetOfWikipediaPages({
  categoryFile,
  lineOffsets,
  numberOfLinesInFile,
  minKeysToSlotsRatio = 0.3,
  probable
}) {
  var mediawiki = new MediaWiki({
    protocol: 'https',
    server: 'en.wikipedia.org',
    path: '/w',
    debug: false
  });

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
        filteredPages.length < Math.round(keys.length * minKeysToSlotsRatio) ||
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
      __dirname + '/../data/' + categoryFile,
      {
        lineOffsets,
        fromLine,
        lineCount: 1
      },
      sb(passLine, done)
    );

    function passLine(lines) {
      if (!lines || !Array.isArray(lines) || lines.length < 1) {
        done(new Error('Could not get valid line for line number ' + fromLine));
      } else {
        done(null, lines[0]);
      }
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

module.exports = GetASetOfWikipediaPages;
