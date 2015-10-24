"use strict";

let http = require("http");
let assert = require("assert");
let BPromise = require("bluebird");
// Nodes querystring can't handle nested objects
let qs = require("qs");
let merge = require("merge");
let iconv = require('iconv-lite');

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
      let body = new Buffer(0);
      res.on('data', d => body = Buffer.concat([body, d]));
      res.on('end', () => resolve({
        res, body: iconv.decode(new Buffer(body), 'iso-8859-1')
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


function getCookies(credentials) {
  return request({
      method: 'POST',
      path: '/?p=login'
    }, credentials)
    .then(r => {
      return {
        res: r.res,
        body: r.body,
        cookies: r.res.headers['set-cookie']
      };
    });
}

function getAllPlayersHTML(cookies) {
  return request({
    path: '/?p=players',
    headers: {
      'Cookie': cookies
    }
  });
}

function getTeamInfoHTML(cookies) {
  return request({
    path: '/?p=team',
    headers: {
      'Cookie': cookies
    }
  });
}

module.exports = {
  getCookies,
  getAllPlayersHTML,
  getTeamInfoHTML,
};
