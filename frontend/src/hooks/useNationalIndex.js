import { useCallback, useEffect, useState } from 'react'
import {
  fetchNationalSnapshot,
  fetchNationalTrend,
  fetchBookingWindows,
  fetchDayOfWeekTrends,
} from '../services/api/indexApi'

export function useNationalSnapshot() {
  const [snapshot, setSnapshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchNationalSnapshot()
      .then((data) => {
        setSnapshot(data)
        setLoading(false)
      })
      .catch((err) => {
        setSnapshot(null)
        setError(err.message || 'Failed to load index')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { snapshot, loading, error, reload }
}

export function useNationalTrend(initialRangeDays = 30) {
  const [rangeDays, setRangeDays] = useState(initialRangeDays)
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback((days) => {
    const next = days ?? rangeDays
    setLoading(true)
    setError(null)
    fetchNationalTrend(next)
      .then((data) => {
        setTrend(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((err) => {
        setTrend([])
        setError(err.message || 'Failed to load trend')
        setLoading(false)
      })
  }, [rangeDays])

  useEffect(() => {
    reload(rangeDays)
  }, [rangeDays, reload])

  return { trend, loading, error, rangeDays, setRangeDays, reload }
}

export function useBookingWindows() {
  const [windows, setWindows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchBookingWindows()
      .then((data) => {
        setWindows(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((err) => {
        setWindows([])
        setError(err.message || 'Failed to load booking windows')
        setLoading(false)
      })
  }, [])
  useEffect(() => {
    reload()
  }, [reload])
  return { windows, loading, error, reload }
}

export function useDayOfWeekTrends() {
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchDayOfWeekTrends()
      .then((data) => {
        setDays(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((err) => {
        setDays([])
        setError(err.message || 'Failed to load day trends')
        setLoading(false)
      })
  }, [])
  useEffect(() => {
    reload()
  }, [reload])
  return { days, loading, error, reload }
}
