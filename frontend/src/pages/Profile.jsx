import { User, Mail, Shield } from 'lucide-react'

export default function Profile() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-zinc-500">Account</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Profile
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Manage your account information.
        </p>
      </div>

      <div className="max-w-2xl rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-sm font-medium text-white">
            AI
          </div>

          <div>
            <h2 className="font-medium">Airfare Index User</h2>
            <p className="text-sm text-zinc-500">
              Dashboard Administrator
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          <div className="flex items-center gap-3">
            <User size={18} className="text-zinc-400" />
            <div>
              <p className="text-xs text-zinc-500">Name</p>
              <p className="text-sm font-medium">Airfare Index User</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail size={18} className="text-zinc-400" />
            <div>
              <p className="text-xs text-zinc-500">Email</p>
              <p className="text-sm font-medium">admin@airfareindex.in</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield size={18} className="text-zinc-400" />
            <div>
              <p className="text-xs text-zinc-500">Role</p>
              <p className="text-sm font-medium">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}