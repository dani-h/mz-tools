"use strict";

let BPromise = require('bluebird');
let storage = require('./lib/storage.js');
let requests = require("./lib/requests");
let parsers = require("./lib/parsers");
let localutil = require('./lib/util.js');

storage.init(localutil.DBFILE).then(db => {
  requests.getCookies()
    .then(cookies => requests.getAllPlayersHTML(cookies))
    .then(playersHTML => {
      let todaysDate = storage.getMidnightDate();
      let playerIDs = parsers.parseAllPlayerIDS(playersHTML);
      playerIDs.forEach(id => {
        let playerContainerHTML = parsers.parsePlayerContainer(playersHTML, id);
        let playerData = parsers.parsePlayerFromHTML(playerContainerHTML);
        let reportData = parsers.parseDailyTraining(id, playerContainerHTML);

        storage.insertOrIgnorePlayer(db, id, playerData.number, playerData.name,
            playerData.age)
          .then(() => BPromise.all([
            storage.getPlayerByID(db, id),
            storage.getSkillByName(db, reportData.skill)
          ]))
          .spread((player, skill) => {
            let date = new Date();
            //If it's a Sunday its weekly training report, so exclude that
            if (date.getDay !== 0) {
              storage.insertOrIgnoreReport(db, player.id, skill.id, todaysDate,
                reportData.progress, reportData.ballGained, reportData.rested,
                reportData.boost);
            }
          });
      });
    });
});
