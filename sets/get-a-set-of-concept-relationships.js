var callNextTick = require('call-next-tick');
var detailsForConcepts = require('./details-for-concepts');
var cache = require('conceptnet-relationship-cache');
var sb = require('standard-bail')();

function GetASetOfConceptRelationships({ probable, relationship }) {
  return getASetOfConceptRelationships;

  function getASetOfConceptRelationships(keys, getDone) {
    var disallowUseEmitters =
      detailsForConcepts[relationship].disallowUseEmitters;
    cache.getRandomMap(
      {
        relationship,
        disallowUseEmitters
      },
      sb(passSet, getDone)
    );

    function passSet(relmap, done) {
      let chanceOfUsingReceivers =
        relmap.receivingConcepts.length > 1
          ? relmap.receivingConcepts.length
          : 0;
      let chanceOfUsingEmitters =
        relmap.emittingConcepts.length > 1 ? relmap.emittingConcepts.length : 0;
      let useReceivers =
        disallowUseEmitters ||
        probable.rollDie(chanceOfUsingReceivers) >=
          probable.rollDie(chanceOfUsingEmitters);
      let theme = detailsForConcepts[relationship].formatTheme(
        relmap.concept,
        useReceivers
      );
      let values = useReceivers
        ? relmap.receivingConcepts
        : relmap.emittingConcepts;
      callNextTick(done, null, { theme, values });
    }
  }
}

module.exports = GetASetOfConceptRelationships;
