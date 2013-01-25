fs = require 'fs'
{iRacing} = require 'iracing'

handler = (req, res) ->
  fs.readFile "#{__dirname}/index.html", (err, data) ->
    if err
      res.writeHead 500
      return res.end "Error loading index.html"

    res.writeHead 200
    res.end data

app = require('http').createServer(handler)
io = require('socket.io').listen(app)

app.listen(80)

telemetryProp = {}
telemetryData = {}

io.sockets.on 'connection', (socket) ->
  iRacing.ready ->
    socket.emit 'session', this.getSession()
    socket.on 'addTelemetry', (data) -> 
      telemetryProp[data.name] = data.onChange;

    socket.on 'removeTelemetry', (data) ->
      delete telemetryProp[data]

    @onTick ->
      for own prop, onChange of telemetryProp
        newVal = @getTelemetry(prop)
        
        continue if onChange and newVal is telemetryData[prop]
        telemetryData[prop] = newVal

        socket.emit 'telemetry',
          name: prop
          value: newVal