import CurrentIndex from '../components/dashboard/CurrentIndex'
import IndexTrendChart from '../components/dashboard/IndexTrendChart'
import RouteMovements from '../components/dashboard/RouteMovements'
import StatCard from '../components/common/StatCard'
import PageHeading from '../components/common/PageHeading'
import { useCollectionStatus } from '../hooks/useCollectionStatus'
import { useRoutes } from '../hooks/useRoutes'

export default function Overview() {
  const { summary, loading: collectionLoading } = useCollectionStatus()
  const { routes } = useRoutes()

  return (
    <div>
      <PageHeading
        eyebrow="Overview"
        title="India's Airfare Market"
        description="Monitor airfare prices and market movements across major domestic routes."
        actions={
          <>
            <button className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">
              Refresh
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-zinc-950 px-3 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
              Export
            </button>
          </>
        }
      />

      {/* Main analytics card */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <CurrentIndex />
        <div className="grid lg:grid-cols-[1.7fr_1fr]">
          <IndexTrendChart />
          <RouteMovements />
        </div>
      </div>

      {/* Bottom cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Routes Tracked"
          value={routes.length || '—'}
          hint="● All routes operational"
          hintTone="up"
        />
        <StatCard
          label="Quotes Collected"
          value={collectionLoading ? '—' : summary.quotesCollectedToday.toLocaleString('en-IN')}
          hint="Updated 2 minutes ago"
        />
        <StatCard
          label="Data Coverage"
          value={collectionLoading ? '—' : `${summary.dataCoveragePct}%`}
          hint="↑ 1.4% this week"
          hintTone="up"
        />
      </div>
    </div>
  )
}
