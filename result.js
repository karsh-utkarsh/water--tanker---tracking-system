window.onload = function() {
    // --- Map Initialization and Tankers ---
    const map = L.map("map").setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);
  
    const tankers = [
      { name: "5000L Tanker", lat: 28.6448, lng: 77.2167, price: 800, eta: "15 mins" },
      { name: "10000L Tanker", lat: 28.6548, lng: 77.2267, price: 1500, eta: "20 mins" },
      { name: "2000L Tanker", lat: 28.6348, lng: 77.2067, price: 400, eta: "10 mins" }
    ];
  
    // --- Booking Modal Elements ---
    const modal = document.getElementById("bookingModal");
    const closeBtn = document.querySelector(".close");
    const confirmBtn = document.getElementById("confirmBooking");
    const modalTanker = document.getElementById("modal-tanker");
    const modalAddress = document.getElementById("modal-address");
    const modalPrice = document.getElementById("modal-price");
  
    // Make openBookingModal global
    window.openBookingModal = function(tankerName, price, address = "Your address") {
      modalTanker.textContent = `Tanker: ${tankerName}`;
      modalPrice.textContent = `Price: ₹${price}`;
      modalAddress.textContent = `Delivery: ${address}`;
      modal.style.display = "block";
      confirmBtn.dataset.amount = price;
    };
  
    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (event) => { if(event.target === modal) modal.style.display = "none"; }
  
    confirmBtn.onclick = () => {
      const amountInINR = confirmBtn.dataset.amount || 500;
      const options = {
        key: "rzp_test_1DP5mmOlF5G5ag",
        amount: amountInINR * 100,
        currency: "INR",
        name: "Water Tanker Marketplace",
        description: modalTanker.textContent,
        handler: function (response){
          // Save booked tanker for tracking
          localStorage.setItem("bookedTanker", JSON.stringify({
            name: modalTanker.textContent.replace("Tanker: ",""),
            price: amountInINR,
            etaMinutes: 15,
            lat: 28.6448,
            lng: 77.2167
          }));
          // Redirect to tracking page
          window.location.href = "myTanker.html";
        },
        prefill: { name: "Test User", email: "test@example.com", contact: "9999999999" },
        theme: { color: "#0077cc" }
      };
      const rzp = new Razorpay(options);
      rzp.open();
    };
  
    // Add markers
    tankers.forEach(tanker => {
      const marker = L.marker([tanker.lat, tanker.lng]).addTo(map);
      marker.bindPopup(`
        <b>${tanker.name}</b><br>
        ETA: ${tanker.eta}<br>
        Price: ₹${tanker.price}<br>
        <button onclick="openBookingModal('${tanker.name}', ${tanker.price})">Book Now</button>
      `);
    });
  
    const group = L.featureGroup(tankers.map(t => L.marker([t.lat, t.lng])));
    map.fitBounds(group.getBounds());
  
    // --- Compare Feature ---
    const compareBtn = document.getElementById("compareBtn");
    const compareModal = document.getElementById("compareModal");
    const compareClose = document.getElementById("compareClose");
    const compareContent = document.getElementById("compareContent");
  
    compareBtn.onclick = () => {
      compareContent.innerHTML = "";
      const selected = document.querySelectorAll(".compare-checkbox:checked");
  
      if(selected.length < 2){
        alert("Select at least 2 tankers to compare");
        return;
      }
  
      selected.forEach(cb => {
        const card = document.createElement("div");
        card.style.background = "#fff";
        card.style.padding = "15px";
        card.style.borderRadius = "10px";
        card.style.minWidth = "180px";
        card.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
  
        card.innerHTML = `
          <h3>${cb.dataset.name}</h3>
          <p>Price: ₹${cb.dataset.price}</p>
          <p>ETA: ${cb.dataset.eta}</p>
          <button class="book-btn" onclick="openBookingModal('${cb.dataset.name}', ${cb.dataset.price})">Book Now</button>
        `;
  
        compareContent.appendChild(card);
      });
  
      compareModal.style.display = "block";
    };
  
    compareClose.onclick = () => compareModal.style.display = "none";
    window.onclick = (event) => { if(event.target === compareModal) compareModal.style.display = "none"; }
  };
   