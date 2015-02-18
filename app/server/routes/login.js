/* jslint node: true */
'use strict';
// Node dependences
/**
*  REQUIRES
*/
var LoginController = require('../controllers/login');
var ForgotController = require('../controllers/login/forgot');
var ResetController = require('../controllers/login/reset');


module.exports = function (app) {

  var loginController = new LoginController();
  var forgotController = new ForgotController();
  var resetController = new ResetController();


  //login/out
  app.route('/login/')
    .get(loginController.initLogin.bind(LoginController))
    .post(loginController.login.bind(LoginController));

  app.route('/login/forgot/')
    .get(forgotController.initForgot)
    .post(forgotController.send.bind(ForgotController));

  app.route('/login/reset/')
    .get(resetController.initReset);

  app.route('/login/reset/:email/:token/')
    .get(resetController.initReset)
    .put(resetController.set.bind(ResetController));


};
