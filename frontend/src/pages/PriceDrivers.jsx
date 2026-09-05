import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Fuel, PartyPopper } from 'lucide-react'
import PageHeading from '../components/common/PageHeading'
import CardShell from '../components/common/CardShell'
import LoadingBlock, { ErrorBlock } from '../components/common/LoadingBlock'
import { usePriceDrivers } from '../hooks/usePriceDrivers'
import { useTheme } from '../context/ThemeContext'
import { getChartTheme, tickStyle } from '../theme/chartTheme'

export default function PriceDrivers() {
  const { isDark } = useTheme()
  const chart = getChartTheme(isDark)
  const { fuelTrend, festivals, demandDrivers, loading, error, available } = usePriceDrivers()
  const fuelRows = Array.isArray(fuelTrend) ? fuelTrend : []
  const festivalRows = Array.isArray(festivals) ? festivals : []
  const driverRows = Array.isArray(demandDrivers) ? demandDrivers : []
  const showEmpty = !loading && (!available || error || (fuelRows.length === 0 && festivalRows.length === 0 && driverRows.length === 0))

  return (
    <div>
      <PageHeading
        eyebrow="Price Drivers"
        title="What's Moving Airfares"
        description="Fuel cost, festival seasonality, and demand signals behind index movement."
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <CardShell
          title="ATF (Jet Fuel) Price vs. Fare Impact"
          subtitle="Illustrative monthly average Turbine Fuel price and its estimated contribution to fare index change"
        >
          <div className="h-[300px] w-full p-6">
            {loading ? (
              <LoadingBlock height="h-full" />
            ) : error ? (
              <ErrorBlock message="Unable to load fuel trend." />
            ) : fuelRows.length === 0 ? (
              <p className="flex h-full items-center justify-center text-center text-sm text-zinc-500">
                Fuel price series is not available from the current quote feed.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fuelRows} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={chart.grid} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={tickStyle(isDark)} />
                  <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={tickStyle(isDark, 11)} />
                  <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={tickStyle(isDark, 11)} />
                  <Tooltip contentStyle={chart.tooltip} />
                  <Line yAxisId="left" type="monotone" dataKey="atfPrice" name="ATF Price (₹/KL)" stroke={chart.line} strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="fareIndexImpact" name="Fare Impact (%)" stroke={chart.accent} strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardShell>

        <CardShell title="Demand Driver Weights" subtitle="Relative contribution to index movement">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {loading ? (
              <LoadingBlock />
            ) : error ? (
              <ErrorBlock message="Unable to load demand drivers." />
            ) : driverRows.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-zinc-500">
                Demand-driver weights are not available.
              </p>
            ) : (
              driverRows.map((d) => (
                <div key={d.driver} className="px-6 py-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{d.driver}</span>
                    <span className="text-zinc-500">{d.weight}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={`h-full rounded-full ${d.trend === 'up' ? 'bg-red-500' : d.trend === 'down' ? 'bg-emerald-500' : 'bg-zinc-400'}`}
                      style={{ width: `${d.weight * 2.6}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardShell>
      </div>

      <CardShell className="mt-6" title="Festival & Seasonality Impact" subtitle="Average fare surge during major Indian travel seasons">
        {loading ? (
          <LoadingBlock />
        ) : error ? (
          <ErrorBlock message="Unable to load festival data." />
        ) : festivalRows.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-zinc-500">
            Festival and seasonality impact is not available from the current quote feed.
          </p>
        ) : (
          <div className="grid divide-y divide-zinc-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3 dark:divide-zinc-800">
            {festivalRows.map((f) => (
              <div key={f.name} className="p-6">
                <div className="flex items-center gap-2">
                  <PartyPopper size={16} className="text-zinc-400" />
                  <p className="text-sm font-medium">{f.name}</p>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{f.dateRange}</p>
                <p className="mt-4 text-2xl font-semibold text-red-500 dark:text-red-400">+{f.avgSurgePct}%</p>
                <p className="mt-1 text-xs text-zinc-500">Most affected: {f.mostAffectedRoute}</p>
              </div>
            ))}
          </div>
        )}
      </CardShell>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
        <Fuel size={16} className="mt-0.5 shrink-0" />
        <p>
          {showEmpty && !available
            ? 'Fuel, festival, and demand-driver series are not present in the quote dataset. This page stays empty until those feeds exist.'
            : 'Fuel and festival effects are estimated from illustrative mock data for this demo. In production these would be computed from ATF price feeds and a festival calendar cross-referenced against route-level fare movement.'}
        </p>
      </div>
    </div>
  )
}
