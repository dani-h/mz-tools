const Bluebird = require('bluebird');
const request = require('request');
const shortID = require('shortid');
const localRequests = require('../requests');

var webdriverio = require('webdriverio');
var options = {
    desiredCapabilities: {
        browserName: 'firefox'
    }
};

webdriverio
    .remote(options)
    .init()
    .url('http://www.managerzone.com')
    .getTitle().then(function(title) {
        console.log('Title was: ' + title);
    })
    .end();
