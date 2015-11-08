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


describe('Parser unit tests', function() {
  let htmlfile = 'player-profiles-with-rested.html';
  let filename = path.join(__dirname, '..', 'html', htmlfile);
  let html = fs.readFileSync(filename).toString();
  let IDs = parsers.parseAllPlayerIDS(html);

  describe('#parseAllPlayerIDs', function() {
    it(
      'should parse IDs from html and assert that all of them are numbers',
      function() {
        IDs.forEach(ID => assert(util.isNumber(ID)));
      });
  });

  describe('#parsePlayer', function() {
    it(
      `should loosely assume that parsePlayer() returns somewhat correct
      results`,
      function() {
        let ID = IDs[0];
        let playerData = parsers.parsePlayer(html, ID);
        assert(playerData.name.length > 0);
        assert(playerData.number >= 1);
        assert(playerData.age >= 15);
      });
  });

});
