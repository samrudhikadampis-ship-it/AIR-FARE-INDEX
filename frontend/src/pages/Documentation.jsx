export default function Documentation() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-zinc-500">System</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Documentation
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Learn about the Airfare Index platform and its data.
        </p>
      </div>

      <div className="max-w-3xl rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="font-medium">Airfare Price Index</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          This platform tracks airfare prices across major domestic routes
          in India and provides insights into price movements, collection
          activity, and market trends.
        </p>
      </div>
    </div>
  )
}