import { Search, ArrowUpDown, Download } from 'lucide-react'
import PageHeading from '../components/common/PageHeading'
import CardShell from '../components/common/CardShell'
import LoadingBlock from '../components/common/LoadingBlock'
import { useDataExplorer } from '../hooks/useDataExplorer'

const COLUMNS = [
  { key: 'id', label: 'Quote ID' },
  { key: 'source', label: 'Origin' },
  { key: 'destination', label: 'Destination' },
  { key: 'departure_time', label: 'Departure' },
  { key: 'arrival_time', label: 'Arrival' },
  { key: 'duration', label: 'Duration' },
  { key: 'price_inr', label: 'Price' },
]

function formatPrice(value) {
  const number = Number(value)

  if (!Number.isNaN(number)) {
    return `₹${number.toLocaleString('en-IN')}`
  }

  return value || '—'
}

export default function DataExplorer() {
  const {
    loading,
    error,
    filtered,
    search,
    setSearch,
    originFilter,
    setOriginFilter,
    destFilter,
    setDestFilter,
    originOptions,
    destOptions,
    sortKey,
    sortDir,
    toggleSort,
    total,
    reload,
  } = useDataExplorer()

  return (
    <div>
      <PageHeading
        eyebrow="Data Explorer"
        title="Raw Quote Records"
        description="Browse, search, and filter individual airfare quotes collected from every source."
        actions={
          <button
            onClick={reload}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            Refresh
          </button>
        }
      />

      <CardShell
        title="Quotes"
        subtitle={`Showing ${filtered.length} of ${total} records`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              {originOptions.map((origin) => (
                <option key={origin} value={origin}>
                  {origin === 'All' ? 'All Origins' : origin}
                </option>
              ))}
            </select>

            <select
              value={destFilter}
              onChange={(e) => setDestFilter(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              {destOptions.map((destination) => (
                <option key={destination} value={destination}>
                  {destination === 'All'
                    ? 'All Destinations'
                    : destination}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950">
              <Search size={15} className="text-zinc-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search quotes..."
                className="w-48 bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:text-zinc-100"
              />
            </div>
          </div>
        }
      >
        {loading ? (
          <LoadingBlock height="h-64" />
        ) : error ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Unable to load quote data
            </p>

            <p className="mt-1 max-w-md text-sm text-zinc-500">
              The data service may not be running yet. The Explorer is ready
              to connect once the backend is available.
            </p>

            <button
              onClick={reload}
              className="mt-4 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead className="sticky top-0 bg-white text-xs text-zinc-500 dark:bg-zinc-900">
                <tr>
                  {COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left font-medium"
                    >
                      <button
                        onClick={() => toggleSort(column.key)}
                        className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-50"
                      >
                        {column.label}

                        <ArrowUpDown
                          size={12}
                          className={
                            sortKey === column.key
                              ? 'text-zinc-900 dark:text-zinc-50'
                              : 'text-zinc-300 dark:text-zinc-600'
                          }
                        />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/70"
                  >
                    <td className="px-6 py-3 font-mono text-xs text-zinc-500">
                      {record.id || '—'}
                    </td>

                    <td className="px-6 py-3 font-medium text-zinc-950 dark:text-zinc-50">
                      {record.source || '—'}
                    </td>

                    <td className="px-6 py-3 font-medium text-zinc-950 dark:text-zinc-50">
                      {record.destination || '—'}
                    </td>

                    <td className="px-6 py-3 text-zinc-700 dark:text-zinc-300">
                      {record.departure_time || '—'}
                    </td>

                    <td className="px-6 py-3 text-zinc-700 dark:text-zinc-300">
                      {record.arrival_time || '—'}
                    </td>

                    <td className="px-6 py-3 text-zinc-700 dark:text-zinc-300">
                      {record.duration || '—'}
                    </td>

                    <td className="px-6 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                      {formatPrice(record.price_inr ?? record.price)}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={COLUMNS.length}
                      className="px-6 py-16 text-center"
                    >
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                        No quote records available
                      </p>

                      <p className="mt-1 text-sm text-zinc-400">
                        Quote data will appear here once the collection
                        service is connected.
                      </p>
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