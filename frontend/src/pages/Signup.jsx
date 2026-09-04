import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Plane } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/common/Button'

export default function Signup() {
  const { signup, error, setError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const from = location.state?.from || '/'

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (signup({ name, email, password })) navigate(from, { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black">
            <Plane size={20} />
          </div>

          <div>
            <p className="text-sm font-semibold">Airfare Index</p>
            <p className="text-xs text-zinc-500">India</p>
          </div>
        </div>

        <h1 className="mt-8 text-2xl font-semibold tracking-tight">
          Create account
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Create an account to access the Airfare Index dashboard.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            Name
            <input
              type="text"
              required
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </label>

          <label className="block text-sm">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </label>

          <label className="block text-sm">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" variant="primary" className="w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-zinc-950 dark:text-white"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
