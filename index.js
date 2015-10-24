#!/usr/bin/env node

"use strict";

let yargs = require('yargs');
let winston = require('winston');
let settings = require('./lib/settings');
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
  .option('v', {
    alias: 'verbose',
    demand: false,
    default: false,
    describe: 'Print debugging output',
    type: 'boolean'
  })
  .help('help')
  .argv;

let opts = settings.createDefaultOpts();
opts.env = settings.ENV.PROD;

if (args.verbose) {
  opts.verbose = true;
}

settings.setup(opts);

if (args.fetch) {
  storage.createDb(settings.DBFILE).then(db => {
    scrapers.fetch(db);
  });
}
