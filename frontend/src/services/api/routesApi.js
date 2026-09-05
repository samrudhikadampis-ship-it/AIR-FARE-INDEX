import { apiGet, getApiBase } from '../http'
import { getScrapeQuotes } from '../mock/quotes'
import { aggregateRoutes, buildNationalTrend } from '../mock/aggregations'
import { routeKey } from '../quotes/normalize'
import { normalizeQuote } from '../quotes/normalize'
import { normalizeRoute, normalizeTrendPoint, unwrapItems } from './shape'

function mockRouteQuotes(routeId) {
  const routes = aggregateRoutes(getScrapeQuotes())
  const route = routes.find((r) => r.id === routeId)
  if (!route) return []
  const key = routeKey(route.fromCity, route.toCity)
  return getScrapeQuotes().filter((q) => routeKey(q.source, q.destination) === key)
}

export async function fetchRoutes() {
  const data = await apiGet('/api/v1/routes', () => aggregateRoutes(getScrapeQuotes()))
  return unwrapItems(data).map(normalizeRoute).filter(Boolean)
}

export async function fetchRouteQuotes(routeId) {
  if (!getApiBase()) {
    const data = await apiGet(`/api/v1/routes/${routeId}/quotes`, () => mockRouteQuotes(routeId))
    return unwrapItems(data).map((row, i) => normalizeQuote(row, i))
  }

  const all = []
  let page = 1
  const pageSize = 100
  const maxPages = 50
  for (;;) {
    const data = await apiGet(
      `/api/v1/routes/${routeId}/quotes?page=${page}&page_size=${pageSize}`,
      () => []
    )
    const rows = unwrapItems(data)
    all.push(...rows)
    const total = Number(data?.total)
    const reachedTotal = Number.isFinite(total) && all.length >= total
    const shortOrEmpty = rows.length === 0 || rows.length < pageSize
    const hitSafetyLimit = page >= maxPages
    if (reachedTotal || shortOrEmpty || hitSafetyLimit) {
      if (hitSafetyLimit && !reachedTotal && !shortOrEmpty) {
        console.error(
          `Stopped paging /api/v1/routes/${routeId}/quotes after ${maxPages} pages; pagination metadata was incomplete.`
        )
      }
      break
    }
    page += 1
  }
  return all.map((row, i) => normalizeQuote(row, i))
}

export async function fetchRouteTrend(routeId, days = 30) {
  const data = await apiGet(`/api/v1/routes/${routeId}/trend?days=${days}`, () => {
    const routeQuotes = mockRouteQuotes(routeId)
    return buildNationalTrend(routeQuotes, days)
  })
  return unwrapItems(data).map(normalizeTrendPoint).filter(Boolean)
}
