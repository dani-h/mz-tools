"use strict";

/**
 * Training ball urls from the player page:
 *
 * Means no progress
 * "http://static.managerzone.com/nocache-<num>/img/training/bar_0.png": 0,
 * Means some sort of progress
 * http://static.managerzone.com/nocache-<num>/img/training/bar_pos_<num>.png
 * Means ball is gained
 * http://static.managerzone.com/nocache-<num>/img/training/bar_pos_<num>_ball.png
 * Means player rested today
 * http://static.managerzone.com/nocache-<num>/img/training/bar_resting.png
 *
 * Training camp img next to progress img (optional)
 * <img class="extraTrainingIcon"
 * src="http://static.managerzone.com/nocache-342/img/training/training_camp.png" alt="">
 * Coach img next to progress img (optional)
 * <img class="extraTrainingIcon"
 * src="http://static.managerzone.com/nocache-342/img/training/coach.png" alt="">
 */

let cheerio = require("cheerio");
let util = require("util");
let storage = require('./storage.js');

let TEAM_ID = "&tid=40842";


//Regarding the images... On normal days you have two images. First the skill, then the progress
//bar and the optionally if there was a training camp or a coach assisting
function parseDailyTraining(playerID, playerContainerHTML) {
  let noProgressText = 'bar_0.png';
  let restedText = 'bar_resting.png';
  let gainedBallRegex = /bar_pos_(\d+)_ball\.png/;
  let progressRegex = /bar_pos_(\d+)\.png/;

  let coachBoost = 'coach.png';
  let campBoost = 'training_camp.png';

  let trainingReport = {
    skill: '',
    progress: -1,
    ballGained: false,
    rested: false,
    boost: ''
  };

  let $ = cheerio.load(playerContainerHTML);
  let $weeklyReportBox = $(".weeklyReportBox");

  trainingReport.skill = $weeklyReportBox.find("span.clippable").html();
  let $images = $weeklyReportBox.find(".imgDiv > img");
  let progressImg = splitSlashGetLastWord($images.eq(1).attr('src'));

  if ($images.length === 3) {
    let boostImg = splitSlashGetLastWord($images.eq(2).attr('src'));
    if (boostImg === campBoost) {
      trainingReport.boost = storage.BOOST.camp;
    } else if (boostImg === coachBoost) {
      trainingReport.boost = storage.BOOST.coach;
    }
  } else {
    trainingReport.boost = storage.BOOST.none;
  }

  if (progressImg === noProgressText) {
    trainingReport.progress = 0;
  } else if (progressImg === restedText) {
    trainingReport.rested = true;
  } else {
    let progressMatch = progressImg.match(progressRegex);
    let ballProgressMatch = progressImg.match(gainedBallRegex);

    if (progressMatch) {
      trainingReport.progress = parseInt(progressMatch[1]);
      trainingReport.ballGained = false;
    } else if (ballProgressMatch) {
      trainingReport.progress = parseInt(ballProgressMatch[1]);
      trainingReport.ballGained = true;
    }
  }

  return trainingReport;
}

function parsePlayerFromHTML(playerContainerHTML, id) {
  let player = {
    number: -1,
    name: '',
    age: -1,
  };
  let $ = cheerio.load(playerContainerHTML);
  player.name = $("span.player_name").html();

  let age = /Age: <strong>(.{1,3})<\/strong>/g.exec(playerContainerHTML);
  player.age = parseInt(age[1]);

  let numberRegex = /\s+(\d+)\./;
  let number = $('a.subheader').html().match(numberRegex)[1];
  player.number = parseInt(number);

  return player;
}

function parsePlayerContainer(html, id) {
  let $ = cheerio.load(html);
  let playerHref = "/?p=players&pid=" + id + TEAM_ID;
  let playerContainer = $(util.format('a[href="%s"]', playerHref)).parent().parent();
  let playerContainerHTML = playerContainer.html();
  return playerContainerHTML;
}

/* jshint ignore:start */
function parseSkill(playerContainerHTML, skillName) {
  // Search via img[alt] which reveals the skill more easily
  let reg = new RegExp(skillName + ": (.*)", "g");
  let m = reg.exec(playerContainerHTML);
  if (m) {
    return parseInt(m[1]);
  }
}
/* jshint ignore:end */


function splitSlashGetLastWord(word) {
  let arr = word.split("/");
  return arr[arr.length - 1];
}


function parseAllPlayerIDS(html) {
  let $ = cheerio.load(html);
  let nodes = $("a.subheader");
  //Note: cheerio map. Requires `.get()`
  let IDs = nodes.map(function() {
    let node = $(this);
    let href = node.attr("href");
    let IDRegex = new RegExp("pid=(.*)&");
    let ID = parseInt(IDRegex.exec(href)[1]);
    return ID;
  }).get();

  return IDs;
}

module.exports = {
  parsePlayerFromHTML,
  parseDailyTraining,
  parsePlayerContainer,
  parseAllPlayerIDS
};
