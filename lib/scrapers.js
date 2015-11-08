'use strict';

let BPromise = require('bluebird');
let storage = require('./storage.js');
let requests = require("./requests");
let parsers = require("./parsers");
let winston = require('winston');

/*
 * param {{}} Sqlite3 db
 * returns {BPromise.Promise}
 */
function fetch(db) {
  winston.info('***Scraping daily training reports***');

  return requests.getCookies()
    .then(r => requests.getAllPlayersHTML(r.cookies))
    .then(r => {
      //Declare the *date* here, so that all the reports share the same date
      let todaysDate = storage.getMidnightDate();
      let htmlInsert = storage.getLastHTMLEntry(db)
        .then(max => {
          if (!max || max < todaysDate) {
            return storage.insertHTMLEntry(db, todaysDate, r.body);
          }
        });
      let playersUpdate = updateDailyTraining(db, r.body, todaysDate);

      return Promise.all([playersUpdate, htmlInsert]);
    });
}

function updateDailyTraining(db, html, date) {
  let playerIDs = parsers.parseAllPlayerIDS(html);

  let updatedPlayers = [];

  playerIDs.forEach(id => {
    let promise = storage.getMaxTrHistoryDateForPlayerID(db, id)
      .then(maxDate => {
        if (!maxDate || maxDate < date) {
          let playerData = parsers.parsePlayer(html, id);
          let reportData = parsers.parseDailyTraining(html, id);
          let updated = updatePlayerData(db, id, date, playerData, reportData);
          return updated;
        }
      });
    updatedPlayers.push(promise);
  });

  return BPromise.all(updatedPlayers)
    .then(() => winston.info('***Finished daily training reports***'));
}

function updatePlayerData(db, id, todaysDate, playerData, reportData) {
  //Get the player that has this id from the DB. If the player doesnt exist,
  //insert a new one and retrieve that player.
  let player = storage.getPlayerByID(db, id)
    .then(player => {
      if (!player) {
        return storage.insertPlayer(db,
          id, playerData.number, playerData.name, playerData.age)
          .then(() => storage.getPlayerByID(db, id));
      } else {
        return player;
      }
    });
  let skill = storage.getSkillByName(db, reportData.skill);
  let done = BPromise.all([player, skill])
    .spread((player, skill) => {
      return storage.insertReport(db, player.id, skill.id, todaysDate, reportData.progress,
        reportData.ballGained, reportData.rested, reportData.boost,
        reportData.currentLevel
      );
    });

  return done;
}

module.exports = {
  fetch,
  updateDailyTraining
};
