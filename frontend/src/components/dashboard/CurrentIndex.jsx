import { TrendingUp, CalendarDays } from 'lucide-react'

export default function CurrentIndex() {
  return (
    <div className="border-b border-zinc-200 p-6 lg:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-sm font-medium text-zinc-600">
              Current National Index
            </p>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <h2 className="text-4xl font-semibold tracking-tight">
              127.4
            </h2>

            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <TrendingUp size={13} />
              6.8%
            </span>
          </div>

          <p className="mt-2 text-sm text-zinc-500">
            National airfare prices are up compared with last month
          </p>
        </div>

        <button className="flex items-center gap-2 self-start rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium shadow-sm transition hover:bg-zinc-50">
          <CalendarDays size={16} />
          Last 30 Days
        </button>
      </div>
    </div>
  )
}