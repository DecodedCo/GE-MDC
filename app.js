/*

  GE XLP Tuesday

  (c) Decoded 2016

*/

// The gateway uses Stomp for websocket streams
var gateway = 'https://predix-isk-gateway-iskdev.run.aws-usw02-pr.ice.predix.io/stomp',
  topic     = '/topic/timeseries',
  ws = new SockJS(gateway),
  client = Stomp.over(ws);

// Verbose debugging off
client.debug = null;

var headers = {
  'reconnection': true,
  'reconnectionDelay': 1000,
  'reconnectionDelayMax': 5000,
  'forceNew': true
};

// Connect to the gateway
client.connect(headers, function() {
  console.log(`Connected to ${gateway}`);
  client.subscribe(topic, processStream);
}, function() {
  alert("Websocket connection failed :(");
});

// Process incoming data
function processStream(payload) {
  // get array of sensors from gateway
  var data = JSON.parse(payload.body).body;
  // gateway returns arrays of 4 sensors at a time
  data.forEach(function (sensor) {
    var deviceName = sensor.name;
    var timestamp = sensor.datapoints[0][0];
    var value = sensor.datapoints[0][1];
    var device = "xlp-trainer-01";
    var re = new RegExp("-" + device + "$");

    // only match on required sensor
    if (re.test(deviceName)) {
      var sensorName = deviceName.replace(re, "");
      console.log("%s %s", new Date(timestamp), sensorName + ": " + value);
      switch (sensorName) {
        case "Light":
          sensorSets[0].append(Date(timestamp), value);
          break;
/*        case "Temperature":
          sensorSets[1].append(Date(timestamp), value);
          break;
        case "Humidity":
          sensorSets[2].append(Date(timestamp), value);
          break;
        case "RotaryAngle":
          sensorSets[3].append(Date(timestamp), value);
          break;
        case "Button":
          sensorSets[4].append(Date(timestamp), value);
          break;
          */
      } // end switch on sensor type

    } //

  });
}

var seriesOptions = [
  { strokeStyle: 'rgba(255, 0, 0, 1)', fillStyle: 'rgba(255, 0, 0, 0.1)', lineWidth: 3 }];
  /*,
  { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.1)', lineWidth: 3 },
  { strokeStyle: 'rgba(0, 0, 255, 1)', fillStyle: 'rgba(0, 0, 255, 0.1)', lineWidth: 3 },
  { strokeStyle: 'rgba(255, 255, 0, 1)', fillStyle: 'rgba(255, 255, 0, 0.1)', lineWidth: 3 },
  { strokeStyle: 'rgba(255, 255, 255, 1)', fillStyle: 'rgba(255, 255, 255, 0.1)', lineWidth: 3 }
];*/

// Initialize an empty TimeSeries for each CPU.
//var sensorSets = [new TimeSeries(), new TimeSeries(), new TimeSeries(), new TimeSeries(), new TimeSeries()]; // 5 sensors
var sensorSets = [new TimeSeries()]; // 5 sensors


// Build the timeline
var timeline = new SmoothieChart({ millisPerPixel: 20, grid: { strokeStyle: '#555555', lineWidth: 1, millisPerLine: 1000, verticalSections: 4 }});

for (var i = 0; i < sensorSets.length; i++) {
  timeline.addTimeSeries(sensorSets[i], seriesOptions[i]);
}

timeline.streamTo(document.getElementById("sensors"), 10000);

//var chart;

/*
var connectToWS = function() {
  var promise = $stomp.connect(BACKEND_URL, {
    'reconnection': true,
    'reconnectionDelay': 1000,
    'reconnectionDelayMax': 5000,
    'forceNew': true
  });
  promise.then(function() {
    $stomp.subscribe(TOPIC, function(payload) {
      payload = payload.body;
      payload.forEach(function(payload) {
        //console.log(payload.name);
        if (payload.name == "RotaryAngle-xlp-trainer-01") {

          var latestDataPoint = payload.datapoints[payload.datapoints.length - 1];
          var time  = latestDataPoint[0],
              value = latestDataPoint[1];
          console.log("%s %s", new Date(time), value);
          chart = chart || $('#chart').epoch({
              type: 'time.line',
              data: [
                {
                  label: 'Sensor',
                  values: [{time: time / 1000, y: value}]
                }
              ],
              margins: {right: 30, left: 10},
              ticks: {time: 5},
              range: [0, 1024],
              axes: ['bottom', 'right', 'left']
            });

          chart.push([{
            time: time / 1000,
            y: value
          }]);
        } // end device filter
      });

    });

  });
  //reconnect
  $stomp.sock.onclose = connectToWS;
};
connectToWS();
*/