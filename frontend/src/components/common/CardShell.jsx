export default function CardShell({ title, subtitle, actions, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            {title && <p className="text-sm font-medium text-zinc-950">{title}</p>}
            {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  )
}
