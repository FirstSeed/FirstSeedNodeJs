/* jslint node: true */
'use strict';

var config = require('../../../config');

module.exports = function(sequelize, DataTypes) {
  var LoginAttempt = sequelize.define("LoginAttempt", {
    ip: DataTypes.STRING,
    user: DataTypes.STRING,
    time: DataTypes.DATE,
    expires: { type: DataTypes.STRING, defaultValue: config.loginAttempts.logExpiration }
  });

  return LoginAttempt;
};
