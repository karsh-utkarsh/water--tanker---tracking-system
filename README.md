first version 

# Water Tanker Marketplace

A web-based marketplace to **book and track water tankers** in real-time. Users can find nearby tankers, compare options, book them via Razorpay test payments, and track the tanker live on a map with an ETA countdown.

---

## Features

### Customer Side
- **Find Tankers**: Users can view a list of available tankers with:
  - Tanker capacity
  - Distance & ETA
  - Price
  - Ratings & badges
- **Compare Tankers**: Select multiple tankers to compare prices, ETA, and details.
- **Book Tankers**: Book a tanker and complete a **dummy payment** via Razorpay test cards.
- **Live Tracking**: View the booked tanker on a map with **real-time movement simulation** and **ETA countdown**.

### Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **Map & Tracking**: [Leaflet.js](https://leafletjs.com/)
- **Payments**: [Razorpay Test Integration](https://razorpay.com/docs/payment-gateway/web-integration/standard/)

### Pages
1. `index.html` – Homepage and tanker search.
2. `results.html` – Displays available tankers, comparison, and booking modal.
3. `myTanker.html` – Shows the live tracker for booked tanker with ETA countdown.

---

## Setup Instructions

1. **Clone the repository** or download files:

```bash
git clone <repository-url>
