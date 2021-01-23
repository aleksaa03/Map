navigator.geolocation.getCurrentPosition(user, error);
var date = new Date();
var settingsCog = document.getElementById("settings");

function user(position) {
  var lat = position.coords.latitude;
  var log = position.coords.longitude;

  map(lat, log);
}

function error(error) {
  console.log(error);
  map(43.32472, 21.90333);
}

class PitchToggle {
  constructor({ bearing = -20, pitch = 70, minpitchzoom = null }) {
    this._bearing = bearing;
    this._pitch = pitch;
    this._minpitchzoom = minpitchzoom;
  }

  onAdd(map) {
    this._map = map;
    let _this = this;

    this._btn = document.createElement("button");
    this._btn.className = "mapboxgl-ctrl-icon mapboxgl-ctrl-pitchtoggle-3d";
    this._btn.type = "button";
    this._btn["aria-label"] = "Toggle Pitch";
    this._btn.onclick = function () {
      if (map.getPitch() === 0) {
        let options = { pitch: _this._pitch, bearing: _this._bearing };
        if (_this._minpitchzoom && map.getZoom() > _this._minpitchzoom) {
          options.zoom = _this._minpitchzoom;
        }
        map.easeTo(options);
        _this._btn.className = "mapboxgl-ctrl-icon mapboxgl-ctrl-pitchtoggle-2d";
      } else {
        map.easeTo({ pitch: 0, bearing: 0 });
        _this._btn.className = "mapboxgl-ctrl-icon mapboxgl-ctrl-pitchtoggle-3d";
      }
    };

    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    this._container.appendChild(this._btn);

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

function map(lat, log) {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiYWxla3NhYTAzIiwiYSI6ImNraTIzbTVyajFzemIycW1wdmg5MWwyemsifQ.Vd0mlLv52unTxAxZVWSe0Q";
  var map = new mapboxgl.Map({
    center: [log, lat],
    zoom: 12,
    container: "map",
    pitch: 0,
  });
  map.addControl(new mapboxgl.NavigationControl());
  map.addControl(new PitchToggle({ minpitchzoom: 20 }));

  var directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    unit: "metric",
  });

  map.addControl(directions, "top-left");

  map.on("load", function () {
    var layers = map.getStyle().layers;

    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
        labelLayerId = layers[i].id;
        break;
      }
    }

    map.addLayer(
      {
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#aaa",
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "height"],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "min_height"],
          ],
          "fill-extrusion-opacity": 0.6,
        },
      },
      labelLayerId
    );
  });

  var hour = date.getHours();
  if (hour < 21 && hour > 5) {
    map.setStyle("mapbox://styles/mapbox/streets-v11");
  } else {
    map.setStyle("mapbox://styles/mapbox/dark-v10");
  }
}

var speedOutput = document.querySelectorAll(".speed");
var weatherOutput = document.querySelectorAll(".weather");

function details() {
  navigator.geolocation.watchPosition((data) => {
    var apiKey = "2b6b6d69f68b80375d0a535e5e7f6ffb";
    for (var i = 0; i < speedOutput.length; i++) {
      speedOutput[i].innerHTML = Math.floor(data.coords.speed * 3.6);
    }
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${data.coords.latitude}&lon=${data.coords.longitude}&appid=${apiKey}`
    )
      .then((response) => response.json())
      .then((data) => weather(data));
  });
}

details();

function weather(data) {
  var temp = data.main.temp;
  for (var i = 0; i < weatherOutput.length; i++) {
    weatherOutput[i].innerHTML = Math.floor(temp - 273.15);
  }
}

var outputWeek = document.querySelectorAll(".week");
var outputDay = document.querySelectorAll(".day");

function mapDate() {
  var day = date.getDate();
  var week = date.getDay();

  switch (week) {
    case 0:
      week = "Sunday";
      break;
    case 1:
      week = "Monday";
      break;
    case 2:
      week = "Tuesday";
      break;
    case 3:
      week = "Wednesday";
      break;
    case 4:
      week = "Thursday";
      break;
    case 5:
      week = "Friday";
      break;
    case 6:
      week = "Saturday";
      break;
  }

  for (var i = 0; i < outputWeek.length; i++) {
    outputWeek[i].innerHTML = week;
    outputDay[i].innerHTML = day;
  }
}

setInterval(mapDate);

var settingsDiv = document.getElementById("settingsDiv");
var radioButton = document.querySelectorAll(".radio");

var dateDiv = document.getElementById("date");
var split = document.getElementById("split");

var connect = document.getElementById("connect");

radioButton[0].checked = true;

function settings(setting) {
  if (setting == "open") {
    settingsDiv.style.display = "block";
    settingsCog.style.animation = "rotate 5s linear infinite";
  } else {
    settingsDiv.style.display = "none";
    settingsCog.style.animation = "";
  }
}

setInterval(function () {
  if (radioButton[0].checked) {
    show(0);
    localStorage.setItem("design", 0);
  }
  if (radioButton[1].checked) {
    show(1);
    localStorage.setItem("design", 1);
  }
});

function show(num) {
  if (num == 0) {
    split.style.display = "flex";
    dateDiv.style.display = "block";
    connect.style.display = "none";
  } else {
    split.style.display = "none";
    dateDiv.style.display = "none";
    connect.style.display = "flex";
  }
}

var savedDesign = JSON.parse(localStorage.getItem("design"));

if (savedDesign != null) {
  radioButton[savedDesign].checked = true;
} else {
  radioButton[0].checked = true;
}
