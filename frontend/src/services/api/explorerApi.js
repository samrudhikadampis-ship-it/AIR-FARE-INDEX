// GET /api/v1/quotes
import { apiGet } from '../http'
import { getScrapeQuotes } from '../mock/quotes'
import { normalizeQuote } from '../quotes/normalize'

function rowsFromPayload(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.items)) return data.items
  return []
}

export async function fetchQuoteRecords() {
  const data = await apiGet('/api/v1/quotes?page=1&page_size=50', () => getScrapeQuotes())
  return rowsFromPayload(data).map((row, i) => normalizeQuote(row, i))
}
