import { useMemo, useState } from 'react'
import {
  HEATMAP_AIRPORTS,
  HEATMAP_METRICS,
  HEATMAP_PERIODS,
  getHeatmapSectors,
} from '../services/mock/heatmap'

export function useSectorHeatmap() {
  const [metric, setMetric] = useState('changePercent')
  const [period, setPeriod] = useState('30d')

  const sectors = useMemo(() => getHeatmapSectors(period), [period])

  const lookup = useMemo(() => {
    const map = new Map()
    for (const row of sectors) {
      map.set(`${row.origin}|${row.destination}`, row)
    }
    return map
  }, [sectors])

  const summary = useMemo(() => {
    if (!sectors.length) {
      return { hottest: null, coolest: null, count: 0 }
    }
    const byChange = [...sectors].sort((a, b) => b.changePercent - a.changePercent)
    return {
      hottest: byChange[0],
      coolest: byChange[byChange.length - 1],
      count: sectors.length,
    }
  }, [sectors])

  return {
    airports: HEATMAP_AIRPORTS,
    metrics: HEATMAP_METRICS,
    periods: HEATMAP_PERIODS,
    metric,
    setMetric,
    period,
    setPeriod,
    sectors,
    lookup,
    summary,
  }
}
