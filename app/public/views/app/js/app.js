var currentRequests;
var timer;
var innerCounter;
var timerRunning;
//var slideInterval; //Tiempo entre rotación de tarjetas
//var slideIntervalCounter; //Contador de gap para rotación de tarjetas
var send;
var request;
var call;
var marquee;

// Audios
var CODE_BLUE_OGG = "/views/app/audios/codigo_azul.ogg"; // Audios para Código Ázul
var CODE_BLUE_MP3 = "/views/app/audios/codigo_azul.mp3";
var NORMAL_CALL_OMG = "/views/app/audios/llamado_normal.ogg"; // Audios para llamado normal
var NORMAL_CALL_MP3 = "/views/app/audios/llamado_normal.mp3";

$(document).ready(function () {

    initialize();   // Inicializa las variables para la operación del sistema.
    toggleVisibility('report_ad'); // Si hay baja batería o no se ha reportado equipo muestra el aviso al final.
    ko.applyBindings(call); // Aplica el Bind del ViewModel.

    $(".description_turn").click(function () { toggleDescription(); });

    window.io = io.connect(); // Me conecto al servidor

    // Del Lado del cliente enviamos información al server
    io.on('connect', function (socket) {
        //console.log('Hi Server'); // Se Saluda al server
        io.emit('start'); // Para enviar mensajes al server se hace io.emit
    });


    // Del Lado del cliente recibimos información del server
    // Se queda escuchando un serialEvent
    io.on('serialEvent', function (response) {
      //console.log(response);
      incomingServerResponse(response);
    });

    io.on('report', function(response) {
        //debugger;
        incomingServerReport(response);
    });

    io.on('alarmEvent', function () {
      changeAudio(NORMAL_CALL_OMG, NORMAL_CALL_MP3);
    });

    io.on('disconnect', function () {
      console.log('Disconnected');
      setTimeout(function(){window.location.reload();}, 15000);
    });

    if (request === 1) {
        request = 0;

        setInterval(function () {
            if (currentRequests !== 0) {
                //request = getFirstResponseQueue(); // Hallo el actual request en la cola.
                $.each(currentRequests, function (index) {
                    //console.log("Almacene");
                    io.emit('storage', currentRequests[index]);
                });
            }
        }, 1000);
    }
});

function initialize() {
    currentRequests = [];
    warningRequests = [];
    innerCounter = 0;
    timerRunning = false;
    //slideInterval = 5;
    //slideIntervalCounter = 0;
    send = true;
    storage = 1;
    request = 1;
    call = new Call();
    marquee = 1;
}

function toggleDescription() {
    $(".description_turn").toggleClass("description_center");
}

// knockout
var addCall = function (response) {

    if ((response.report != -1) && (response.report != -3)) {
        call.calls.unshift(new Equipment(response));
    } else {
        call.warnings.push(new Equipment(response));
    }
};


function removeServerResponse(request) {
    io.emit('remove', request);
}


function serverResponseReceived (currentRequests) {
    for (var i = 0; i < currentRequests.length; i++)
    {
        io.emit('received', currentRequests[i]);
    }
}


function handleTimer() {
    if (isThereResponse) {
        startTimer();
    } else {
        stopTimer();
    }
}


function startTimer() {
    if (timerRunning === false) {
        timerRunning = true;
        if (currentRequests !== 0) {
            request = getFirstResponseQueue(); // Hallo el actual request en la cola
        }

        timer = setInterval(function () { timerTick(request); }, 1000);
    }
}


function stopTimer() {
    clearInterval(timer);
    timerRunning = false;
}


function isThereResponse() {
    responsesCounter = currentRequests.length;
    warningsCounter = warningRequests.length;
    if (responsesCounter > 0) {
        return true;
    } else {
        return false;
    }
}


function timerTick(currentRequest) {
    if (currentRequest !== undefined) {
        if (isThereResponse() === true) {
            updateCards(currentRequest);
            //setTimeout(function () { io.emit('storage', current_request); }, 1000);// Cada segundo escribo en el temporal
        } else {
            stopTimer();
        }
    }
}


