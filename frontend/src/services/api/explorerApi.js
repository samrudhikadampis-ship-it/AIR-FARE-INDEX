// GET /api/quotes
import { apiGet } from '../http'
import { getScrapeQuotes } from '../mock/quotes'
import { normalizeQuote } from '../quotes/normalize'

export async function fetchQuoteRecords() {
  const data = await apiGet('/api/quotes', () => getScrapeQuotes())
  return (Array.isArray(data) ? data : []).map((row, i) => normalizeQuote(row, i))
}
