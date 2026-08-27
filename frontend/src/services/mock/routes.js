// Mock route + airline reference data + route-level index series.
// Replace this file's exports with real API calls later -- the shape
// returned by services/api/routesApi.js should stay the same.

export const AIRPORTS = {
  DEL: 'Delhi', BOM: 'Mumbai', BLR: 'Bengaluru', MAA: 'Chennai',
  CCU: 'Kolkata', HYD: 'Hyderabad', PNQ: 'Pune', GOI: 'Goa', AMD: 'Ahmedabad',
}

export const AIRLINES = [
  { code: '6E', name: 'IndiGo', color: '#0f172a' },
  { code: 'AI', name: 'Air India', color: '#dc2626' },
  { code: 'SG', name: 'SpiceJet', color: '#f59e0b' },
  { code: 'QP', name: 'Akasa Air', color: '#7c3aed' },
  { code: 'IX', name: 'Air India Express', color: '#0891b2' },
]

const pairs = [
  ['DEL', 'BOM'], ['BOM', 'BLR'], ['DEL', 'BLR'], ['MAA', 'DEL'],
  ['DEL', 'CCU'], ['BOM', 'GOI'], ['BLR', 'HYD'], ['DEL', 'HYD'],
  ['BOM', 'MAA'], ['CCU', 'BLR'], ['PNQ', 'DEL'], ['AMD', 'BOM'],
  ['GOI', 'DEL'], ['HYD', 'MAA'], ['DEL', 'PNQ'], ['BLR', 'GOI'],
  ['CCU', 'BOM'], ['HYD', 'BOM'], ['MAA', 'BLR'], ['DEL', 'AMD'],
  ['BOM', 'CCU'], ['BLR', 'PNQ'], ['GOI', 'BOM'], ['AMD', 'BLR'],
]

// Deterministic pseudo-random so numbers don't jump on every render.
function seeded(seedStr) {
  let h = 0
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0
    return h / 4294967296
  }
}

export const ROUTES = pairs.map(([from, to]) => {
  const rnd = seeded(`${from}-${to}`)
  const baseFare = Math.round(3500 + rnd() * 5500)
  const changePct = Number(((rnd() - 0.4) * 16).toFixed(1))
  return {
    id: `${from}-${to}`,
    from, to,
    fromCity: AIRPORTS[from], toCity: AIRPORTS[to],
    avgFare: baseFare,
    changePct,
    indexValue: Number((100 + rnd() * 40).toFixed(1)),
    quotesCollected: Math.round(300 + rnd() * 900),
    topAirline: AIRLINES[Math.floor(rnd() * AIRLINES.length)].name,
  }
})

export function buildRouteTrend(routeId, days = 30) {
  const rnd = seeded(routeId + 'trend')
  const out = []
  let val = 100 + rnd() * 20
  const start = new Date()
  start.setDate(start.getDate() - days)
  for (let i = 0; i < days; i++) {
    val += (rnd() - 0.48) * 3
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    out.push({
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      index: Number(val.toFixed(1)),
    })
  }
  return out
}

export function buildAirlineComparison(routeId) {
  const rnd = seeded(routeId + 'airline')
  return AIRLINES.map((a) => ({
    airline: a.name,
    code: a.code,
    avgFare: Math.round(4200 + rnd() * 5200),
    changePct: Number(((rnd() - 0.45) * 14).toFixed(1)),
    quotesCollected: Math.round(70 + rnd() * 200),
  }))
}
