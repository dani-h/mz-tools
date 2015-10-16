'use strict';

let mocha = require('mocha');
let assert = require('assert');
let util = require('util');

let requests = require('../lib/requests');
let parsers = require('../lib/parsers.js');
let storage = require('../lib/storage.js');

let describe = mocha.describe;
let it = mocha.it;

describe('MZ connection test suite', function() {
  this.timeout(10000);
  it('Should login to MZ and check that the location and session headers are correct',
    function(done) {
      requests.getCookies()
        .then(r => {
          assert.strictEqual(r.res.headers['location'], '/?p=clubhouse');
        })
        .then(() => done())
        .catch(err => {
          done(err);
        });
    });
  it(
    'Should assert that the HTML that player data is parsed from returns somewhat correct results',
    function(done) {
      requests.getCookies()
        .then(r => requests.getAllPlayersHTML(r.cookies))
        .then(r => {
          let IDs = parsers.parseAllPlayerIDS(r.body);
          IDs.forEach(id => {
            let playerContainerHTML = parsers.parsePlayerContainer(r.body, id);
            let playerData = parsers.parsePlayerFromHTML(playerContainerHTML);
            assert(playerData.number > 0);
            assert(playerData.name.length > 0);
            //Juniors minimum age 15
            assert(playerData.age >= 15);
            let reportData = parsers.parseDailyTraining(id, playerContainerHTML);
            assert(reportData.currentLevel >= 0 && reportData.currentLevel <= 10);
            assert(reportData.progress >= 0 && reportData.progress <= 10);
            assert(storage.SKILLS.indexOf(reportData.skill) > -1);
            assert(util.isBoolean(reportData.ballGained));
            assert(util.isBoolean(reportData.rested));
            assert(util.isString(reportData.boost));
          });
        })
        .then(() => done())
        //This is weird. You have to keep the curly brace. Check it out
        .catch(err => {
          done(err);
        });
    });
});
