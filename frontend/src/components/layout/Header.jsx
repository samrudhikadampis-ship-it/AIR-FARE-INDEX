import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Moon, Sun, Bell, Menu, LogOut, User, Settings, BookOpen } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useLayout } from '../../context/LayoutContext'
import { useNotifications } from '../../context/NotificationsContext'

export default function Header() {
  const navigate = useNavigate()
  const { user, initials, logout } = useAuth()
  const { isDark, toggle } = useTheme()
  const { openMobile } = useLayout()
  const { items, unreadCount, markRead } = useNotifications()
  const [query, setQuery] = useState('')
  const [bellOpen, setBellOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const bellRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false)
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function onSearch(e) {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/explorer?q=${encodeURIComponent(q)}` : '/explorer')
  }

  const recent = items.slice(0, 4)

  return (
    <header className="flex h-20 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:px-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2.5 text-zinc-600 hover:bg-zinc-100 lg:hidden dark:text-zinc-300 dark:hover:bg-zinc-800"
          onClick={openMobile}
          aria-label="Open menu"
        >
          <Menu size={19} />
        </button>

        <form onSubmit={onSearch} className="hidden items-center gap-3 md:flex">
          <Search size={18} className="text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search origin, destination, price…"
            className="w-64 bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:text-zinc-100"
          />
        </form>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={toggle}
          className="rounded-lg p-2.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <div className="relative" ref={bellRef}>
          <button
            type="button"
            onClick={() => setBellOpen((o) => !o)}
            className="relative rounded-lg p-2.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
            )}
          </button>
          {bellOpen && (
            <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 px-4 py-3 text-sm font-medium dark:border-zinc-800 dark:text-zinc-50">
                Notifications
              </div>
              <div className="max-h-80 divide-y divide-zinc-100 dark:divide-zinc-800">
                {recent.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      markRead(n.id)
                      setBellOpen(false)
                      navigate('/notifications')
                    }}
                    className="block w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{n.body}</p>
                  </button>
                ))}
              </div>
              <Link
                to="/notifications"
                onClick={() => setBellOpen(false)}
                className="block border-t border-zinc-200 px-4 py-3 text-center text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                View all
              </Link>
            </div>
          )}
        </div>

        <div className="relative ml-1" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white dark:bg-white dark:text-zinc-900"
            aria-label="Account menu"
            title={user?.name}
          >
            {initials}
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-zinc-500">{user?.email}</p>
              </div>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <User size={15} /> Profile
              </Link>
              <Link to="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <Settings size={15} /> Settings
              </Link>
              <Link to="/docs" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <BookOpen size={15} /> Documentation
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  logout()
                  navigate('/login')
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-zinc-50 dark:text-red-400 dark:hover:bg-zinc-800"
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
