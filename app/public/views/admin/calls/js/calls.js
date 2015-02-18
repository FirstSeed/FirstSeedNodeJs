/* global app:true */


var language = {
	"sProcessing":     "Procesando...",
	"sLengthMenu":     "Mostrar _MENU_ registros",
	"sZeroRecords":    "No se encontraron resultados",
	"sEmptyTable":     "Ningún dato disponible en esta tabla",
	"sInfo":           "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
	"sInfoEmpty":      "Mostrando registros del 0 al 0 de un total de 0 registros",
	"sInfoFiltered":   "(filtrado de un total de _MAX_ registros)",
	"sInfoPostFix":    "",
	"sSearch":         "Buscar:",
	"sUrl":            "",
	"sInfoThousands":  ",",
	"sLoadingRecords": "Cargando...",
	"oPaginate": {
			"sFirst":    "Primero",
			"sLast":     "Último",
			"sNext":     "Siguiente",
			"sPrevious": "Anterior"
	},
	"oAria": {
			"sSortAscending":  ": Activar para ordenar la columna de manera ascendente",
			"sSortDescending": ": Activar para ordenar la columna de manera descendente"
	}
};

var Backbone = Backbone;
var $ = $;
var _ = _;
var document = document;
var moment = moment;

(function() {
	'use strict';

	app = app || {};

	app.Record = Backbone.Model.extend({
		idAttribute: 'id',
		defaults: {
			initDate: '',
			endDate:  '',
			time:     '',
			equipmentName:  '',
			equipmentArea:  ''
		},
		url: function() {
			return '/admin/calls/'+ (this.isNew() ? '' : this.id);
		}
	});

	app.RecordCollection = Backbone.Collection.extend({
		model: app.Record,
		url: '/admin/calls/',
		parse: function(results) {
			return results.data;
		}
	});

	app.ResultsView = Backbone.View.extend({
		el: '#results-table',
		template: _.template( $('#tmpl-results-table').html() ),
		initialize: function() {
			this.collection = new app.RecordCollection( app.mainView.results.data );
			this.listenTo(this.collection, 'reset', this.render);
			this.render();
		},
		render: function () {
			this.$el.html( this.template() );

			var frag = document.createDocumentFragment();

			this.collection.each(function(record) {
			  this.beforeWriteTable(record);
				var view = new app.ResultsRowView({ model: record });
				frag.appendChild(view.render().el);
			}, this);
			this.loadResults(frag);

			if (this.collection.length === 0) {
				$('#results-rows').append( $('#tmpl-results-empty-row').html() );
			}
		},
		beforeWriteTable: function (record) {
			this.setDates(record);
			this.setCode(record);
			this.setStatus(record);
		},
		setDates: function (record) {
			if (record.get("initDate") !== null) {
				record.set({
					initDate: moment(record.get("initDate")).format("YYYY-MM-DD HH:mm:ss")
					//initTime: moment(record.get("initDate")).format("HH:mm:ss"),
				});
			}
			if (record.get("endDate") !== null) {
				console.log(record.toJSON());
				record.set({
					endDate: moment(record.get("endDate")).format("YYYY-MM-DD HH:mm:ss")
					//endTime: moment(record.get("endDate")).format("HH:mm:ss"),
				});
			}
		},
		setCode: function (record) {
			if (record.get("attended") === null) {
				record.set({ attended: "Activo"});
			} else if (record.get("attended") === true) {
				record.set({ attended: "Atendido"});
			} else {
				record.set({ attended: "Cancelado"});
			}
		},
		setStatus: function (record) {
			if (record.get("code") === "1") {
				record.set({ code: "Emergencia"});
			} else {
				record.set({ code: "Azul"});
			}
		},
		loadResults: function (frag) {
			$('#results-rows').append(frag);
			$('#calls-results').dataTable({
					"language": language
			});
		}
	});

	app.ResultsRowView = Backbone.View.extend({
		tagName: 'tr',
		template: _.template( $('#tmpl-results-row').html() ),

		render: function() {
			this.$el.html(this.template( this.model.attributes ));
			return this;
		}
	});

	app.MainView = Backbone.View.extend({
		el: '.page .container',
		initialize: function () {
			app.mainView = this;
			// Llegan los datos del metodo find del controlador
			//this.results = JSON.parse( unescape($('#data-results').html()) );
			this.results = JSON.parse( $('#data-results').html());
			app.resultsView = new app.ResultsView();
		}
	});

	app.Router = Backbone.Router.extend({
		routes: {
			'': 'default',
			'q/:params': 'query'
		},
		initialize: function () {
			app.mainView = new app.MainView();
		},
		default: function () {
			if (!app.firstLoad) {
				app.resultsView.collection.fetch({ reset: true });
			}
			app.firstLoad = false;
		},
		query: function (params) {
			app.resultsView.collection.fetch({ data: params, reset: true });
			app.firstLoad = false;
		}
	});

	$(document).ready(function () {
	  app.firstLoad = true;
		app.router = new app.Router();
		Backbone.history.start(); // Inicia el Router
	});
}());
