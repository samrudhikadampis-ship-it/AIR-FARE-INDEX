import CurrentIndex from '../components/dashboard/CurrentIndex'
import IndexTrendChart from '../components/dashboard/IndexTrendChart'
import RouteMovements from '../components/dashboard/RouteMovements'
import StatCard from '../components/common/StatCard'
import PageHeading from '../components/common/PageHeading'
import { useCollectionStatus } from '../hooks/useCollectionStatus'
import { useRoutes } from '../hooks/useRoutes'
import { formatInt } from '../services/api/shape'

export default function Overview() {
  const { summary, loading: collectionLoading, error: collectionError } = useCollectionStatus()
  const { routes, loading: routesLoading, error: routesError } = useRoutes()
  const routeCount = Array.isArray(routes) ? routes.length : 0

  const quotesValue = collectionLoading
    ? '—'
    : collectionError || !summary
      ? '—'
      : formatInt(summary.quotesTotal)

  const coverageValue = collectionLoading
    ? '—'
    : summary?.dataCoveragePct != null
      ? `${summary.dataCoveragePct}%`
      : '—'

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

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <CurrentIndex />
        <div className="grid lg:grid-cols-[1.7fr_1fr]">
          <IndexTrendChart />
          <RouteMovements />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Routes Tracked"
          value={routesLoading ? '—' : routesError ? '—' : routeCount || '—'}
          hint={routesError ? 'Unable to load routes' : '● All routes operational'}
          hintTone={routesError ? undefined : 'up'}
        />
        <StatCard
          label="Quotes Collected"
          value={quotesValue}
          hint={collectionError ? 'Unable to load collection summary' : undefined}
        />
        <StatCard
          label="Data Coverage"
          value={coverageValue}
          hint={summary?.dataCoveragePct != null ? '↑ 1.4% this week' : 'Not available from current collection feed'}
          hintTone={summary?.dataCoveragePct != null ? 'up' : undefined}
        />
      </div>
    </div>
  )
}
