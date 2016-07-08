/*

  GE XLP Tuesday

  (c) Decoded 2016

*/

// Which Edge Device and sensor are we reading?
var device = 'xlp-trainer-02';
var desiredSensor = $('select option:selected').val();
var myChart;

// Define sensor ranges. These must be listed in order received from gateway
// as epoch receives data as arrays
var sensorConfig = {
  'Button': {
    label: 'Button',
    min: 0,
    max: 1.2
  },
  'Light': {
    label: 'Light',
    min: 0,
    max: 1024
  },
  'RotaryAngle': {
    label: 'RotaryAngle',
    min: 0,
    max: 300
  },
  'Temperature': {
    label: 'Temperature',
    min: 0,
    max: 50
  },
  'Humidity': {
    label: 'Humidity',
    min: 0,
    max: 100
  }
}

// The gateway uses Stomp for websocket streams
var gateway = 'https://predix-isk-gateway-iskdev.run.aws-usw02-pr.ice.predix.io/stomp',
//var gateway = 'https://predix-isk-gateway-allen.run.aws-usw02-pr.ice.predix.io/stomp',
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
  data.forEach(function (sensor) {
    var timestamp = sensor.datapoints[0][0];
    var value = sensor.datapoints[0][1];
    var re = new RegExp(`-${device}$`);
    var sensorName = sensor.name.replace(re,'');
    console.log(Date(timestamp), `${sensorName}: ${value}`);
    packet.push({time: timestamp/1000, y: value});
  });

  myChart.push(packet);

}

// Initial render of chart
var data=Array();
for (var sensor in sensorConfig) {
  data.push({
    label: sensorConfig[sensor].label,
    values:[]
  });
}

myChart = $('#myChart').epoch({
  type: 'time.line',
  data: data,
  margins: {right: 30, left: 30, bottom: 20, top: 20},
  ticks: {time: 5},
  range: [sensorConfig[desiredSensor].min, sensorConfig[desiredSensor].max],
  axes: ['bottom', 'left', 'right']
});

// Hide unwanted sensors
for (var sensor in sensorConfig) {
  if (sensor !== desiredSensor)
    myChart.hideLayer(sensor);
}

// When new sensor is selected...
$("select").change(function() {
  currentSensor=desiredSensor;
  desiredSensor=$('select option:selected').val();
  console.log(`Switching to ${desiredSensor} from ${currentSensor}`)
  myChart.option('range', [sensorConfig[desiredSensor].min, sensorConfig[desiredSensor].max]);
  myChart.hideLayer(currentSensor);
  myChart.showLayer(desiredSensor);
});
