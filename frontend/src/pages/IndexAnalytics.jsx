import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import PageHeading from '../components/common/PageHeading'
import CardShell from '../components/common/CardShell'
import LoadingBlock from '../components/common/LoadingBlock'
import { useBookingWindows, useDayOfWeekTrends } from '../hooks/useNationalIndex'

export default function IndexAnalytics() {
  const { windows, loading: windowsLoading } = useBookingWindows()
  const { days, loading: daysLoading } = useDayOfWeekTrends()

  const maxDay = Math.max(...days.map((d) => d.indexValue), 1)

  return (
    <div>
      <PageHeading
        eyebrow="Index Analytics"
        title="Booking Window & Demand Patterns"
        description="See how far in advance to book, and which days of the week carry the highest fares."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <CardShell title="Fare by Booking Window" subtitle="Average index value, T+1 to T+45 days before departure">
          <div className="h-[320px] w-full p-6">
            {windowsLoading ? (
              <LoadingBlock height="h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={windows} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="window" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#e4e4e7' }}
                    formatter={(v, name) => [name === 'indexValue' ? v : `₹${v.toLocaleString('en-IN')}`, name === 'indexValue' ? 'Index' : 'Avg. Fare']}
                  />
                  <Bar dataKey="indexValue" radius={[6, 6, 0, 0]}>
                    {windows.map((w, i) => (
                      <Cell key={w.window} fill={i === 0 ? '#dc2626' : '#18181b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="border-t border-zinc-200 px-6 py-3 text-xs text-zinc-500">
            Booking closer to departure (T+1) carries the steepest fare premium — plan 30+ days out for the best rates.
          </div>
        </CardShell>

        <CardShell title="Day-of-Week Trend" subtitle="Average index value by departure day">
          <div className="h-[320px] w-full p-6">
            {daysLoading ? (
              <LoadingBlock height="h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={days} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#e4e4e7' }} />
                  <Bar dataKey="indexValue" radius={[6, 6, 0, 0]}>
                    {days.map((d) => (
                      <Cell key={d.day} fill={d.indexValue === maxDay ? '#dc2626' : '#18181b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="border-t border-zinc-200 px-6 py-3 text-xs text-zinc-500">
            Friday and Saturday departures see the highest average fares across tracked routes.
          </div>
        </CardShell>
      </div>

      <CardShell className="mt-6" title="Booking Window Detail">
        {windowsLoading ? (
          <LoadingBlock />
        ) : (
          <div className="divide-y divide-zinc-100">
            {windows.map((w) => (
              <div key={w.window} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium">{w.window}</p>
                  <p className="text-xs text-zinc-500">{w.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">₹{w.avgFare.toLocaleString('en-IN')}</p>
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
