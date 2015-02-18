/* jslint node: true */
'use strict';

var models = require('./app/server/models');

var validatePassword = function(password, hash, done) {
  var bcrypt = require('bcrypt');
  bcrypt.compare(password, hash, function(err, res) {
    done(err, res);
  });
};


exports = module.exports = function(app, passport) {
  var LocalStrategy = require('passport-local').Strategy,
      TwitterStrategy = require('passport-twitter').Strategy,
      GitHubStrategy = require('passport-github').Strategy,
      FacebookStrategy = require('passport-facebook').Strategy,
      GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

  passport.use(new LocalStrategy(
    function(username, password, done) {
      var userModel = models.User;
      var conditions = { isActive: 'yes' };
      if (username.indexOf('@') === -1) {
        //conditions.username = username;
      }
      else {
        conditions.email = username;
      }

      userModel
        .find({ where: conditions })
        .then(function(user) {
          if (!user) {
            return done(null, false, { message: 'Unknown user' });
          }


          validatePassword(password, user.password, function(err, isValid) {
            if (err) {
              return done(err);
            }

            if (!isValid) {
              return done(null, false, { message: 'Invalid password' });
            }

            return done(null, user);
          });

        })
        .error(function (err) {
  				return done(err);
  			});

    }
  ));


  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    models.User
      .find({where: {id: id}})
      .then(function(user) {
        done(null, user);
      })
      .error(function(err){
        done(err, null);
      });
  });
};
