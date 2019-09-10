function initMap() {
  var position = new google.maps.LatLng(59.93650000, 30.32106467);
  var mapParams = {
    zoom: 16,
    center: position,
    disableDefaultUI: true,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_CENTER
    },
    scrollwheel: false
  };
  map = new google.maps.Map(document.getElementById("map"), mapParams);
  new google.maps.Marker({
    position: {
      lat: 59.93630000,
      lng: 30.32106467
    },
    map: map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 13,
      fillOpacity: 100,
      fillColor: "#d22856",
      strokeWeight: 10,
      strokeColor: "white"
    }
  });
  google.maps.event.addDomListener(window, "resize", function () {
    var e = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(e)
  });
}


function initMap1() {
  var position = {
    lat: 59.9387942,
    lng: 30.3230833
  };
  var center = {
    lat: 59.939794,
    lng: 30.3230833
  };
  var centerParameters = {
    zoom: 15,
    center: center
  };
  var map = new google.maps.Map(document.getElementById("map"), centerParameters);
  var icon = {
    url: "img/icon-map-marker.svg",
    size: new google.maps.Size(100, 100),
    scaledSize: new google.maps.Size(35, 35),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(20, 20),
    optimized: false,
    zIndex: 1
  };
  var marker = new google.maps.Marker({
    position: position,
    map: map,
    icon: icon,
    title: "HTML Academy"
  });
  google.maps.event.addDomListener(window, "resize", function () {
    var e = map.getCenter();
    google.maps.event.trigger(map, "resize"),
      map.setCenter(e)
  });
  marker.setMap(map)
}
