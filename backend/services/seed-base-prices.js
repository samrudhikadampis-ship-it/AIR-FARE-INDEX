// seed_base_prices.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data/scraped_data.json');
const flights = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const enrichedFlights = flights.map(flight => {
  if (!flight.base_price) {
    // Simulate a baseline price 5% to 12% lower/higher than current fare
    const varianceMultiplier = 0.88 + Math.random() * 0.20; // 0.88x to 1.08x
    flight.base_price = Math.round(flight.current_price * varianceMultiplier);
  }
  return flight;
});

fs.writeFileSync(filePath, JSON.stringify(enrichedFlights, null, 2));
console.log('✅ Base prices successfully seeded for hackathon demo!');