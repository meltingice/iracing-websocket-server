(function () {
  var socket = io.connect('/');
  socket.on('session', function (data) {
    $("#Track").html(data.WeekendInfo.TrackDisplayName);

    var telemetry = {};

    socket.emit('addTelemetry', {name: 'Gear', onChange: true});
    socket.emit('addTelemetry', {name: 'Throttle', onChange: true});
    socket.emit('addTelemetry', {name: 'Brake', onChange: true});
    socket.emit('addTelemetry', {name: 'Clutch', onChange: true});

    socket.on('telemetry', function (data) {
      if (data.name === "Gear") {
        $("#Gear").html(data.value);
      } else {
        $("#" + data.name)
          .find('> div')
          .css('width', (data.value * 100) + "%");
      }
    });
  });
}());
