/* jslint node: true */
'use strict';

// Node dependences
/**
 *  REQUIRES
 */

// related third party node_modules
var express = require('express'),
    passport = require('passport'),
    swig = require('swig');

// local node-modules specific requires
var env = process.env.NODE_ENV || 'production',
    middlewares = require('./middlewares/admin'),
    router = require('./server/routes/router'),
    HttpController = require('./server/controllers/http');

// Init Controllers
var httpController = new HttpController();


var ExpressServer = function (config) {

  //keep reference to config
  this.config = config || {};

  /**
   * Create express app
   */
  this.expressServer = new express();

  /**
  *  GLOBALS
  */
  this.expressServer.activeCalls = [];
  this.expressServer.activeCallsIds = [];
  this.expressServer.activeEquipments = [];

  // Middlewares - between express and routes
  for (var middleware in middlewares) {
    this.expressServer.use(middlewares[middleware]);
  }
  this.expressServer.use(passport.initialize());
  this.expressServer.use(passport.session());
  //custom (friendly) error handler
  this.expressServer.use(httpController.http500);

  //setup passport
  require('../passport')(this.expressServer, passport);

  /**
  * Settings
  */
  // Template engine
  this.expressServer.engine('html', swig.renderFile);
  this.expressServer.set('view engine', 'html');
  this.expressServer.set('views', __dirname + '/server/views/');
  swig.setDefaults({varControls: ['[[', ']]']}); // Para usar {} en Angular

  // development enviroment
  if (env === 'development') {
    console.log('OK NO HAY CACHE');
    this.expressServer.set('view cache', false);
    swig.setDefaults({cache: false, varControls:['[[',']]']});
  }

  // Routes
  // Dinamic Routes
  for (var routes in router) {
    router[routes](this.expressServer);
  }

};

module.exports = ExpressServer;
