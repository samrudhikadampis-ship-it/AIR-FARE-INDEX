// src/data/mockData.js

export const nationalIndexSummary = {
  currentIndex: 128.6,
  monthlyChange: "+4.8%",
  quarterlyChange: "+7.2%",
  yearlyChange: "+12.6%",
  basePeriod: "Jan 2024 = 100",
  vsPrevious: "vs Jul 2026 (122.7)",
  observationsToday: "48,621",
  routesTracked: 184,
  activeSources: 14,
  airlinesCount: 9,
  otasCount: 5,
  frequency: "Every 15 mins",
  systemStatus: "Operational",
  lastUpdated: "2 mins ago",
  liveTimestamp: "25 Aug 2026, 02:58 PM",
};

export const indexTrend12Months = [
  { month: "Sep 2025", index: 112.4 },
  { month: "Oct 2025", index: 116.8 },
  { month: "Nov 2025", index: 115.7 },
  { month: "Dec 2025", index: 120.2 },
  { month: "Jan 2026", index: 125.8 },
  { month: "Feb 2026", index: 127.9 },
  { month: "Mar 2026", index: 125.1 },
  { month: "Apr 2026", index: 127.0 },
  { month: "May 2026", index: 131.2 },
  { month: "Jun 2026", index: 132.5 },
  { month: "Jul 2026", index: 128.0 },
  { month: "Aug 2026", index: 128.6 },
];

export const regionalContributions = [
  { region: "Western India", index: 129.8, share: 31 },
  { region: "Northern India", index: 127.4, share: 27 },
  { region: "Southern India", index: 126.1, share: 22 },
  { region: "Eastern India", index: 124.3, share: 20 },
];

export const routeSurveillance = [
  { origin: "Mumbai", destination: "Delhi", fare: "₹5,420", change: "+18.4%", index: 134.2, status: "HIGH SURGE", badge: "rose" },
  { origin: "Delhi", destination: "Mumbai", fare: "₹5,180", change: "+12.1%", index: 129.7, status: "RISING", badge: "amber" },
  { origin: "Mumbai", destination: "Bengaluru", fare: "₹4,210", change: "-7.2%", index: 118.3, status: "FALLING", badge: "emerald" },
  { origin: "Delhi", destination: "Bengaluru", fare: "₹4,820", change: "+0.8%", index: 121.5, status: "STABLE", badge: "slate" },
  { origin: "Delhi", destination: "Hyderabad", fare: "₹5,100", change: "+6.3%", index: 125.8, status: "RISING", badge: "amber" },
  { origin: "Bengaluru", destination: "Mumbai", fare: "₹4,650", change: "-2.4%", index: 119.2, status: "FALLING", badge: "emerald" },
];

export const airlineSources = [
  { name: "IndiGo", status: "LIVE", time: "14:58:21", count: "8,421" },
  { name: "Air India", status: "LIVE", time: "14:58:18", count: "7,982" },
  { name: "Akasa Air", status: "LIVE", time: "14:57:52", count: "5,431" },
  { name: "SpiceJet", status: "LIVE", time: "14:57:41", count: "4,821" },
];

export const otaSources = [
  { name: "MakeMyTrip", status: "LIVE", time: "14:58:12", count: "6,721" },
  { name: "Yatra", status: "LIVE", time: "14:57:44", count: "4,823" },
  { name: "Ixigo", status: "LIVE", time: "14:58:01", count: "4,211" },
  { name: "Goibibo", status: "LIVE", time: "14:57:22", count: "3,912" },
  { name: "Cleartrip", status: "LIVE", time: "14:56:58", count: "2,299" },
];

export const bookingWindowData = [
  { window: "30 Days", fare: 4200, category: "Lower" },
  { window: "21 Days", fare: 4350, category: "Lower" },
  { window: "14 Days", fare: 4680, category: "Lower" },
  { window: "7 Days", fare: 5120, category: "Higher" },
  { window: "3 Days", fare: 6100, category: "Higher" },
  { window: "1 Day", fare: 7200, category: "Higher" },
];

export const priceDrivers = [
  { label: "Booking Window", impact: "HIGH", color: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
  { label: "Demand Surge", impact: "HIGH", color: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
  { label: "Seasonality", impact: "MEDIUM", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  { label: "Festival Effect", impact: "MEDIUM", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  { label: "Fuel Indicator", impact: "LOW", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
];

export const rawObservations = [
  { time: "14:58:21", route: "BOM - DEL", source: "IndiGo", airline: "IndiGo", departure: "10 Sep 2026", booking: "14 days", fare: "₹5,420" },
  { time: "14:58:23", route: "BOM - DEL", source: "MakeMyTrip", airline: "IndiGo", departure: "10 Sep 2026", booking: "14 days", fare: "₹5,390" },
  { time: "14:58:25", route: "BOM - DEL", source: "Yatra", airline: "IndiGo", departure: "10 Sep 2026", booking: "14 days", fare: "₹5,450" },
  { time: "14:57:41", route: "DEL - BLR", source: "Air India", airline: "Air India", departure: "12 Sep 2026", booking: "7 days", fare: "₹6,210" },
  { time: "14:57:33", route: "DEL - HYD", source: "Ixigo", airline: "Air India", departure: "12 Sep 2026", booking: "7 days", fare: "₹5,800" },
  { time: "14:57:22", route: "BOM - HYD", source: "Goibibo", airline: "Akasa Air", departure: "15 Sep 2026", booking: "21 days", fare: "₹4,210" },
];

export const methodologySteps = [
  { num: 1, name: "Data Collection", desc: "Automated scraping from 9 airlines & 5 OTAs every 15 minutes." },
  { num: 2, name: "Validation", desc: "Outlier filtering, sold-out removal, and fare-type boundary checks." },
  { num: 3, name: "Normalization", desc: "Decomposing total fare into base fare, taxes, UDF, and convenience fees." },
  { num: 4, name: "Deduplication", desc: "Matching duplicate seat quotes across OTAs and direct airline portals." },
  { num: 5, name: "Representative Fare", desc: "Calculating sector-level geometric mean for each advance-booking window." },
  { num: 6, name: "Route Index", desc: "Constructing elementary Jevons sub-indices for all 184 city pairs." },
  { num: 7, name: "Weighting", desc: "Applying DGCA passenger-traffic passenger share weights." },
  { num: 8, name: "National Index", desc: "Generating the final augmented CPI-ready composite APIx score." },
];