import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useRoutes } from '../../hooks/useRoutes'
import { formatInr } from '../../services/api/shape'

export default function RouteMovements() {
  const { routes, loading, error } = useRoutes()
  const list = Array.isArray(routes) ? routes : []

  const notable = [...list]
    .filter((route) => route.changePct != null)
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, 4)

  const fallback = notable.length
    ? notable
    : [...list]
        .filter((route) => route.avgFare != null)
        .sort((a, b) => b.avgFare - a.avgFare)
        .slice(0, 4)

  return (
    <div>
      <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <p className="text-sm font-medium">Route Movements</p>
        <p className="mt-1 text-xs text-zinc-500">
          {notable.length ? 'Routes with notable price changes' : 'Highest average fares among tracked routes'}
        </p>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[76px] animate-pulse bg-zinc-50 dark:bg-zinc-800/50" />
          ))}

        {!loading && error && (
          <p className="px-6 py-10 text-center text-sm text-zinc-500">Unable to load routes.</p>
        )}

        {!loading && !error && fallback.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-zinc-500">No route records available.</p>
        )}

        {!loading &&
          !error &&
          fallback.map((route) => {
            const showChange = route.changePct != null
            const up = showChange && route.changePct >= 0
            return (
              <Link
                to={`/routes?route=${route.id}`}
                key={route.id}
                className="flex items-center justify-between px-6 py-5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/70"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                    {route.from} → {route.to}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Avg. fare {formatInr(route.avgFare)}
                  </p>
                </div>

                {showChange ? (
                  <div className={`flex items-center gap-1 text-sm font-medium ${up ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {up ? '+' : ''}{route.changePct}%
                  </div>
                ) : (
                  <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {formatInr(route.avgFare)}
                  </div>
                )}
              </Link>
            )
          })}
      </div>

      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <Link
          to="/routes"
          className="block w-full rounded-lg border border-zinc-200 py-2 text-center text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          View all routes →
        </Link>
      </div>
    </div>
  )
}
