/* jslint node: true */
'use strict';

var Io = require('socket.io');


// related third party node_modules
var _ = require("underscore");


var SocketIO = function(config) {
	config = config || {};
	var io = Io.listen(config.server);

	io.sockets.on('connection', function(socket) {
		config.app.socket = socket;

		socket.join('some::room');

		// Received Start
		socket.on('start', function(data) {
			mainApp(config.app);
		});


		// Received All Rest
		socket.on('storage', function(data) {
			data.load = 1;
    	//currentCalls(config.app, data);
		});

		socket.on('remove', function(data) {
			//console.log('removed: ', data);
			//console.log(config.app.activeCallsIds);
	    callController.update(config.app, data);
	    var index = _.indexOf(config.app.activeCallsIds, data.id);
	    config.app.activeCallsIds = _.without(config.app.activeCallsIds, data.id);
	    if (index !== -1) {
	      config.app.activeCalls.splice(index,1);
	      config.app.activeEquipments.splice(index, 1);
	    }
		});
	});
};

module.exports = SocketIO;
