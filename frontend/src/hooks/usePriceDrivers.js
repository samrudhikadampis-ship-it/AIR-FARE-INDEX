import { useEffect, useState } from 'react'
import { fetchFuelTrend, fetchFestivalEvents, fetchDemandDrivers } from '../services/api/driversApi'

export function usePriceDrivers() {
  const [fuelTrend, setFuelTrend] = useState([])
  const [festivals, setFestivals] = useState([])
  const [demandDrivers, setDemandDrivers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchFuelTrend(), fetchFestivalEvents(), fetchDemandDrivers()]).then(
      ([fuel, fest, demand]) => {
        setFuelTrend(fuel); setFestivals(fest); setDemandDrivers(demand); setLoading(false)
      }
    )
  }, [])

  return { fuelTrend, festivals, demandDrivers, loading }
}
