/* jslint node: true */
'use strict';

var Logout = function (config) {
  this.config = config || config;
};

Logout.prototype.initLogout = function(req, res) {
  req.logout();
  res.redirect('/');
};

module.exports = Logout;
