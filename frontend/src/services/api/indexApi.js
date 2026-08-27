// GET /api/index/snapshot  GET /api/index/trend?days=  GET /api/index/booking-windows  GET /api/index/day-of-week
import { apiGet } from '../http'
import { getScrapeQuotes } from '../mock/quotes'
import { buildNationalSnapshot, buildNationalTrend } from '../mock/aggregations'
import { BOOKING_WINDOWS, DAY_OF_WEEK_TRENDS } from '../mock/nationalIndex'

export async function fetchNationalSnapshot() {
  return apiGet('/api/index/snapshot', () => buildNationalSnapshot(getScrapeQuotes()))
}

export async function fetchNationalTrend(rangeDays = 30) {
  return apiGet(`/api/index/trend?days=${rangeDays}`, () =>
    buildNationalTrend(getScrapeQuotes(), rangeDays)
  )
}

export async function fetchBookingWindows() {
  return apiGet('/api/index/booking-windows', () => BOOKING_WINDOWS)
}

export async function fetchDayOfWeekTrends() {
  return apiGet('/api/index/day-of-week', () => DAY_OF_WEEK_TRENDS)
}
