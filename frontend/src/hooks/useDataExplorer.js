import { useEffect, useMemo, useState } from 'react'
import { fetchQuoteRecords } from '../services/api/explorerApi'

export function useDataExplorer() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [airlineFilter, setAirlineFilter] = useState('All')
  const [sortKey, setSortKey] = useState('collectedAt')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    fetchQuoteRecords().then((data) => { setRecords(data); setLoading(false) })
  }, [])

  const airlineOptions = useMemo(
    () => ['All', ...new Set(records.map((r) => r.airline))],
    [records]
  )

  const filtered = useMemo(() => {
    let rows = records
    if (airlineFilter !== 'All') rows = rows.filter((r) => r.airline === airlineFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(
        (r) =>
          r.route.toLowerCase().includes(q) ||
          r.airline.toLowerCase().includes(q) ||
          r.source.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      )
    }
    const sorted = [...rows].sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey]
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [records, search, airlineFilter, sortKey, sortDir])

  function toggleSort(key) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  return {
    loading, filtered, search, setSearch, airlineFilter, setAirlineFilter,
    airlineOptions, sortKey, sortDir, toggleSort, total: records.length,
  }
}
