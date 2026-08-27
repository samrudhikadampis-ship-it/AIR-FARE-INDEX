import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchQuoteRecords } from '../services/api/explorerApi'

function normalizeRecord(record, index) {
  const priceString = String(record?.price ?? '')
  const priceNumber = Number(
    priceString.replace(/[^\d.]/g, '')
  )

  return {
    ...record,
    id: record?.id ?? `quote-${index + 1}`,
    source: record?.source ?? '',
    destination: record?.destination ?? '',
    departure_time: record?.departure_time ?? '',
    arrival_time: record?.arrival_time ?? '',
    duration: record?.duration ?? '',
    price: record?.price ?? '',
    price_inr: Number.isNaN(priceNumber) ? 0 : priceNumber,
  }
}

export function useDataExplorer(initialSearch = '') {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState(initialSearch)

  const [originFilter, setOriginFilter] = useState('All')
  const [destFilter, setDestFilter] = useState('All')

  const [sortKey, setSortKey] = useState('price_inr')
  const [sortDir, setSortDir] = useState('asc')

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)

    fetchQuoteRecords()
      .then((data) => {
        const safeData = Array.isArray(data) ? data : []

        setRecords(
          safeData.map((record, index) =>
            normalizeRecord(record, index)
          )
        )

        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load quote records:', err)

        setRecords([])
        setError(err.message || 'Failed to load quotes')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    setSearch(initialSearch)
  }, [initialSearch])

  const originOptions = useMemo(
    () => [
      'All',
      ...[
        ...new Set(
          records
            .map((record) => record.source)
            .filter(Boolean)
        ),
      ].sort(),
    ],
    [records]
  )

  const destOptions = useMemo(
    () => [
      'All',
      ...[
        ...new Set(
          records
            .map((record) => record.destination)
            .filter(Boolean)
        ),
      ].sort(),
    ],
    [records]
  )

  const filtered = useMemo(() => {
    let rows = records

    if (originFilter !== 'All') {
      rows = rows.filter(
        (record) => record.source === originFilter
      )
    }

    if (destFilter !== 'All') {
      rows = rows.filter(
        (record) => record.destination === destFilter
      )
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()

      rows = rows.filter((record) => {
        return (
          String(record.source).toLowerCase().includes(q) ||
          String(record.destination).toLowerCase().includes(q) ||
          String(record.departure_time).toLowerCase().includes(q) ||
          String(record.arrival_time).toLowerCase().includes(q) ||
          String(record.price).toLowerCase().includes(q) ||
          String(record.id).toLowerCase().includes(q)
        )
      })
    }

    return [...rows].sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]

      if (va < vb) {
        return sortDir === 'asc' ? -1 : 1
      }

      if (va > vb) {
        return sortDir === 'asc' ? 1 : -1
      }

      return 0
    })
  }, [
    records,
    search,
    originFilter,
    destFilter,
    sortKey,
    sortDir,
  ])

  function toggleSort(key) {
    if (key === sortKey) {
      setSortDir((direction) =>
        direction === 'asc' ? 'desc' : 'asc'
      )
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return {
    loading,
    error,
    reload,

    filtered,

    search,
    setSearch,

    originFilter,
    setOriginFilter,

    destFilter,
    setDestFilter,

    originOptions,
    destOptions,

    sortKey,
    sortDir,
    toggleSort,

    total: records.length,
  }
}