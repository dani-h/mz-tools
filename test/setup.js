'use strict';

let settings = require('../lib/settings');
let opts = settings.createDefaultOpts();
opts.env = settings.ENV.TEST;
settings.setup(opts);
