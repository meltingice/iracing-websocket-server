$(document).ready(function () {
  var socket = io.connect('/');
  var driver = null;
  var telemetryCallbacks = {
    Gear: updateGear,
    RPM: updateRPM,
    Speed: roundTelemetry
  };

  var $gearStages = $("#GearStages");

  socket.on('ready', function () {
    socket.emit('addTelemetry', {name: 'Gear', onChange: true});
    socket.emit('addTelemetry', {name: 'Throttle', onChange: true});
    socket.emit('addTelemetry', {name: 'Brake', onChange: true});
    socket.emit('addTelemetry', {name: 'Clutch', onChange: true});
    socket.emit('addTelemetry', {name: 'RPM', onChange: true});
    socket.emit('addTelemetry', {name: 'Speed', onChange: true});

    socket.on('telemetry', function (data) {
      if (telemetryCallbacks[data.name]) {
        telemetryCallbacks[data.name](data);
      } else {
        updateTelemetry(data);
      }
    });
  });

  socket.on('driver', function (data) {
    driver = data;

  });

  socket.on('weekend', function (data) {
    $("#Track").html(data.TrackDisplayName);
  });

  function updateTelemetry(data) {
    $("[data-telemetry='" + data.name + "']").html(data.value);
  }

  function roundTelemetry(data) {
    data.value = Math.round(data.value);
    updateTelemetry(data);
  }

  function updateGear(data) {
    if (data.value == -1) {
      data.value = "R";
    }

    updateTelemetry(data);
  }

  function updateRPM(data) {
    roundTelemetry(data);

    if (data.value < driver.DriverCarSLFirstRPM) {
      return $gearStages.attr('data-active', 0);
    }

    if (data.value < (driver.DriverCarSLLastRPM - (driver.DriverCarSLLastRPM - driver.DriverCarSLFirstRPM) * 0.8)) {
      return $gearStages.attr('data-active', 1);
    }
    if (data.value < (driver.DriverCarSLLastRPM - (driver.DriverCarSLLastRPM - driver.DriverCarSLFirstRPM) * 0.6)) {
      return $gearStages.attr('data-active', 2);
    }
    if (data.value < (driver.DriverCarSLLastRPM - (driver.DriverCarSLLastRPM - driver.DriverCarSLFirstRPM) * 0.4)) {
      return $gearStages.attr('data-active', 3);
    }
    if (data.value < (driver.DriverCarSLLastRPM - (driver.DriverCarSLLastRPM - driver.DriverCarSLFirstRPM) * 0.2)) {
      return $gearStages.attr('data-active', 4);
    }

    return $gearStages.attr('data-active', 5);
  }
});