function getFirstResponseQueue() {

    if (call.calls().length !== 0) {
        firstCard = $("#calls").first();
        firstCardId = firstCard.children().attr('id');
        request = getResponseByInnerCounter(firstCardId);
        return request;
    } else {
        return undefined;
    }
}


function updateCards(currentRequest) {

    $.each(currentRequests, function (index) {
        // si el inner conunter es diferente
        if (currentRequest.innerCounter != currentRequests[index].innerCounter){
            currentRequests[index].time++;
        } else if (currentRequest.innerCounter == currentRequests[index].innerCounter) {
            currentRequest.time++;
            //currentRequests[index].time++;
        }
        updateCard(currentRequests[index]);
        updateCard(currentRequest);
    });
    updateRequestDetails(currentRequest);
    //showRequestDetails(current_request);

}


function getResponseByInnerCounter(divId){
    returnRequest = undefined;
    var innerCounter = divId.split("turn_")[1];

    // Para current
    $.each(currentRequests,function (index) {
        request = currentRequests[index];

        if (request.innerCounter.toString() == innerCounter) {
            returnRequest = request;
            return;
        }
    });

    // para warning
    $.each(warningRequests, function (index) {
        request = warningRequests[index];

        if (request.innerCounter.toString() == innerCounter) {
            returnRequest = request;
            return;
        }
    });

    return returnRequest;
}

function getResponseById(id) {
    var returnRequest = undefined;
    $.each(currentRequests, function (index) {
        var request = currentRequests[index];
        if (request.id == id) {
            returnRequest = request;
            return;
        }
    });
    return returnRequest;
}

function buildCurrentTurn(request) {
    return  "<ul id='currentTurn'>" +
                "<li class='turns'>" +
                    "<div id='datas'>" +
                        "<span class='area_tag bold'> Área: <span id='areas'>" + request.area  + "</span> </span>" +
                        "<span class='room_tag bold'>  <span id='rooms'>" + request.room + "</span></span>" +
                        "<span class='code_tag bold'> Código: <span id='codes'>" + callCodes[request.code] + "</span></span><br />" +
                        "<span class='bed_tag bold'> Cama: <span id='beds'>" + request.bed + "</span></span>" +
                        "<span class='nurse_tag bold'> Enfermera: <span id='nurses'>" + request.nurse + "</span></span>" +
                        "<span class='time_tag bold'> Tiempo de Atención: <span id='times'>" + secondsToHms(request.time) + "</span></span>" +
                    "</div>" +
                "</li>" +
            "</ul>";
}

function getWarningById(id) {
    //debugger;
    var returnRequest = undefined;
    var request = undefined;
    $.each(call.warnings(), function (index) {
        request = call.warnings()[index];
        if (request.id() == id) {
            returnRequest = request;
            return returnRequest;
        }
    });
    return returnRequest;
}


// Cambiar la clase cuando la Batería es baja
function updateWarning(request) {
    var warning = "<span> <img class='middle' src='/views/app/images/CodigoNaranja.png' width='18' height='18'> SIN REPORTE </span>";
    warning = warning + "<span class='room_turn' data-bind='text: room'>" + request.room +  " </span>";
    warning =  warning + "<span class='bed_turn' data-bind='text: bed'>" + request.bed + "</span>";

    $("#turn_" + request.innerCounter).html(warning);
}


function updateCard(request) {
    $("#turn_" + request.innerCounter + " div.time").html(secondsToHms(request.time));
}


