/**
 * Created by anhtuan on 6/21/16.
 */
var Application = angular.module('Application', [
  'ngStomp'
]);

Application.controller('MainCtrl', ['$scope', '$rootScope', '$stomp', function($scope, $rootScope, $stomp) {
  //var BACKEND_URL = 'https://sample-gateway.run.aws-usw02-pr.ice.predix.io/stomp',
  var BACKEND_URL = 'https://predix-isk-gateway-iskdev.run.aws-usw02-pr.ice.predix.io/stomp',
      TOPIC       = '/topic/timeseries';

  var chart;

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
          if (payload.name == "Light-xlp-trainer-02") {

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

}]);
