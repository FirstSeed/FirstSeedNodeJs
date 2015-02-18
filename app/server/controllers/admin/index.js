/* jslint node: true */
'use strict';

var models  = require('../../models');
var pagedFind = require('../plugins/pagedFind');

var Admin = function (config) {
  this.config = config || {};
};


Admin.prototype.find = function (req, res, next) {
  res.render(app/index);
};


module.exports = Admin;
