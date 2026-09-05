import { useCallback, useEffect, useState } from 'react'
import { getApiBase } from '../services/http'
import { fetchSources, fetchCollectionTimeline, fetchCollectionSummary } from '../services/api/collectionApi'

export function useCollectionStatus() {
  const [sources, setSources] = useState([])
  const [timeline, setTimeline] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    const live = Boolean(getApiBase())

    if (live) {
      fetchCollectionSummary()
        .then((sum) => {
          setSummary(sum)
          setSources([])
          setTimeline([])
          setLoading(false)
        })
        .catch((err) => {
          setSummary(null)
          setSources([])
          setTimeline([])
          setError(err.message || 'Failed to load collection status')
          setLoading(false)
        })
      return
    }

    Promise.all([fetchSources(), fetchCollectionTimeline(), fetchCollectionSummary()])
      .then(([s, t, sum]) => {
        setSources(Array.isArray(s) ? s : [])
        setTimeline(Array.isArray(t) ? t : [])
        setSummary(sum)
        setLoading(false)
      })
      .catch((err) => {
        setSummary(null)
        setSources([])
        setTimeline([])
        setError(err.message || 'Failed to load collection status')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { sources, timeline, summary, loading, error, reload }
}
