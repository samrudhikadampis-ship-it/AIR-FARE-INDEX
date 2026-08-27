import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useRoutes } from '../../hooks/useRoutes'

export default function RouteMovements() {
  const { routes, loading } = useRoutes()

  const notable = [...routes]
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, 4)

  return (
    <div>
      <div className="border-b border-zinc-200 px-6 py-4">
        <p className="text-sm font-medium">Route Movements</p>
        <p className="mt-1 text-xs text-zinc-500">Routes with notable price changes</p>
      </div>

      <div className="divide-y divide-zinc-100">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[76px] animate-pulse bg-zinc-50" />
          ))}

        {!loading &&
          notable.map((route) => {
            const up = route.changePct >= 0
            return (
              <Link
                to={`/routes?route=${route.id}`}
                key={route.id}
                className="flex items-center justify-between px-6 py-5 transition hover:bg-zinc-50"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-950">
                    {route.from} → {route.to}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Avg. fare ₹{route.avgFare.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className={`flex items-center gap-1 text-sm font-medium ${up ? 'text-red-500' : 'text-emerald-600'}`}>
                  {up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {up ? '+' : ''}{route.changePct}%
                </div>
              </Link>
            )
          })}
      </div>

      <div className="border-t border-zinc-200 p-4">
        <Link
          to="/routes"
          className="block w-full rounded-lg border border-zinc-200 py-2 text-center text-sm font-medium transition hover:bg-zinc-50"
        >
          View all routes →
        </Link>
      </div>
    </div>
  )
}
