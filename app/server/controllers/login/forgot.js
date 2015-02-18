/* jslint node: true */
'use strict';

var models  = require('../../models');

var LoginForgot = function (config) {
  this.config = config || {};

  this.userModel = models.User;

  this.workflow = require('../../lib/workflow');
  this.sendmail = require('../../lib/sendmail');
};

LoginForgot.prototype.encryptPassword = function(password, done) {
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

LoginForgot.prototype.addDays = function (theDate, days) {
    return new Date(theDate.getTime() + days*24*60*60*1000);
};

LoginForgot.prototype.initForgot = function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect(req.user.defaultReturnUrl());
  }
  else {
    res.render('login/forgot/index');
  }
};

LoginForgot.prototype.send = function(req, res, next) {
  var config = require('../../../../config');
  var loginForgot = new this();
  var workflow = loginForgot.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.email) {
      workflow.outcome.errfor.email = 'required';
      return workflow.emit('response');
    }

    workflow.emit('generateToken');
  });

  workflow.on('generateToken', function() {
    var crypto = require('crypto');
    crypto.randomBytes(21, function(err, buf) {
      if (err) {
        return next(err);
      }

      var token = buf.toString('hex');
      loginForgot.encryptPassword(token, function(err, hash) {
        if (err) {
          return next(err);
        }

        workflow.emit('patchUser', token, hash);
      });
    });
  });

  workflow.on('patchUser', function(token, hash) {
    var conditions = { email: req.body.email.toLowerCase() };
    var fieldsToSet = {
      resetPasswordToken: hash,
      resetPasswordExpires: loginForgot.addDays(new Date(), 1)
    };

    var getUser = function(callback) {
      loginForgot.userModel
        .find({ where: conditions })
        .then(function(user) {
          if (!user) {
            workflow.outcome.errfor.email = 'Not User found';
            return workflow.emit('response');
          }
          callback(null, user);
        })
        .error(function (err) {
  				return workflow.emit('exception', err);
  			});
    };

    var updateUser = function(user, callback) {
      loginForgot.userModel
        .update(fieldsToSet, { where: conditions })
        .then(function(user) {

  			})
  			.error(function (err) {
  				console.log(err);
  			});

      workflow.emit('sendEmail', token, user);
      callback(null, user);
    };

    require('async').waterfall([
      getUser,
      updateUser
    ],
    function(err, results){
      if (err) {
        console.log('error');
      }
    });
  });

  workflow.on('sendEmail', function(token, user) {
    loginForgot.sendmail(req, res, {
      from: config.smtp.from.name +' <'+ config.smtp.from.address +'>',
      to: user.email,
      subject: 'Reset your '+ config.projectName +' password',
      textPath: 'login/forgot/email-text',
      htmlPath: 'login/forgot/email-html',
      locals: {
        username: user.username,
        resetLink: req.protocol +'://'+ req.headers.host +'/login/reset/'+ user.email +'/'+ token +'/',
        projectName: config.projectName
      },
      success: function(message) {
        workflow.emit('response');
      },
      error: function(err) {
        workflow.outcome.errors.push('Error Sending: '+ err);
        workflow.emit('response');
      }
    });
  });

  workflow.emit('validate');
};

module.exports = LoginForgot;
