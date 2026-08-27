import { Link } from 'react-router-dom'
import { Plane } from 'lucide-react'
import Button from '../components/common/Button'

export default function Signup() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
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

        <form className="mt-6 space-y-4">
          <label className="block text-sm">
            Name
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="block text-sm">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="block text-sm">
            Password
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </label>

          <Button type="submit" variant="primary" className="w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-zinc-950"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}