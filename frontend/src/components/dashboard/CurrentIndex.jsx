import { TrendingUp, TrendingDown, CalendarDays } from 'lucide-react'
import { useNationalSnapshot } from '../../hooks/useNationalIndex'

export default function CurrentIndex({ rangeLabel = 'Last 30 Days', onRangeClick }) {
  const { snapshot, loading } = useNationalSnapshot()

  if (loading || !snapshot) {
    return <div className="h-[140px] animate-pulse border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50" />
  }

  const up = snapshot.direction === 'up'

  return (
    <div className="border-b border-zinc-200 p-6 lg:p-7 dark:border-zinc-800">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Current National Index</p>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <h2 className="text-4xl font-semibold tracking-tight">{snapshot.current}</h2>

            <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${up ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'}`}>
              {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {snapshot.changePct}%
            </span>
          </div>

          <p className="mt-2 text-sm text-zinc-500">{snapshot.summary}</p>
        </div>

        <button
          onClick={onRangeClick}
          className="flex items-center gap-2 self-start rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <CalendarDays size={16} />
          {rangeLabel}
        </button>
      </div>
    </div>
  )
}
