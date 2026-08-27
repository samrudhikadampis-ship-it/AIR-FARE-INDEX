import { createContext, useContext, useMemo, useState } from 'react'
import { buildNotifications } from '../services/mock/notifications'
import { readJson, writeJson, STORAGE } from './storage'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const [items, setItems] = useState(() => {
    const base = buildNotifications()
    const state = readJson(STORAGE.notifState, {})
    return base.map((n) => ({ ...n, unread: state[n.id]?.unread ?? n.unread }))
  })

  function persist(next) {
    const state = Object.fromEntries(next.map((n) => [n.id, { unread: n.unread }]))
    writeJson(STORAGE.notifState, state)
    setItems(next)
  }

  function markRead(id) {
    persist(items.map((n) => (n.id === id ? { ...n, unread: false } : n)))
  }

  function markAllRead() {
    persist(items.map((n) => ({ ...n, unread: false })))
  }

  const unreadCount = items.filter((n) => n.unread).length

  const value = useMemo(
    () => ({ items, unreadCount, markRead, markAllRead }),
    [items, unreadCount]
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
