/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);
// console.log(locations);

// Create map and attach it to #map
const map = L.map('map', { zoomControl: false });
// Add tile layer to our map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Create icon
var greenIcon = L.icon({
  iconUrl: '/img/pin.png',
  iconSize: [32, 40], // size of the icon
  iconAnchor: [16, 45], // point of the icon which will correspond to the marker's location
  popupAnchor: [0, -50], // point from which the popup should open relative to the iconAnchor
});

// Add locations to map
const points = [];
locations.forEach((loc) => {
  // Create points
  // points
  //   .push([loc.coordinates[1], loc.coordinates[0]])
  //   .addTo(map)
  //   // Add popup
  //   .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
  //     autoClose: false,
  //   })
  //   .openPopup();
  const marker = L.marker([loc.coordinates[1], loc.coordinates[0]], {
    icon: greenIcon,
  }).addTo(map);

  // Add popup
  marker
    .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
      autoclose: false,
    })
    .openPopup();

  // Add point for map bounds
  points.push([loc.coordinates[1], loc.coordinates[0]]);
});

// Set map bounds to include current location
const bounds = L.latLngBounds(points).pad(0.5);
map.fitBounds(bounds);

// Disable scroll on map
map.scrollWheelZoom.disable();
