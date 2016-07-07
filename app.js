/*

  GE XLP Tuesday

  (c) Decoded 2016

*/

// Which Edge Device and sensor are we reading?
var device = 'xlp-trainer-01';
var desiredSensor = 'RotaryAngle';

// The gateway uses Stomp for websocket streams
var gateway = 'https://predix-isk-gateway-iskdev.run.aws-usw02-pr.ice.predix.io/stomp',
  topic     = '/topic/' + device,
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
  alert('Websocket connection failed. Try reloading the page.');
});

// Process incoming data
function processStream(payload) {
  // get array of sensors from gateway
  var data = JSON.parse(payload.body).body;
  // gateway returns arrays of 5 sensors at a time
  data.forEach(function (sensor) {
    var deviceName = sensor.name;
    var timestamp = sensor.datapoints[0][0];
    var value = sensor.datapoints[0][1];
    var re = new RegExp(`-${device}$`);

    //console.log(Date(timestamp), `${deviceName}: ${value}`);

    // only match on required sensor
    if (re.test(deviceName)) {
      var sensorName = deviceName.replace(re, '');
      /*switch (sensorName) {
        case 'Light':
          sensorSets[0].append(Date(timestamp), value);
          break;
        case 'Temperature':
          sensorSets[1].append(Date(timestamp), value);
          break;
        case 'Humidity':
          sensorSets[2].append(Date(timestamp), value);
          break;
        case 'RotaryAngle':
          sensorSets[3].append(Date(timestamp), value);
          break;
        case 'Button':
          sensorSets[4].append(Date(timestamp), value);
          break;
      } // end switch on sensor type*/
      if (sensorName == desiredSensor) {
        myChart.push([{time: timestamp/100, y: value}]);
        console.log(Date(timestamp), `${sensorName}: ${value}`);
      }
    } //
  });
}

var myChart = $('#myChart').epoch({
  type: 'time.line',
  data: [{
    label: 'Rotary',
    values:[]
  }],
  margins: {right: 30, left: 10},
  ticks: {time: 5},
  range: [0, 300],
  axes: ['bottom', 'right', 'left']
});