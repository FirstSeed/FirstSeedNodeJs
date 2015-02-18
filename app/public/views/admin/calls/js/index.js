/* global app:true */

var $ = $;
var Backbone = Backbone;
var _ = _;

(function () {
  'use strict';

  app = app || {}; // Objeto literal

  // Models
  app.Area = Backbone.Model.extend({  });
  app.Room = Backbone.Model.extend({ urlRoot: '/admin/calls/rooms/'  });
  app.Bed = Backbone.Model.extend({ urlRoot: '/admin/calls/beds/'  });

  // Collections
  app.Areas = Backbone.Collection.extend({
    url: '/admin/calls/areas/',
    model: app.Area
  });

  app.Rooms = Backbone.Collection.extend({
    model: app.Room
  });

  app.Beds = Backbone.Collection.extend({
    model: app.Bed
  });

  // Views
  app.LocationView = Backbone.View.extend({
    tagName: "option",

    initialize: function () {
      _.bindAll(this, 'render');
    },
    render: function () {
      $(this.el).attr('value',
         this.model.get('id')).html(this.model.get('name'));
      if (this.model.get('id') === app.mainView.area) {
        app.mainView.area = -1;
        $(this.el).attr("selected", "selected");
        //app.areasView.changeSelected();
        console.log($(this.el).val());
        app.areasView.toggleVisibility();
        app.areasView.setSelectedId($(this.el).val());
      }
      return this;
    }
  });

  app.LocationsView = Backbone.View.extend({
    events: {
      "change": "changeSelected"
    },
    initialize: function(){
      _.bindAll(this, 'addOne', 'addAll');
      this.collection.bind('reset', this.addAll);
    },
    addOne: function(location){
      var locationView = new app.LocationView({ model: location });
      this.locationViews.push(locationView);

      $(this.el).append(locationView.render().el);
    },
    addAll: function () {
      _.each(this.locationViews, function(locationView) { locationView.remove(); });
      this.locationViews = [];
      this.collection.each(this.addOne);
      if (this.selectedId) {
        $(this.el).val(this.selectedId);
      }
    },
    changeSelected: function () {
      if ($(this.el).val()) {
        this.toggleVisibility();
        this.setSelectedId($(this.el).val());
      }
    },
    populateFrom: function(url) {
      this.collection.url = url;
      this.collection.fetch({ reset: true });
      this.setDisabled(false);
    },
    setDisabled: function(disabled) {
      $(this.el).attr('disabled', disabled);
    }
  });

  app.AreasView = app.LocationsView.extend({
    setSelectedId: function(areaId) {
      this.roomsView.selectedId = null;
      this.roomsView.setAreaId(areaId);

      this.bedsView.collection.reset();
      this.bedsView.setDisabled(true);
    },
    toggleVisibility: function () {
      var template = _.template($('#tmpl-rooms').html());
      $('#rooms').html(template());
      app.roomsView = new app.RoomsView({ el: $('#room'), tagName: '#rooms',collection: new app.Rooms() });
      app.areasView.roomsView = app.roomsView;

      if ($(app.roomsView.tagName).css('visibility') === 'hidden') {
		    $(app.roomsView.tagName).css('visibility', 'visible');
	    }
	    if ($(app.bedsView.tagName).css('visibility') === 'visible') {
		    $(app.bedsView.tagName).css('visibility', 'hidden');
	    }
      if ($(app.consultView.el).css('visibility') === 'visible') {
		    $(app.consultView.el).css('visibility', 'hidden');
	    }
    }
  });

  app.RoomsView = app.LocationsView.extend({
    setSelectedId: function(roomId) {
      this.bedsView.selectedId = null;
      this.bedsView.setRoomId(roomId);
    },
    setAreaId: function (areaId) {
      this.populateFrom("/admin/calls/" + areaId + "/rooms/");
    },
    toggleVisibility: function () {
      var template = _.template($('#tmpl-beds').html());
      $('#beds').html(template());
      app.bedsView = new app.BedsView({ el: $('#bed'), tagName: '#beds',collection: new app.Beds()  });
      app.roomsView.bedsView = app.bedsView;
      app.areasView.bedsView = app.bedsView;

      if ($(app.bedsView.tagName).css('visibility') === 'hidden') {
			  $(app.bedsView.tagName).css('visibility', 'visible');
	    }
    }
  });

  app.BedsView = app.LocationsView.extend({
    setSelectedId: function(roomId) {
      // Do nothing
    },
    setRoomId: function(roomId) {
      this.populateFrom("/admin/calls/" + roomId + "/beds/");
    },
    toggleVisibility: function () {
      if ($(app.consultView.el).css('visibility') === 'hidden') {
			  $(app.consultView.el).css('visibility', 'visible');
	    }
      app.consultView.render();
    }
  });

  app.ConsultView = Backbone.View.extend({
    el: '#consulta',
    template: _.template($('#tmpl-consult').html()),
    render: function () {
      this.$el.html( this.template());
    },
  });


  app.MainView = Backbone.View.extend({
    el: '.page .container',

    initialize: function () {
      app.mainView = this;
      var template = _.template($('#tmpl-areas').html());
      $('#areas').html(template());
      // Llegan los datos del metodo find del controlador
      this.area = JSON.parse( unescape($('#data-results').html()) );
      app.areas = new app.Areas();

      // Se instancian todas las vistas
      app.areasView = new app.AreasView({ el: $('#area'), collection: app.areas });
      app.bedsView = new app.BedsView({ el: $('#bed'), tagName: '#beds', collection: new app.Beds()  });
      app.areasView.bedsView = app.bedsView;
      app.consultView = new app.ConsultView();
    }
  });

  // Router
  app.Router = Backbone.Router.extend({
    routes: {
      '': 'default',
      'q/:params': 'query' // #q/params
    },
    initialize: function () {
      app.mainView = new app.MainView();
  },
   default: function () {
     if (app.firstLoad) {
      app.areas.fetch({ reset: true });
     }
   },
   query: function (params) {
    app.areaView.model.fetch({ data: params, reset: true });
    app.firstLoad = false;
   }
  });


  $(document).ready(function () {
    app.firstLoad = true;
    app.router = new app.Router();
    Backbone.history.start();
  });
}());
