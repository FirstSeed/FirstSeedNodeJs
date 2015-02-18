/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.Record = Backbone.Model.extend({
    defaults: {
      errors: [],
      errfor: {},
      _id: undefined,
      name: '',
      success: false,
    },
    url: function() {
      return '/admin/areas/'+ (this.isNew() ? '' : this.id +'/');
    }
  });

  app.HeaderView = Backbone.View.extend({
    el: '#header',
    template: _.template( $('#tmpl-header').html() ),
    initialize: function() {
      this.render();
    },
    render: function() {
      this.$el.html(this.template( ));
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
        name: this.$el.find('[name="name"]').val()
      },{
        success: function(model, response) {
          if (response.success) {
            Backbone.history.stop();
            Backbone.history.start();
          }
          else {
            alert(response.errors.join('\n'));
          }
        }
      });
    }
  });

  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainView = this;
      app.headerView = new app.HeaderView();
      app.DetailsView = new app.DetailsView();
    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
}());
