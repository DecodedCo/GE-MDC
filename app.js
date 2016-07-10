/*

  GE XLP Tuesday

  (c) Decoded 2016

*/

// Which Edge Device and sensor are we reading?
var device = 'xlp-trainer-01';
var desiredSensor = $('select option:selected').val();
var myChart;

// Define sensor data
// min/max correspond to sensor ranges
var sensors = {
  'Button' : { 'min': 0, 'max': 1 },
  'Light' : { 'min': 0, 'max': 1024 },
  'RotaryAngle' : { 'min': 0, 'max': 300 },
  'Temperature' : { 'min': 0, 'max': 80 }, // in degrees C
  'Humidity' : { 'min': 0, 'max': 100 },
};

// Create index for sensor data
// Sensor order varies per websocket connection
// We need it to be consistent for viz
var indexes = Array();

for (sensor in sensors) {
  indexes.push(sensor);
}

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
  var packet = Array();

  // Gateway returns arrays of 5 sensors at a time
  // Make sure they are ordered as per the initialization object
  data.forEach(function (sensor) {
    var timestamp = sensor.datapoints[0][0];
    var value = sensor.datapoints[0][1];
    var re = new RegExp(`-${device}$`);
    var sensorName = sensor.name.replace(re,'');
    var index = indexes.indexOf(sensorName);

    console.log(Date(timestamp), `${sensorName}: ${value}`);

    packet[index] = {time: timestamp/1000, y: value};
  });

  myChart.push(packet);

}

// Initial render of chart
var data=Array();
for (var sensor in indexes) {
  data.push({
    label: indexes[sensor],
    values:[] // blank starting point
  });
}

myChart = $('#myChart').epoch({
  type: 'time.line',
  data: data,
  margins: {right: 30, left: 30, bottom: 20, top: 20},
  ticks: {time: 5},
  range: [sensors[desiredSensor].min, sensors[desiredSensor].max],
  axes: ['bottom', 'left', 'right']
});

// Hide unwanted sensors for single sensor view
for (var sensor in sensors) {
  if (sensor !== desiredSensor)
    myChart.hideLayer(sensor);
}

// When new sensor is selected, hide current and show new
$("select").change(function() {
  currentSensor=desiredSensor;
  desiredSensor=$('select option:selected').val();
  console.log(`Switching from ${currentSensor} to ${desiredSensor}`)
  myChart.option('range', [sensors[desiredSensor].min, sensors[desiredSensor].max]);
  myChart.hideLayer(currentSensor);
  myChart.showLayer(desiredSensor);
});

/* Debugging functions */

function generateFakeData() {
  var packet = Array();

  for (var sensor in indexes) {
    packet.push({
      time: Date.now()/1000,
      y: sensors[indexes[sensor]].min + (Math.random() * sensors[indexes[sensor]].max)
    });
  }
  return packet;
}

//setInterval(function() { myChart.push(generateFakeData()); }, 1000);