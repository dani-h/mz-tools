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

describe('Parser testsuite', function() {
  describe('#fetch', function() {
    let storageFile = 'player-profiles-with-rested-STORAGE.json';
    let storageContents = fs.readFileSync(path.join(__dirname, '..', 'json', storageFile));
    let expectedStorage = JSON.parse(storageContents);

    let htmlFilename= 'player-profiles-with-rested.html';
    let htmlFile = path.join(__dirname, '..', 'html', htmlFilename);
    let html = fs.readFileSync(htmlFile).toString();

    it('asserts that the parsed html is stored correctly and matches the locally stored result',
      function(done) {
        this.timeout(5000);

        // Mock the requests towards mz so that we return local html
        sinon.stub(requests, 'getCookies')
          .returns(bluebird.resolve({cookies: undefined}));
        sinon.stub(requests, 'getAllPlayersHTML')
          .returns(bluebird.resolve({body: html}));

        // The date comparsion is a moving piece we need to pin down to the date in the
        // stored player results
        storage.getMidnightDate = sinon.stub(storage, 'getMidnightDate')
          .returns(1444860000000.0);

        let sortPlayerByID = (a, b) => a.id - b.id;

        storage.createDb(':memory:')
          .then(db => {
            return scrapers.fetch(db).then(() => storage.getAllPlayersData(db));
          })
        .then(data => {
          let actual = data.slice().sort(sortPlayerByID);
          let expected = expectedStorage.slice().sort(sortPlayerByID);
          assert.deepEqual(actual, expected);
        })
          .then(done)
          .catch(err => done(err));
      });
    });
});
