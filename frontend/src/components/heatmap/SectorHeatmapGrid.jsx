import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sectorRouteId } from '../../services/mock/heatmap'

function lerp(a, b, t) {
  return a + (b - a) * t
}

function rgb(r, g, b) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

function changeFill(value, isDark) {
  const t = Math.max(-1, Math.min(1, value / 15))
  if (t >= 0) {
    const from = isDark ? [39, 39, 42] : [244, 244, 245]
    const to = [220, 38, 38]
    return rgb(lerp(from[0], to[0], t), lerp(from[1], to[1], t), lerp(from[2], to[2], t))
  }
  const from = isDark ? [39, 39, 42] : [244, 244, 245]
  const to = [5, 150, 105]
  const u = -t
  return rgb(lerp(from[0], to[0], u), lerp(from[1], to[1], u), lerp(from[2], to[2], u))
}

function fareFill(value, min, max, isDark) {
  const span = Math.max(1, max - min)
  const t = (value - min) / span
  const from = isDark ? [39, 39, 42] : [241, 245, 249]
  const mid = isDark ? [161, 98, 7] : [251, 191, 36]
  const to = [220, 38, 38]
  if (t < 0.5) {
    const u = t * 2
    return rgb(lerp(from[0], mid[0], u), lerp(from[1], mid[1], u), lerp(from[2], mid[2], u))
  }
  const u = (t - 0.5) * 2
  return rgb(lerp(mid[0], to[0], u), lerp(mid[1], to[1], u), lerp(mid[2], to[2], u))
}

function cellTextClass(value, metric, isDark) {
  if (metric === 'changePercent') {
    const strong = Math.abs(value) >= 7
    if (strong) return 'text-white'
    return isDark ? 'text-zinc-200' : 'text-zinc-700'
  }
  return value > 0.62 ? 'text-white' : isDark ? 'text-zinc-200' : 'text-zinc-800'
}

function formatMetric(sector, metric) {
  if (metric === 'changePercent') {
    const sign = sector.changePercent > 0 ? '+' : ''
    return `${sign}${sector.changePercent}%`
  }
  return `₹${sector.averageFare.toLocaleString('en-IN')}`
}

