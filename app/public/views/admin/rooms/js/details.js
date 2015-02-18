/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.RoomGroup = Backbone.Model.extend({
    url: function() {
      return '/admin/rooms/'+ this.id +'/';
    }
  });

  app.Delete = Backbone.Model.extend({
    defaults: {
      success: false,
      errors: [],
      errfor: {}
    },
    url: function() {
      return '/admin/rooms/'+ app.mainView.model.id +'/';
    }
  });

  app.Details = Backbone.Model.extend({
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      name: '',
      area: ''
    },
    url: function() {
      return '/admin/rooms/'+ app.mainView.model.id +'/';
    },
    parse: function(response) {
      if (response.roomGroup) {
        app.mainView.model.set(response.roomGroup);
        delete response.roomGroup;
      }

      return response;
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
    syncUp: function() {
      this.model.set({
        id: app.mainView.model.id,
        name: app.mainView.model.get('name'),
        area: app.mainView.model.get('AreaId')
      });
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));

      for (var key in this.model.attributes) {
        if (this.model.attributes.hasOwnProperty(key)) {
          this.$el.find('[name="'+ key +'"]').val(this.model.attributes[key]);
        }
      }
    },
    update: function() {
      this.model.save({
        name: this.$el.find('[name="name"]').val(),
        area: this.$el.find('[name="area"]').val()
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
      if (confirm('Está seguro?')) {
        this.model.destroy({
          success: function(model, response) {
            if (response.success) {
              location.href = '/admin/rooms/';
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
      this.model = new app.RoomGroup( JSON.parse( unescape($('#data-results').html()) ) );

      app.headerView = new app.HeaderView();
      app.detailsView = new app.DetailsView();
      app.deleteView = new app.DeleteView();
    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
}());
