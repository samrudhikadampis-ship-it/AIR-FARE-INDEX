// Sector heatmap mock. Replace getHeatmapSectors() with an API later;
// keep this object shape so the UI does not need to change.

export const HEATMAP_AIRPORTS = [
  { code: 'DEL', city: 'New Delhi' },
  { code: 'BOM', city: 'Mumbai' },
  { code: 'BLR', city: 'Bengaluru' },
  { code: 'HYD', city: 'Hyderabad' },
  { code: 'MAA', city: 'Chennai' },
  { code: 'CCU', city: 'Kolkata' },
  { code: 'PNQ', city: 'Pune' },
  { code: 'AMD', city: 'Ahmedabad' },
  { code: 'GOI', city: 'Goa' },
]

export const HEATMAP_PERIODS = [
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
]

export const HEATMAP_METRICS = [
  { id: 'changePercent', label: 'Price Change' },
  { id: 'averageFare', label: 'Average Fare' },
]

const BASE_SECTORS = [
  { origin: 'DEL', destination: 'BOM', changePercent: 8.4, averageFare: 9120, indexValue: 132.6, observations: 486 },
  { origin: 'DEL', destination: 'BLR', changePercent: 5.1, averageFare: 7840, indexValue: 124.1, observations: 412 },
  { origin: 'DEL', destination: 'HYD', changePercent: 3.6, averageFare: 6980, indexValue: 118.4, observations: 274 },
  { origin: 'DEL', destination: 'MAA', changePercent: 6.9, averageFare: 8210, indexValue: 127.8, observations: 228 },
  { origin: 'DEL', destination: 'CCU', changePercent: -2.4, averageFare: 7340, indexValue: 109.2, observations: 301 },
  { origin: 'DEL', destination: 'PNQ', changePercent: 4.2, averageFare: 6420, indexValue: 116.8, observations: 198 },
  { origin: 'DEL', destination: 'AMD', changePercent: 1.8, averageFare: 5890, indexValue: 108.6, observations: 167 },
  { origin: 'DEL', destination: 'GOI', changePercent: 12.7, averageFare: 9680, indexValue: 141.3, observations: 254 },

  { origin: 'BOM', destination: 'DEL', changePercent: 7.2, averageFare: 8890, indexValue: 129.8, observations: 471 },
  { origin: 'BOM', destination: 'BLR', changePercent: 2.1, averageFare: 6120, indexValue: 112.4, observations: 389 },
  { origin: 'BOM', destination: 'HYD', changePercent: -1.3, averageFare: 5480, indexValue: 104.7, observations: 246 },
  { origin: 'BOM', destination: 'MAA', changePercent: 3.8, averageFare: 6710, indexValue: 115.9, observations: 218 },
  { origin: 'BOM', destination: 'CCU', changePercent: 9.4, averageFare: 10140, indexValue: 136.2, observations: 184 },
  { origin: 'BOM', destination: 'AMD', changePercent: -0.8, averageFare: 4210, indexValue: 98.4, observations: 203 },
  { origin: 'BOM', destination: 'GOI', changePercent: 14.6, averageFare: 8420, indexValue: 146.8, observations: 362 },
  { origin: 'BOM', destination: 'PNQ', changePercent: 0.6, averageFare: 3840, indexValue: 96.1, observations: 141 },

  { origin: 'BLR', destination: 'DEL', changePercent: 4.8, averageFare: 7690, indexValue: 122.7, observations: 398 },
  { origin: 'BLR', destination: 'BOM', changePercent: 1.9, averageFare: 5980, indexValue: 111.2, observations: 371 },
  { origin: 'BLR', destination: 'HYD', changePercent: -3.1, averageFare: 4120, indexValue: 94.8, observations: 287 },
  { origin: 'BLR', destination: 'MAA', changePercent: 0.4, averageFare: 4560, indexValue: 101.3, observations: 264 },
  { origin: 'BLR', destination: 'CCU', changePercent: 6.2, averageFare: 8940, indexValue: 125.6, observations: 156 },
  { origin: 'BLR', destination: 'GOI', changePercent: 11.3, averageFare: 7210, indexValue: 138.4, observations: 219 },
  { origin: 'BLR', destination: 'PNQ', changePercent: 2.7, averageFare: 5340, indexValue: 107.9, observations: 132 },

  { origin: 'HYD', destination: 'DEL', changePercent: 3.2, averageFare: 6810, indexValue: 117.1, observations: 261 },
  { origin: 'HYD', destination: 'BOM', changePercent: -1.7, averageFare: 5360, indexValue: 103.8, observations: 238 },
  { origin: 'HYD', destination: 'BLR', changePercent: -2.9, averageFare: 3980, indexValue: 93.6, observations: 276 },
  { origin: 'HYD', destination: 'MAA', changePercent: 1.4, averageFare: 4780, indexValue: 105.2, observations: 194 },
  { origin: 'HYD', destination: 'GOI', changePercent: 8.8, averageFare: 8120, indexValue: 130.4, observations: 118 },

  { origin: 'MAA', destination: 'DEL', changePercent: 5.7, averageFare: 8060, indexValue: 126.1, observations: 214 },
  { origin: 'MAA', destination: 'BOM', changePercent: 3.3, averageFare: 6580, indexValue: 114.6, observations: 207 },
  { origin: 'MAA', destination: 'BLR', changePercent: 0.9, averageFare: 4410, indexValue: 102.4, observations: 251 },
  { origin: 'MAA', destination: 'HYD', changePercent: 1.1, averageFare: 4690, indexValue: 104.8, observations: 181 },
  { origin: 'MAA', destination: 'CCU', changePercent: 7.6, averageFare: 9210, indexValue: 128.9, observations: 97 },

  { origin: 'CCU', destination: 'DEL', changePercent: -1.8, averageFare: 7180, indexValue: 110.4, observations: 288 },
  { origin: 'CCU', destination: 'BOM', changePercent: 8.9, averageFare: 9860, indexValue: 134.7, observations: 176 },
  { origin: 'CCU', destination: 'BLR', changePercent: 5.4, averageFare: 8710, indexValue: 123.8, observations: 149 },
  { origin: 'CCU', destination: 'HYD', changePercent: 4.1, averageFare: 7920, indexValue: 119.6, observations: 88 },

  { origin: 'PNQ', destination: 'DEL', changePercent: 3.9, averageFare: 6290, indexValue: 115.3, observations: 186 },
  { origin: 'PNQ', destination: 'BOM', changePercent: 0.3, averageFare: 3710, indexValue: 95.4, observations: 134 },
  { origin: 'PNQ', destination: 'BLR', changePercent: 2.4, averageFare: 5210, indexValue: 106.7, observations: 121 },
  { origin: 'PNQ', destination: 'GOI', changePercent: 9.8, averageFare: 6840, indexValue: 133.2, observations: 102 },

  { origin: 'AMD', destination: 'DEL', changePercent: 1.5, averageFare: 5740, indexValue: 107.8, observations: 159 },
  { origin: 'AMD', destination: 'BOM', changePercent: -1.1, averageFare: 4090, indexValue: 97.2, observations: 191 },
  { origin: 'AMD', destination: 'BLR', changePercent: 4.6, averageFare: 7120, indexValue: 120.5, observations: 84 },

  { origin: 'GOI', destination: 'DEL', changePercent: 10.9, averageFare: 9410, indexValue: 137.6, observations: 241 },
  { origin: 'GOI', destination: 'BOM', changePercent: 13.2, averageFare: 8180, indexValue: 143.1, observations: 348 },
  { origin: 'GOI', destination: 'BLR', changePercent: 9.6, averageFare: 6980, indexValue: 134.8, observations: 207 },
  { origin: 'GOI', destination: 'HYD', changePercent: 7.4, averageFare: 7890, indexValue: 127.2, observations: 109 },
]

const PERIOD_SCALE = {
  '7d': { change: 0.62, fare: 1.06, index: 1.03, observations: 0.32 },
  '30d': { change: 1, fare: 1, index: 1, observations: 1 },
  '90d': { change: 1.28, fare: 0.96, index: 0.97, observations: 2.45 },
}

function round1(n) {
  return Number(n.toFixed(1))
}

export function getHeatmapSectors(period = '30d') {
  const scale = PERIOD_SCALE[period] ?? PERIOD_SCALE['30d']
  return BASE_SECTORS.map((row) => ({
    origin: row.origin,
    destination: row.destination,
    changePercent: round1(row.changePercent * scale.change),
    averageFare: Math.round(row.averageFare * scale.fare),
    indexValue: round1(row.indexValue * scale.index),
    observations: Math.max(12, Math.round(row.observations * scale.observations)),
  }))
}

export function sectorRouteId(origin, destination) {
  return `${origin}-${destination}`
}
