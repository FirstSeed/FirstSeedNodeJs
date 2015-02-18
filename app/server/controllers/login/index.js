/* jslint node: true */
'use strict';

var models  = require('../../models');

var Login = function (config) {
  this.config = config || {};

  this.loginAttemptModel = models.LoginAttempt;
  this.userModel = models.User;

  this.workflow = require('../../lib/workflow');

};

Login.prototype.ensureAuthenticated = function (req, res, next) {
  if (req.session.passport.user) {
    return next();
  }
  res.set('X-Auth-Required', 'true');
  req.session.returnUrl = req.originalUrl;
  res.redirect('/login/');

};

Login.prototype.getReturnUrl = function (req) {
  var returnUrl = this.userModel.defaultReturnUrl();
  if (req.session.returnUrl) {
    returnUrl = req.session.returnUrl;
    delete req.session.returnUrl;
  }
  return returnUrl;
};

Login.prototype.initLogin = function (req, res) {
  var login = new this();
  if (req.isAuthenticated()) {
    res.redirect(login.getReturnUrl(req));
  }
  else {
    res.render('login/index', {
      oauthMessage: '',
      oauthTwitter: !!req.app.get('twitter-oauth-key'),
      oauthGitHub: !!req.app.get('github-oauth-key'),
      oauthFacebook: !!req.app.get('facebook-oauth-key'),
      oauthGoogle: !!req.app.get('google-oauth-key')
    });
  }
};

Login.prototype.login = function(req, res) {
  var login = new Login();
  var workflow = login.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.username) {
      workflow.outcome.errfor.username = 'required';
    }

    if (!req.body.password) {
      workflow.outcome.errfor.password = 'required';
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('abuseFilter');
  });

  workflow.on('abuseFilter', function() {
     workflow.emit('attemptLogin');
  });

  workflow.on('attemptLogin', function() {
    req._passport.instance.authenticate('local', function(err, user, info) {
      if (err) {
        console.log(err);
        return workflow.emit('exception', err);
      }

      if (!user) {
        var fieldsToSet = { ip: req.ip, user: req.body.username };
        login.loginAttemptModel
          .create(fieldsToSet)
          .then(function(user) {
            workflow.outcome.errors.push('Nombre usuario o contraseña incorrecta o la cuenta está inactiva');
            return workflow.emit('response');
    			})
    			.error(function (err) {
    				return workflow.emit('exception', err);
    			});
      } else {
        req.login(user, function(err) {
          if (err) {
            return workflow.emit('exception', err);
          }

          workflow.emit('response');
        });
      }
    })(req, res);
  });

  workflow.emit('validate');
};

module.exports = Login;
