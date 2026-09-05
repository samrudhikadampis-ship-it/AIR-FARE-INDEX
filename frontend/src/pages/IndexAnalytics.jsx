import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import PageHeading from '../components/common/PageHeading'
import CardShell from '../components/common/CardShell'
import LoadingBlock, { ErrorBlock } from '../components/common/LoadingBlock'
import CurrentIndex from '../components/dashboard/CurrentIndex'
import IndexTrendChart from '../components/dashboard/IndexTrendChart'
import { useBookingWindows, useDayOfWeekTrends } from '../hooks/useNationalIndex'
import { useTheme } from '../context/ThemeContext'
import { getChartTheme, tickStyle } from '../theme/chartTheme'
import { formatInr } from '../services/api/shape'

export default function IndexAnalytics() {
  const { isDark } = useTheme()
  const chart = getChartTheme(isDark)
  const { windows, loading: windowsLoading, error: windowsError } = useBookingWindows()
  const { days, loading: daysLoading, error: daysError } = useDayOfWeekTrends()
  const windowRows = Array.isArray(windows) ? windows : []
  const dayRows = Array.isArray(days) ? days : []

  const dayValues = dayRows.map((d) => d.indexValue).filter((n) => Number.isFinite(n))
  const maxDay = dayValues.length ? Math.max(...dayValues) : null

  return (
    <div>
      <PageHeading
        eyebrow="Index Analytics"
        title="Booking Window & Demand Patterns"
        description="See how far in advance to book, and which days of the week carry the highest fares."
      />

      <div className="mb-6 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <CurrentIndex />
        <IndexTrendChart />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CardShell title="Fare by Booking Window" subtitle="Average index value for observed booking windows">
          <div className="h-[320px] w-full p-6">
            {windowsLoading ? (
              <LoadingBlock height="h-full" />
            ) : windowsError ? (
              <ErrorBlock message="Unable to load booking windows." />
            ) : windowRows.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-zinc-500">No booking-window quotes matched 1, 7, 15, 30, or 45 days.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={windowRows} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={chart.grid} />
                  <XAxis dataKey="window" tickLine={false} axisLine={false} tick={tickStyle(isDark)} />
                  <YAxis tickLine={false} axisLine={false} tick={tickStyle(isDark)} />
                  <Tooltip
                    contentStyle={chart.tooltip}
                    formatter={(v, name) => [name === 'indexValue' ? v : `₹${Number(v).toLocaleString('en-IN')}`, name === 'indexValue' ? 'Index' : 'Avg. Fare']}
                  />
                  <Bar dataKey="indexValue" radius={[6, 6, 0, 0]}>
                    {windowRows.map((w, i) => (
                      <Cell key={w.window} fill={i === 0 ? chart.accent : chart.line} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="border-t border-zinc-200 px-6 py-3 text-xs text-zinc-500 dark:border-zinc-800">
            Only quotes whose travel date minus scrape date is exactly 1, 7, 15, 30, or 45 days are included.
          </div>
        </CardShell>

        <CardShell title="Day-of-Week Trend" subtitle="Average index value by departure day">
          <div className="h-[320px] w-full p-6">
            {daysLoading ? (
              <LoadingBlock height="h-full" />
            ) : daysError ? (
              <ErrorBlock message="Unable to load day-of-week data." />
            ) : dayRows.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-zinc-500">No travel dates are available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayRows} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={chart.grid} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={tickStyle(isDark)} />
                  <YAxis tickLine={false} axisLine={false} tick={tickStyle(isDark)} />
                  <Tooltip contentStyle={chart.tooltip} />
                  <Bar dataKey="indexValue" radius={[6, 6, 0, 0]}>
                    {dayRows.map((d) => (
                      <Cell key={d.day} fill={maxDay != null && d.indexValue === maxDay ? chart.accent : chart.line} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="border-t border-zinc-200 px-6 py-3 text-xs text-zinc-500 dark:border-zinc-800">
            Days with no collected travel dates are omitted.
          </div>
        </CardShell>
      </div>

      <CardShell className="mt-6" title="Booking Window Detail">
        {windowsLoading ? (
          <LoadingBlock />
        ) : windowsError ? (
          <ErrorBlock message="Unable to load booking windows." />
        ) : windowRows.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-zinc-500">No booking-window detail available.</p>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {windowRows.map((w) => (
              <div key={w.window} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium">{w.window}</p>
                  <p className="text-xs text-zinc-500">{w.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatInr(w.avgFare)}</p>
                  <p className="text-xs text-zinc-500">Index {w.indexValue}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardShell>
    </div>
  )
}
