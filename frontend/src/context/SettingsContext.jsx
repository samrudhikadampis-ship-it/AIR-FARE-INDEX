import { createContext, useContext, useMemo, useState } from 'react'
import { getApiBase, setApiBase as persistApiBase } from '../services/http'
import { readJson, writeJson, STORAGE } from './storage'

const SettingsContext = createContext(null)

const DEFAULTS = {
  defaultRangeDays: 30,
  fareAlerts: true,
  scraperAlerts: true,
  systemAlerts: true,
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => ({ ...DEFAULTS, ...readJson(STORAGE.settings, {}) }))
  const [apiBase, setApiBaseState] = useState(() => getApiBase())

  function updateSettings(patch) {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      writeJson(STORAGE.settings, next)
      return next
    })
  }

  function updateApiBase(value) {
    persistApiBase(value)
    setApiBaseState(getApiBase())
  }

  const value = useMemo(
    () => ({ settings, updateSettings, apiBase, updateApiBase }),
    [settings, apiBase]
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
