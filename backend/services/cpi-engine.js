const fs = require('fs');
const path = require('path');

function calculateAirfareCPI() {
 const scrapedPath = path.join(__dirname, '..', 'scraper', 'fast_flights_data.json');
  // Resolves to: backend/services/base-price.json
  const basePricePath = path.join(__dirname, 'base-price.json');

  if (!fs.existsSync(scrapedPath)) {
    return { success: false, message: "scraped-data.json file not found!" };
  }
  if (!fs.existsSync(basePricePath)) {
    return { success: false, message: "base-price.json file not found!" };
  }

  const scrapedData = JSON.parse(fs.readFileSync(scrapedPath, 'utf-8'));
  const baseData = JSON.parse(fs.readFileSync(basePricePath, 'utf-8'));

  let currentFlights = Array.isArray(scrapedData) ? scrapedData : (scrapedData.flights || scrapedData.data || []);
  let baseFlights = Array.isArray(baseData) ? baseData : (baseData.data || []);

  // 1. Calculate Average Base Price per Route
  const baseRouteMap = {};
  const baseRouteCounts = {};

  baseFlights.forEach(item => {
    const source = item.source || item.origin || 'FROM';
    const destination = item.destination || item.to || 'TO';
    const routeName = `${source}-${destination}`.toUpperCase();
    
    const priceVal = item.price !== undefined ? item.price : item.fare;
    const cleanPrice = Number(String(priceVal || 0).replace(/[^0-9.]/g, ''));

    if (cleanPrice > 0) {
      if (!baseRouteMap[routeName]) {
        baseRouteMap[routeName] = 0;
        baseRouteCounts[routeName] = 0;
      }
      baseRouteMap[routeName] += cleanPrice;
      baseRouteCounts[routeName]++;
    }
  });

  // Average out the base prices per route
  Object.keys(baseRouteMap).forEach(route => {
    baseRouteMap[route] = baseRouteMap[route] / baseRouteCounts[route];
  });

  // 2. Group Current Scraped Flights by Route and Average their Current Prices
  const currentRouteMap = {};
  const currentRouteCounts = {};

  currentFlights.forEach(flight => {
    const rawPrice = flight.price !== undefined ? flight.price : flight.fare;
    const currentPrice = Number(String(rawPrice || 0).replace(/[^0-9.]/g, ''));

    if (isNaN(currentPrice) || currentPrice <= 0) return;

    const source = flight.source || flight.origin || 'FROM';
    const destination = flight.destination || flight.to || 'TO';
    const routeName = `${source}-${destination}`.toUpperCase();

    if (!currentRouteMap[routeName]) {
      currentRouteMap[routeName] = 0;
      currentRouteCounts[routeName] = 0;
    }
    currentRouteMap[routeName] += currentPrice;
    currentRouteCounts[routeName]++;
  });

  const routeBreakdown = [];
  let totalWeightedRelative = 0;
  const uniqueRoutes = Object.keys(currentRouteMap);
  const totalRoutesCount = uniqueRoutes.length;

  if (totalRoutesCount === 0) {
    return { success: false, message: "No valid routes found!" };
  }

  // 3. Calculate Laspeyres Index Across Distinct Routes
  uniqueRoutes.forEach(routeName => {
    const avgCurrentPrice = currentRouteMap[routeName] / currentRouteCounts[routeName];
    
    // Fallback to current price if base price history doesn't exist for this route yet
    const avgBasePrice = baseRouteMap[routeName] || avgCurrentPrice; 
    
    const weight = 1 / totalRoutesCount; // Equal weight per route basket item
    const priceRelative = avgCurrentPrice / avgBasePrice;

    totalWeightedRelative += (priceRelative * weight);

    const priceChange = (((avgCurrentPrice - avgBasePrice) / avgBasePrice) * 100).toFixed(2);

    routeBreakdown.push({
      route: routeName,
      flightsCount: currentRouteCounts[routeName],
      averageCurrentPrice: Math.round(avgCurrentPrice),
      averageBasePrice: Math.round(avgBasePrice),
      priceChangePercent: priceChange,
      weight: weight.toFixed(4)
    });
  });

  const overallCPI = (totalWeightedRelative * 100).toFixed(2);

  return {
    success: true,
    summary: {
      overallCPI: parseFloat(overallCPI),
      baseIndex: 100.00,
      inflationRatePercent: (overallCPI - 100).toFixed(2) + "%",
      totalFlightsProcessed: currentFlights.length,
      distinctRoutesTracked: totalRoutesCount,
      timestamp: new Date().toISOString()
    },
    routes: routeBreakdown // Now neatly grouped by unique route!
  };
}

module.exports = { calculateAirfareCPI };

// This checks if the file is being run directly from the terminal
if (require.main === module) {
  const result = calculateAirfareCPI();
  
  // Print the result to the console in a readable JSON format
  console.log(JSON.stringify(result, null, 2));
}