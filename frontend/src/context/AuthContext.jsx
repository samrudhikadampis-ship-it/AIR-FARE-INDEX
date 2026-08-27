import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { readJson, writeJson, STORAGE } from './storage'

const AuthContext = createContext(null)

const DEMO_USER = {
  name: 'Arsh',
  email: 'demo@airfare.index',
  password: 'demo123',
}

function seedUsers() {
  const users = readJson(STORAGE.users, [])
  if (!users.some((u) => u.email === DEMO_USER.email)) {
    users.push(DEMO_USER)
    writeJson(STORAGE.users, users)
  }
  return users
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJson(STORAGE.session, null))
  const [error, setError] = useState('')

  useEffect(() => {
    seedUsers()
  }, [])

  function persistSession(next) {
    const session = { name: next.name, email: next.email }
    writeJson(STORAGE.session, session)
    setUser(session)
  }

  function login(email, password) {
    setError('')
    const users = seedUsers()
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!found || found.password !== password) {
      setError('Invalid email or password.')
      return false
    }
    persistSession(found)
    return true
  }

  function signup({ name, email, password }) {
    setError('')
    const users = seedUsers()
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setError('An account with that email already exists.')
      return false
    }
    const next = { name: name.trim(), email: email.trim().toLowerCase(), password }
    users.push(next)
    writeJson(STORAGE.users, users)
    persistSession(next)
    return true
  }

  function updateProfile(patch) {
    if (!user) return false
    const users = seedUsers()
    const idx = users.findIndex((u) => u.email === user.email)
    if (idx === -1) return false
    const next = { ...users[idx], ...patch }
    if (patch.email && patch.email !== user.email) {
      if (users.some((u, i) => i !== idx && u.email.toLowerCase() === patch.email.toLowerCase())) {
        setError('That email is already in use.')
        return false
      }
    }
    users[idx] = next
    writeJson(STORAGE.users, users)
    persistSession(next)
    setError('')
    return true
  }

  function changePassword(current, nextPassword) {
    const users = seedUsers()
    const found = users.find((u) => u.email === user?.email)
    if (!found || found.password !== current) {
      setError('Current password is incorrect.')
      return false
    }
    return updateProfile({ password: nextPassword })
  }

  function logout() {
    localStorage.removeItem(STORAGE.session)
    setUser(null)
  }

  const initials = useMemo(() => {
    if (!user?.name) return 'AI'
    const parts = user.name.trim().split(/\s+/)
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || 'AI'
  }, [user])

  const value = {
    user,
    error,
    setError,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    initials,
    demo: DEMO_USER,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
