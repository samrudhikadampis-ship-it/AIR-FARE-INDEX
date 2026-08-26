import {
  Search,
  Moon,
  Bell,
  RefreshCw,
  Download,
} from 'lucide-react'

export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div className="flex items-center gap-6">
        <div className="hidden items-center gap-3 md:flex">
          <Search size={18} className="text-zinc-400" />

          <input
            type="text"
            placeholder="Search..."
            className="w-64 bg-transparent text-sm outline-none placeholder:text-zinc-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="rounded-lg p-2.5 text-zinc-600 hover:bg-zinc-100">
          <Moon size={19} />
        </button>

        <button className="relative rounded-lg p-2.5 text-zinc-600 hover:bg-zinc-100">
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        <div className="ml-2 h-8 w-8 rounded-full bg-zinc-900 text-center text-xs font-medium leading-8 text-white">
          AI
        </div>
      </div>
    </header>
  )
}