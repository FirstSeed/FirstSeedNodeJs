/* jslint node: true */
'use strict';

var Master = function(config){
	config = config || {};
	this.cluster = config.cluster;
};

Master.prototype.createWorker = function () {
	var worker = this.cluster.fork();
	console.log("worker %s pid %s",  worker.id, process.pid);
};

Master.prototype.onWorkerExit = function(){
	var self = this;
	setTimeout(function () {
		self.createWorker();
	}, 500);
};

module.exports = Master;
