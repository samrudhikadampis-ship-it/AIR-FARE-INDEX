import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { RefreshCw } from 'lucide-react'
import PageHeading from '../components/common/PageHeading'
import CardShell from '../components/common/CardShell'
import StatCard from '../components/common/StatCard'
import StatusBadge from '../components/common/StatusBadge'
import LoadingBlock from '../components/common/LoadingBlock'
import { useCollectionStatus } from '../hooks/useCollectionStatus'
import { useTheme } from '../context/ThemeContext'
import { getChartTheme, tickStyle } from '../theme/chartTheme'

export default function LiveCollection() {
  const { isDark } = useTheme()
  const chart = getChartTheme(isDark)
  const { sources, timeline, summary, loading } = useCollectionStatus()

  return (
    <div>
      <PageHeading
        eyebrow="Live Collection"
        title="Scraper & Data Source Health"
        description="Real-time status of every airline and OTA source feeding the index."
        actions={
          <button className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">
            <RefreshCw size={15} />
            Refresh
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Quotes Collected Today" value={loading ? '—' : summary.quotesCollectedToday.toLocaleString('en-IN')} />
        <StatCard label="Active Scrapers" value={loading ? '—' : `${summary.activeScrapers}/${summary.totalScrapers}`} />
        <StatCard label="Data Coverage" value={loading ? '—' : `${summary.dataCoveragePct}%`} hint="↑ 1.4% this week" hintTone="up" />
        <StatCard label="Avg. Success Rate" value={loading ? '—' : `${summary.avgSuccessRatePct}%`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <CardShell title="Quotes Collected (24h)" subtitle="Hourly volume across all sources">
          <div className="h-[280px] w-full p-6">
            {loading ? (
              <LoadingBlock height="h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="quotesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chart.areaFill} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={chart.areaFill} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={chart.grid} />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tick={tickStyle(isDark, 11)} interval={3} />
                  <YAxis tickLine={false} axisLine={false} tick={tickStyle(isDark, 11)} />
                  <Tooltip contentStyle={chart.tooltip} />
                  <Area type="monotone" dataKey="quotes" stroke={chart.line} strokeWidth={2} fill="url(#quotesGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardShell>

        <CardShell title="Source Status" subtitle={`${sources.filter((s) => s.status === 'healthy').length} of ${sources.length} healthy`}>
          <div className="max-h-[320px] divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
            {loading ? (
              <LoadingBlock />
            ) : (
              sources.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-zinc-500">{s.type} · Last run {s.lastRunAgoMin}m ago</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))
            )}
          </div>
        </CardShell>
      </div>

      <CardShell className="mt-6" title="Source Details">
        {loading ? (
          <LoadingBlock />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-xs text-zinc-500">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Source</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Success Rate</th>
                  <th className="px-4 py-3 text-left font-medium">Avg. Latency</th>
                  <th className="px-4 py-3 text-left font-medium">Quotes (24h)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {sources.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/70">
                    <td className="px-6 py-3.5 font-medium text-zinc-950 dark:text-zinc-50">{s.name}</td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400">{s.type}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3.5 text-zinc-700 dark:text-zinc-300">{s.successRate}%</td>
                    <td className="px-4 py-3.5 text-zinc-700 dark:text-zinc-300">{s.avgLatencyMs}ms</td>
                    <td className="px-4 py-3.5 text-zinc-700 dark:text-zinc-300">{s.quotesLast24h.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardShell>
    </div>
  )
}
