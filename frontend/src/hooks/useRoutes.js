import { useCallback, useEffect, useState } from 'react'
import { fetchRoutes, fetchRouteTrend, fetchRouteQuotes } from '../services/api/routesApi'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const reload = useCallback(() => {
    if (!routeId) {
      setTrend([])
      setQuotes([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    Promise.all([fetchRouteTrend(routeId), fetchRouteQuotes(routeId)])
      .then(([t, q]) => {
        setTrend(t)
        setQuotes(q)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load route detail')
        setLoading(false)
      })
  }, [routeId])

  useEffect(() => {
    reload()
  }, [reload])

  return { trend, quotes, loading, error, reload }
}
