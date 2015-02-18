/* jslint node: true */
'use strict';

var http = require('http'),
	  config = require('./config'),
	  ExpressServer = require('./app/expressServer'),
		SocketIO = require('./app/socketIO'),
    models = require("./app/server/models");

var Workers = function(config) {
  config = config || {};


  // create express app
  var app = new ExpressServer(config);

  // setup web server
  this.server = http.createServer(app.expressServer);

	var IO = new SocketIO( {app: app.expressServer, server: this.server} );
};

Workers.prototype.run = function () {
	// start server
  var self = this;
  models.sequelize.sync().then(function () {
    self.server.listen(config.port, function() {
      console.log("llamado-enfermeria corriendo en http://localhost:%s", config.port);
    });
  });
};

if (module.parent) {
	module.exports = Workers;
} else {
	new Workers();
	console.log('debugger');
}
