// Mock scraper / data-source health for the Live Collection page.

export const SOURCES = [
  { id: 'indigo-direct', name: 'IndiGo (Direct)', type: 'Airline', status: 'healthy', successRate: 99.1, avgLatencyMs: 820, quotesLast24h: 4210, lastRunAgoMin: 2 },
  { id: 'airindia-direct', name: 'Air India (Direct)', type: 'Airline', status: 'healthy', successRate: 97.6, avgLatencyMs: 1140, quotesLast24h: 3120, lastRunAgoMin: 4 },
  { id: 'spicejet-direct', name: 'SpiceJet (Direct)', type: 'Airline', status: 'degraded', successRate: 88.2, avgLatencyMs: 2410, quotesLast24h: 1480, lastRunAgoMin: 11 },
  { id: 'akasa-direct', name: 'Akasa Air (Direct)', type: 'Airline', status: 'healthy', successRate: 98.4, avgLatencyMs: 960, quotesLast24h: 1890, lastRunAgoMin: 3 },
  { id: 'makemytrip', name: 'MakeMyTrip', type: 'OTA', status: 'healthy', successRate: 96.3, avgLatencyMs: 1580, quotesLast24h: 5340, lastRunAgoMin: 1 },
  { id: 'cleartrip', name: 'Cleartrip', type: 'OTA', status: 'healthy', successRate: 95.7, avgLatencyMs: 1720, quotesLast24h: 3980, lastRunAgoMin: 3 },
  { id: 'yatra', name: 'Yatra', type: 'OTA', status: 'down', successRate: 41.2, avgLatencyMs: 5200, quotesLast24h: 210, lastRunAgoMin: 47 },
  { id: 'ixigo', name: 'ixigo', type: 'OTA', status: 'healthy', successRate: 94.9, avgLatencyMs: 1340, quotesLast24h: 4570, lastRunAgoMin: 2 },
  { id: 'goibibo', name: 'Goibibo', type: 'OTA', status: 'degraded', successRate: 85.5, avgLatencyMs: 2680, quotesLast24h: 2210, lastRunAgoMin: 9 },
]

export function buildCollectionTimeline(hours = 24) {
  const out = []
  const now = new Date()
  let seed = 7
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
  for (let i = hours - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000)
    out.push({
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      quotes: Math.round(800 + rnd() * 1400),
      failures: Math.round(rnd() * 60),
    })
  }
  return out
}

export const COLLECTION_SUMMARY = {
  quotesCollectedToday: 27_012,
  activeScrapers: 8,
  totalScrapers: 9,
  dataCoveragePct: 98.2,
  avgSuccessRatePct: 88.5,
}
