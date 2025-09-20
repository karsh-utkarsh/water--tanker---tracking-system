// Initialize Leaflet map
const map = L.map("map").setView([20.5937, 78.9629], 5);

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Detect user location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // Move map
      map.setView([lat, lng], 15);

      // Marker
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup("📍 Your Location").openPopup();

      // Update input
      document.getElementById("address").value = `Lat: ${lat}, Lng: ${lng}`;
    },
    (err) => {
      document.getElementById("address").placeholder =
        "Enter your address manually";
    }
  );
} else {
  document.getElementById("address").placeholder =
    "Geolocation not supported. Enter manually.";
}
