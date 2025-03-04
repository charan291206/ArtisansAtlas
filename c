navigator.geolocation.getCurrentPosition(function (position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  var map = L.map("map").setView([lat, lon], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(map);
  L.marker([lat, lon]).addTo(map);

  let currentCircle;
  let artisansLayer;
  let buyersLayer;
  let markerCount = 0;

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

  document.getElementById("select").onchange = function () {
    markerCount = 0;
    var selectedValue = this.value;
    if (selectedValue === "0") {
      drawCircle();
    }
    if (selectedValue === "5") {
      drawCircle(5000, 13);
    } else if (selectedValue === "10") {
      drawCircle(10000, 12);
    }
  };

  function addLayer(layerData, existingLayer, markerImageUrl ) {
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
            popupAnchor: [0, -25]
          })
        });
      }
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
      document.getElementById("markerCount").innerHTML = `<p>Markers within ${currentCircle.getRadius() / 1000} KM: ${markerCount}</p><hr>`;
      return { newLayer, markersWithinCircle };
    }
    return { newLayer, markersWithinCircle: [] };
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
            layer.bindPopup(`
              <b>ID:</b> ${det.properties.id}<br>
              <b>Gender:</b> ${det.properties.Male_Female}<br>
              <b>Latitude:</b> ${clickedLat}<br>
              <b>Longitude:</b> ${clickedLng}<br>
            `).openPopup();

            document.getElementById("message1").innerHTML = `
                            <b style ="color : #b4c005 "> ID : </b> ${det.properties.id}<br>
                            <b style ="color : #b4c005"> Gender : </b> ${det.properties.Male_Female}<br>
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

  //  total count of artisans or buyers
  function updateMarkerCount(type) {
    var count = 0;
    if (type === 'Artisans') {
      count = art.features.length;
    } else if (type === 'Buyers') {
      count = buy.features.length;
    }
    document.getElementById('message1').innerText = type + ' count:' + count;
  }

    // get markers with in the radius
  
  function getMarkerData(markersWithinCircle ,  datatype) {
    const markerData = [];
    markersWithinCircle.forEach((marker) => {
      const feature = marker.feature;
      markerData.push(feature.properties);
    });
  
    const markerDataHtml = markerData.map((data, index) => `
      <div id="marker-data-${index}" style="cursor: pointer;">
        <b style="color: #b4c005">ID:</b> ${data.id}<br>
        <b style="color: #b4c005">Gender:</b> ${data.Male_Female}<br>
        <hr>
      </div>
    `).join('');
  
    document.getElementById('markerData').innerHTML = `
      <h2 style="text-align: center">${datatype} Data</h2>
      <div id="markerDataContainer" style="height: 200px; overflow-y: auto; padding: 10px; ">
        ${markerDataHtml}
      </div>
    `;
  
    // Add click event listener to each marker data
    markerData.forEach((data, index) => {
      const markerDataElement = document.getElementById(`marker-data-${index}`);
      markerDataElement.addEventListener('click', () => {
        const feature = markersWithinCircle[index].feature;
        const lat = feature.geometry.coordinates[1];
        const lng = feature.geometry.coordinates[0];
        map.panTo([lat, lng]);
       markersWithinCircle[index].bindPopup(`
                <b>ID:</b> ${data.id}<br>
                <b>Gender:</b> ${data.Male_Female}<br>
              `).openPopup();
      });
    });
  }

  // artisans button
  let click1 = true;
  document.getElementById("button1").onclick = function () {
    markerCount = 0;
    click2 = true;
    if (click1) {
      const markerImageUrl = 'green.png';
      const { newLayer, markersWithinCircle } = addLayer(art, buyersLayer, markerImageUrl);
      artisansLayer = newLayer;
      common(art);
      click1 = false;
      getMarkerData(markersWithinCircle , 'Artisans');
    }
    updateMarkerCount('Artisans');
  };

  // buyers button
  let click2 = true;
  document.getElementById("button2").onclick = function () {
    markerCount = 0;
    click1 = true;
    if (click2) {
      const markerImageUrl = 'red.png';
      const { newLayer, markersWithinCircle } = addLayer(buy, artisansLayer, markerImageUrl);
      buyersLayer = newLayer;
      common(buy);
      click2 = false;
      getMarkerData(markersWithinCircle , 'Buyers');
    }
    updateMarkerCount('Buyers');
  };

 
});