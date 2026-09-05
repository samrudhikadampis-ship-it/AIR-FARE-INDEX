import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function ChangePill({ value, suffix = '%' }) {
  if (value == null || value === '' || Number.isNaN(Number(value))) {
    return <span className="text-sm text-zinc-400">—</span>
  }

  const n = Number(value)
  const up = n >= 0
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${up ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
      {up ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
      {up ? '+' : ''}{n}{suffix}
    </span>
  )
}
