/*

  GE XLP Tuesday

  (c) Decoded 2016

*/

// Which Edge Device are we reading?
var device = 'xlp-68';
var charts = {};

// Define sensor data
// min/max correspond to sensor ranges
// color corresponds to d3 categorical color
var sensors = {
  'Button' : { 'min': 0, 'max': 1, 'color': 'category1' },
  'Light' : { 'min': 0, 'max': 1024, 'color': 'category2' },
  'RotaryAngle' : { 'min': 0, 'max': 300, 'color': 'category3' },
  'Temperature' : { 'min': 0, 'max': 80, 'color': 'category4' }, // in degrees C
  'Humidity' : { 'min': 0, 'max': 100, 'color': 'category5' },
};

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
  // Get array of sensors from gateway
  var data = JSON.parse(payload.body).body;

  // Gateway returns arrays of 5 sensors at a time
  data.forEach(function (sensor) {
    var timestamp = sensor.datapoints[0][0];
    var value = sensor.datapoints[0][1];
    var re = new RegExp(`-${device}$`);
    var sensorName = sensor.name.replace(re,'');

    console.log(Date(timestamp), `${sensorName}: ${value}`);

    charts[sensorName].push([{time: timestamp/1000, y: value}]);
  });

}

// Initialize charts
for (var sensor in sensors) {
  charts[sensor] = $(`#${sensor}`).epoch({
    type: 'time.line',
    data: [{
      label: sensor,
      values: []
    }],
    margins: {right: 30, left: 30, bottom: 20, top: 20},
    ticks: {time: 5},
    range: [sensors[sensor].min, sensors[sensor].max],
    axes: ['bottom', 'left', 'right']
  });

  // switch to correct d3 color
  charts[sensor].getVisibleLayers()[0].className =
    charts[sensor].getVisibleLayers()[0].className.replace('category1', sensors[sensor].color);

}

/* Debugging functions */

function generateFakeData(sensor) {
  return [{
    time: Date.now()/1000,
    y: sensors[sensor].min + (Math.random() * sensors[sensor].max) }];
}

/*setInterval(function() {
  for (var sensor in sensors) {
    charts[sensor].push(generateFakeData(sensor));
  }
}, 2000);*/