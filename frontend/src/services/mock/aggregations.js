import { CITY_BY_NAME } from './quotes'
import { routeKey } from '../quotes/normalize'

const BASE_FARE = 6000

export function aggregateRoutes(quotes) {
  const groups = new Map()
  for (const q of quotes) {
    const key = routeKey(q.source, q.destination)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(q)
  }

  return [...groups.entries()].map(([key, rows]) => {
    const prices = rows.map((r) => r.price_inr)
    const avgFare = Math.round(prices.reduce((s, n) => s + n, 0) / prices.length)
    const mid = Math.ceil(rows.length / 2)
    const older = rows.slice(mid)
    const newer = rows.slice(0, mid)
    const olderAvg = older.length ? older.reduce((s, r) => s + r.price_inr, 0) / older.length : avgFare
    const newerAvg = newer.length ? newer.reduce((s, r) => s + r.price_inr, 0) / newer.length : avgFare
    const changePct = olderAvg ? Number((((newerAvg - olderAvg) / olderAvg) * 100).toFixed(1)) : 0
    const fromCity = rows[0].source
    const toCity = rows[0].destination
    const from = CITY_BY_NAME[fromCity]?.code ?? fromCity.slice(0, 3).toUpperCase()
    const to = CITY_BY_NAME[toCity]?.code ?? toCity.slice(0, 3).toUpperCase()
    return {
      id: `${from}-${to}`,
      from,
      to,
      fromCity,
      toCity,
      label: key,
      avgFare,
      minFare: Math.min(...prices),
      maxFare: Math.max(...prices),
      changePct,
      indexValue: Number(((avgFare / BASE_FARE) * 100).toFixed(1)),
      quotesCollected: rows.length,
    }
  }).sort((a, b) => a.fromCity.localeCompare(b.fromCity) || a.toCity.localeCompare(b.toCity))
}

export function buildNationalSnapshot(quotes) {
  if (!quotes.length) {
    return {
      current: 100,
      changePct: 0,
      direction: 'down',
      asOf: new Date().toISOString(),
      summary: 'No quotes collected yet',
    }
  }
  const avg = quotes.reduce((s, q) => s + q.price_inr, 0) / quotes.length
  const current = Number(((avg / BASE_FARE) * 100).toFixed(1))
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recent = quotes.filter((q) => q.collected_at && new Date(q.collected_at).getTime() >= cutoff)
  const older = quotes.filter((q) => q.collected_at && new Date(q.collected_at).getTime() < cutoff)
  const recentAvg = recent.length ? recent.reduce((s, q) => s + q.price_inr, 0) / recent.length : avg
  const olderAvg = older.length ? older.reduce((s, q) => s + q.price_inr, 0) / older.length : avg
  const changePct = olderAvg ? Number((((recentAvg - olderAvg) / olderAvg) * 100).toFixed(1)) : 0
  const direction = changePct >= 0 ? 'up' : 'down'
  return {
    current,
    changePct: Math.abs(changePct),
    direction,
    asOf: new Date().toISOString(),
    summary:
      direction === 'up'
        ? 'National airfare prices are up compared with last week'
        : 'National airfare prices are down compared with last week',
  }
}

export function buildNationalTrend(quotes, rangeDays = 30) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - rangeDays + 1)
  const buckets = new Map()
  for (let i = 0; i < rangeDays; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    buckets.set(key, [])
  }
  for (const q of quotes) {
    if (!q.collected_at) continue
    const key = q.collected_at.slice(0, 10)
    if (buckets.has(key)) buckets.get(key).push(q.price_inr)
  }
  let last = 108
  const out = []
  for (const [key, prices] of buckets) {
    if (prices.length) {
      last = Number(((prices.reduce((s, n) => s + n, 0) / prices.length / BASE_FARE) * 100).toFixed(1))
    }
    const d = new Date(key)
    out.push({
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      index: last,
    })
  }
  return out
}