function updateCall(request) {
    // Update
    //$("#turn_" + request.innerCounter + " div .room_turn").html(request.room);
    $("#turn_" + request.innerCounter + " div .bed_turn").html(request.bed);
    //$("#turn_" + request.innerCounter + " div .nurse_turn").html(request.nurse);
//#3E4095, #0099DA, rojo #ED3237
    switch(request.code) // Poner aqui como debe ser la clase segun la prioridad
    {
        case 1:
          var imgR = '<img class="middle" src="/views/app/images/CodigoRojo.png" width="30" height="30">';
          $("#turn_" + request.innerCounter + " div").css("color","#000000");
          //$("#turn_" + request.innerCounter + " div img").attr("src", "/views/app/images/CodigoRojo.png");
          $("#turn_" + request.innerCounter + " .code_turn").html(imgR + " EMERGENCIA");
          $("#turn_" + request.innerCounter + " .code_turn").css("color","#000000");
          break;
        case 3:
          var imgA = '<img class="middle" src="/views/app/images/CodigoAzul.png" width="30" height="30">';
          $("#turn_" + request.innerCounter + " div").css("color","#000000");
          //$("#turn_" + request.innerCounter + " div img").attr("src", "/views/app/images/CodigoAzul.png");
          $("#turn_" + request.innerCounter + " .code_turn").html(imgA + " CÓDIGO AZUL");
          $("#turn_" + request.innerCounter + " .code_turn").css("color","#000000");
          break;
    }
}

var callCodes = [
    "",
    "Llamado de enfermera normal",
    "Cancelación de llamado",
    "Activación de código azul",
    "Reporte de funcionamiento de equipo",
    "Atención del llamado por parte de la enfermera"
];

function incomingServerResponse(response) {
    // llega response leído desde el archivo temporal
    if (response.load == 1) {
        response.load = 0;
        response.innerCounter = 0;
        send = false;
    } else {
        send = false;
    }
    // Si llega con una alarma de

    // Si es el primer response del server, si no es una alarma de voltaje y no es código 2 ni 5.
    if ((currentRequests.length === 0) && (send === false) && (response.voltageAlarm != 1) && (response.code != 2 && response.code != 5)) {
        innerCounter++;
        response.innerCounter = innerCounter;
        if (response.calls === 0) { response.calls++; }
        send = true;
        // si ya hay responses en cola y no es una alarma de voltaje
    } else if ((currentRequests.length > 0) && (response.voltageAlarm != 1)) {
        send = true;
        var isId = 0;
        for (var i = 0; i < currentRequests.length; i++) {

            if ((currentRequests[i].id == response.id) && (response.code != 2 && response.code != 5)) {

                if (response.load === 0) {
                    response.calls = currentRequests[i].calls;
                }
                else {
                    response.calls = currentRequests[i].calls + 1;
                    currentRequests[i].calls+=1;
                }

                currentRequests[i].code = response.code;
                currentRequests[i].bed = response.bed;
                currentRequests[i].nurse = response.nurse;
                currentRequests[i].room = response.room;
                response.innerCounter = currentRequests[i].innerCounter;
                updateCall(response);
                showRequestDetails(currentRequests[i]);
                if (response.code == 1) {
                    changeAudio(NORMAL_CALL_OMG, NORMAL_CALL_MP3);
                } else if (response.code == 3) {
                    changeAudio(CODE_BLUE_OGG, CODE_BLUE_MP3);
                }
                send = false;
                isId = 1;

                break;

            } else if ((currentRequests[i].id == response.id) && (response.code == 2 || response.code == 5)) {
                response.innerCounter = currentRequests[i].innerCounter;
                isId = 1;
                break;
            }

        }

        if (isId === 0 ) {
            innerCounter++;
            response.innerCounter = innerCounter;
            response.calls++;
        }

    } else if ((call.warnings().length === 0) && (send === false) && (response.voltageAlarm == 1)) {
        //response.id = response.id + 'w';
        innerCounter++;
        response.innerCounter = innerCounter;
        send = true;
    } else if ((call.warnings().length > 0) && (response.voltageAlarm == 1)) {
        send = true;
        var isId = 0;
        for (var i = 0; i < call.warnings().length; i++) {

            if ((call.warnings()[i].id() == response.id) && (response.code == -1))  {
                send = false;
                isId = 1;
                break;

            } else if ((call.warnings()[i].id() == response.id) && (response.code == -2)) {
                //response.id = response.id + 'w';
                response.innerCounter = call.warnings()[i].innerCounter();
                isId = 1;
                break;
            }
        }

        if ((isId === 0) && (response.code == -1)) {
            //response.id = response.id + 'w';
            innerCounter++;
            response.innerCounter = innerCounter;
        } else if ((isId === 0) && (response.code == -2)) {
            send = false;
        }

    }


    if ((response.innerCounter !== 0) && (send === true)) {
      switch(response.code) {
      case 1:
        changeAudio(NORMAL_CALL_OMG, NORMAL_CALL_MP3);
        sendNormalServerResponse(response);
        break;
      case 2:
        if (currentRequests.length !== 0){cancelResponse(response);}
        break;
      case 3:
        changeAudio(CODE_BLUE_OGG, CODE_BLUE_MP3);
        sendUrgentResponse(response);
        break;
      case 4:
        saveDeviceAck(response);
        break;
      case 5:
        nurseCallback(response);
        break;
      case -1:
        sendWarningRequest(response);
        //updateWarning(response);
        break;
      case -2:
        if (currentRequests.length !== 0){cancelWarning(response);}


      }
        handleTimer();
    }
}

