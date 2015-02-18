/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.BedGroup = Backbone.Model.extend({
    url: function() {
      return '/admin/beds/'+ this.id +'/';
    }
  });

  app.Delete = Backbone.Model.extend({
    defaults: {
      success: false,
      errors: [],
      errfor: {}
    },
    url: function() {
      return '/admin/beds/'+ app.mainView.model.id +'/';
    }
  });

  app.Details = Backbone.Model.extend({
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      name: '',
      area: '',
      room: ''
    },
    url: function() {
      return '/admin/beds/'+ app.mainView.model.id +'/';
    },
    parse: function(response) {
      if (response.bedGroup) {
        app.mainView.model.set(response.bedGroup);
        delete response.bedGroup;
      }

      return response;
    }
  });

  app.Area = Backbone.Model.extend({  });
  app.Room = Backbone.Model.extend({ urlRoot: '/admin/calls/rooms/'  });

  // Collections
  app.Areas = Backbone.Collection.extend({
    url: '/admin/calls/areas/',
    model: app.Area
  });

  app.Rooms = Backbone.Collection.extend({
    model: app.Room
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
    addAll: function(){
      _.each(this.locationViews, function(locationView) { locationView.remove(); });
      this.locationViews = [];
      this.collection.each(this.addOne);
      if (this.selectedId) {
        $(this.el).val(this.selectedId);
      }
    },
    changeSelected: function () {
      this.setSelectedId($(this.el).val());
    },
    populateFrom: function(url) {
      this.collection.url = url;
      this.collection.fetch({ reset: true });
    },
    setDisabled: function(disabled) {
      $(this.el).attr('disabled', disabled);
    }
  });

  app.AreasView = app.LocationsView.extend({
    setSelectedId: function(areaId) {
      this.roomsView.selectedId = null;
      this.roomsView.setAreaId(areaId);
    }
  });

  app.RoomsView = app.LocationsView.extend({
    setSelectedId: function(roomId) {
      // Do nothing
    },
    setAreaId: function (areaId) {
      this.populateFrom("/admin/calls/" + areaId + "/rooms/");
      this.collection.bind('change', this.reload);
      //console.log(app.detailsView.model.get('room'));
    },
    reload: function () {
      console.log("Room ha cambiado");
    }
  });

  app.HeaderView = Backbone.View.extend({
    el: '#header',
    template: _.template( $('#tmpl-header').html() ),
    initialize: function() {
      this.model = app.mainView.model;
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    }
  });

  app.DetailsView = Backbone.View.extend({
    el: '#details',
    template: _.template( $('#tmpl-details').html() ),
    events: {
      'click .btn-update': 'update'
    },
    initialize: function() {
      this.model = new app.Details();
      this.syncUp();
      this.listenTo(app.mainView.model, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    syncUp: function () {
      this.model.set({
        id: app.mainView.model.id,
        name: app.mainView.model.get('name'),
        room: app.mainView.model.get('RoomId')
      });
    },
    render: function () {
      this.$el.html(this.template( this.model.attributes ));

      for (var key in this.model.attributes) {
        if (this.model.attributes.hasOwnProperty(key)) {
          this.$el.find('[name="'+ key +'"]').val(this.model.attributes[key]);
        }
      }
      this.selectBoxes();
    },
    selectBoxes: function () {
      app.areas = new app.Areas();

      app.areasView = new app.AreasView({ el: $('#area'), collection: app.areas });
      app.roomsView = new app.RoomsView({ el: $('#room'), collection: new app.Rooms() });

      app.areasView.roomsView = app.roomsView;

      var roomId = this.model.get('room');

      if (roomId !== null) {
        new app.Room({id: roomId}).fetch({ success: function(room) {
          app.roomsView.selectedId = room.get('id');
          var areaId = room.get('AreaId');
          app.roomsView.setAreaId(areaId);

          app.areasView.selectedId = areaId;
          app.areas.fetch({ reset: true });

        }});
      } else { app.areas.fetch({ reset: true });  }
    },
    update: function() {
      this.model.save({
        name: this.$el.find('[name="name"]').val(),
        area: this.$el.find('[name="area"]').val(),
        room: this.$el.find('[name="room"]').val(),
      });
    }
  });

  app.DeleteView = Backbone.View.extend({
    el: '#delete',
    template: _.template( $('#tmpl-delete').html() ),
    events: {
      'click .btn-delete': 'delete',
    },
    initialize: function() {
      this.model = new app.Delete({ id: app.mainView.model.id });
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    },
    delete: function() {
      if (confirm('Estás seguro?')) {
        this.model.destroy({
          success: function(model, response) {
            if (response.success) {
              location.href = '/admin/beds/';
            }
            else {
              app.deleteView.model.set(response);
            }
          }
        });
      }
    }
  });


  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainView = this;
      this.model = new app.BedGroup( JSON.parse( unescape($('#data-results').html()) ) );

      app.headerView = new app.HeaderView();
      app.detailsView = new app.DetailsView();
      app.deleteView = new app.DeleteView();
    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
}());
