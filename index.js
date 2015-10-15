#!/usr/bin/env node

"use strict";

let yargs = require('yargs');
let winston = require('winston');
let localutil = require('./lib/localutil');
let storage = require('./lib/storage');
let scrapers = require('./lib/scrapers');

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
    scrapers.fetch(db);
  });
}
