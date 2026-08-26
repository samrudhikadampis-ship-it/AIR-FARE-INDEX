export default function PageContainer({ children }) {
  return (
    <main className="min-w-0 flex-1 bg-zinc-50">
      <div className="mx-auto max-w-[1600px] p-6 lg:p-8">
        {children}
      </div>
    </main>
  )
}