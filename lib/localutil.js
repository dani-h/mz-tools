"use strict";

let fs = require("fs");
let path = require('path');
let winston = require('winston');

const DIR = __dirname;
const CREDENTIALSFILE = path.join(DIR, '..', "/credentials.json");
const DBFILE = path.join(DIR, '..', '/db.db');
const LOGFILE = path.join(DIR, '..', '/logfile.log');

function getCredentials(user) {
  try {
    const credentials = fs.readFileSync(CREDENTIALSFILE, 'utf8');
    const json = JSON.parse(credentials);
    return json;
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log("Missing credentials, place them in", CREDENTIALSFILE);
    }
    throw e;
  }
}

winston.add(winston.transports.File, {
  filename: LOGFILE
});


module.exports = {
  getCredentials,
  DBFILE,
  LOGFILE,
  winston
};
