/* jslint node: true */
'use strict';
// Node dependences
/**
*  REQUIRES
*/
var LoginController = require('../controllers/login');
var AdminController = require('../controllers/admin');


module.exports = function(app) {

  var loginController = new LoginController();
  var adminController = new AdminController();
  
  //admin
  app.route('/admin*')
    .all(loginController.ensureAuthenticated);

  // root frontend
  app.route('/')
    .get(loginController.ensureAuthenticated, adminController.find);
};
