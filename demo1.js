navigator.geolocation.getCurrentPosition(function (position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  var map = L.map("map").setView([lat, lon], 12);

  // Add base layers
  var baseLayers = {
    OpenStreetMap: L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {}
    ),
    Satellite: L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {}
    ),
    Biking: L.tileLayer(
      "https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=78ddd35bda4b4580a5f1a9cb613416b2",
      {}
    ),
    "Public Transport": L.tileLayer(
      "https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=78ddd35bda4b4580a5f1a9cb613416b2",
      {}
    ),
  };

  // Add map layers to the map
  L.control.layers(baseLayers).addTo(map);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(
    map
  );
  L.marker([lat, lon]).addTo(map);

  let art;
  fetch("Artisans1.geojson")
    .then((response) => response.json())
    .then((data) => {
      art = data;
    });

  let buy;
  fetch("Buyers.geojson")
    .then((response) => response.json())
    .then((data) => {
      buy = data;
    });

  let currentCircle;
  let artisansLayer;
  let buyersLayer;
  let markerCount = 0;
  let selectedType = "";
  let selectedRadius = 0;

  function drawCircle(radius, zoomlevel) {
    if (currentCircle) {
      map.removeLayer(currentCircle);
    }
    map.setView([lat, lon], zoomlevel);
    currentCircle = L.circle([lat, lon], {
      color: "gray",
      fillColor: "#757b75",
      fillOpacity: 0.2,
      radius: radius,
    }).addTo(map);
  }

  function addLayer(layerData, existingLayer, markerImageUrl, type) {
    markerCount = 0;
    if (existingLayer) {
      map.removeLayer(existingLayer);
    }
    const newLayer = L.geoJSON(layerData, {
      pointToLayer: function (_feature, latlng) {
        return L.marker(latlng, {
          icon: L.icon({
            iconUrl: markerImageUrl,
            iconSize: [25, 40],
            iconAnchor: [10, 25],
            popupAnchor: [0, -25],
          }),
        });
      },
    });

    map.addLayer(newLayer);

    // Count markers within the current circle
    if (currentCircle) {
      const markersWithinCircle = [];
      newLayer.eachLayer(function (layer) {
        if (currentCircle.getBounds().contains(layer.getLatLng())) {
          markerCount++;
          markersWithinCircle.push(layer);
        }
      });
      document.getElementById("markerCount").innerHTML = `<p>Markers within ${
        currentCircle.getRadius() / 1000
      } KM: ${markerCount}</p><hr>`;
      return { newLayer, markersWithinCircle };
    }
    return { newLayer, markersWithinCircle: [] };
  }

  function getMarkerData(markersWithinCircle, datatype) {
    const markerData = [];
    markersWithinCircle.forEach((marker) => {
      const feature = marker.feature;
      markerData.push(feature.properties);
    });

    const markerDataHtml = markerData
      .map(
        (data, index) => `
      <div id="marker-data-${index}" style="cursor: pointer;">
        <b style="color: #b4c005">ID:</b> ${data.Id}<br>
        <b style="color: #b4c005">Gender:</b> ${data.Gender}<br>
        <hr>
      </div>
    `
      )
      .join("");

    document.getElementById("markerData").innerHTML = `
      <h2 style="text-align: center">${datatype} Data</h2>
      <div id="markerDataContainer" style="height: 200px; overflow-y: auto; padding: 10px; ">
        ${markerDataHtml}
      </div>
    `;

    // Add click event listener to each marker data
    markerData.forEach((data, index) => {
      const markerDataElement = document.getElementById(`marker-data-${index}`);
      markerDataElement.addEventListener("click", () => {
        const feature = markersWithinCircle[index].feature;
        const lat = feature.geometry.coordinates[1];
        const lng = feature.geometry.coordinates[0];
        map.panTo([lat, lng]);
        markersWithinCircle[index]
          .bindPopup(
            `
          <b>ID:</b> ${data.Id}<br>
          <b>Gender:</b> ${data.Gender}<br>
        `
          )
          .openPopup();
      });
    });
  }

  function updateMarkerCount(type) {
    var count = 0;
    if (type === "Artisans") {
      count = art.features.length;
    } else if (type === "Buyers") {
      count = buy.features.length;
    }
    document.getElementById("message1").innerText = type + " count:" + count;
  }

  // to extract the data from the geojson popup the marker
  function common(geo) {
    map.eachLayer(function (layer) {
      if (layer instanceof L.Marker) {
        layer.on("click", function (e) {
          const clickedLat = e.latlng.lat;
          const clickedLng = e.latlng.lng;

          const det = geo.features.find((feature) => {
            const featureLat = feature.geometry.coordinates[1];
            const featureLng = feature.geometry.coordinates[0];
            return (
              Math.abs(featureLat - clickedLat) < 0.00001 &&
              Math.abs(featureLng - clickedLng) < 0.00001
            );
          });

          if (det) {
            layer
              .bindPopup(
                `
              <b>ID:</b> ${det.properties.Id}<br>
              <b>Gender:</b> ${det.properties.Gender}<br>
              <b>Latitude:</b> ${clickedLat}<br>
              <b>Longitude:</b> ${clickedLng}<br>
            `
              )
              .openPopup();

            document.getElementById("message1").innerHTML = `
                            <b style ="color : #b4c005 "> ID : </b> ${det.properties.Id}<br>
                            <b style ="color : #b4c005"> Gender : </b> ${det.properties.Gender}<br>
                            <b style ="color : #b4c005"> Latitude : </b> ${clickedLat}<br>
                            <b style ="color : #b4c005"> Longitude : </b> ${clickedLng}<br>
                             <hr />
                          `;
          } else {
            console.log("No matching marker found in geo.");
          }
        });
      }
    });
  }

  // Event listener for artisans button
  let click1 = true;
  document.getElementById("button1").onclick = function () {

    click2 = true;
    if (click1) {
      selectedType = "Artisans";
      const markerImageUrl = "green.png";
      const { newLayer, markersWithinCircle } = addLayer(
        art,
        buyersLayer,
        markerImageUrl,
        selectedType
      );
      artisansLayer = newLayer;
      updateMarkerCount(selectedType);
      if (selectedRadius > 0) {
        getMarkerData(markersWithinCircle, selectedType);
      }
      click1 = false;
    }
    common(art);
  };

  // Event listener for buyers button
  let click2 = true;
  document.getElementById("button2").onclick = function () {
    click1 = true;
    if (click2) {
      selectedType = "Buyers";
      const markerImageUrl = "red.png";
      const { newLayer, markersWithinCircle } = addLayer(
        buy,
        artisansLayer,
        markerImageUrl,
        selectedType
      );
      buyersLayer = newLayer;
      updateMarkerCount(selectedType);
      if (selectedRadius > 0) {
        getMarkerData(markersWithinCircle, selectedType);
      }
      click2 = false;
    }
    common(buy);
  };

  // Event listener for distance select
  document.getElementById("select").onchange = function () {
    selectedRadius = parseInt(this.value);
    if (selectedRadius === 5) {
      drawCircle(5000, 13);
    } else if (selectedRadius === 10) {
      drawCircle(10000, 12);
    }

    if (selectedType === "Artisans") {
      if (buyersLayer) {
        map.removeLayer(buyersLayer);
        buyersLayer = null;
      }
      if (artisansLayer) {
        map.removeLayer(artisansLayer);
      }
      const { newLayer, markersWithinCircle } = addLayer(
        art,
        buyersLayer,
        "green.png",
        selectedType
      );
      artisansLayer = newLayer;
      getMarkerData(markersWithinCircle, selectedType);
      common(art);
    } else if (selectedType === "Buyers") {
      if (artisansLayer) {
        map.removeLayer(artisansLayer);
        artisansLayer = null;
      }
      if (buyersLayer) {
        map.removeLayer(buyersLayer);
      }
      const { newLayer, markersWithinCircle } = addLayer(
        buy,
        artisansLayer,
        "red.png",
        selectedType
      );
      buyersLayer = newLayer;
      getMarkerData(markersWithinCircle, selectedType);
      common(buy);
    }
  };
});
