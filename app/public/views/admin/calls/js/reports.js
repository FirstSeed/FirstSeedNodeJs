/* global app:true */
// nameSpace, permite poner los elemtos en el global de window

(function () {
  'use strict';

  var handlerDate  = function () {
    $('#initDate').datetimepicker({
      format: "YYYY-MM-DD HH:mm"
    });
    $('#endDate').datetimepicker({
      format: "YYYY-MM-DD HH:mm"
    });
    $("#initDate").on("dp.change",function (e) {
      $('#endDate').data("DateTimePicker").setMinDate(e.date);
    });
    $("#endDate").on("dp.change",function (e) {
      $('#initDate').data("DateTimePicker").setMaxDate(e.date);
    });
  };

  var validateDates = function () {
    var initDate = $("#init_date").val();
    var endDate = $("#end_date").val();
    window.isValid = true;

    // validate initDate value
    if (initDate === "") {
      alert("Debe ingresar una Fecha Inicio");
      isValid = false;
    }

    // validate endDate value
    if (endDate === "") {
      alert("Debe ingresar una Fecha Fin");
      isValid = false;
    }

    console.log(isValid);

    // submit the form if all entries are valid
    if (isValid === true) {
      $("#date_form").submit();
    }
  };


  $(document).ready(function () {
    handlerDate();
    $("#gen_report").click(validateDates);
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
