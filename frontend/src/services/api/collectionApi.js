import { apiGet } from '../http'
import { SOURCES, buildCollectionTimeline, COLLECTION_SUMMARY } from '../mock/collection'
import { normalizeCollectionSummary } from './shape'

export async function fetchSources() {
  return apiGet('/api/v1/collection/sources', () => SOURCES)
}

export async function fetchCollectionTimeline(hours = 24) {
  return apiGet(`/api/v1/collection/timeline?hours=${hours}`, () => buildCollectionTimeline(hours))
}

export async function fetchCollectionSummary() {
  const data = await apiGet('/api/v1/collection/summary', () => COLLECTION_SUMMARY)
  return normalizeCollectionSummary(data)
}
