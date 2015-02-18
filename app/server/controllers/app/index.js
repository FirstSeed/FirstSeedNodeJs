/* jslint node: true */
'use strict';

var App = function (config) {
  this.config = config;
};

App.prototype.initApp = function(req, res) {
  res.render('app/index');
};

module.exports = App;
