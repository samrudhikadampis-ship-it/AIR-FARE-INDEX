export default function LoadingBlock({ height = 'h-40', label = 'Loading...' }) {
  return (
    <div className={`flex ${height} items-center justify-center text-sm text-zinc-400`}>
      {label}
    </div>
  )
}

export function ErrorBlock({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <p className="text-sm text-zinc-500">{message || 'Something went wrong.'}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          Try again
        </button>
      )}
    </div>
  )
}
