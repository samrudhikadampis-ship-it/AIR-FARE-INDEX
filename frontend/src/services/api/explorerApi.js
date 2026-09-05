import { apiGet } from '../http'
import { getScrapeQuotes } from '../mock/quotes'
import { normalizeQuote } from '../quotes/normalize'

function rowsFromPayload(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.items)) return data.items
  return []
}

function filterMockRows(rows, origin, destination, q) {
  let next = rows
  if (origin && origin !== 'All') {
    next = next.filter((row) => String(row.source) === origin)
  }
  if (destination && destination !== 'All') {
    next = next.filter((row) => String(row.destination) === destination)
  }
  if (q && q.trim()) {
    const needle = q.trim().toLowerCase()
    next = next.filter((row) =>
      [
        row.id,
        row.source,
        row.destination,
        row.departure_time,
        row.arrival_time,
        row.price,
        row.airline,
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    )
  }
  return next
}

export async function fetchQuoteRecords({
  page = 1,
  pageSize = 50,
  origin = 'All',
  destination = 'All',
  q = '',
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  })
  if (origin && origin !== 'All') params.set('origin', origin)
  if (destination && destination !== 'All') params.set('destination', destination)
  if (q.trim()) params.set('q', q.trim())

  const data = await apiGet(`/api/v1/quotes?${params.toString()}`, () => {
    const rows = filterMockRows(getScrapeQuotes(), origin, destination, q)
    const start = (page - 1) * pageSize
    return {
      items: rows.slice(start, start + pageSize),
      page,
      page_size: pageSize,
      total: rows.length,
    }
  })

  const items = rowsFromPayload(data).map((row, i) => normalizeQuote(row, i))
  const total = Number(data?.total)
  return {
    items,
    page: Number(data?.page) || page,
    pageSize: Number(data?.page_size) || pageSize,
    total: Number.isFinite(total) ? total : items.length,
  }
}
