import { useEffect, useState, useCallback } from 'react'
import { fetchRoutes, fetchAirlines, fetchRouteTrend, fetchAirlineComparison } from '../services/api/routesApi'

export function useRoutes() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchRoutes().then((data) => { setRoutes(data); setLoading(false) })
  }, [])
  return { routes, loading }
}

export function useAirlines() {
  const [airlines, setAirlines] = useState([])
  useEffect(() => { fetchAirlines().then(setAirlines) }, [])
  return { airlines }
}

export function useRouteDetail(routeId) {
  const [trend, setTrend] = useState([])
  const [comparison, setComparison] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    if (!routeId) return
    setLoading(true)
    Promise.all([fetchRouteTrend(routeId), fetchAirlineComparison(routeId)]).then(
      ([t, c]) => { setTrend(t); setComparison(c); setLoading(false) }
    )
  }, [routeId])

  useEffect(() => { load() }, [load])

  return { trend, comparison, loading }
}
