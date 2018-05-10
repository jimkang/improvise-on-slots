/* global __dirname */

var callNextTick = require('call-next-tick');
var waterfall = require('async-waterfall');
var curry = require('lodash.curry');
var lineChomper = require('line-chomper');
var fs = require('fs');
var iscool = require('iscool')({
  customBlacklist: ['massacre', 'massacres']
});
var detailsForConcepts = require('./details-for-concepts');
var splitToWords = require('split-to-words');

function GetASetOfConceptRelationships({ probable, relationship }) {
  return getASetOfConceptRelationships;

  function getASetOfConceptRelationships(keys, getDone) {
    waterfall([pickRandomRelationshipMap, passSet], getDone);

    function passSet(relmap, done) {
      var receivers = relmap.receivingConcepts.filter(eachWordIsCool);
      var emitters = relmap.emittingConcepts.filter(eachWordIsCool);
      var disallowUseEmitters =
        detailsForConcepts[relationship].disallowUseEmitters;
      if (receivers.length < 2 && emitters.length < 2) {
        // TODO: These should be filtered out in the data files ahead of time.
        callNextTick(
          done,
          new Error(
            `Not enough suitable concepts with relationships to ${
              relmap.concept
            }.`
          )
        );
      } else if (disallowUseEmitters && receivers.length < 1) {
        callNextTick(
          done,
          new Error(
            `No receivers for relationship ${relationship} and concept ${
              relmap.concept
            }.`
          )
        );
      } else {
        let chanceOfUsingReceivers =
          receivers.length > 1 ? receivers.length : 0;
        let chanceOfUsingEmitters = emitters.length > 1 ? emitters.length : 0;
        let useReceivers =
          disallowUseEmitters ||
          probable.rollDie(chanceOfUsingReceivers) >=
            probable.rollDie(chanceOfUsingEmitters);
        let theme = detailsForConcepts[relationship].formatTheme(
          relmap.concept,
          useReceivers
        );
        let values = useReceivers ? receivers : emitters;
        callNextTick(done, null, { theme, values });
      }
    }
  }

  function pickRandomRelationshipMap(pickDone) {
    var fromLine = probable.roll(detailsForConcepts[relationship].lineCount);

    waterfall(
      [
        curry(fs.readFile)(
          `${__dirname}/../data/conceptnet/${
            relationship
          }-relmaps-offsets.json`,
          'utf8'
        ),
        chomp,
        passMap
      ],
      pickDone
    );

    function chomp(lineOffsetsText, done) {
      lineChomper.chomp(
        `${__dirname}/../data/conceptnet/${relationship}-relmaps.ndjson`,
        {
          lineOffsets: JSON.parse(lineOffsetsText),
          fromLine,
          lineCount: 1
        },
        done
      );
    }

    function passMap(lines, done) {
      if (!lines || !Array.isArray(lines) || lines.length < 1) {
        done(new Error('Could not get valid line for line number ' + fromLine));
      } else {
        done(null, JSON.parse(lines[0]));
      }
    }
  }
}

function eachWordIsCool(phrase) {
  return splitToWords(phrase).every(iscool);
}

module.exports = GetASetOfConceptRelationships;
