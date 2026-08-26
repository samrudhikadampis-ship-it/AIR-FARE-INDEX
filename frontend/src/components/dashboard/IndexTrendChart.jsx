import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { date: 'Aug 1', index: 118.2 },
  { date: 'Aug 3', index: 119.1 },
  { date: 'Aug 5', index: 118.7 },
  { date: 'Aug 7', index: 121.4 },
  { date: 'Aug 9', index: 120.8 },
  { date: 'Aug 11', index: 122.6 },
  { date: 'Aug 13', index: 121.9 },
  { date: 'Aug 15', index: 124.1 },
  { date: 'Aug 17', index: 123.5 },
  { date: 'Aug 19', index: 125.2 },
  { date: 'Aug 21', index: 124.7 },
  { date: 'Aug 23', index: 126.3 },
  { date: 'Aug 25', index: 127.4 },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-xs text-zinc-500">{label}</p>

      <p className="mt-1 text-sm font-semibold text-zinc-950">
        Airfare Index: {payload[0].value}
      </p>
    </div>
  )
}

export default function IndexTrendChart() {
  return (
    <div className="border-r border-zinc-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            Index Trend
          </p>

          <h3 className="mt-2 text-2xl font-semibold tracking-tight">
            127.4
          </h3>

          <p className="mt-1 text-sm text-emerald-600">
            ↑ 6.8% from previous month
          </p>
        </div>

        <select className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none">
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>Last 12 Months</option>
        </select>
      </div>

      {/* Chart */}
      <div className="mt-8 h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -15,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#e4e4e7"
            />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 12,
                fill: '#71717a',
              }}
            />

            <YAxis
              domain={['dataMin - 2', 'dataMax + 2']}
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 12,
                fill: '#71717a',
              }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: '#a1a1aa',
                strokeDasharray: '4 4',
              }}
            />

            <Line
              type="monotone"
              dataKey="index"
              stroke="#18181b"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-xs text-zinc-400">
        National airfare price index · Illustrative data
      </p>
    </div>
  )
}