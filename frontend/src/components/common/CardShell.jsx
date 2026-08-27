export default function CardShell({ title, subtitle, actions, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            {title && <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{title}</p>}
            {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  )
}
