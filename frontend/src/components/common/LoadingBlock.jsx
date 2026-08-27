export default function LoadingBlock({ height = 'h-40', label = 'Loading...' }) {
  return (
    <div className={`flex ${height} items-center justify-center text-sm text-zinc-400`}>
      {label}
    </div>
  )
}
