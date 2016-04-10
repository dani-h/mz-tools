const request = require('request');
const Bluebird = require('bluebird');
const shortID = require('shortid');
const localRequests = require('../requests');

const bRequest = Bluebird.promisify(request, {context: request});

// console.log(shortID.generate());
//
const url = 'http://www.managerzone.com';

const username = 'trnklewater3';
const password = 'testinglabomba2';
const email = 'dodson44342@gmail.com';

const registerUserQs = {
  val: 'registerUser',
  username: username,
  password: password,
  email: '',
  liame: email,
  raf_code: '',
  time666718391:1460295618,
  sport: 'soccer',
  sid:0.3090162785628914
};

const verifyRegformQs = {
  val: 'verifyRegform',
  username: username,
  password: '',
  email: '',
  liame: '',
  raf_code: '',
  // time1364227757:1460296195
  sport:'soccer'
  // sid:0.2924923142970557
};

const haveIATeamQs = {
  val: 'haveIaTeam',
  uid: 8391578,
  sportId: 1
  // sid:0.18211259930063872
};

Bluebird.coroutine(function * () {
  // const creds = {
    // "logindata": {
      // "username": username,
      // "md5": "be450357fa2070679ca6f986bbd8d33c",
      // "sport": "soccer"
    // }
  // };
  // localRequests.getCookies()
  // const arr1 = yield bRequest({
    // url: url,
    // qs: verifyRegformQs,
    // followRedirect: false
  // });

  // const res2 = arr1[0];
  // const body1 = arr2[1];

  // console.log('res.statusCode', res2.statusCode);
  // console.log('res.headers', res2.headers);
  const zingo = yield bRequest({
    url: url
  })

  const res = zingo[0];

  const cookie = res.headers['set-cookie'];

  console.log('cookie', cookie);

  // console.log('res', res.headers);

  const arr2 = yield bRequest({
    url: 'http://www.managerzone.com/ajax_com/start.php',
    qs: registerUserQs,
    followRedirect: false,
    headers: {
      'Cookie': cookie
    }
  });

  const res2 = arr2[0];
  // const body2 = arr2[1];

  console.log('res2.headers', res2.headers);
  console.log('res2.statusCode', res2.statusCode);
  // console.log('body2', body2);


})();
