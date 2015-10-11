"use strict";

let BPromise = require('bluebird');
let storage = require('./lib/storage.js');
let requests = require("./lib/requests");
let parsers = require("./lib/parsers");
let localutil = require('./lib/util.js');
let winston = require('winston');

winston.add(winston.transports.File, {
  filename: localutil.LOGFILE
});

winston.info('Running scripts.');
process.on('uncaughtException', (err) => winston.warn(err));

storage.init(localutil.DBFILE).then(db => {
  requests.getCookies()
    .then(cookies => requests.getAllPlayersHTML(cookies))
    .then(playersHTML => {
      //Declare the *date* here, so that all the reports share the same date
      let todaysDate = storage.getMidnightDate();
      let playerIDs = parsers.parseAllPlayerIDS(playersHTML);

      playerIDs.forEach(id => {
        let playerContainerHTML = parsers.parsePlayerContainer(playersHTML, id);
        let playerData = parsers.parsePlayerFromHTML(playerContainerHTML);
        let reportData = parsers.parseDailyTraining(id, playerContainerHTML);

        storage.getPlayerByID(db, id)
          .then(player => {
            if (!player) {
              return storage.insertPlayer(db, id, playerData.number, playerData.name,
                playerData.age);
            } else return player;
          })
          .then(() => BPromise.all([
            storage.getPlayerByID(db, id),
            storage.getSkillByName(db, reportData.skill),
            storage.getMaxTrHistoryDateForPlayerID(db, id)
          ]))
          .spread((player, skill, maxTrHistoryDate) => {
            //Dont insert if we already have an entry for today. Do this on a player-by-player
            //basis as purchased players may have no report for today
            if (maxTrHistoryDate !== todaysDate.getTime()) {
              storage.insertReport(db, player.id, skill.id, todaysDate, reportData.progress,
                reportData.ballGained, reportData.rested, reportData.boost,
                reportData.currentLevel
              );
            }
          });

      });
    });
});
