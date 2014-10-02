
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var iRacing = require('iracing').iRacing;
var io = require('socket.io').listen(server);

var __hasProp = {}.hasOwnProperty;
var telemetryProp = {};
var telemetryData = {};

io.sockets.on('connection', function(socket) {
  return iRacing.ready(function() {
    socket.on('addTelemetry', function(data) {
      console.log("Adding telemetry:", data);
      telemetryProp[data.name] = data.onChange;
    });

    socket.on('removeTelemetry', function(data) {
      console.log("Removing telemetry:", data);
      return delete telemetryProp[data];
    });

    socket.emit('ready', true);
    socket.emit('weekend', this.sessions.weekend);
    socket.emit('session', this.sessions.current);
    socket.emit('driver', this.cars.driverCar);

    return this.onTick(function() {
      var newVal, onChange, prop, _results;

      for (prop in telemetryProp) {
        if (!__hasProp.call(telemetryProp, prop)) continue;

        onChange = telemetryProp[prop];
        newVal = this.getTelemetry(prop);

        if (onChange && newVal === telemetryData[prop]) {
          continue;
        }

        telemetryData[prop] = newVal;
        socket.volatile.emit('telemetry', {
          name: prop,
          value: newVal
        });
      }
    });
  });
});
