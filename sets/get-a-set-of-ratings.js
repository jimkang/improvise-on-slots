var sb = require('standard-bail')();
var getTopicWord = require('../get-topic-word');
var callNextTick = require('call-next-tick');
var range = require('d3-array').range;

var topicPlaceholderRegex = /\<topic\>/g;

var verbalRatings = [
  'good',
  'ok',
  'shit',
  'amaze',
  'woh',
  'whoa',
  'so good',
  'whatevs',
  'balls',
  "ballin'",
  'eh',
  'meh',
  'weak',
  "Fuckin' A",
  'garbage',
  'tasty',
  'gross',
  'what is a "<topic>"?',
  'wow',
  'no',
  'abstain',
  'I saw a <topic> once',
  '14/10',
  'subscribes to newsletter'
];

function GetASetOfRatings({
  theme,
  themePartOfSpeech = 'noun',
  verbal,
  ranking = false,
  probable,
  wordnikAPIKey
}) {
  var numberOfRatingsTable = probable.createTableFromSizes([
    [12, 3],
    [5, 2],
    [6, 4],
    [6, 5],
    [2, probable.rollDie(verbalRatings.length)]
  ]);

  return getASetOfRatings;

  function getASetOfRatings(keys, getDone) {
    if (!theme) {
      getTopicWord(
        wordnikAPIKey,
        themePartOfSpeech,
        sb(proceedWithTopic, getDone)
      );
    } else {
      callNextTick(proceedWithTopic, theme);
    }

    function proceedWithTopic(topic) {
      var values;
      if (ranking) {
        values = probable.shuffle(range(1, keys.length + 1));
      } else if (verbal) {
        let ratings = verbalRatings;
        if (topic === 'rating') {
          ratings = verbalRatings.filter(doesNotHaveATopicPlaceholder);
        }
        let numberOfRatings = numberOfRatingsTable.roll();
        values = probable
          .shuffle(ratings)
          .slice(0, numberOfRatings)
          .map(fillInTopic);
      } else {
        values = range(keys.length).map(getNumericRating);
      }

      getDone(null, { theme: topic, values });

      function getNumericRating() {
        return probable.rollDie(100);
      }

      function fillInTopic(rating) {
        return rating.replace(topicPlaceholderRegex, topic);
      }
    }
  }
}

function doesNotHaveATopicPlaceholder(s) {
  return s.indexOf('<topic>') === -1;
}

module.exports = GetASetOfRatings;
