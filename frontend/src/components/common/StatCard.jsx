export default function StatCard({ label, value, hint, hintTone = 'neutral' }) {
  const toneClass = {
    up: 'text-emerald-600',
    down: 'text-red-500',
    neutral: 'text-zinc-500',
  }[hintTone]

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      {hint && <p className={`mt-1 text-xs ${toneClass}`}>{hint}</p>}
    </div>
  )
}