export default function SectorHeatmapGrid({ airports, lookup, metric, isDark }) {
  const navigate = useNavigate()
  const wrapRef = useRef(null)
  const [tip, setTip] = useState(null)

  const fareValues = [...lookup.values()].map((s) => s.averageFare)
  const fareMin = fareValues.length ? Math.min(...fareValues) : 0
  const fareMax = fareValues.length ? Math.max(...fareValues) : 1

  function fillFor(sector) {
    if (metric === 'changePercent') return changeFill(sector.changePercent, isDark)
    return fareFill(sector.averageFare, fareMin, fareMax, isDark)
  }

  function intensity(sector) {
    if (metric === 'changePercent') return Math.abs(sector.changePercent)
    return (sector.averageFare - fareMin) / Math.max(1, fareMax - fareMin)
  }

  function moveTip(event, sector) {
    const wrap = wrapRef.current
    if (!wrap) return
    const wrapRect = wrap.getBoundingClientRect()
    let clientX = event.clientX
    let clientY = event.clientY
    if (event.type === 'focus' || clientX == null) {
      const r = event.currentTarget.getBoundingClientRect()
      clientX = r.left + r.width / 2
      clientY = r.top
    }
    setTip({
      sector,
      x: clientX - wrapRect.left + wrap.scrollLeft,
      y: clientY - wrapRect.top + wrap.scrollTop,
    })
  }

  function onCellClick(sector) {
    navigate(`/routes?route=${sectorRouteId(sector.origin, sector.destination)}`)
  }

  return (
    <div ref={wrapRef} className="relative overflow-auto p-4 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-4 px-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Origin</p>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Destination</p>
      </div>

      <div
        className="grid min-w-[720px] gap-1"
        style={{ gridTemplateColumns: `3.25rem repeat(${airports.length}, minmax(0, 1fr))` }}
      >
        <div />
        {airports.map((airport) => (
          <div
            key={`col-${airport.code}`}
            className="flex flex-col items-center pb-2 pt-1 text-center"
            title={airport.city}
          >
            <span className="text-xs font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">{airport.code}</span>
            <span className="mt-0.5 hidden text-[10px] text-zinc-400 lg:block">{airport.city}</span>
          </div>
        ))}

        {airports.map((origin) => (
          <div key={`row-${origin.code}`} className="contents">
            <div className="flex items-center pr-2" title={origin.city}>
              <span className="text-xs font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">{origin.code}</span>
            </div>
            {airports.map((dest) => {
              if (origin.code === dest.code) {
                return (
                  <div
                    key={`${origin.code}-${dest.code}`}
                    className="aspect-square rounded-md bg-zinc-100 dark:bg-zinc-800/80"
                    aria-hidden
                  >
                    <div className="flex h-full items-center justify-center text-[10px] text-zinc-300 dark:text-zinc-600">
                      —
                    </div>
                  </div>
                )
              }

              const sector = lookup.get(`${origin.code}|${dest.code}`)
              if (!sector) {
                return (
                  <div
                    key={`${origin.code}-${dest.code}`}
                    className="aspect-square rounded-md border border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
                    title="No observations"
                  />
                )
              }

              const fill = fillFor(sector)
              const textClass = cellTextClass(intensity(sector), metric, isDark)

              return (
                <button
                  key={`${origin.code}-${dest.code}`}
                  type="button"
                  onClick={() => onCellClick(sector)}
                  onMouseEnter={(e) => moveTip(e, sector)}
                  onMouseMove={(e) => moveTip(e, sector)}
                  onMouseLeave={() => setTip(null)}
                  onFocus={(e) => moveTip(e, sector)}
                  onBlur={() => setTip(null)}
                  className="aspect-square rounded-md text-[10px] font-medium shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] transition duration-150 hover:z-10 hover:scale-[1.08] hover:shadow-md focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] dark:focus-visible:outline-white"
                  style={{ backgroundColor: fill }}
                  aria-label={`${sector.origin} to ${sector.destination}, ${formatMetric(sector, metric)}`}
                >
                  <span className={`hidden sm:inline ${textClass}`}>{formatMetric(sector, metric)}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {tip && (
        <div
          className="pointer-events-none absolute z-20 w-56 rounded-xl border border-zinc-200 bg-white px-3.5 py-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          style={{
            left: Math.min(tip.x + 14, (wrapRef.current?.scrollWidth ?? 400) - 230),
            top: Math.max(8, tip.y - 108),
          }}
        >
          <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {tip.sector.origin} → {tip.sector.destination}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {metric === 'changePercent' ? 'Price change' : 'Average fare'}{' '}
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{formatMetric(tip.sector, metric)}</span>
          </p>
          <div className="mt-2 space-y-1 border-t border-zinc-100 pt-2 text-xs text-zinc-500 dark:border-zinc-800">
            <p>
              Average fare{' '}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                ₹{tip.sector.averageFare.toLocaleString('en-IN')}
              </span>
            </p>
            <p>
              Index value{' '}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{tip.sector.indexValue}</span>
            </p>
            <p>
              Observations{' '}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {tip.sector.observations.toLocaleString('en-IN')}
              </span>
            </p>
          </div>
          <p className="mt-2 text-[10px] text-zinc-400">Click to open Route Intelligence</p>
        </div>
      )}
    </div>
  )
}

export function HeatmapLegend({ metric }) {
  if (metric === 'changePercent') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-6 py-3 dark:border-zinc-800">
        <p className="text-xs text-zinc-500">Cell intensity shows sector fare movement. Click a route to inspect it.</p>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500">Fares down</span>
          <div
            className="h-2.5 w-36 rounded-full"
            style={{ background: 'linear-gradient(90deg, #059669, #e4e4e7, #dc2626)' }}
          />
          <span className="text-[11px] text-zinc-500">Fares up</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-6 py-3 dark:border-zinc-800">
      <p className="text-xs text-zinc-500">Cell intensity shows average quoted fare for the selected window.</p>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-zinc-500">Lower</span>
        <div
          className="h-2.5 w-36 rounded-full"
          style={{ background: 'linear-gradient(90deg, #f1f5f9, #fbbf24, #dc2626)' }}
        />
        <span className="text-[11px] text-zinc-500">Higher</span>
      </div>
    </div>
  )
}
