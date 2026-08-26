import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

const routes = [
  {
    route: 'DEL → BOM',
    fare: '₹6,420',
    change: '+12.4%',
    up: true,
  },
  {
    route: 'BOM → BLR',
    fare: '₹5,920',
    change: '+8.1%',
    up: true,
  },
  {
    route: 'DEL → BLR',
    fare: '₹7,180',
    change: '+4.2%',
    up: true,
  },
  {
    route: 'MAA → DEL',
    fare: '₹6,040',
    change: '-2.6%',
    up: false,
  },
]

export default function RouteMovements() {
  return (
    <div>
      <div className="border-b border-zinc-200 px-6 py-4">
        <p className="text-sm font-medium">Route Movements</p>
        <p className="mt-1 text-xs text-zinc-500">
          Routes with notable price changes
        </p>
      </div>

      <div className="divide-y divide-zinc-100">
        {routes.map((route) => (
          <div
            key={route.route}
            className="flex items-center justify-between px-6 py-5 transition hover:bg-zinc-50"
          >
            <div>
              <p className="text-sm font-medium text-zinc-950">
                {route.route}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Avg. fare {route.fare}
              </p>
            </div>

            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                route.up
                  ? 'text-red-500'
                  : 'text-emerald-600'
              }`}
            >
              {route.up ? (
                <ArrowUpRight size={16} />
              ) : (
                <ArrowDownRight size={16} />
              )}

              {route.change}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-200 p-4">
        <button className="w-full rounded-lg border border-zinc-200 py-2 text-sm font-medium transition hover:bg-zinc-50">
          View all routes →
        </button>
      </div>
    </div>
  )
}