/* jslint node: true */
'use strict';
// Node dependences
/**
*  REQUIRES
*/

var HttpController = require('../controllers/http');

module.exports = function (app) {

  var httpController = new HttpController();

  //route not found
  app.route('*')
  .all(httpController.http404);

};
