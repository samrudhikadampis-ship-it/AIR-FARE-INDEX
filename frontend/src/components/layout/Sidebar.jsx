import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Plane,
  BarChart3,
  Activity,
  Database,
  Grid3x3,
  Settings,
  HelpCircle,
  Fuel,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  User,
} from 'lucide-react'
import { useLayout } from '../../context/LayoutContext'

const navigation = [
  { label: 'Overview', to: '/', icon: LayoutDashboard },
  { label: 'Route Intelligence', to: '/routes', icon: Plane },
  { label: 'Sector Heatmap', to: '/heatmap', icon: Grid3x3 },
  { label: 'Live Collection', to: '/live-collection', icon: Activity },
  { label: 'Index Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Price Drivers', to: '/drivers', icon: Fuel },
  { label: 'Data Explorer', to: '/explorer', icon: Database },
]

const system = [
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Profile', to: '/profile', icon: User },
  { label: 'Settings', to: '/settings', icon: Settings },
  { label: 'Documentation', to: '/docs', icon: HelpCircle },
]

function NavItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
          collapsed ? 'justify-center px-0' : ''
        } ${
          isActive
            ? 'bg-zinc-950 font-medium text-white dark:bg-white dark:text-zinc-950'
            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
        }`
      }
    >
      <Icon size={17} strokeWidth={1.8} className="shrink-0" />
      {!collapsed && item.label}
    </NavLink>
  )
}

function SidebarPanel({ collapsed, onNavigate, showCollapse }) {
  const { toggleCollapsed } = useLayout()

  return (
    <aside
      className={`flex h-full flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      <div className={`flex h-20 items-center border-b border-zinc-200 dark:border-zinc-800 ${collapsed ? 'justify-center px-2' : 'px-6'}`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black">
          <Plane size={19} strokeWidth={2.2} />
        </div>
        {!collapsed && (
          <div className="ml-3 min-w-0">
            <p className="text-sm font-semibold tracking-tight">Airfare Index</p>
            <p className="text-xs text-zinc-500">India</p>
          </div>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto py-6 ${collapsed ? 'px-2' : 'px-3'}`}>
        {!collapsed && (
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Dashboard
          </p>
        )}
        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </nav>

        {!collapsed && (
          <p className="mb-3 mt-9 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            System
          </p>
        )}
        {collapsed && <div className="my-4 border-t border-zinc-200 dark:border-zinc-800" />}
        <nav className="space-y-1">
          {system.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </nav>
      </div>

      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        {!collapsed && (
          <div className="mb-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Data collection active</span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500">Mock quotes until a backend is connected.</p>
          </div>
        )}
        {showCollapse && (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
            {!collapsed && 'Collapse'}
          </button>
        )}
      </div>
    </aside>
  )
}

export default function Sidebar() {
  const { collapsed, mobileOpen, closeMobile } = useLayout()

  return (
    <>
      <div className="sticky top-0 hidden h-screen lg:block">
        <SidebarPanel collapsed={collapsed} showCollapse onNavigate={() => {}} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={closeMobile}
          />
          <div className="relative z-50 h-full w-64 shadow-xl">
            <SidebarPanel collapsed={false} showCollapse={false} onNavigate={closeMobile} />
          </div>
        </div>
      )}
    </>
  )
}
