import { apiGet } from '../http'
import { getHeatmapSectors, HEATMAP_AIRPORTS } from '../mock/heatmap'
import { normalizeHeatmapAirport, normalizeHeatmapSector, unwrapItems } from './shape'

export async function fetchHeatmapSectors(period = '30d') {
  const data = await apiGet('/api/v1/heatmap/sectors', () => ({
    airports: HEATMAP_AIRPORTS,
    sectors: getHeatmapSectors(period),
  }))

  if (Array.isArray(data)) {
    return {
      airports: [],
      sectors: data.map(normalizeHeatmapSector).filter(Boolean),
    }
  }

  const sectors = unwrapItems(data?.sectors ? { items: data.sectors } : data)
    .map(normalizeHeatmapSector)
    .filter(Boolean)

  const fromPayload = Array.isArray(data?.airports)
    ? data.airports.map(normalizeHeatmapAirport).filter(Boolean)
    : []

  const codes = new Set(sectors.flatMap((s) => [s.origin, s.destination]))
  const airports =
    fromPayload.length > 0
      ? fromPayload
      : [...codes].sort().map((code) => ({ code, city: code }))

  return { airports, sectors }
}
