import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchQuoteRecords } from '../services/api/explorerApi'
import { fetchRoutes } from '../services/api/routesApi'

const PAGE_SIZE = 50

function normalizeRecord(record, index) {
  const priceString = String(record?.price ?? '')
  const priceNumber = Number(priceString.replace(/[^\d.]/g, ''))

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
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [originFilter, setOriginFilter] = useState('All')
  const [destFilter, setDestFilter] = useState('All')
  const [originOptions, setOriginOptions] = useState(['All'])
  const [destOptions, setDestOptions] = useState(['All'])

  const [sortKey, setSortKey] = useState('price_inr')
  const [sortDir, setSortDir] = useState('asc')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setSearch(initialSearch)
    setDebouncedSearch(initialSearch)
    setPage(1)
  }, [initialSearch])

  useEffect(() => {
    setPage(1)
  }, [originFilter, destFilter, debouncedSearch])

  useEffect(() => {
    fetchRoutes()
      .then((routes) => {
        const origins = new Set()
        const dests = new Set()
        for (const route of Array.isArray(routes) ? routes : []) {
          if (route?.from) origins.add(route.from)
          if (route?.to) dests.add(route.to)
        }
        setOriginOptions(['All', ...[...origins].sort()])
        setDestOptions(['All', ...[...dests].sort()])
      })
      .catch(() => {
        setOriginOptions(['All'])
        setDestOptions(['All'])
      })
  }, [])

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchQuoteRecords({
      page,
      pageSize: PAGE_SIZE,
      origin: originFilter,
      destination: destFilter,
      q: debouncedSearch,
    })
      .then((data) => {
        const items = Array.isArray(data.items) ? data.items : []
        setRecords(items.map((record, index) => normalizeRecord(record, index)))
        setTotal(Number.isFinite(Number(data.total)) ? Number(data.total) : items.length)
        setLoading(false)
      })
      .catch((err) => {
        setRecords([])
        setTotal(0)
        setError(err.message || 'Failed to load quotes')
        setLoading(false)
      })
  }, [page, originFilter, destFilter, debouncedSearch])

  useEffect(() => {
    reload()
  }, [reload])

  const filtered = useMemo(() => {
    return [...records].sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [records, sortKey, sortDir])

  function toggleSort(key) {
    if (key === sortKey) {
      setSortDir((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE) || 1)
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)

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
    total,
    page,
    setPage,
    pageCount,
    pageSize: PAGE_SIZE,
    from,
    to,
  }
}
