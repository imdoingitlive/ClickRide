function MainController($scope, $location, $http) {
  $scope.products = [];

  $scope.selectProduct = function(index) {
    $scope.selectedProduct = $scope.products[index];
  };

  function getProducts() {
    if (!$scope.user.uber.token) {
      return;
    }

    $http.get('/products', {
      params: {
        lat: $scope.start_latitude,
        lng: $scope.start_longitude
      },
      headers: {
        Authorization: 'Bearer ' + $scope.user.uber.token,
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
    L.mapbox.accessToken = 'pk.eyJ1IjoiaW1kb2luZ2l0bGl2ZSIsImEiOiJjaXVkZndncHYwMGF5MnpydTV2dDduOWNsIn0.9TKWFzpnaB-rbAlBCutYBg';

    var mamouns = [40.497979, -74.449074];
    var atrium = [40.535383,-74.520848];

    var MAP = L.mapbox
      .map('map', 'mapbox.streets')
      .setView(mamouns, 13)
      .addControl(L.mapbox.geocoderControl('mapbox.places', {}));

    var pickup = L.marker(atrium, {
      icon: L.mapbox.marker.icon({
        'marker-color': '#49A86C'
      }),
      title: 'pickup',
      opacity: 0.8,
      draggable: true
    }).addTo(MAP);

    var dropoff = L.marker(mamouns, {
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

  $scope.$watchGroup(['user.uber.token', 'start_latitude', 'start_longitude'], getProducts);
}

angular
.module('click-ride', []);

angular
.module('click-ride')
.controller('MainController', MainController);