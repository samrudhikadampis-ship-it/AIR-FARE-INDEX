import PageHeading from '../components/common/PageHeading'
import CardShell from '../components/common/CardShell'
import StatCard from '../components/common/StatCard'
import LoadingBlock, { ErrorBlock } from '../components/common/LoadingBlock'
import SectorHeatmapGrid, { HeatmapLegend } from '../components/heatmap/SectorHeatmapGrid'
import { useSectorHeatmap } from '../hooks/useSectorHeatmap'
import { useTheme } from '../context/ThemeContext'

function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      {options.map((option) => {
        const active = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              active
                ? 'bg-zinc-950 font-medium text-white dark:bg-white dark:text-zinc-950'
                : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default function SectorHeatmap() {
  const { isDark } = useTheme()
  const {
    airports,
    metrics,
    periods,
    metric,
    setMetric,
    period,
    setPeriod,
    lookup,
    summary,
    loading,
    error,
  } = useSectorHeatmap()

  const airportList = Array.isArray(airports) ? airports : []
  const hottestHint = summary.hottest
    ? summary.ranking === 'changePercent' && summary.hottest.changePercent != null
      ? `+${summary.hottest.changePercent}% vs prior window`
      : `Avg fare ₹${Number(summary.hottest.averageFare).toLocaleString('en-IN')}`
    : undefined
  const coolestHint = summary.coolest
    ? summary.ranking === 'changePercent' && summary.coolest.changePercent != null
      ? `${summary.coolest.changePercent > 0 ? '+' : ''}${summary.coolest.changePercent}% vs prior window`
      : `Avg fare ₹${Number(summary.coolest.averageFare).toLocaleString('en-IN')}`
    : undefined

  return (
    <div>
      <PageHeading
        eyebrow="Sector Heatmap"
        title="Sector-wise Airfare Movement"
        description="Compare fare change and average prices across major Indian domestic sectors. Darker cells show stronger movement in the selected metric."
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          ariaLabel="Heatmap metric"
          options={metrics}
          value={metric}
          onChange={setMetric}
        />
        <Segmented
          ariaLabel="Time period"
          options={periods}
          value={period}
          onChange={setPeriod}
        />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Sectors Mapped"
          value={loading ? '—' : summary.count}
          hint={`${airportList.length} airports in the matrix`}
        />
        <StatCard
          label="Hottest Sector"
          value={summary.hottest ? `${summary.hottest.origin} → ${summary.hottest.destination}` : '—'}
          hint={hottestHint}
          hintTone="down"
        />
        <StatCard
          label="Softest Sector"
          value={summary.coolest ? `${summary.coolest.origin} → ${summary.coolest.destination}` : '—'}
          hint={coolestHint}
          hintTone="up"
        />
      </div>

      <CardShell
        title="Route matrix"
        subtitle={`${airportList.length} × ${airportList.length} origin–destination grid · ${period.toUpperCase()} window`}
      >
        {loading ? (
          <LoadingBlock height="h-64" />
        ) : error ? (
          <ErrorBlock message="Unable to load heatmap sectors." />
        ) : airportList.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-zinc-500">No sector observations are available.</p>
        ) : (
          <>
            <SectorHeatmapGrid airports={airportList} lookup={lookup} metric={metric} isDark={isDark} />
            <HeatmapLegend metric={metric} isDark={isDark} />
          </>
        )}
      </CardShell>
    </div>
  )
}
