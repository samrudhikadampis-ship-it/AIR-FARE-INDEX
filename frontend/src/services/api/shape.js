export function unwrapItems(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.items)) return data.items
  return []
}

export function finiteNumber(value) {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

export function formatInt(value) {
  const n = finiteNumber(value)
  return n == null ? '—' : n.toLocaleString('en-IN')
}

export function formatInr(value) {
  const n = finiteNumber(value)
  return n == null ? '—' : `₹${n.toLocaleString('en-IN')}`
}

export function formatIndex(value) {
  const n = finiteNumber(value)
  return n == null ? '—' : String(n)
}

const WINDOW_LABELS = {
  1: 'Book 1 day ahead',
  7: 'Book 1 week ahead',
  15: 'Book 15 days ahead',
  30: 'Book 30 days ahead',
  45: 'Book 45 days ahead',
}

export function normalizeSnapshot(raw) {
  if (!raw || typeof raw !== 'object') return null
    const current = finiteNumber(raw.index_value ?? raw.current)
  const method = raw.method ? String(raw.method) : null
  return {
    current,
    changePct: finiteNumber(raw.changePct),
    direction: raw.direction === 'up' || raw.direction === 'down' ? raw.direction : null,
    asOf: raw.as_of ?? raw.asOf ?? null,
    summary: raw.summary ? String(raw.summary) : method ? 'Fare index proxy from collected quotes.' : null,
    quoteCount: finiteNumber(raw.quote_count ?? raw.quoteCount),
    avgFare: finiteNumber(raw.avg_fare ?? raw.avgFare),
  }
}

export function normalizeTrendPoint(raw) {
  if (!raw || typeof raw !== 'object') return null
  const index = finiteNumber(raw.index)
  const date = raw.date != null ? String(raw.date) : ''
  if (!date || index == null) return null
  return { date, index }
}

export function normalizeRoute(raw) {
  if (!raw || typeof raw !== 'object') return null
  const from = String(raw.from ?? '').trim()
  const to = String(raw.to ?? '').trim()
  if (!from || !to) return null
  const fromCity = String(raw.fromCity ?? from).trim() || from
  const toCity = String(raw.toCity ?? to).trim() || to
  return {
    id: String(raw.id || `${from}-${to}`),
    from,
    to,
    fromCity,
    toCity,
    label: raw.label || `${from} → ${to}`,
    avgFare: finiteNumber(raw.avgFare),
    minFare: finiteNumber(raw.minFare),
    maxFare: finiteNumber(raw.maxFare),
    changePct: finiteNumber(raw.changePct),
    indexValue: finiteNumber(raw.indexValue),
    quotesCollected: finiteNumber(raw.quoteCount ?? raw.quotesCollected),
  }
}

export function normalizeCollectionSummary(raw) {
  if (!raw || typeof raw !== 'object') return null
  const quotesTotal = finiteNumber(
    raw.quotes_total ?? raw.quotesTotal ?? raw.quotesCollectedToday
  )
  return {
    quotesTotal,
    routes: finiteNumber(raw.routes),
    lastCollectedAt: raw.last_collected_at ?? raw.lastCollectedAt ?? null,
    source: raw.source ? String(raw.source) : null,
    quotesCollectedToday: finiteNumber(raw.quotesCollectedToday) ?? quotesTotal,
    activeScrapers: finiteNumber(raw.activeScrapers),
    totalScrapers: finiteNumber(raw.totalScrapers),
    dataCoveragePct: finiteNumber(raw.dataCoveragePct),
    avgSuccessRatePct: finiteNumber(raw.avgSuccessRatePct),
  }
}

export function normalizeBookingWindow(raw) {
  if (!raw || typeof raw !== 'object') return null
  const days = finiteNumber(raw.days)
  const indexValue = finiteNumber(raw.indexValue ?? raw.index_value)
  const avgFare = finiteNumber(raw.avgFare ?? raw.avg_fare)
  const window = raw.window != null ? String(raw.window) : days != null ? `T+${days}` : ''
  if (!window || indexValue == null) return null
  return {
    window,
    days,
    label: raw.label || (days != null ? WINDOW_LABELS[days] : '') || window,
    avgFare,
    indexValue,
    quoteCount: finiteNumber(raw.quoteCount ?? raw.quote_count),
  }
}

export function normalizeDayOfWeek(raw) {
  if (!raw || typeof raw !== 'object') return null
  const day = raw.day != null ? String(raw.day) : ''
  const indexValue = finiteNumber(raw.indexValue ?? raw.index_value)
  if (!day || indexValue == null) return null
  return {
    day,
    indexValue,
    avgFare: finiteNumber(raw.avgFare ?? raw.avg_fare),
    quoteCount: finiteNumber(raw.quoteCount ?? raw.quote_count),
  }
}

export function normalizeHeatmapAirport(raw) {
  if (!raw || typeof raw !== 'object') return null
  const code = String(raw.code ?? '').trim()
  if (!code) return null
  const city = raw.city != null && String(raw.city).trim() ? String(raw.city).trim() : code
  return { code, city }
}

export function normalizeHeatmapSector(raw) {
  if (!raw || typeof raw !== 'object') return null
  const origin = String(raw.origin ?? '').trim()
  const destination = String(raw.destination ?? '').trim()
  const averageFare = finiteNumber(raw.averageFare)
  if (!origin || !destination || averageFare == null) return null
  return {
    origin,
    destination,
    changePercent: finiteNumber(raw.changePercent),
    averageFare,
    indexValue: finiteNumber(raw.indexValue),
    observations: finiteNumber(raw.quoteCount ?? raw.observations),
  }
}
