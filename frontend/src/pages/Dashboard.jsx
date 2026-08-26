import CurrentIndex from '../components/dashboard/CurrentIndex'
import IndexTrendChart from '../components/dashboard/IndexTrendChart'
import RouteMovements from '../components/dashboard/RouteMovements'

export default function Dashboard() {
  return (
    <div>
      {/* Page heading */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm text-zinc-500">
            Overview
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            India's Airfare Market
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Monitor airfare prices and market movements across
            major domestic routes.
          </p>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <button className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50">
            Refresh
          </button>

          <button className="flex items-center gap-2 rounded-lg bg-zinc-950 px-3 py-2 text-sm text-white hover:bg-zinc-800">
            Export
          </button>
        </div>
      </div>

      {/* Main analytics card */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <CurrentIndex />

        <div className="grid lg:grid-cols-[1.7fr_1fr]">
          <IndexTrendChart />
          <RouteMovements />
        </div>
      </div>

      {/* Bottom cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Routes Tracked</p>
          <p className="mt-3 text-3xl font-semibold">24</p>
          <p className="mt-1 text-xs text-emerald-600">
            ● All routes operational
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Quotes Collected</p>
          <p className="mt-3 text-3xl font-semibold">12,482</p>
          <p className="mt-1 text-xs text-zinc-500">
            Updated 2 minutes ago
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Data Coverage</p>
          <p className="mt-3 text-3xl font-semibold">98.2%</p>
          <p className="mt-1 text-xs text-emerald-600">
            ↑ 1.4% this week
          </p>
        </div>
      </div>
    </div>
  )
}