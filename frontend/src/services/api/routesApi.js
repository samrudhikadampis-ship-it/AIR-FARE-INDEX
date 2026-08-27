import { ROUTES, AIRLINES, buildRouteTrend, buildAirlineComparison } from '../mock/routes'

const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms))

export async function fetchRoutes() {
  await delay()
  return ROUTES
}

export async function fetchAirlines() {
  await delay()
  return AIRLINES
}

export async function fetchRouteTrend(routeId, days = 30) {
  await delay()
  return buildRouteTrend(routeId, days)
}

export async function fetchAirlineComparison(routeId) {
  await delay()
  return buildAirlineComparison(routeId)
}
