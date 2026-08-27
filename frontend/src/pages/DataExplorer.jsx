import { Search, ArrowUpDown, Download } from 'lucide-react'
import PageHeading from '../components/common/PageHeading'
import CardShell from '../components/common/CardShell'
import LoadingBlock from '../components/common/LoadingBlock'
import { useDataExplorer } from '../hooks/useDataExplorer'

const COLUMNS = [
  { key: 'id', label: 'Quote ID' },
  { key: 'route', label: 'Route' },
  { key: 'airline', label: 'Airline' },
  { key: 'fare', label: 'Fare' },
  { key: 'source', label: 'Source' },
  { key: 'bookingWindowDays', label: 'Booking Window' },
  { key: 'collectedAt', label: 'Collected At' },
]

export default function DataExplorer() {
  const {
    loading, filtered, search, setSearch, airlineFilter, setAirlineFilter,
    airlineOptions, sortKey, sortDir, toggleSort, total,
  } = useDataExplorer()

  return (
    <div>
      <PageHeading
        eyebrow="Data Explorer"
        title="Raw Quote Records"
        description="Browse, search, and filter individual fare quotes collected from every source."
        actions={
          <button className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50">
            <Download size={15} />
            Export CSV
          </button>
        }
      />

      <CardShell
        title="Quotes"
        subtitle={`Showing ${filtered.length} of ${total} records`}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={airlineFilter}
              onChange={(e) => setAirlineFilter(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
            >
              {airlineOptions.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2">
              <Search size={15} className="text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search route, airline, source..."
                className="w-48 bg-transparent text-sm outline-none placeholder:text-zinc-400"
              />
            </div>
          </div>
        }
      >
        {loading ? (
          <LoadingBlock height="h-64" />
        ) : (
          <div className="max-h-[600px] overflow-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="sticky top-0 bg-white text-xs text-zinc-500">
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="px-6 py-3 text-left font-medium">
                      <button
                        onClick={() => toggleSort(col.key)}
                        className="flex items-center gap-1 hover:text-zinc-900"
                      >
                        {col.label}
                        <ArrowUpDown size={12} className={sortKey === col.key ? 'text-zinc-900' : 'text-zinc-300'} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-3 font-mono text-xs text-zinc-500">{r.id}</td>
                    <td className="px-6 py-3 font-medium text-zinc-950">{r.route}</td>
                    <td className="px-6 py-3 text-zinc-700">{r.airline}</td>
                    <td className="px-6 py-3 text-zinc-700">₹{r.fare.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-3 text-zinc-700">{r.source}</td>
                    <td className="px-6 py-3 text-zinc-700">T+{r.bookingWindowDays}</td>
                    <td className="px-6 py-3 text-zinc-500">
                      {new Date(r.collectedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-6 py-12 text-center text-sm text-zinc-400">
                      No quotes match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardShell>
    </div>
  )
}
