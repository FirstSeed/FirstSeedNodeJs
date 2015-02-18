/* jslint node: true */
'use strict';

// Node dependences
/**
 *  REQUIRES
 */

// related third party node_modules
var session = require('express-session');

// Redis sessions
var RedisStore = require('connect-redis')(session);

// local node-moudules
var config = require('../../config');

module.exports = session({
  resave: true,
  saveUninitialized: true,
  secret : config.cryptoKey,
  store  : new RedisStore({})
});
