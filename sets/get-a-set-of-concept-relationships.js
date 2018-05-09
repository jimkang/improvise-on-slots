/* global __dirname */

var callNextTick = require('call-next-tick');
var waterfall = require('async-waterfall');
var curry = require('lodash.curry');
var lineChomper = require('line-chomper');
var fs = require('fs');
var iscool = require('iscool')({
  customBlacklist: [
    'massacre',
    'massacres'
  ]
});
var detailsForConcepts = require('./details-for-concepts');
var splitToWords = require('split-to-words');

var topicFormattersForRelationships = {
  AtLocation(concept, useReceivers) {
    return useReceivers ? `locations of ${concept}` : `things at ${concept}`;
  },
  CapableOf(concept, useReceivers) {
    return useReceivers
      ? `capabilities of ${concept}`
      : `things that can ${concept}`;
  },
  Causes(concept, useReceivers) {
    return useReceivers ? `results of ${concept}` : `causes of ${concept}`;
  },
  HasA(concept, useReceivers) {
    return useReceivers ? `aspects of ${concept}` : `havers of ${concept}`;
  },
  PartOf(concept, useReceivers) {
    return useReceivers
      ? `things ${concept} is a part of`
      : `part of ${concept}`;
  },
  UsedFor(concept, useReceivers) {
    return useReceivers ? `uses of ${concept}` : `things used for ${concept}`;
  }
};

function GetASetOfConceptRelationships({ probable, relationship }) {
  return getASetOfConceptRelationships;

  function getASetOfConceptRelationships(keys, getDone) {
    waterfall([pickRandomRelationshipMap, passSet], getDone);

    function passSet(relmap, done) {
      var receivers = relmap.receivingConcepts.filter(eachWordIsCool);
      var emitters = relmap.emittingConcepts.filter(eachWordIsCool);
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
      } else {
        let chanceOfUsingReceivers =
          receivers.length > 1 ? receivers.length : 0;
        let chanceOfUsingEmitters = emitters.length > 1 ? emitters.length : 0;
        let useReceivers =
          probable.rollDie(chanceOfUsingReceivers) >=
          probable.rollDie(chanceOfUsingEmitters);
        let theme = topicFormattersForRelationships[relationship](
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
