// API layer for the national airfare index.
// Swap the body of each function for a real fetch('/api/...') call later --
// hooks/pages never need to change, only this file.
import {
  buildNationalTrend,
  NATIONAL_INDEX_SNAPSHOT,
  BOOKING_WINDOWS,
  DAY_OF_WEEK_TRENDS,
} from '../mock/nationalIndex'

const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms))

export async function fetchNationalSnapshot() {
  await delay()
  return NATIONAL_INDEX_SNAPSHOT
}

export async function fetchNationalTrend(rangeDays = 30) {
  await delay()
  return buildNationalTrend(rangeDays)
}

export async function fetchBookingWindows() {
  await delay()
  return BOOKING_WINDOWS
}

export async function fetchDayOfWeekTrends() {
  await delay()
  return DAY_OF_WEEK_TRENDS
}
