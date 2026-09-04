import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

// Airfare-specific convention: price UP is shown in red (bad for travelers),
// price DOWN is shown in green (good for travelers) -- opposite of a typical
// stock-style dashboard. This is intentional throughout the app.
export default function ChangePill({ value, suffix = '%' }) {
  const up = value >= 0
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${up ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
      {up ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
      {up ? '+' : ''}{value}{suffix}
    </span>
  )
}
