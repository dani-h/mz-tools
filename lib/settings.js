"use strict";

let fs = require("fs");
let path = require('path');
let winston = require('winston');

const DIR = __dirname;
const PROD_CREDENTIALSFILE = path.join(DIR, '..', "/credentials.json");
const TEST_CREDENTIALSFILE = path.join(DIR, '..', "/credentials.test.json");

const DBFILE = path.join(DIR, '..', '/db.db');
const LOGFILE = path.join(DIR, '..', '/logfile.log');
const ENCODING = "utf8";

const ENV = {
  TEST: 'TEST',
  PROD: 'PROD'
};


function createDefaultOpts() {
  return {
    verbose: false,
    env: ENV.PROD
  };
}

function setup(opts) {
  if (opts.env === ENV.TEST) {
    module.exports.credentials = getCookieCredentials(TEST_CREDENTIALSFILE);
    module.exports.dbFile = ':memory:';
  } else if (opts.env === ENV.PROD) {
    module.exports.credentials = getCookieCredentials(PROD_CREDENTIALSFILE);
    module.exports.dbFile = DBFILE;
    winston.add(winston.transports.File, {
      filename: LOGFILE
    });
  } else {
    throw new Error('Invalid env');
  }

  if (!opts.verbose) {
    winston.remove(winston.transports.Console);
  }
}

function getCookieCredentials(file) {
  try {
    return JSON.parse(fs.readFileSync(file, ENCODING));
  } catch (e) {
    throw e;
  }
}

module.exports = {
  createDefaultOpts,
  setup,
  ENV
};
