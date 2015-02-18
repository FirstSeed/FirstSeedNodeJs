// Use knockoutjs for ModelViewViewModel

/* global ko:true */

var ko = ko; 

var Equipment = function(response) {
    var self = this;

    self.id = ko.observable(response.id);
    self.innerCounter = ko.observable(response.innerCounter);
    self.area = ko.observable(response.area);
    self.bed = ko.observable(response.bed);
    self.room = ko.observable(response.room);
    
    self.nurse = ko.observable(response.nurse);
    self.time = ko.observable(response.time);
    self.featured = ko.observable(response.featured);
    self.calls = ko.observable(response.calls);
    
    self.code = ko.observable(response.code);
    self.voltage = ko.observable(response.voltage); // menos de 200 envía una alerta.
};


var Call = function () {
    var self = this;

    self.calls = ko.observableArray([]);
    self.warnings = ko.observableArray([]);
};

