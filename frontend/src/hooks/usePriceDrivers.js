import { useCallback, useEffect, useState } from 'react'
import { getApiBase } from '../services/http'
import { fetchFuelTrend, fetchFestivalEvents, fetchDemandDrivers } from '../services/api/driversApi'

export function usePriceDrivers() {
  const [fuelTrend, setFuelTrend] = useState([])
  const [festivals, setFestivals] = useState([])
  const [demandDrivers, setDemandDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [available, setAvailable] = useState(true)

  const reload = useCallback(() => {
    if (getApiBase()) {
      setFuelTrend([])
      setFestivals([])
      setDemandDrivers([])
      setAvailable(false)
      setError(null)
      setLoading(false)
      return
    }

    setAvailable(true)
    setLoading(true)
    setError(null)
    Promise.all([fetchFuelTrend(), fetchFestivalEvents(), fetchDemandDrivers()])
      .then(([fuel, fest, demand]) => {
        setFuelTrend(Array.isArray(fuel) ? fuel : [])
        setFestivals(Array.isArray(fest) ? fest : [])
        setDemandDrivers(Array.isArray(demand) ? demand : [])
        setLoading(false)
      })
      .catch((err) => {
        setFuelTrend([])
        setFestivals([])
        setDemandDrivers([])
        setError(err.message || 'Failed to load price drivers')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { fuelTrend, festivals, demandDrivers, loading, error, available, reload }
}
