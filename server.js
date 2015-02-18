/* jslint node: true */
'use strict';

// Node dependences
/**
 *  REQUIRES
 */

// related third party node_modules

// standard core node_modules requires
var http = require('http');

// local node-modules specific requires
var config = require('./config'),
    ExpressServer = require('./app/expressServer'),
    SocketIO = require('./app/socketIO'),
    models = require("./app/server/models");

var sticky = require('sticky-session');

// create express app
var app = new ExpressServer(config);

// start server
models.sequelize.sync().then(function () {
	sticky(1, function () {
		// create web server
		var server = http.createServer(app.expressServer);
		var IO = new SocketIO( {app: app.expressServer, server: server} );
		return server;
	}).listen(config.port, function() {
		console.log("firstseed nodejs corriendo en http://localhost:%s", config.port);
	});
});


/**
 * Cluster
 */
// var cluster = require('cluster');
//
//
// if (cluster.isMaster) {
// 	var Master = require('./master');
// 	var master = new Master({cluster:cluster});
//
// 	var cpuCount = require('os').cpus().length;
//
// 	for (var i = 0; i < cpuCount; i++) {
// 		master.createWorker();
// 	}
//
//
// 	cluster.on('exit', function(worker) {
// 		console.log('worker ' + worker.id + '  died');
// 		master.onWorkerExit();
// 	});
//
// } else {
// 	var Workers = require('./workers');
// 	var workers = new Workers();
// 	workers.run();
// 	console.log('worker ' + cluster.worker.id + '  running!');
// }
