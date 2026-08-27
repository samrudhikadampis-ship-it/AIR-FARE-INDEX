import { buildQuoteRecords } from '../mock/explorer'

const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms))
let cache = null

export async function fetchQuoteRecords() {
  await delay()
  if (!cache) cache = buildQuoteRecords(80)
  return cache
}
