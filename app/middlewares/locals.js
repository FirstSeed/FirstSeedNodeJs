/* jslint node: true */
'use strict';

var config = require('../../config');

module.exports = function (req, res, next) {
  res.locals.user = {};
  res.locals.user.username = "juvasquezg";
  res.locals.copyrightYear = new Date().getFullYear();
  res.locals.copyrightName = config.companyName;
  res.locals.projectName = config.projectName;
  next();
};
