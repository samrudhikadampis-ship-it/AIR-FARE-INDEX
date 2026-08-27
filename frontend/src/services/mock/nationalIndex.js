// Mock national airfare index (mirrors ROUTES trend shape).

export function buildNationalTrend(rangeDays = 30) {
  const out = []
  let val = 108
  const start = new Date()
  start.setDate(start.getDate() - rangeDays)
  let seed = 42
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  for (let i = 0; i < rangeDays; i++) {
    val += (rnd() - 0.42) * 1.6
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    out.push({
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      index: Number(val.toFixed(1)),
    })
  }
  return out
}

export const NATIONAL_INDEX_SNAPSHOT = {
  current: 127.4,
  changePct: 6.8,
  direction: 'up',
  asOf: new Date().toISOString(),
  summary: "National airfare prices are up compared with last month",
}

export const BOOKING_WINDOWS = [
  { window: 'T+1', label: 'Book 1 day ahead', avgFare: 9840, indexValue: 148.2 },
  { window: 'T+7', label: 'Book 1 week ahead', avgFare: 7120, indexValue: 121.6 },
  { window: 'T+15', label: 'Book 15 days ahead', avgFare: 6050, indexValue: 108.9 },
  { window: 'T+30', label: 'Book 30 days ahead', avgFare: 5380, indexValue: 99.4 },
  { window: 'T+45', label: 'Book 45 days ahead', avgFare: 5120, indexValue: 95.1 },
]

export const DAY_OF_WEEK_TRENDS = [
  { day: 'Mon', indexValue: 112.4 },
  { day: 'Tue', indexValue: 107.8 },
  { day: 'Wed', indexValue: 105.1 },
  { day: 'Thu', indexValue: 110.6 },
  { day: 'Fri', indexValue: 128.9 },
  { day: 'Sat', indexValue: 133.7 },
  { day: 'Sun', indexValue: 121.2 },
]
