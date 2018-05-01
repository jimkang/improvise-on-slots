var request = require('request');
var sb = require('standard-bail')();
var pluck = require('lodash.pluck');
var iscool = require('iscool')();
// No need to use probable with a specific seed random here since the randomWords API is also out of our control.
var probable = require('probable');

function getTopicWord(wordnikAPIKey, partOfSpeech, done) {
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

module.exports = getTopicWord;
