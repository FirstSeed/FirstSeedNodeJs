/* global app:true */
// nameSpace, permite poner los elemtos en el global de window

// var $ = $;
// var Backbone = Backbone;
// var _ = _;

(function () {
  'use strict';

  app = app || {}; // Objeto literal

  // Models
  app.Item = Backbone.Model.extend({ }); // Clase

  // Collections
  app.ItemCollection = Backbone.Collection.extend({
    model: app.Item,
    url: '/admin/area-groups/',
    parse: function(results) {
      return results.data;
    }
  });

  app.ItemsView = Backbone.View.extend({
    el: $('#productos'),

    template: _.template( $('#tmpl-item').html() ),

    initialize: function () {
      this.collection = new app.ItemCollection( app.mainView.results.data );
      //this.listenTo(this.collection, "add", this.addOne, this);
      this.listenTo(this.collection, 'reset', this.render);
      this.render();
    },

    render: function () {
      //this.collection.forEach(this.addOne, this);
      this.collection.each(this.addOne, this);
    },

    addOne: function (item) {
      var itemView = new app.ItemView({ model: item });
      this.$el.append(itemView.render().el);
      var id = item.toJSON().id;
      //$(".non-underline").attr( "id", "amigos" + id);
    }
  });


  // Views
  app.ItemView = Backbone.View.extend({

    tagName: 'div',
    className: 'col-sm-4',

    events: {
      'click': 'navigate'
    },

    template: _.template( $('#tmpl-item').html() ),

    initialize: function () {
      this.listenTo(this.model, "change", this.render, this);
    },

    render: function () {
      var item = this.model.toJSON();
      var html = this.template(item);
      this.$el.html(html);

      return this;
    }
  });


  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function () {
      app.mainView = this;
      this.results = JSON.parse( unescape($('#data-results').html()) );

      app.itemsView = new app.ItemsView();

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
      if (!app.firstLoad) {
       app.itemsView.collection.fetch({ reset: true });
      }

      app.firstLoad = false;
    },
    query: function (params) {
      app.itemsView.collections.fetch({ data: params, reset: true });
      app.firstLoad = false;
    }
  });

  $(document).ready(function () {
    app.firstLoad = true;
    app.router = new app.Router();
    Backbone.history.start();
  });

}());

// Uso
// Uso
//var report = new app.Report({ callsRequest: "15", callsAttended: "13", averageTime: "1:04", maxTime: "1:03", minTime: "00:50"}); // instacio el modelo usando las clase Call.Floor
//var source = $("#tmpl-reports").html(); // Obtengo el contenido html de mi template
//var template = _.template(source); compilo mi template, pasandole el contenido html  para obtener una funcion.
//var html = template(report.toJSON()); // Le paso a mi template los datos, en Json, en este caso los datos de mi modelo

// En el Browser
// var reportView = new app.ReportView({ model: report, el: $(".list") })
// reportView.render();
