'use strict';

const qs = require('qs');
const assert = require('assert');
const Bluebird = require('bluebird');
const request = require('request');

const localRequests = require('../requests');
const localutil = require('../localutil');
const bRequest = Bluebird.promisify(request, {context: request});

const url = `http://www.managerzone.com/`;

/**
 * @param {string} dateStr Format: 2014-10-10
 * @param {number} hour 0-24
 * @param {number} location 0 = home, 1 = away
 *
 */
function setFriendly(dateStr, hour, location) {
  return Bluebird.coroutine(function * () {
    const credentialsJSON = localutil.getCredentials();
    const mainCred = credentialsJSON.main;
    const dummyCred = credentialsJSON.dummy;

    const mainCookies = yield localRequests.getCookies(mainCred.login);
    const dummyCookies = yield localRequests.getCookies(dummyCred.login);

    const cID = yield challangeFriendly(
      mainCookies, dummyCred.teamID, dateStr, hour, location);

    yield acceptFriendy(dummyCookies, cID);
  })();
}

function challangeFriendly(challangerCookies, opposingTeamID, dateStr, hour, place) {
  const queryParams = {
    p: 'challenges',
    sub: 'action',
    action: 'create',
    tid: opposingTeamID
  };

  const date = new Date(dateStr).getTime() / 1000;

  const formData = {
    date: `${date},${hour}`,
    place: place
  };

  return Bluebird.coroutine(function * () {
    const arr = yield bRequest({
      method: 'POST',
      url: url,
      qs: queryParams,
      headers: {
        Cookie: challangerCookies,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: qs.stringify(formData),
      followAllRedirects: true
    });

    const body = arr[1];
    const cid = /cids\[\]"\s*value="(\d+)"/g.exec(body)[1];

    return cid;
  })();
}

function acceptFriendy(cookies, cid) {
  return Bluebird.coroutine(function * () {
    const qs = {
      p: 'challenges',
      sub: 'action',
      action: 'accept',
      cid: cid
    };

    const arr = yield bRequest({
      url: url,
      qs: qs,
      method: 'GET',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // Dont follow redirect because we need to caputure the location
      // since it tells us if the request was successful.
      followRedirect: false
    });

    const res = arr[0];

    assert(res.headers.location === '?p=challanges&msg=match_booked', 'Match not booked');
  })();
}

// let startDate = 16;
// for(let i = 0; i < 100; i++) {
  // const date = '2016-04-' + (startDate + Math.floor(Math.random() * 7));
  // const hour = Math.floor(Math.random() * 24)
  // // startDate++;
  // console.log('date', date, 'hour', hour, 'location', startDate % 2);
  // setFriendly(date, Math.floor(Math.random() * 24), startDate % 2).catch(err => console.log('error'))
// }

module.exports = {
  setFriendly,
};

