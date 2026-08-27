const STYLES = {
  healthy: 'bg-emerald-50 text-emerald-700',
  degraded: 'bg-amber-50 text-amber-700',
  down: 'bg-red-50 text-red-600',
  up: 'bg-emerald-50 text-emerald-700',
}

const LABELS = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  down: 'Down',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status] ?? STYLES.healthy}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'healthy' ? 'bg-emerald-500' : status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'}`} />
      {LABELS[status] ?? status}
    </span>
  )
}
