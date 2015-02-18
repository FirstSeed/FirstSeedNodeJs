/* global app:true */

(function() {
  'use strict';

  app = app || {};
  // Models
  app.Record = Backbone.Model.extend({
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
      return '/admin/equipments/'+ (this.isNew() ? '' : this.id +'/');
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
    addAll: function()  {
      _.each(this.locationViews, function(locationView) { locationView.remove(); });
      this.locationViews = [];
      this.collection.each(this.addOne);

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

      //this.bedsView.setDisabled(true);
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
      console.log("Room ha cambiado");
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
      //this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template());
    }
  });

  app.DetailsView = Backbone.View.extend({
    el: '#details',
    template: _.template( $('#tmpl-details').html() ),
    events: {
      'submit form': 'preventSubmit',
      'keypress input[type="text"]': 'addNewOnEnter',
      'click .btn-add': 'addNew'
    },
    initialize: function() {
      this.model = new app.Record();
      this.listenTo(this.model, 'change', this.render);
      this.render();
      app.julian.on('change', function () {
        app.bedsView.setRoomId($('#room').val());
        app.bedsView.selectedId = $('#bed').val();
        //app.roomsView.selectedId = $('#room').val();
      }, this);
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
      this.selectBoxes();
    },
    preventSubmit: function(event) {
      event.preventDefault();
    },
    addNewOnEnter: function(event) {
      if (event.keyCode !== 13) { return; }
      event.preventDefault();
      this.addNew();
    },
    addNew: function() {
      this.model.save({
        name: this.$el.find('[name="name"]').val(),
        area: this.$el.find('[name="area"]').val(),
        room:  this.$el.find('[name="room"]').val(),
        bed:  this.$el.find('[name="bed"]').val(),
        nurse:  this.$el.find('[name="nurse"]').val(),
        _id: this.$el.find('[name="_id"]').val()
      },{
        success: function(model, response) {
          if (response.success) {
            app.detailsView.model.set({ name: '', _id: '', nurse: '' });
            Backbone.history.stop();
            Backbone.history.start();
          }
          else {
            alert(response.errors.join('\n'));
          }
        }
      });
    },
    selectBoxes: function () {
      //var isArea = this.$el.find('[name="area"]').val();
      app.areas = new app.Areas();

      app.areasView = new app.AreasView({ el: $('#area'), collection: app.areas });
      app.roomsView = new app.RoomsView({ el: $('#room'), collection: new app.Rooms() });
      app.bedsView = new app.BedsView({ el: $('#bed'), collection: new app.Beds()  });

      app.areasView.roomsView = app.roomsView;
      app.areasView.bedsView = app.bedsView;
      app.roomsView.bedsView = app.bedsView;


      //var bedId = this.model.get('bed');
      //var bedId = this.$el.find('[name="bed"]').val();
      var temp = app.mainView.results[0];
      var bedId = null;
      if (temp !== undefined) {
        bedId = temp.id;
      }
      if (bedId !== null) {
        new app.Bed({id: bedId}).fetch({ success: function(bed) {
          app.bedsView.selectedId = bed.get('id');
          var roomId = bed.get('RoomId');
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
    }
  });

  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainView = this;
      this.results = JSON.parse( unescape ($('#data-results').html() ));
      app.julian = new app.Julian({ room: '1' });

      app.headerView = new app.HeaderView();
      app.detailsView = new app.DetailsView();

    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
}());
