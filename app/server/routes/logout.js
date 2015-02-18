/* jslint node: true */
'use strict';

var LogoutController = require('../controllers/logout');

module.exports = function (app) {

  var logoutController = new LogoutController();

  app.route('/logout/')
    .get(logoutController.initLogout);
};
