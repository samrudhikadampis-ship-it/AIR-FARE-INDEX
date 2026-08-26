import {
  LayoutDashboard,
  Plane,
  BarChart3,
  Activity,
  Database,
  Settings,
  HelpCircle,
} from 'lucide-react'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Routes', icon: Plane },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Live Collection', icon: Activity },
  { label: 'Data Explorer', icon: Database },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-zinc-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
          <Plane size={19} strokeWidth={2.2} />
        </div>

        <div className="ml-3">
          <p className="text-sm font-semibold tracking-tight">
            Airfare Index
          </p>
          <p className="text-xs text-zinc-500">
            India
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-6">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Dashboard
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  item.active
                    ? 'bg-zinc-950 font-medium text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                }`}
              >
                <Icon size={17} strokeWidth={1.8} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <p className="mb-3 mt-9 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          System
        </p>

        <nav className="space-y-1">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-100">
            <Settings size={17} />
            Settings
          </button>

          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-100">
            <HelpCircle size={17} />
            Documentation
          </button>
        </nav>
      </div>

      {/* Status */}
      <div className="border-t border-zinc-200 p-4">
        <div className="rounded-xl bg-zinc-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-zinc-700">
              Data collection active
            </span>
          </div>

          <p className="text-xs leading-relaxed text-zinc-500">
            Last updated 2 minutes ago
          </p>
        </div>
      </div>
    </aside>
  )
}