// Single backend seam. Leave VITE_API_BASE_URL empty (or Settings → API base empty)
// to use mock data. Point it at a server later; fetch* functions stay the same.

const MOCK_DELAY_MS = 220

export function getApiBase() {
  try {
    const fromSettings = localStorage.getItem('afi.apiBase')
    if (fromSettings != null && fromSettings.trim() !== '') return fromSettings.trim().replace(/\/$/, '')
  } catch {
    /* ignore */
  }
  const env = import.meta.env.VITE_API_BASE_URL
  return env ? String(env).replace(/\/$/, '') : ''
}

export function setApiBase(value) {
  const next = String(value ?? '').trim().replace(/\/$/, '')
  if (!next) localStorage.removeItem('afi.apiBase')
  else localStorage.setItem('afi.apiBase', next)
}

const delay = (ms = MOCK_DELAY_MS) => new Promise((res) => setTimeout(res, ms))

export async function apiGet(path, mockFn) {
  const base = getApiBase()
  if (!base) {
    await delay()
    return mockFn()
  }
  const res = await fetch(`${base}${path}`)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}
