import { normalizeQuote } from '../quotes/normalize'

export const CITIES = [
  { code: 'DEL', name: 'New Delhi' },
  { code: 'BOM', name: 'Mumbai' },
  { code: 'BLR', name: 'Bengaluru' },
  { code: 'MAA', name: 'Chennai' },
  { code: 'CCU', name: 'Kolkata' },
  { code: 'HYD', name: 'Hyderabad' },
  { code: 'PNQ', name: 'Pune' },
  { code: 'GOI', name: 'Goa' },
  { code: 'AMD', name: 'Ahmedabad' },
]

export const CITY_BY_NAME = Object.fromEntries(CITIES.map((c) => [c.name, c]))
export const CITY_BY_CODE = Object.fromEntries(CITIES.map((c) => [c.code, c]))

const PAIRS = [
  ['New Delhi', 'Mumbai'],
  ['Mumbai', 'Bengaluru'],
  ['New Delhi', 'Bengaluru'],
  ['Chennai', 'New Delhi'],
  ['New Delhi', 'Kolkata'],
  ['Mumbai', 'Goa'],
  ['Bengaluru', 'Hyderabad'],
  ['New Delhi', 'Hyderabad'],
  ['Mumbai', 'Chennai'],
  ['Kolkata', 'Bengaluru'],
  ['Pune', 'New Delhi'],
  ['Ahmedabad', 'Mumbai'],
  ['Goa', 'New Delhi'],
  ['Hyderabad', 'Chennai'],
  ['Bengaluru', 'Goa'],
  ['Kolkata', 'Mumbai'],
  ['Hyderabad', 'Mumbai'],
  ['Chennai', 'Bengaluru'],
  ['New Delhi', 'Ahmedabad'],
  ['Mumbai', 'Kolkata'],
]

function seeded(seedStr) {
  let h = 0
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0
    return h / 4294967296
  }
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function formatDuration(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${pad(m)}m`
}

export function buildScrapeQuotes(count = 96) {
  const rnd = seeded('scrape-quotes-v1')
  const records = []
  for (let i = 0; i < count; i++) {
    const [source, destination] = PAIRS[Math.floor(rnd() * PAIRS.length)]
    const depHour = Math.floor(rnd() * 24)
    const depMin = [0, 10, 15, 20, 30, 40, 45, 50][Math.floor(rnd() * 8)]
    const durationMins = 75 + Math.floor(rnd() * 180)
    const depTotal = depHour * 60 + depMin
    const arrTotal = (depTotal + durationMins) % (24 * 60)
    const price = Math.round(3800 + rnd() * 7200)
    const collected = new Date()
    collected.setDate(collected.getDate() - Math.floor(rnd() * 28))
    collected.setHours(Math.floor(rnd() * 24), Math.floor(rnd() * 60), 0, 0)

    records.push(
      normalizeQuote(
        {
          departure_time: `${pad(depHour)}:${pad(depMin)}`,
          arrival_time: `${pad(Math.floor(arrTotal / 60))}:${pad(arrTotal % 60)}`,
          duration: formatDuration(durationMins),
          price: `₹${price.toLocaleString('en-IN')}`,
          source,
          destination,
          collected_at: collected.toISOString(),
        },
        i
      )
    )
  }
  return records.sort((a, b) => String(b.collected_at).localeCompare(String(a.collected_at)))
}

let cache = null
export function getScrapeQuotes() {
  if (!cache) cache = buildScrapeQuotes()
  return cache
}
