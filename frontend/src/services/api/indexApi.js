import { apiGet } from '../http'
import { getScrapeQuotes } from '../mock/quotes'
import { buildNationalSnapshot, buildNationalTrend } from '../mock/aggregations'
import { BOOKING_WINDOWS, DAY_OF_WEEK_TRENDS } from '../mock/nationalIndex'
import {
  normalizeBookingWindow,
  normalizeDayOfWeek,
  normalizeSnapshot,
  normalizeTrendPoint,
  unwrapItems,
} from './shape'

export async function fetchNationalSnapshot() {
  const data = await apiGet('/api/v1/index/snapshot', () => buildNationalSnapshot(getScrapeQuotes()))
  return normalizeSnapshot(data)
}

export async function fetchNationalTrend(rangeDays = 30) {
  const data = await apiGet(`/api/v1/index/trend?days=${rangeDays}`, () =>
    buildNationalTrend(getScrapeQuotes(), rangeDays)
  )
  return unwrapItems(data).map(normalizeTrendPoint).filter(Boolean)
}

export async function fetchBookingWindows() {
  const data = await apiGet('/api/v1/index/booking-windows', () => BOOKING_WINDOWS)
  return unwrapItems(data).map(normalizeBookingWindow).filter(Boolean)
}

export async function fetchDayOfWeekTrends() {
  const data = await apiGet('/api/v1/index/day-of-week', () => DAY_OF_WEEK_TRENDS)
  return unwrapItems(data).map(normalizeDayOfWeek).filter(Boolean)
}
