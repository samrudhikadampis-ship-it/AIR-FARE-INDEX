// GET /api/routes  GET /api/routes/:id/quotes  GET /api/routes/:id/trend
import { apiGet } from '../http'
import { getScrapeQuotes } from '../mock/quotes'
import { aggregateRoutes, buildNationalTrend } from '../mock/aggregations'
import { routeKey } from '../quotes/normalize'

export async function fetchRoutes() {
  return apiGet('/api/routes', () => aggregateRoutes(getScrapeQuotes()))
}

export async function fetchRouteQuotes(routeId) {
  return apiGet(`/api/routes/${routeId}/quotes`, () => {
    const routes = aggregateRoutes(getScrapeQuotes())
    const route = routes.find((r) => r.id === routeId)
    if (!route) return []
    const key = routeKey(route.fromCity, route.toCity)
    return getScrapeQuotes().filter((q) => routeKey(q.source, q.destination) === key)
  })
}

export async function fetchRouteTrend(routeId, days = 30) {
  return apiGet(`/api/routes/${routeId}/trend?days=${days}`, () => {
    const routes = aggregateRoutes(getScrapeQuotes())
    const route = routes.find((r) => r.id === routeId)
    if (!route) return []
    const key = routeKey(route.fromCity, route.toCity)
    const quotes = getScrapeQuotes().filter((q) => routeKey(q.source, q.destination) === key)
    return buildNationalTrend(quotes, days)
  })
}
