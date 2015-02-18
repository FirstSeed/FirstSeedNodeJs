/* global app:true */

(function() {
  'use strict';

  app = app || {};

  // Models
  app.Equipments = Backbone.Model.extend({
    url: function() {
      return '/admin/equipments/'+ this.id +'/';
    }
  });

  app.Delete = Backbone.Model.extend({
    defaults: {
      success: false,
      errors: [],
      errfor: {}
    },
    url: function() {
      return '/admin/equipments/'+ app.mainView.model.id +'/';
    }
  });

  app.Details = Backbone.Model.extend({
    defaults: {
      _id: '',
      success: false,
      errors: [],
      errfor: {},
      name: '',
      area: '',
      room: '',
      bed: '',
      nurse: ''
    },
    url: function() {
      return '/admin/equipments/'+ app.mainView.model.id + '/';
    },
    parse: function(response) {
      if (response.id) {
          app.mainView.model.set(response.name);
          delete response.id;
      }

      return response;
    }
  });

  app.Area = Backbone.Model.extend({  });
  app.Room = Backbone.Model.extend({ urlRoot: '/admin/calls/rooms/'  });
  app.Bed = Backbone.Model.extend({ urlRoot: '/admin/calls/beds/'  });

  app.Julian = Backbone.Model.extend ({ });

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
      // Nuevo
      var bed = $('#room').val();
      app.bedsView.selectedId = $('#bed').val();
      if (bed !== null ) {
        app.julian.set({room: $('#room').val() });
      }

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
    }
  });

  app.RoomsView = app.LocationsView.extend({
    setSelectedId: function(roomId) {
      //this.bedsView.selectedId = null;
      this.bedsView.setRoomId(roomId);
    },
    setAreaId: function (areaId) {
      this.populateFrom("/admin/calls/" + areaId + "/rooms/");
      this.collection.bind('change', this.reload);
      //console.log(app.detailsView.model.get('room'));
    },
    reload: function () {
      console.log("Bed ha cambiado");
    }
  });

  app.BedsView = app.LocationsView.extend({
    //initialize: function() {
    //  this.collection.bind('change', this.reload);
    //},
    setSelectedId: function(roomId) {
      // Do nothing
    },
    setRoomId: function(roomId) {
      this.populateFrom("/admin/calls/" + roomId + "/beds/");
    },
    reload: function () {
      console.log("Bed ha cambiado");
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
    initialize: function () {
      this.model = new app.Details();
      this.syncUp();
      this.listenTo(app.mainView.model, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
      app.julian.on('change', function () {
      app.bedsView.setRoomId($('#room').val());
      app.bedsView.selectedId = $('#bed').val();
      //app.roomsView.selectedId = $('#room').val();
      }, this);
    },
    syncUp: function() {
      // Set data to DetailsView
      this.model.set({
        id: app.mainView.model.id,
        name: app.mainView.model.get('name'),
        nurse: app.mainView.model.get('nurse'),
        unique: app.mainView.model.get('unique'),
        bed: app.mainView.model.get('BedId'),
        _id: app.mainView.model.get('_id')
      });
    },
    render: function() {
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
      app.bedsView = new app.BedsView({ el: $('#bed'), collection: new app.Beds()  });

      app.areasView.roomsView = app.roomsView;
      app.areasView.bedsView = app.bedsView;
      app.roomsView.bedsView = app.bedsView;


      var bedId = this.model.get('bed');
      console.log(bedId);

      if (bedId !== null) {
        new app.Bed({id: bedId}).fetch({ success: function(bed) {
          app.bedsView.selectedId = bed.get('id');
          var roomId = bed.get('RoomId');
          console.log(roomId);
          app.bedsView.setRoomId(roomId);

          new app.Room({id: roomId}).fetch({success: function(room) {
            app.roomsView.selectedId = room.get('id');
            var areaId = room.get('AreaId');
            app.roomsView.setAreaId(areaId);

            app.areasView.selectedId = areaId;
            app.areas.fetch({ reset: true });
          }});
        }});
      } else { app.areas.fetch({ reset: true });  }
    },
    update: function() {
      this.model.save({
        name: this.$el.find('[name="name"]').val(),
        area: this.$el.find('[name="area"]').val(),
        room: this.$el.find('[name="room"]').val(),
        bed: this.$el.find('[name="bed"]').val(),
        nurse: this.$el.find('[name="nurse"]').val(),
        _id: this.$el.find('[name="_id"]').val(),
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
      if (confirm('Estás Seguro?')) {
          this.model.destroy({
            success: function(model, response) {
              if (response.success) {
                location.href = '/admin/equipments/';
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
      app.mainView = this ;
      // Parse data response
      this.model = new app.Equipments( JSON.parse( unescape($('#data-results').html()) ) );
      this.listenTo(this.model, 'change', this.reload, this);
      app.julian = new app.Julian({ room: '1' });

      app.headerView = new app.HeaderView();
      app.detailsView = new app.DetailsView();
      app.deleteView = new app.DeleteView();
    },
    reload: function () {
      console.log("El MainView ha cambiado");
    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
}());
