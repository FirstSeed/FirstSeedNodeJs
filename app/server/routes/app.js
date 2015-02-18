/* jslint node: true */
'use strict';
// Node dependences
/**
*  REQUIRES
*/

var AppController = require('../controllers/app');

module.exports = function(app) {

  var appController = new AppController();

  //app
  app.route('/app')
    .get(appController.initApp);

};