function changeAudio(ogg, mp3) {
    var audio = $("#player");
    $("#ogg_src").attr("src", ogg);
    $("#mp3_src").attr("src", mp3);
    /****************/
    audio[0].pause();
    audio[0].load(); //suspends and restores all audio element
    audio[0].play();
    /****************/
}


function incomingServerReport(response) {
  //debugger;
  var send = false;
  if ((call.warnings().length === 0) && (send === false)) {
    innerCounter++;
    response.innerCounter = innerCounter;
    send = true;
  } else if ((call.warnings().length > 0)) {
    send = true;
    var isId = 0;
    for (var i = 0; i < call.warnings().length; i++) {

      if ((call.warnings()[i].id() == response.id) && (response.report == -3))  {
        send = false;
        isId = 1;
        break;

      } else if ((call.warnings()[i].id() == response.id) && (response.report == -4)) {
        response.innerCounter = call.warnings()[i].innerCounter();
        isId = 1;
        break;
      }
    }

    if ((isId === 0) && (response.report === -3)) {
      innerCounter++;
      response.innerCounter = innerCounter;
    } else if ((isId === 0) && (response.report === -4)) {
      send = false;
    }

  }

  if ((response.innerCounter !== 0) && (send === true)) {
    switch(response.report) {
    case -3:
      sendWarningRequest(response);
      updateWarning(response);
      break;
    case -4:
      if (call.warnings().length !==0){ cancelWarning(response); }
      break;
    }
  }
}

function toggleVisibility(id) {
    var e = document.getElementById(id);
    if (call.warnings().length === 0) {
      e.style.visibility = 'hidden';
    } else {
      e.style.visibility = 'visible';
    }
}

function showRequestDetails(request) {

    if (call.calls().length === 0) {
        var currentTurn = buildCurrentTurn(request);
        $("#details_column").append(currentTurn);
        return;

    }

    ////Tomar el turno actual
    var firstTurn = $("#calls").children().first();
    var firstTurnId = firstTurn.attr('id');
    request = getResponseByInnerCounter(firstTurnId);

    var firstCard = $("#details_column").first();
    var firstCardId = firstCard.children().attr('id');
    //// Eliminarlo
    $("#" + firstCardId).remove();

    var currentTurn = buildCurrentTurn(request);
    if (request.code != -1 && request.code != -2) {
        $("#details_column").append(currentTurn);
    }
}

function removeResponseDetails(response) {

    if (call.calls().length === 0) {
        firstCard = $("#details_column").first();
        firstCardId = firstCard.children().attr('id');
        ////Eliminarla
        $("#" + firstCardId).remove();
    } else {
        // Busque el request del que esta en la cola actual y pongalo.
        var request = getResponseById(response.id);
        showRequestDetails(request);
    }
}

function updateRequestDetails(request){
    $("#times").html(secondsToHms(request.time));
}

