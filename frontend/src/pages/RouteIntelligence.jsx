import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Search, X } from 'lucide-react'
import PageHeading from '../components/common/PageHeading'
import CardShell from '../components/common/CardShell'
import ChangePill from '../components/common/ChangePill'
import LoadingBlock, { ErrorBlock } from '../components/common/LoadingBlock'
import { useRoutes, useRouteDetail } from '../hooks/useRoutes'
import { useTheme } from '../context/ThemeContext'
import { getChartTheme, tickStyle } from '../theme/chartTheme'
import { formatIndex, formatInr, formatInt } from '../services/api/shape'

export default function RouteIntelligence() {
  const { isDark } = useTheme()
  const chart = getChartTheme(isDark)
  const { routes, loading, error } = useRoutes()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const routeList = Array.isArray(routes) ? routes : []

  const selectedId = params.get('route')
  const selectedRoute = routeList.find((r) => r.id === selectedId) ?? null
  const { trend, comparison, loading: detailLoading, error: detailError } = useRouteDetail(selectedId)
  const comparisonRows = Array.isArray(comparison) ? comparison : []
  const trendPoints = Array.isArray(trend) ? trend : []

  const filtered = useMemo(() => {
    if (!search.trim()) return routeList
    const q = search.trim().toLowerCase()
    return routeList.filter((r) => {
      const from = String(r.from ?? '').toLowerCase()
      const to = String(r.to ?? '').toLowerCase()
      const fromCity = String(r.fromCity ?? r.from ?? '').toLowerCase()
      const toCity = String(r.toCity ?? r.to ?? '').toLowerCase()
      return from.includes(q) || to.includes(q) || fromCity.includes(q) || toCity.includes(q)
    })
  }, [routeList, search])

  function selectRoute(id) {
    setParams(id ? { route: id } : {})
  }

  return (
    <div>
      <PageHeading
        eyebrow="Route Intelligence"
        title="Route-level Airfare Analysis"
        description="Compare fares, index movement, and airline performance across all tracked routes."
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <CardShell
          title="All Tracked Routes"
          subtitle={`${filtered.length} of ${routeList.length} routes`}
          actions={
            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950">
              <Search size={15} className="text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search route or city..."
                className="w-40 bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:text-zinc-100"
              />
            </div>
          }
        >
          {loading ? (
            <LoadingBlock />
          ) : error ? (
            <ErrorBlock message="Unable to load routes." />
          ) : filtered.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-zinc-500">No routes match this view.</p>
          ) : (
            <div className="max-h-[560px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white text-xs text-zinc-500 dark:bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Route</th>
                    <th className="px-4 py-3 text-left font-medium">Avg. Fare</th>
                    <th className="px-4 py-3 text-left font-medium">Index</th>
                    <th className="px-4 py-3 text-left font-medium">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => selectRoute(r.id)}
                      className={`cursor-pointer transition hover:bg-zinc-50 dark:hover:bg-zinc-800/70 ${selectedId === r.id ? 'bg-zinc-50 dark:bg-zinc-800/70' : ''}`}
                    >
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-zinc-950 dark:text-zinc-50">{r.from} → {r.to}</p>
                        <p className="text-xs text-zinc-500">{r.fromCity} to {r.toCity}</p>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-700 dark:text-zinc-300">{formatInr(r.avgFare)}</td>
                      <td className="px-4 py-3.5 text-zinc-700 dark:text-zinc-300">{formatIndex(r.indexValue)}</td>
                      <td className="px-4 py-3.5"><ChangePill value={r.changePct} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardShell>

        <div className="space-y-6">
          {!selectedId && (
            <CardShell>
              <div className="p-10 text-center text-sm text-zinc-500">
                Select a route from the table to see its trend and airline comparison.
              </div>
            </CardShell>
          )}

          {selectedId && !loading && !selectedRoute && (
            <CardShell>
              <div className="p-10 text-center text-sm text-zinc-500">
                This route is not in the current dataset.
              </div>
            </CardShell>
          )}

          {selectedRoute && (
            <>
              <CardShell
                title={`${selectedRoute.from} → ${selectedRoute.to}`}
                subtitle={`${selectedRoute.fromCity} to ${selectedRoute.toCity}`}
                actions={
                  <button onClick={() => selectRoute(null)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                    <X size={16} />
                  </button>
                }
              >
                <div className="p-6">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-2xl font-semibold tracking-tight">{formatIndex(selectedRoute.indexValue)}</h3>
                    <ChangePill value={selectedRoute.changePct} />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Avg. fare {formatInr(selectedRoute.avgFare)} · {formatInt(selectedRoute.quotesCollected)} quotes collected
                  </p>

                  <div className="mt-6 h-[200px] w-full">
                    {detailLoading ? (
                      <LoadingBlock height="h-full" />
                    ) : detailError ? (
                      <ErrorBlock message="Unable to load route trend." />
                    ) : trendPoints.length === 0 ? (
                      <p className="flex h-full items-center justify-center text-sm text-zinc-500">No scrape-date trend for this route.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendPoints} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={chart.grid} />
                          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={tickStyle(isDark, 11)} interval={4} />
                          <YAxis tickLine={false} axisLine={false} tick={tickStyle(isDark, 11)} />
                          <Tooltip contentStyle={chart.tooltip} />
                          <Line type="monotone" dataKey="index" stroke={chart.line} strokeWidth={2} dot={trendPoints.length === 1} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </CardShell>

              <CardShell title="Airline Comparison" subtitle="Average fare by airline on this route">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {detailLoading ? (
                    <LoadingBlock />
                  ) : detailError ? (
                    <ErrorBlock message="Unable to load route quotes." />
                  ) : comparisonRows.length === 0 ? (
                    <p className="px-6 py-10 text-center text-sm text-zinc-500">
                      No airline comparison available for this route.
                    </p>
                  ) : (
                    comparisonRows.map((a, index) => (
                      <div key={a.code ?? a.airline ?? index} className="flex items-center justify-between px-6 py-4">
                        <div>
                          <p className="text-sm font-medium">{a.airline}</p>
                          <p className="text-xs text-zinc-500">{formatInt(a.quotesCollected)} quotes</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {formatInr(a.avgFare)}
                          </p>
                          <ChangePill value={a.changePct} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardShell>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
