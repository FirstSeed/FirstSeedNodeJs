/* jslint node: true */
'use strict';

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.DATE,
    isActive: DataTypes.STRING
  }, {
    classMethods: {
      defaultReturnUrl: function() {
        var returnUrl = '/';
        if (this.canPlayRoleOf('account')) {
          returnUrl = '/account/';
        }

        if (this.canPlayRoleOf('admin')) {
          returnUrl = '/';
        }

        return returnUrl;
      },
      canPlayRoleOf: function(role) {
        if (role === "admin") {
          return true;
        }

        if (role === "account") {
          return true;
        }

        return false;
      }
    }
  });

  return User;
};
