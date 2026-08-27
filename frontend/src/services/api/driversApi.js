// GET /api/drivers/fuel  GET /api/drivers/festivals  GET /api/drivers/demand
import { apiGet } from '../http'
import { buildFuelTrend, FESTIVAL_EVENTS, DEMAND_DRIVERS } from '../mock/drivers'

export async function fetchFuelTrend(months = 12) {
  return apiGet(`/api/drivers/fuel?months=${months}`, () => buildFuelTrend(months))
}

export async function fetchFestivalEvents() {
  return apiGet('/api/drivers/festivals', () => FESTIVAL_EVENTS)
}

export async function fetchDemandDrivers() {
  return apiGet('/api/drivers/demand', () => DEMAND_DRIVERS)
}
