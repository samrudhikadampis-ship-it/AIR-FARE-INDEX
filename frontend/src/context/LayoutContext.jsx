import { createContext, useContext, useEffect, useState } from 'react'
import { STORAGE } from './storage'

const LayoutContext = createContext(null)

export function LayoutProvider({ children }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE.sidebar) === '1')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE.sidebar, collapsed ? '1' : '0')
  }, [collapsed])

  const value = {
    collapsed,
    setCollapsed,
    toggleCollapsed: () => setCollapsed((c) => !c),
    mobileOpen,
    setMobileOpen,
    openMobile: () => setMobileOpen(true),
    closeMobile: () => setMobileOpen(false),
  }

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

export function useLayout() {
  const ctx = useContext(LayoutContext)
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider')
  return ctx
}
