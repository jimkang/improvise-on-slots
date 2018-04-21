improvise-on-slots
==================

Given slots, fill each in with pieces of text that relate to each other.

Installation
------------

npm install --save improvise-on-slots

Usage
-----

    var Improvise = require('improvise-on-slots');
    var improvise = Improvise({ wordnikAPIKey: config.wordnik.apiKey });

    var opts = {
      keyType: 'Wu-Tang Clan member',
      keys: ['RZA', 'GZA', 'Inspectah Deck', 'Masta Killa', 'U-God', 'Ol\' Dirty Bastard', 'Method Man', 'Raekwon', 'Ghostface Killah'],
      method: 'wikipedia-categories'
    };
    improvise(opts, logResult);

    function logResult(error, dict) {
      if (error) {
        console.log(error);
      } else {
        console.log(dict);
      }
    }

Output:

    { 
      theme: 'Journalism adapted into films',
      title: 'Favorite Journalism adapted into films by Wu-Tang Clan member',
      slots: {
        RZA: 'Phantom (2015 film)',
        GZA: 'Kavan (film)',
        'Inspectah Deck': 'Bangaram (film)',
        'Masta Killa': 'Mission Istaanbul',
        'U-God': 'News (film)',
        'Ol\' Dirty Bastard': 'Kanithan',
        'Method Man': 'Ism (film)',
        Raekwon: 'Ism (film)',
        'Ghostface Killah': 'Vangaveeti (film)'
      } 
    }

Possible `method` values:

    'wikipedia-categories',
    'related-words',
    'verbal-rating-of-keys',
    'verbal-rating-of-topic',
    'counts-of-topic',
    'ranking-of-keys'

License
-------

The MIT License (MIT)

Copyright (c) 2018 Jim Kang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
