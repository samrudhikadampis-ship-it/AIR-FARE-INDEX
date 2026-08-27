export const STORAGE = {
  users: 'afi.users',
  session: 'afi.session',
  theme: 'afi.theme',
  sidebar: 'afi.sidebarCollapsed',
  settings: 'afi.settings',
  notifState: 'afi.notifState',
}

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}
