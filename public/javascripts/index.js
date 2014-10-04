$(document).ready(function () {
  var socket = io.connect('/');
  var driver = null;
  var telemetryCallbacks = {
    Gear: updateGear,
    RPM: updateRPM,
    Speed: updateSpeed,
    Throttle: updatePedal,
    Brake: updatePedal,
    Clutch: updatePedal,
    LapBestLapTime: updateTime,
    LapLastLapTime: updateTime
  };

  var $gearStages = $("#GearStages");

  socket.on('ready', function () {
    socket.emit('addTelemetry', {name: 'Gear', onChange: true});
    socket.emit('addTelemetry', {name: 'Throttle', onChange: true});
    socket.emit('addTelemetry', {name: 'Brake', onChange: true});
    socket.emit('addTelemetry', {name: 'Clutch', onChange: true});
    socket.emit('addTelemetry', {name: 'RPM', onChange: true});
    socket.emit('addTelemetry', {name: 'Speed', onChange: true});
    socket.emit('addTelemetry', {name: 'Lap', onChange: true});
    socket.emit('addTelemetry', {name: 'LapBestLapTime', onChange: true});
    socket.emit('addTelemetry', {name: 'LapLastLapTime', onChange: true});

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

  function updateSpeed(data) {
    //convert m/s to mph
    data.value = Math.round(data.value * 2.236936292);
    updateTelemetry(data);
  }

  function updatePedal(data) {
    var percentage = Math.round(data.value * 100);
    if(data.name == "Clutch") {
      percentage = 100 - percentage;
    }
    $('#' + data.name).css('width', percentage + "%");
    updateTelemetry(data);
  }

  function roundTelemetry(data) {
    data.value = Math.round(data.value);
    updateTelemetry(data);
  }

  function updateGear(data) {
    if (data.value == -1) {
      data.value = "R";
    }
    else if (data.value == 0) {
      data.value = "N";
    }

    updateTelemetry(data);
  }

  function updateTime(data) {
    var mins = Math.floor(data.value / 60);
    var seconds = (data.value % 60).toFixed(3)
    if (seconds < 10)
      seconds = "0"+seconds;
    data.value = mins + ":" + seconds;
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
