'use strict';

let BPromise = require('bluebird');
let storage = require('./storage.js');
let requests = require("./requests");
let parsers = require("./parsers");
let winston = require('winston');

function parseDailyTraining(db) {
  winston.info('***Scraping daily training reports***');
  return requests.getCookies()
    .then(cookies => requests.getAllPlayersHTML(cookies))
    .then(playersHTML => {
      //Declare the *date* here, so that all the reports share the same date
      let todaysDate = storage.getMidnightDate();
      let playerIDs = parsers.parseAllPlayerIDS(playersHTML);

      let updatedPlayerPromises = [];

      //For each player, check if he already exists. If not, insert the new player
      //For each player get the most recent training data. If that has already been inserted today,
      //avoid inserting again
      playerIDs.forEach(id => {
        //If no report is found we get undefined, otherwise we a date
        storage.getMaxTrHistoryDateForPlayerID(db, id)
          .then(maxDate => {
            if (!maxDate || maxDate < todaysDate) {
              let playerContainerHTML = parsers.parsePlayerContainer(playersHTML, id);
              let playerData = parsers.parsePlayerFromHTML(playerContainerHTML);
              let reportData = parsers.parseDailyTraining(id, playerContainerHTML);
              let updated = updatePlayerData(db, id, todaysDate, playerData, reportData);
              updatedPlayerPromises.push(updated);
            }
          });
      });

      return BPromise.all(updatedPlayerPromises)
        .then(() => winston.info('***Finished daily training reports***'));
    });
}

function updatePlayerData(db, id, todaysDate, playerData, reportData) {
  //Get or create player
  let player = storage.getPlayerByID(db, id)
    .then(player => {
      if (!player) {
        return storage.insertPlayer(db, id, playerData.number, playerData.name,
            playerData.age)
          .then(() => storage.getPlayerByID(db, id));
      } else {
        return player;
      }
    });
  let skill = storage.getSkillByName(db, reportData.skill);
  let done = BPromise.all([player, skill])
    .spread((player, skill) => {
      storage.insertReport(db, player.id, skill.id, todaysDate, reportData.progress,
        reportData.ballGained, reportData.rested, reportData.boost,
        reportData.currentLevel
      );
    });

  return done;
}

module.exports = {
  parseDailyTraining
};
