import { useEffect, useState } from 'react'
import { fetchSources, fetchCollectionTimeline, fetchCollectionSummary } from '../services/api/collectionApi'

export function useCollectionStatus() {
  const [sources, setSources] = useState([])
  const [timeline, setTimeline] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchSources(), fetchCollectionTimeline(), fetchCollectionSummary()]).then(
      ([s, t, sum]) => { setSources(s); setTimeline(t); setSummary(sum); setLoading(false) }
    )
  }, [])

  return { sources, timeline, summary, loading }
}
