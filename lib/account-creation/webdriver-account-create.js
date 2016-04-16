const Bluebird = require('bluebird');
const request = require('request');
const shortID = require('shortid');
const localRequests = require('../requests');

var webdriverio = require('webdriverio');
var options = { desiredCapabilities: { browserName: 'phantomjs' } };
var client = webdriverio.remote(options);

client
    .init()
    .windowHandleMaximize()
    .url('http://www.managerzone.com/')
    .pause(1500)
    .setValue('#register-form-wrapper input#username', 'zolafranco333')
    .pause(2000)
    .setValue('#register-form-wrapper input#password', 'simple1234')
    .pause(2000)
    .setValue('input#liame', 'whoknowszl333@gmail.com')
    .pause(2000)
    .moveToObject('#_table', 0, 0)
    .pause(2000)
    .doubleClick('#_table')
    .pause(2000)
    .doubleClick('#_table')
    .pause(60000)
    .end();

