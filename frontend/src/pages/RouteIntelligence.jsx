import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Search, X } from 'lucide-react'
import PageHeading from '../components/common/PageHeading'
import CardShell from '../components/common/CardShell'
import ChangePill from '../components/common/ChangePill'
import LoadingBlock from '../components/common/LoadingBlock'
import { useRoutes, useRouteDetail } from '../hooks/useRoutes'

export default function RouteIntelligence() {
  const { routes, loading } = useRoutes()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')

  const selectedId = params.get('route')
  const selectedRoute = routes.find((r) => r.id === selectedId) ?? null
  const { trend, comparison, loading: detailLoading } = useRouteDetail(selectedId)
  const comparisonRows = Array.isArray(comparison) ? comparison : []

  const filtered = useMemo(() => {
    if (!search.trim()) return routes
    const q = search.trim().toLowerCase()
    return routes.filter(
      (r) =>
        r.from.toLowerCase().includes(q) ||
        r.to.toLowerCase().includes(q) ||
        r.fromCity.toLowerCase().includes(q) ||
        r.toCity.toLowerCase().includes(q)
    )
  }, [routes, search])

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
        {/* Route table */}
        <CardShell
          title="All Tracked Routes"
          subtitle={`${filtered.length} of ${routes.length} routes`}
          actions={
            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2">
              <Search size={15} className="text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search route or city..."
                className="w-40 bg-transparent text-sm outline-none placeholder:text-zinc-400"
              />
            </div>
          }
        >
          {loading ? (
            <LoadingBlock />
          ) : (
            <div className="max-h-[560px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white text-xs text-zinc-500">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Route</th>
                    <th className="px-4 py-3 text-left font-medium">Avg. Fare</th>
                    <th className="px-4 py-3 text-left font-medium">Index</th>
                    <th className="px-4 py-3 text-left font-medium">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => selectRoute(r.id)}
                      className={`cursor-pointer transition hover:bg-zinc-50 ${selectedId === r.id ? 'bg-zinc-50' : ''}`}
                    >
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-zinc-950">{r.from} → {r.to}</p>
                        <p className="text-xs text-zinc-500">{r.fromCity} to {r.toCity}</p>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-700">₹{r.avgFare.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3.5 text-zinc-700">{r.indexValue}</td>
                      <td className="px-4 py-3.5"><ChangePill value={r.changePct} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardShell>

        {/* Detail panel */}
        <div className="space-y-6">
          {!selectedRoute && (
            <CardShell>
              <div className="p-10 text-center text-sm text-zinc-500">
                Select a route from the table to see its trend and airline comparison.
              </div>
            </CardShell>
          )}

          {selectedRoute && (
            <>
              <CardShell
                title={`${selectedRoute.from} → ${selectedRoute.to}`}
                subtitle={`${selectedRoute.fromCity} to ${selectedRoute.toCity}`}
                actions={
                  <button onClick={() => selectRoute(null)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
                    <X size={16} />
                  </button>
                }
              >
                <div className="p-6">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-2xl font-semibold tracking-tight">{selectedRoute.indexValue}</h3>
                    <ChangePill value={selectedRoute.changePct} />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Avg. fare ₹{selectedRoute.avgFare.toLocaleString('en-IN')} · {selectedRoute.quotesCollected} quotes collected
                  </p>

                  <div className="mt-6 h-[200px] w-full">
                    {detailLoading ? (
                      <LoadingBlock height="h-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e4e4e7" />
                          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#71717a' }} interval={4} />
                          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#e4e4e7' }} />
                          <Line type="monotone" dataKey="index" stroke="#18181b" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </CardShell>

              <CardShell title="Airline Comparison" subtitle="Average fare by airline on this route">
                <div className="divide-y divide-zinc-100">
                  {detailLoading ? (
                    <LoadingBlock />
                  ) : comparisonRows.length === 0 ? (
                    <p className="px-6 py-10 text-center text-sm text-zinc-500">
                      No airline comparison available for this route.
                    </p>
                  ) : (
                    comparisonRows.map((a, index) => (
                      <div key={a.code ?? a.airline ?? index} className="flex items-center justify-between px-6 py-4">
                        <div>
                          <p className="text-sm font-medium">{a.airline}</p>
                          <p className="text-xs text-zinc-500">{a.quotesCollected ?? 0} quotes</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-zinc-900">
                            ₹{Number(a.avgFare || 0).toLocaleString('en-IN')}
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
