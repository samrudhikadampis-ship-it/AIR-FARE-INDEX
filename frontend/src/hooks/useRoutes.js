import { useCallback, useEffect, useState } from 'react'
import { fetchRoutes, fetchRouteTrend, fetchRouteQuotes } from '../services/api/routesApi'
import { buildAirlineComparison } from '../services/mock/routes'

function airlineComparisonFromQuotes(quotes) {
  if (!Array.isArray(quotes) || !quotes.length) return []

  const groups = new Map()
  for (const quote of quotes) {
    const airline = quote.airline || quote.airline_name
    if (!airline) continue
    if (!groups.has(airline)) groups.set(airline, [])
    groups.get(airline).push(quote)
  }

  return [...groups.entries()].map(([airline, rows]) => {
    const prices = rows.map((row) => Number(row.price_inr) || 0)
    const avgFare = Math.round(prices.reduce((sum, n) => sum + n, 0) / prices.length)
    const mid = Math.ceil(rows.length / 2)
    const older = rows.slice(mid)
    const newer = rows.slice(0, mid)
    const olderAvg = older.length
      ? older.reduce((sum, row) => sum + (Number(row.price_inr) || 0), 0) / older.length
      : avgFare
    const newerAvg = newer.length
      ? newer.reduce((sum, row) => sum + (Number(row.price_inr) || 0), 0) / newer.length
      : avgFare
    const changePct = olderAvg ? Number((((newerAvg - olderAvg) / olderAvg) * 100).toFixed(1)) : 0
    const code = rows[0].airlineCode || String(airline).slice(0, 2).toUpperCase()

    return {
      airline,
      code,
      avgFare,
      changePct,
      quotesCollected: rows.length,
    }
  })
}

function resolveComparison(routeId, quotes) {
  const fromQuotes = airlineComparisonFromQuotes(quotes)
  if (fromQuotes.length) return fromQuotes
  if (!routeId) return []
  const fallback = buildAirlineComparison(routeId)
  return Array.isArray(fallback) ? fallback : []
}

export function useRoutes() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchRoutes()
      .then((data) => {
        setRoutes(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load routes')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    reload()
  }, [reload])
  return { routes, loading, error, reload }
}

export function useRouteDetail(routeId) {
  const [trend, setTrend] = useState([])
  const [quotes, setQuotes] = useState([])
  const [comparison, setComparison] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const reload = useCallback(() => {
    if (!routeId) {
      setTrend([])
      setQuotes([])
      setComparison([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    Promise.all([fetchRouteTrend(routeId), fetchRouteQuotes(routeId)])
      .then(([t, q]) => {
        const nextQuotes = Array.isArray(q) ? q : []
        setTrend(Array.isArray(t) ? t : [])
        setQuotes(nextQuotes)
        setComparison(resolveComparison(routeId, nextQuotes))
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load route detail')
        setComparison([])
        setLoading(false)
      })
  }, [routeId])

  useEffect(() => {
    reload()
  }, [reload])

  return { trend, quotes, comparison, loading, error, reload }
}
