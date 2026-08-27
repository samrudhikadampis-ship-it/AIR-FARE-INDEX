// Mock price-driver data: fuel (ATF), festivals/seasonality, demand.

export function buildFuelTrend(months = 12) {
  const out = []
  let atf = 92000 // approx Rs. per KL, illustrative
  const now = new Date()
  let seed = 19
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    atf += (rnd() - 0.45) * 4200
    out.push({
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      atfPrice: Math.round(atf),
      fareIndexImpact: Number((2.5 + rnd() * 4).toFixed(1)),
    })
  }
  return out
}

export const FESTIVAL_EVENTS = [
  { name: 'Diwali', dateRange: 'Oct 20 - Nov 2', avgSurgePct: 34.2, mostAffectedRoute: 'DEL → BOM' },
  { name: 'Christmas & New Year', dateRange: 'Dec 20 - Jan 2', avgSurgePct: 28.6, mostAffectedRoute: 'BOM → GOI' },
  { name: 'Holi', dateRange: 'Mar 10 - Mar 15', avgSurgePct: 19.4, mostAffectedRoute: 'DEL → PNQ' },
  { name: 'Summer Vacation', dateRange: 'May 15 - Jun 20', avgSurgePct: 22.8, mostAffectedRoute: 'BLR → GOI' },
  { name: 'Onam', dateRange: 'Aug 25 - Sep 5', avgSurgePct: 15.1, mostAffectedRoute: 'BOM → MAA' },
  { name: 'Ganesh Chaturthi', dateRange: 'Aug 27 - Sep 5', avgSurgePct: 17.9, mostAffectedRoute: 'DEL → BOM' },
]

export const DEMAND_DRIVERS = [
  { driver: 'Booking window (last-minute)', weight: 34, trend: 'up' },
  { driver: 'Festival & holiday seasonality', weight: 24, trend: 'up' },
  { driver: 'Fuel (ATF) price', weight: 18, trend: 'up' },
  { driver: 'Day-of-week demand', weight: 14, trend: 'flat' },
  { driver: 'Route competition (# airlines)', weight: 10, trend: 'down' },
]