function unshiftNotificationCard(request) {
    //$("#turns_queue").prepend(build_card(request));
    addCall(request);
    var firstCard = $("#calls").children().first();
    firstCard.attr("id", "turn_" + request.innerCounter);
    updateCall(request);
}

function pushNotificationCard(request) {
    addCall(request);
    if (call.warnings().length == 1) {

        $('#marquee').marquee();
    }
    var lastCard = $("#marquee").children().last();
    lastCard.attr("id", "turn_" + request.innerCounter);
    updateCall(request);
    var $ul = $("#report_ad").children().last();
    $ul.marquee("update");
}

function sendNormalServerResponse(request){
    currentRequests.push(request);
    serverResponseReceived(currentRequests);
    unshiftNotificationCard(request);
    setAsFeatured(request);
}

function cancelResponse(request) {
    // Sacarla del array y borrarla
    //debugger;
    var request = getResponseById(request.id);
    if (request !== undefined) {
        removeResponseQue(request);
        eraseCard(request);
        removeServerResponse(request);
        removeResponseDetails(request);
    }
}

function cancelWarning(response) {
    // Sacarla del array y borrarla
    //debugger;
    var currentResponse = getWarningById(response.id);
    if (currentResponse !== undefined) {
        //removeResponseQue(currentResponse);
        removeWarningQue(currentResponse);
        //removeServerResponse(currentResponse);
        //removeResponseDetails(currentResponse);
        toggleVisibility('report_ad');
    }
}

function sendUrgentResponse(request){
    currentRequests.push(request);
    serverResponseReceived(currentRequests);
    unshiftNotificationCard(request);
    setAsFeatured(request);
}

function sendWarningRequest(request) {
    //currentRequests.push(request);
    pushNotificationCard(request);
    toggleVisibility('report_ad');
}


function saveDeviceAck(request) {
    //Salvar en donde? el reconocimiento de equipo
}

function nurseCallback(request) {
    //Cancelar request y guardar en db tiempo de respuesta
    cancelResponse(request);
    //salvar en db aqui
}

function removeResponseQue(request) {
    var indexOf = -1;
    if (request !== undefined) {
        $.each(currentRequests, function (index) {
            if (currentRequests[index].id == request.id) {
                indexOf = index;
            }
        });
        currentRequests.splice(indexOf,1); // Borra 1 elemento en la posición indexOf
        //innerCounter--; // reduce el contador interno de cada llamado.
    }
}

function removeWarningQue(request) {
    var indexOf = -1;
    if (request !== undefined) {
        $.each(call.warnings(), function (index) {
            if (call.warnings()[index].id() == request.id()) {
                indexOf = index;
            }
        });
        call.warnings.splice(indexOf,1); // Borra 1 elemento en la posición indexOf
        //innerCounter--; // reduce el contador interno de cada llamado.
    }
}

function eraseCard(request) {
    var indexOf = -1;
    if (request !== undefined) {
        if (request.code != -2) {
            $.each(call.calls(), function (index) {
                if (call.calls()[index].id() == request.id) {
                    indexOf = index;
                }
            });
            call.calls.splice(indexOf, 1); // Borra 1 elemento en la posición indexOf
        }
    }
}

function eraseWarning(request) {
    var indexOf = -1;
    if (request !== undefined) {
        $.each(call.warnings(), function (index) {
            if (call.warnings()[index].id() == request.id) {
                indexOf = index;
            }
        });
        call.warnings.splice(indexOf, 1); // Borra 1 elemento en la posición indexOf
    }
}


//Pone el request como visto en detalles
function setAsFeatured(request) {
    $.each(currentRequests, function (index) {
        _request = currentRequests[index];
        if (request.innerCounter == _request.innerCounter) {
            request.featured = true;
            updateRequestDetails(request);
            showRequestDetails(request);

        } else {
            request.featured = false;
        }
    });
}

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h>0) ? h + ":" : "") + ((m<10) ? "0"+m : m) +":"+ ((s<10) ? "0"+s : s);
}
