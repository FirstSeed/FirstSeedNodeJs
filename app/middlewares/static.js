/* jslint node: true */
'use strict';

// Node dependences
/**
 *  REQUIRES
 */

// related third party node_modules
var express = require('express');

// standard core node_modules requires

// local node-modules specific requires
var path = require('path');

module.exports = express.static(path.join(__dirname, '../public/'));
