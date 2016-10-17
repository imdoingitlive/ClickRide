function MainController($scope, $location, $http) {
  $scope.products = [];

  $scope.selectProduct = function(index) {
    $scope.selectedProduct = $scope.products[index];
  };

  function getProducts() {
    if (!$scope.TOKEN) {
      return;
    }

    $http.get('/products', {
      params: {
        lat: $scope.start_latitude,
        lng: $scope.start_longitude
      },
      headers: {
        Authorization: 'Bearer ' + $scope.TOKEN,
      }
    })
    .success(function(data) {
      $scope.products = data.products;
      if ($scope.products.length > 0) {
        $scope.selectedProduct = $scope.products[0];
      }
      console.log('products:', data);
    })
    .error(function(error) {
      console.error(error);
    });
  };

  function init() {
    L.mapbox.accessToken = 'pk.eyJ1IjoiZ2VvZmZyZXl0aXNzZXJhbmQiLCJhIjoiY2lmbHF0d2twMncwMXM2a3F1ODRraGdxaiJ9.wJk9as6xGHfCis8dyZQ2PA';

    var uberHQ = [37.775718, -122.418077];
    var lyftHQ = [37.7603392,-122.4148612];

    var MAP = L.mapbox
      .map('map', 'mapbox.streets')
      .setView(uberHQ, 13)
      .addControl(L.mapbox.geocoderControl('mapbox.places', {}));

    var pickup = L.marker(lyftHQ, {
      icon: L.mapbox.marker.icon({
        'marker-color': '#49A86C'
      }),
      title: 'pickup',
      opacity: 0.8,
      draggable: true
    }).addTo(MAP);

    var dropoff = L.marker(uberHQ, {
      icon: L.mapbox.marker.icon({
        'marker-color': '#F8322F'
      }),
      title: 'dropoff',
      opacity: 0.8,
      draggable: true
    }).addTo(MAP);


    pickup.on('dragend', setPickup);
    dropoff.on('dragend', setDropoff);

    function setPickup() {
      var m = pickup.getLatLng();
      $scope.start_latitude = m.lat;
      $scope.start_longitude = m.lng;
    }

    function setDropoff() {
      var m = dropoff.getLatLng();
      $scope.end_latitude = m.lat;
      $scope.end_longitude = m.lng;
    }

    setPickup();
    setDropoff();
  }

  init();

  $scope.$watchGroup(['TOKEN', 'start_latitude', 'start_longitude'], getProducts);
}

angular
.module('uber-dash', []);

angular
.module('uber-dash')
.controller('MainController', MainController);