'use strict';

//node_modules
let mocha = require('mocha');
let assert = require('assert');
let fs = require('fs');
let path = require('path');
let sinon = require('sinon');
let bluebird = require('bluebird');

//local imports
let storage = require('../../lib/storage');
let scrapers = require('../../lib/scrapers');
let requests = require('../../lib/requests');

let describe = mocha.describe;
let it = mocha.it;

let expected = [{
  id: 196598919,
  number: 27,
  name: 'Alex Markusson',
  age: 16,
  team_id: null,
  skill: 'Stamina',
  date: '1444860000000.0',
  progress: 8,
  rested: 0,
  boost: 'camp',
  current_level: 2
}, {
  id: 196598925,
  number: 33,
  name: 'Sven L&#xF6;nn',
  age: 16,
  team_id: null,
  skill: 'Ball Control',
  date: '1444860000000.0',
  progress: 6,
  rested: 0,
  boost: 'coach',
  current_level: 1
}, {
  id: 196598918,
  number: 26,
  name: 'Per-Oskar Enstr&#xF6;m',
  age: 16,
  team_id: null,
  skill: 'Ball Control',
  date: '1444860000000.0',
  progress: 6,
  rested: 0,
  boost: 'coach',
  current_level: 1
}, {
  id: 196593544,
  number: 30,
  name: 'Rutger Frisck',
  age: 16,
  team_id: null,
  skill: 'Stamina',
  date: '1444860000000.0',
  progress: 8,
  rested: 0,
  boost: 'camp',
  current_level: 2
}, {
  id: 196598914,
  number: 22,
  name: 'Leonardo Bergman',
  age: 16,
  team_id: null,
  skill: 'Passing',
  date: '1444860000000.0',
  progress: 9,
  rested: 0,
  boost: 'camp',
  current_level: 3
}, {
  id: 196598921,
  number: 29,
  name: 'Tommy Brenner',
  age: 16,
  team_id: null,
  skill: 'Passing',
  date: '1444860000000.0',
  progress: 9,
  rested: 0,
  boost: 'camp',
  current_level: 1
}, {
  id: 196598923,
  number: 31,
  name: 'Folke Vik',
  age: 16,
  team_id: null,
  skill: 'Stamina',
  date: '1444860000000.0',
  progress: 6,
  rested: 0,
  boost: 'coach',
  current_level: 2
}, {
  id: 196598913,
  number: 21,
  name: 'Emanuel Fredriksson',
  age: 16,
  team_id: null,
  skill: 'Speed',
  date: '1444860000000.0',
  progress: 9,
  rested: 0,
  boost: 'camp',
  current_level: 1
}, {
  id: 196598915,
  number: 23,
  name: 'Dan Valstr&#xF6;m',
  age: 16,
  team_id: null,
  skill: 'Speed',
  date: '1444860000000.0',
  progress: 6,
  rested: 0,
  boost: 'coach',
  current_level: 2
}, {
  id: 196598924,
  number: 32,
  name: 'Frans Lustig',
  age: 16,
  team_id: null,
  skill: 'Stamina',
  date: '1444860000000.0',
  progress: 8,
  rested: 0,
  boost: 'camp',
  current_level: 2
}, {
  id: 196598926,
  number: 34,
  name: 'Felix Browald',
  age: 16,
  team_id: null,
  skill: 'Speed',
  date: '1444860000000.0',
  progress: 6,
  rested: 0,
  boost: 'coach',
  current_level: 2
}, {
  id: 196598917,
  number: 25,
  name: 'Casper S&#xF6;derstr&#xF6;m',
  age: 16,
  team_id: null,
  skill: 'Speed',
  date: '1444860000000.0',
  progress: 7,
  rested: 0,
  boost: 'coach',
  current_level: 0
}, {
  id: 196598930,
  number: 38,
  name: 'S&#xF6;ren Lustig',
  age: 16,
  team_id: null,
  skill: 'Stamina',
  date: '1444860000000.0',
  progress: 6,
  rested: 0,
  boost: 'coach',
  current_level: 1
}, {
  id: 196598934,
  number: 42,
  name: 'Ingvar Eriksson',
  age: 16,
  team_id: null,
  skill: 'Keeping',
  date: '1444860000000.0',
  progress: 5,
  rested: 0,
  boost: 'coach',
  current_level: 2
}, {
  id: 196598935,
  number: 43,
  name: 'Dag Bi&#xF6;rkquist',
  age: 16,
  team_id: null,
  skill: 'Ball Control',
  date: '1444860000000.0',
  progress: 6,
  rested: 0,
  boost: 'coach',
  current_level: 3
}, {
  id: 196598932,
  number: 40,
  name: 'Rune Bergqvist',
  age: 16,
  team_id: null,
  skill: 'Ball Control',
  date: '1444860000000.0',
  progress: 6,
  rested: 0,
  boost: 'coach',
  current_level: 1
}, {
  id: 186536327,
  number: 45,
  name: 'Matthias Tingberg',
  age: 20,
  team_id: null,
  skill: 'Play Intelligence',
  date: '1444860000000.0',
  progress: 4,
  rested: 0,
  boost: 'coach',
  current_level: 3
}, {
  id: 190338170,
  number: 46,
  name: 'Adrian Bj&#xF6;rkman',
  age: 20,
  team_id: null,
  skill: 'Stamina',
  date: '1444860000000.0',
  progress: 5,
  rested: 0,
  boost: '',
  current_level: 6
}, {
  id: 196598927,
  number: 35,
  name: 'Knut Bergsten',
  age: 16,
  team_id: null,
  skill: 'Stamina',
  date: '1444860000000.0',
  progress: 6,
  rested: 0,
  boost: 'coach',
  current_level: 1
}, {
  id: 196598928,
  number: 36,
  name: 'Johnny Sj&#xF6;',
  age: 16,
  team_id: null,
  skill: 'Passing',
  date: '1444860000000.0',
  progress: 8,
  rested: 0,
  boost: 'camp',
  current_level: 3
}, {
  id: 196598933,
  number: 41,
  name: 'Fabian Lekberg',
  age: 16,
  team_id: null,
  skill: 'Shooting',
  date: '1444860000000.0',
  progress: 9,
  rested: 0,
  boost: 'camp',
  current_level: 1
}, {
  id: 191284617,
  number: 44,
  name: 'Ivan Bazovsk&#xFD;',
  age: 19,
  team_id: null,
  skill: 'Tackling',
  date: '1444860000000.0',
  progress: 0,
  rested: 0,
  boost: '',
  current_level: 8
}, {
  id: 196598931,
  number: 39,
  name: 'Viktor Hellsing',
  age: 16,
  team_id: null,
  skill: 'Passing',
  date: '1444860000000.0',
  progress: 8,
  rested: 0,
  boost: 'camp',
  current_level: 3
}, {
  id: 194683702,
  number: 47,
  name: 'Karl-Oskar Edstr&#xF6;m',
  age: 19,
  team_id: null,
  skill: 'None',
  date: '1444860000000.0',
  progress: -1,
  rested: 1,
  boost: '',
  current_level: -1
}, {
  id: 196598929,
  number: 37,
  name: 'Jens-Ove Anselius',
  age: 16,
  team_id: null,
  skill: 'Stamina',
  date: '1444860000000.0',
  progress: 6,
  rested: 0,
  boost: 'coach',
  current_level: 3
}, {
  id: 196598920,
  number: 28,
  name: 'Per-Oskar Hermansson',
  age: 16,
  team_id: null,
  skill: 'Stamina',
  date: '1444860000000.0',
  progress: 9,
  rested: 0,
  boost: 'camp',
  current_level: 2
}, {
  id: 196598916,
  number: 24,
  name: 'Karl-Oskar B&#xE4;ck',
  age: 16,
  team_id: null,
  skill: 'Speed',
  date: '1444860000000.0',
  progress: 6,
  rested: 0,
  boost: 'coach',
  current_level: 1
}];


