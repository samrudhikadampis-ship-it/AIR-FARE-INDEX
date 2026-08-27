import { useCallback, useEffect, useState } from 'react'
import { fetchFuelTrend, fetchFestivalEvents, fetchDemandDrivers } from '../services/api/driversApi'

export function usePriceDrivers() {
  const [fuelTrend, setFuelTrend] = useState([])
  const [festivals, setFestivals] = useState([])
  const [demandDrivers, setDemandDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([fetchFuelTrend(), fetchFestivalEvents(), fetchDemandDrivers()])
      .then(([fuel, fest, demand]) => {
        setFuelTrend(fuel)
        setFestivals(fest)
        setDemandDrivers(demand)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load price drivers')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { fuelTrend, festivals, demandDrivers, loading, error, reload }
}
