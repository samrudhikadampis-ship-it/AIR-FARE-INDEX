import { useCallback, useEffect, useState } from 'react'
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
    Promise.all([fetchSources(), fetchCollectionTimeline(), fetchCollectionSummary()])
      .then(([s, t, sum]) => {
        setSources(s)
        setTimeline(t)
        setSummary(sum)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load collection status')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { sources, timeline, summary, loading, error, reload }
}
