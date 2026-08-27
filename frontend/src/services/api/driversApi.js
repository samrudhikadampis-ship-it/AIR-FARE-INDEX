import { buildFuelTrend, FESTIVAL_EVENTS, DEMAND_DRIVERS } from '../mock/drivers'

const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms))

export async function fetchFuelTrend(months = 12) {
  await delay()
  return buildFuelTrend(months)
}

export async function fetchFestivalEvents() {
  await delay()
  return FESTIVAL_EVENTS
}

export async function fetchDemandDrivers() {
  await delay()
  return DEMAND_DRIVERS
}
