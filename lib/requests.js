"use strict";

let http = require("http");
let assert = require("assert");
let BPromise = require("bluebird");
// Nodes querystring can't handle nested objects
let qs = require("qs");
let merge = require("merge");

let localutil = require('./localutil');

const REQUEST_TIMEOUT = 15000;

function request(opts, msg) {
  assert.notStrictEqual(opts.path, undefined);
  let headers = {};
  if (opts.headers) {
    headers = merge(headers, opts.headers);
  }
  if (msg) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    msg = qs.stringify(msg);
    headers['Content-Length'] = Buffer.byteLength(msg);
  }
  let reqOpts = {
    host: opts.host || 'www.managerzone.com',
    port: opts.port || 80,
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
    if (msg) {
      req.write(msg);
    }
    req.on('error', (e) => reject(e));
    req.setTimeout(REQUEST_TIMEOUT, () => {
      reject('Timeout');
    });
    req.end();
  });
}


function getCookies() {
  let postdata = localutil.getCookieCredentials();
  return request({
      method: 'POST',
      path: '/?p=login'
    }, postdata)
    .then(r => {
      assert.notStrictEqual(r.res.headers['location'], '/?p=start&msg=wrong_username_or_password');
      return r.res.headers['set-cookie'];
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
  getCookies,
  getAllPlayersHTML,
  request,
};
