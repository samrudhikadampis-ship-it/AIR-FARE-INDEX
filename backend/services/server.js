const express = require('express');
const cors = require('cors');
const { calculateAirfareCPI } = require('./cpi-engine');

const app = express();
app.use(cors());
app.use(express.json());

// API Endpoint for Overall CPI & Route Breakdown
app.get('/api/cpi', (req, res) => {
  try {
    const cpiData = calculateAirfareCPI();
    res.json({ success: true, data: cpiData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error calculating CPI", error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 CPI Engine Mock Server running at http://localhost:${PORT}/api/cpi`);
});