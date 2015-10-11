"use strict";

let fs = require("fs");
let path = require('path');

const DIR = __dirname;
const CREDENTIALSFILE = path.join(DIR, '..', "/credentials.json");
const DBFILE = path.join(DIR, '..', '/db.db');
const LOGFILE = path.join(DIR, '..', '/logfile.log');
const ENCODING = "utf8";

function getCookieCredentials() {
  try {
    return JSON.parse(fs.readFileSync(CREDENTIALSFILE, ENCODING));
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log("Missing credentials, place them in", CREDENTIALSFILE);
    }
    throw e;
  }
}

module.exports = {
  getCookieCredentials,
  DBFILE,
  LOGFILE
};
