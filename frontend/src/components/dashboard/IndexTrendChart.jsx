import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useNationalTrend } from '../../hooks/useNationalIndex'
import { useTheme } from '../../context/ThemeContext'
import { getChartTheme, tickStyle } from '../../theme/chartTheme'

const RANGE_OPTIONS = [
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'Last 12 Months', days: 365 },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
        Airfare Index: {payload[0].value}
      </p>
    </div>
  )
}

export default function IndexTrendChart() {
  const { isDark } = useTheme()
  const chart = getChartTheme(isDark)
  const { trend, loading, rangeDays, setRangeDays } = useNationalTrend(30)

  const latest = trend[trend.length - 1]?.index
  const first = trend[0]?.index
  const changePct = first ? (((latest - first) / first) * 100).toFixed(1) : 0
  const up = changePct >= 0

  return (
    <div className="border-r border-zinc-200 p-6 dark:border-zinc-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">Index Trend</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">{latest ?? '—'}</h3>
          <p className={`mt-1 text-sm ${up ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {up ? '↑' : '↓'} {Math.abs(changePct)}% from range start
          </p>
        </div>

        <select
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          value={rangeDays}
          onChange={(e) => setRangeDays(Number(e.target.value))}
        >
          {RANGE_OPTIONS.map((opt) => (
            <option key={opt.days} value={opt.days}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="mt-8 h-[320px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">Loading trend…</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={chart.grid} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={tickStyle(isDark)}
                interval={Math.max(0, Math.floor(trend.length / 8))}
              />
              <YAxis
                domain={['dataMin - 2', 'dataMax + 2']}
                tickLine={false}
                axisLine={false}
                tick={tickStyle(isDark)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: chart.cursor, strokeDasharray: '4 4' }} />
              <Line
                type="monotone"
                dataKey="index"
                stroke={chart.line}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="mt-3 text-xs text-zinc-400">
        National airfare price index · Illustrative data
      </p>
    </div>
  )
}
