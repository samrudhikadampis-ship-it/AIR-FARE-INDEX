// GET /api/collection/sources  GET /api/collection/timeline  GET /api/collection/summary
import { apiGet } from '../http'
import { SOURCES, buildCollectionTimeline, COLLECTION_SUMMARY } from '../mock/collection'

export async function fetchSources() {
  return apiGet('/api/collection/sources', () => SOURCES)
}

export async function fetchCollectionTimeline(hours = 24) {
  return apiGet(`/api/collection/timeline?hours=${hours}`, () => buildCollectionTimeline(hours))
}

export async function fetchCollectionSummary() {
  return apiGet('/api/collection/summary', () => COLLECTION_SUMMARY)
}
