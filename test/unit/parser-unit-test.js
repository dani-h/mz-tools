'use strict';

//node_modules
let mocha = require('mocha');
let assert = require('assert');
let fs = require('fs');
let util = require('util');
let path = require('path');

//local imports
let parsers = require('../../lib/parsers');

//declaring global variables
let describe = mocha.describe;
let it = mocha.it;


let htmlfile = 'player-profiles-with-rested.html';
let filename = path.join(__dirname, '..', 'html', htmlfile);
let html = fs.readFileSync(filename).toString();
let IDs = parsers.parseAllPlayerIDS(html);


describe('Parser unit tests', function() {
  let htmlfile = 'player-profiles-with-rested.html';
  let filename = path.join(__dirname, '..', 'html', htmlfile);
  let html = fs.readFileSync(filename).toString();
  let IDs = parsers.parseAllPlayerIDS(html);

  describe('#parseAllPlayerIDs', function() {
    it('should parse IDs from html and assert that all of them are numbers',
      function() {
        IDs.forEach(ID => assert(util.isNumber(ID)));
      });

    it('should compare the numbers with the stored test results', function () {
        var filename = 'player-profiles-with-rested-IDs.json';
        var file = path.join(__dirname, '..', 'json', filename);

        var contents = fs.readFileSync(file)
        var expected = JSON.parse(contents).sort()
        var actual   = IDs.slice().sort();

        assert.deepEqual(expected, actual);
    });
  });

  describe('#parsePlayer', function() {
    it(
      'compares #parsePlayer results to the exact stored test results',
      function() {
        var filename = 'player-profiles-with-rested.json';
        var file = path.join(__dirname, '..', 'json', filename);
        var sortByNumber = (a, b) => { return a.number - b.number };

        var expected = JSON.parse(fs.readFileSync(file))
        var expectedSorted = expected.sort(sortByNumber)

        var actualResults = IDs.map(ID => parsers.parsePlayer(html, ID));
        var actualResultsSorted =  actualResults.sort(sortByNumber);

        assert.deepEqual(expectedSorted, actualResultsSorted);
      });
  });
});
