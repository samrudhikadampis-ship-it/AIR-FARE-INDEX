export default function StatCard({ label, value, hint, hintTone = 'neutral' }) {
  const toneClass = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-red-500 dark:text-red-400',
    neutral: 'text-zinc-500',
  }[hintTone]

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{value}</p>
      {hint && <p className={`mt-1 text-xs ${toneClass}`}>{hint}</p>}
    </div>
  )
}
