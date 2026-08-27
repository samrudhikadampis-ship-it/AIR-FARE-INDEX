// Canonical scraper quote:
// { departure_time, arrival_time, duration, price, source, destination }
// Extra keys (airline, collected_at, …) are kept and ignored until the UI needs them.

export function parsePrice(price) {
  if (typeof price === 'number' && Number.isFinite(price)) return price
  const n = Number(String(price ?? '').replace(/[₹Rs.\s,]/gi, ''))
  return Number.isFinite(n) ? n : 0
}

export function parseDurationMinutes(duration) {
  if (typeof duration === 'number') return duration
  const text = String(duration ?? '')
  const h = text.match(/(\d+)\s*h/i)
  const m = text.match(/(\d+)\s*m/i)
  return (h ? Number(h[1]) : 0) * 60 + (m ? Number(m[1]) : 0)
}

export function formatInr(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export function normalizeQuote(raw, index = 0) {
  return {
    id: raw.id ?? `Q-${String(index + 1).padStart(4, '0')}`,
    departure_time: raw.departure_time ?? '',
    arrival_time: raw.arrival_time ?? '',
    duration: raw.duration ?? '',
    duration_minutes: raw.duration_minutes ?? parseDurationMinutes(raw.duration),
    price: raw.price ?? '',
    price_inr: raw.price_inr ?? parsePrice(raw.price),
    source: raw.source ?? '',
    destination: raw.destination ?? '',
    collected_at: raw.collected_at ?? null,
    airline: raw.airline ?? null,
  }
}

export function routeKey(source, destination) {
  return `${source} → ${destination}`
}
