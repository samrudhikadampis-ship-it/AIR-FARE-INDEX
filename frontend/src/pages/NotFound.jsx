export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-semibold tracking-tight">404</p>
        <h1 className="mt-3 text-xl font-medium">Page not found</h1>
        <p className="mt-2 text-sm text-zinc-500">
          The page you're looking for doesn't exist.
        </p>
      </div>
    </div>
  )
}