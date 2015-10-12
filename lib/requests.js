"use strict";

let http = require("http");
let assert = require("assert");
let BPromise = require("bluebird");
let qs = require("qs");
let merge = require("merge");
let util = require("./util.js");

const REQUEST_TIMEOUT = 15000;
const NUM_RETRIES = 5;

function request(opts, retries) {
  assert.notStrictEqual(opts.path, undefined);
  let headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  if (opts.headers) {
    headers = merge(headers, opts.headers);
  }
  let reqOpts = {
    host: 'www.managerzone.com',
    path: opts.path,
    method: opts.method || 'GET',
    headers: headers
  };
  return new BPromise((resolve, reject) => {
    let req = http.request(reqOpts, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({
        res, body
      }));
    });
    req.on('error', (e) => reject(e));
    req.setTimeout(REQUEST_TIMEOUT, () => {
      retries = retries || 1;
      if (retries < NUM_RETRIES) {
        console.log("Request timed out...retrying", opts.path);
        request(opts, retries + 1);
      } else {
        console.log("Exceeded number of retries", opts.path);
      }
    });
    req.end();
  });
}


function getCookies(retries) {
  // Nodes querystring can't handle nested objects
  let postdata = qs.stringify(util.getCookieCredentials());

  let opts = {
    host: 'www.managerzone.com',
    path: '/?p=login',
    method: 'POST',
    headers: {
      'Content-Type': "application/x-www-form-urlencoded",
      //You must specify content length when sending form data to MZ!
      'Content-Length': Buffer.byteLength(postdata),
    }
  };

  return new BPromise((resolve, reject) => {
    let req = http.request(opts, (res) => {
      assert.notStrictEqual(res.headers['set-cookie'], undefined);
      resolve(res.headers['set-cookie']);
    });
    req.write(postdata);

    req.setTimeout(REQUEST_TIMEOUT, () => {
      retries = retries || 1;
      if (retries < NUM_RETRIES) {
        console.log("Request to", opts.path, "timed out, retrying...");
        return getCookies(retries + 1);
      } else {
        req.abort();
        reject("Timeout");
      }
    });
    req.on('error', (e) => reject(e));
    req.end();
  });
}


function getAllPlayersHTML(cookies) {
  return request({
    path: '/?p=players',
    headers: {
      'Cookie': cookies
    }
  }).then(result => {
    assert.notStrictEqual(result.body, undefined);
    assert.notStrictEqual(result.body, '');
    return result.body;
  });
}


module.exports = {
  getCookies: getCookies,
  getAllPlayersHTML: getAllPlayersHTML,
};
