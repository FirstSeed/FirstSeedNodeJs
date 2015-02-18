/* jslint node: true */
'use strict';

var models  = require('../../models');

var ResetLogin = function (config) {
  this.config = config || {};

  this.userModel = models.User;

  this.workflow = require('../../lib/workflow');
};

ResetLogin.prototype.validatePassword = function(password, hash, done) {
  var bcrypt = require('bcrypt');
  bcrypt.compare(password, hash, function(err, res) {
    done(err, res);
  });
};

ResetLogin.prototype.encryptPassword = function(password, done) {
  var bcrypt = require('bcrypt');
  bcrypt.genSalt(10, function(err, salt) {
    if (err) {
      return done(err);
    }

    bcrypt.hash(password, salt, function(err, hash) {
      done(err, hash);
    });
  });
};

ResetLogin.prototype.initReset = function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect(req.user.defaultReturnUrl());
  }
  else {
    res.render('login/reset/index');
  }
};

ResetLogin.prototype.set = function(req, res) {
  var resetLogin = new this();
  var workflow = resetLogin.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.password) {
      workflow.outcome.errfor.password = 'required';
    }

    if (!req.body.confirm) {
      workflow.outcome.errfor.confirm = 'required';
    }

    if (req.body.password !== req.body.confirm) {
      workflow.outcome.errors.push('Passwords do not match.');
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('findUser');
  });

  workflow.on('findUser', function() {
    var date = new Date();
    var conditions = {
      email: req.params.email,
      resetPasswordExpires: { gt : date }
    };

    resetLogin.userModel
      .find({ where: conditions })
      .then(function(user) {
        if (!user) {
          workflow.outcome.errors.push('Invalid request.');
          return workflow.emit('response');
        }

        resetLogin.validatePassword(req.params.token, user.resetPasswordToken, function(err, isValid) {
          if (err) {
            return workflow.emit('exception', err);
          }

          if (!isValid) {
            workflow.outcome.errors.push('Invalid request.');
            return workflow.emit('response');
          }

          workflow.emit('patchUser', user);
        });
      })
      .error(function (err) {
        return workflow.emit('exception', err);
      });
  });

  workflow.on('patchUser', function(user) {
    resetLogin.encryptPassword(req.body.password, function(err, hash) {
      if (err) {
        return workflow.emit('exception', err);
      }

      var fieldsToSet = { password: hash, resetPasswordToken: '' };
      resetLogin.userModel.update(fieldsToSet, { where: {id: user.id} })
        .then(function(user) {
          workflow.emit('response');
  			})
  			.error(function (err) {
  				return workflow.emit('exception', err);
  			});
    });
  });

  workflow.emit('validate');
};

module.exports = ResetLogin;
