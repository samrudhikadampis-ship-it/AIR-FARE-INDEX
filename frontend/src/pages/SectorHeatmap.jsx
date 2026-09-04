import PageHeading from '../components/common/PageHeading'
import CardShell from '../components/common/CardShell'
import StatCard from '../components/common/StatCard'
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
  } = useSectorHeatmap()

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
          value={summary.count}
          hint={`${airports.length} airports in the matrix`}
        />
        <StatCard
          label="Hottest Sector"
          value={summary.hottest ? `${summary.hottest.origin} → ${summary.hottest.destination}` : '—'}
          hint={summary.hottest ? `+${summary.hottest.changePercent}% vs prior window` : undefined}
          hintTone="down"
        />
        <StatCard
          label="Softest Sector"
          value={summary.coolest ? `${summary.coolest.origin} → ${summary.coolest.destination}` : '—'}
          hint={
            summary.coolest
              ? `${summary.coolest.changePercent > 0 ? '+' : ''}${summary.coolest.changePercent}% vs prior window`
              : undefined
          }
          hintTone="up"
        />
      </div>

      <CardShell
        title="Route matrix"
        subtitle={`${airports.length} × ${airports.length} origin–destination grid · ${period.toUpperCase()} window`}
      >
        <SectorHeatmapGrid airports={airports} lookup={lookup} metric={metric} isDark={isDark} />
        <HeatmapLegend metric={metric} />
      </CardShell>
    </div>
  )
}
