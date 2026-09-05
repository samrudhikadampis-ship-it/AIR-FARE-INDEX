import { useCallback, useEffect, useMemo, useState } from 'react'
import { HEATMAP_METRICS, HEATMAP_PERIODS } from '../services/mock/heatmap'
import { fetchHeatmapSectors } from '../services/api/heatmapApi'

export function useSectorHeatmap() {
  const [metric, setMetric] = useState('changePercent')
  const [period, setPeriod] = useState('30d')
  const [airports, setAirports] = useState([])
  const [sectors, setSectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchHeatmapSectors(period)
      .then((data) => {
        const nextSectors = Array.isArray(data?.sectors) ? data.sectors : []
        const nextAirports = Array.isArray(data?.airports) ? data.airports : []
        setSectors(nextSectors)
        setAirports(nextAirports)
        const hasChange = nextSectors.some((row) => row.changePercent != null)
        if (!hasChange) setMetric('averageFare')
        setLoading(false)
      })
      .catch((err) => {
        setSectors([])
        setAirports([])
        setError(err.message || 'Failed to load heatmap')
        setLoading(false)
      })
  }, [period])

  useEffect(() => {
    reload()
  }, [reload])

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
    const withChange = sectors.filter((row) => row.changePercent != null)
    if (!withChange.length) {
      const byFare = [...sectors].sort((a, b) => b.averageFare - a.averageFare)
      return {
        hottest: byFare[0],
        coolest: byFare[byFare.length - 1],
        count: sectors.length,
        ranking: 'averageFare',
      }
    }
    const byChange = [...withChange].sort((a, b) => b.changePercent - a.changePercent)
    return {
      hottest: byChange[0],
      coolest: byChange[byChange.length - 1],
      count: sectors.length,
      ranking: 'changePercent',
    }
  }, [sectors])

  return {
    airports,
    metrics: HEATMAP_METRICS,
    periods: HEATMAP_PERIODS,
    metric,
    setMetric,
    period,
    setPeriod,
    sectors,
    lookup,
    summary,
    loading,
    error,
    reload,
  }
}
