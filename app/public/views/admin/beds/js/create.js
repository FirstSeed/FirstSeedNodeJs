/* global app:true */

(function() {
  'use strict';

  app = app || {};

    app.Record = Backbone.Model.extend({
    defaults: {
      unique: '',
      success: false,
      errors: [],
      errfor: {},
      name: '',
      area: '',
      room: ''
    },
    url: function() {
      return '/admin/beds/'+ (this.isNew() ? '' : this.id +'/');
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
      //this.model = new app.Bed();
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
        room: this.$el.find('[name="room"]').val(),
      },{
        success: function(model, response) {
          if (response.success) {
            app.detailsView.model.set({ name: '' });
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

      app.areasView.roomsView = app.roomsView;
      
      var roomId = null;
      var temp = app.mainView.results[0];
      if (temp !== undefined) {
        roomId = temp.id;
      }
      if (roomId !== null) {
        new app.Room({id: roomId}).fetch({ success: function(room) {
          app.roomsView.selectedId = room.get('id');
          var areaId = room.get('AreaId');
          app.roomsView.setAreaId(areaId);

          new app.Room({id: roomId}).fetch({success: function(room) {
            app.roomsView.selectedId = room.get('id');
            var areaId = room.get('AreaId');
            app.areas.fetch({ reset: true });
          }});
        }});
      } else { app.areas.fetch({ reset: true });  }
    }
  });


  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function () {
      app.mainView = this;
      this.results = JSON.parse( $('#data-results').html() );

      app.headerView = new app.HeaderView();
      app.detailsView = new app.DetailsView();
    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
}());
