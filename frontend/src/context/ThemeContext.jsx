import { createContext, useContext, useEffect, useState } from 'react'
import { STORAGE } from './storage'

const ThemeContext = createContext(null)

function getSystemDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function applyTheme(mode) {
  const dark = mode === 'dark' || (mode === 'system' && getSystemDark())
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE.theme) || 'light')
  const [systemDark, setSystemDark] = useState(getSystemDark)

  useEffect(() => {
    applyTheme(mode)
    localStorage.setItem(STORAGE.theme, mode)
  }, [mode, systemDark])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      setSystemDark(mq.matches)
    }
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  function toggle() {
    setMode((m) => (m === 'dark' ? 'light' : 'dark'))
  }

  const isDark = mode === 'dark' || (mode === 'system' && systemDark)

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggle, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