describe('Parser testsuite', function() {
  let htmlfile = 'player-profiles-with-rested.html';
  let filename = path.join(__dirname, '..', 'html', htmlfile);
  let html = fs.readFileSync(filename).toString();

  describe('Parses local html and test that the parsers function correctly',
    function() {
      it(
        `expects that the data parsed from local html and the expected results
        are identical`,
        function(done) {
          requests.getCookies = sinon.stub.returns(
            bluebird.resolve({cookies: null}));
          requests.getAllPlayersHTML = sinon.stub.returns(
              bluebird.resolve({body: html}));

          this.timeout(5000);
          let expectedDate = 1444860000000.0;
          storage.createDb(':memory:').then(db => {
            scrapers.updateDailyTraining(db, html, expectedDate)
              .then(() => storage.getAllPlayersData(db))
              .then(playerData => {
                assert(playerData.length === expected.length);
                let sortedResult = expected.slice()
                  .sort((a, b) => b.id - a.id);
                let sortedPlayers = playerData.slice()
                  .sort((a, b) => b.id - a.id);
                for (let i = 0; i < sortedPlayers.length; i++) {
                  assert.deepEqual(sortedPlayers[i], sortedResult[i]);
                }
              })
              .then(() => done())
              .catch(err => {
                done(err);
              });
          });
        });
    });
});
