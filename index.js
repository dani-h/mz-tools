"use strict";

let winston = require('winston');
let yargs = require('yargs');

let localutil = require('./lib/util');
let storage = require('./lib/storage');
let scrapers = require('./lib/scrapers');

winston.add(winston.transports.File, {
  filename: localutil.LOGFILE
});

process.on('uncaughtException', (err) => winston.warn(err));

let args = yargs
  .option('f', {
    alias: 'fetch',
    demand: false,
    default: false,
    describe: 'Fetch the daily training report',
    type: 'boolean'
  })
  .help('help')
  .argv;


if (args.fetch) {
  storage.createDb(localutil.DBFILE).then(db => {
    scrapers.parseDailyTraining(db);
  });
}
