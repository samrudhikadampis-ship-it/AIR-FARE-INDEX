// Mock raw quote records for the Data Explorer table.
import { AIRLINES, AIRPORTS } from './routes'

const routePairs = Object.keys(AIRPORTS)
const sources = ['MakeMyTrip', 'Cleartrip', 'ixigo', 'Goibibo', 'Airline Direct']

function seeded(seedStr) {
  let h = 0
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0
  return () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296 }
}

export function buildQuoteRecords(count = 60) {
  const rnd = seeded('explorer-seed')
  const records = []
  for (let i = 0; i < count; i++) {
    const from = routePairs[Math.floor(rnd() * routePairs.length)]
    let to = routePairs[Math.floor(rnd() * routePairs.length)]
    while (to === from) to = routePairs[Math.floor(rnd() * routePairs.length)]
    const airline = AIRLINES[Math.floor(rnd() * AIRLINES.length)]
    const d = new Date()
    d.setDate(d.getDate() - Math.floor(rnd() * 30))
    records.push({
      id: `Q-${10000 + i}`,
      route: `${from} → ${to}`,
      from, to,
      airline: airline.name,
      airlineCode: airline.code,
      fare: Math.round(3800 + rnd() * 7200),
      source: sources[Math.floor(rnd() * sources.length)],
      collectedAt: d.toISOString(),
      bookingWindowDays: [1, 7, 15, 30, 45][Math.floor(rnd() * 5)],
    })
  }
  return records.sort((a, b) => new Date(b.collectedAt) - new Date(a.collectedAt))
}
