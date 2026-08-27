import { SOURCES, buildCollectionTimeline, COLLECTION_SUMMARY } from '../mock/collection'

const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms))

export async function fetchSources() {
  await delay()
  return SOURCES
}

export async function fetchCollectionTimeline(hours = 24) {
  await delay()
  return buildCollectionTimeline(hours)
}

export async function fetchCollectionSummary() {
  await delay()
  return COLLECTION_SUMMARY
}
