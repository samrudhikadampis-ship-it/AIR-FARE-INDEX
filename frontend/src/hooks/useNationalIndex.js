import { useEffect, useState, useCallback } from 'react'
import {
  fetchNationalSnapshot,
  fetchNationalTrend,
  fetchBookingWindows,
  fetchDayOfWeekTrends,
} from '../services/api/indexApi'

export function useNationalSnapshot() {
  const [snapshot, setSnapshot] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetchNationalSnapshot().then((data) => {
      if (alive) { setSnapshot(data); setLoading(false) }
    })
    return () => { alive = false }
  }, [])

  return { snapshot, loading }
}

export function useNationalTrend(initialRangeDays = 30) {
  const [rangeDays, setRangeDays] = useState(initialRangeDays)
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback((days) => {
    setLoading(true)
    fetchNationalTrend(days ?? rangeDays).then((data) => {
      setTrend(data)
      setLoading(false)
    })
  }, [rangeDays])

  useEffect(() => { reload(rangeDays) }, [rangeDays]) // eslint-disable-line react-hooks/exhaustive-deps

  return { trend, loading, rangeDays, setRangeDays }
}

export function useBookingWindows() {
  const [windows, setWindows] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchBookingWindows().then((data) => { setWindows(data); setLoading(false) })
  }, [])
  return { windows, loading }
}

export function useDayOfWeekTrends() {
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchDayOfWeekTrends().then((data) => { setDays(data); setLoading(false) })
  }, [])
  return { days, loading }
}
