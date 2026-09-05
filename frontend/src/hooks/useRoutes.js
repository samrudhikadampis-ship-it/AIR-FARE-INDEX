import { useCallback, useEffect, useState } from 'react'
import { getApiBase } from '../services/http'
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
    const prices = rows.map((row) => Number(row.price_inr)).filter((n) => Number.isFinite(n))
    const avgFare = prices.length
      ? Math.round(prices.reduce((sum, n) => sum + n, 0) / prices.length)
      : null
    const code = rows[0].airlineCode || String(airline).slice(0, 2).toUpperCase()

    return {
      airline,
      code,
      avgFare,
      changePct: null,
      quotesCollected: rows.length,
    }
  })
}

function resolveComparison(routeId, quotes) {
  const fromQuotes = airlineComparisonFromQuotes(quotes)
  if (fromQuotes.length) return fromQuotes
  if (getApiBase() || !routeId) return []
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
        setRoutes(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((err) => {
        setRoutes([])
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
      setError(null)
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
        setTrend([])
        setQuotes([])
        setComparison([])
        setError(err.message || 'Failed to load route detail')
        setLoading(false)
      })
  }, [routeId])

  useEffect(() => {
    reload()
  }, [reload])

  return { trend, quotes, comparison, loading, error, reload }
}
