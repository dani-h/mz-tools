"use strict";

let sqlite3 = require('sqlite3').verbose();
let BPromise = require('bluebird');


let CREATE_PLAYERS_TABLE =
  `
create table if not exists players (
  id integer primary key,
  number integer not null unique,
  name text not null,
  age integer not null,
  team_id integer
)
`;

let CREATE_SKILLS_TABLE =
  `
create table if not exists skills (
  id integer primary key,
  skill text not null unique
)
`;

let CREATE_TR_HISTORY_TABLE =
  `
create table if not exists tr_history (
  id integer primary key,
  player_id integer,
  skill_id integer,

  date text, -- ISO8601 format. Make sure that only one date is set per day
  -- Let hours, seconds and milis be 0

  progress integer not null, -- 0-10
  ball_gained integer not null, -- boolean
  rested integer not null, -- boolean
  boost text not null, -- coach | camp,
  current_level integer not null, -- only if the player hasn't been resting

  unique(player_id, date), -- only one player can have one daily report

  foreign key(player_id) references players(id),
  foreign key(skill_id) references skills(id)
)
`;


const BOOST = {
  coach: 'coach',
  camp: 'camp',
};
const SKILLS = ['Speed', 'Stamina', 'Play Intelligence', 'Passing', 'Shooting', 'Heading',
  'Keeping', 'Ball Control', 'Tackling', 'Aerial Passing', 'Set Plays', 'Experience', 'Form',
  'None'
];

function createTables(db) {
  db.serialize(() => {
    db.exec(CREATE_PLAYERS_TABLE);
    db.exec(CREATE_SKILLS_TABLE);
    db.exec(CREATE_TR_HISTORY_TABLE);
  });
}

function populateSkills(db) {
  db.serialize(() => {
    let stmt = db.prepare('insert or ignore into skills values (null, ?)');
    SKILLS.forEach(skill => stmt.run(skill));
  });
}

function init(dbname) {
  return new BPromise((resolve, reject) => {
    let db = new sqlite3.Database(dbname);
    db.serialize(() => {
      createTables(db);
      populateSkills(db);
      db.exec('select 1 from skills limit 1', (err) => {
        if (err) throw err;
        resolve(db);
      });
    });
  });
}

function getPlayerByID(db, id) {
  let get = BPromise.promisify(db.get, db);
  let stmt = 'select * from players where players.id = ? limit 1';
  return get(stmt, id);
}

function getSkillByName(db, name) {
  let get = BPromise.promisify(db.get, db);
  let stmt = 'select * from skills where skills.skill = ? limit 1';
  return get(stmt, name);
}

function getMaxTrHistoryDateForPlayerID(db, playerID) {
  let get = BPromise.promisify(db.get, db);
  let stmt = 'select max(date) as max from tr_history where player_id = ?';
  return get(stmt, playerID).then(res => parseInt(res.max));
}

function insertPlayer(db, id, number, name, age) {
  let run = BPromise.promisify(db.run, db);
  let stmt = 'insert into players (id, number, name, age) values (?, ?, ?, ?)';
  return run(stmt, id, number, name, age);
}

function insertReport(db, playerID, skillID, date,
  progress, ballGained, rested, boost, currentLevel) {

  let run = BPromise.promisify(db.run, db);
  let stmt =
    `insert into tr_history
    (player_id, skill_id, date, progress, ball_gained, rested, boost, current_level) values
    ($player_id, $skill_id, $date, $progress, $ball_gained, $rested, $boost, $current_level)`;
  return run(stmt, {
    $player_id: playerID,
    $skill_id: skillID,
    $date: date,
    $progress: progress,
    $ball_gained: ballGained,
    $rested: rested,
    $boost: boost,
    $current_level: currentLevel
  });
}

function getMidnightDate() {
  let date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}


module.exports = {
  BOOST,
  SKILLS,
  init,
  insertPlayer,
  insertReport,
  getPlayerByID,
  getSkillByName,
  getMaxTrHistoryDateForPlayerID,
  getMidnightDate
};
