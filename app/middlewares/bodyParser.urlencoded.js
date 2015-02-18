/* jslint node: true */
'use strict';

// // Node dependences
/**
*  REQUIRES
*/

// related third party node_modules
var bodyParser = require('body-parser');

module.exports = bodyParser.urlencoded({extended: true});
