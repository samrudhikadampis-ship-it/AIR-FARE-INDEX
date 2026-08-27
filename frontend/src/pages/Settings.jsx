import { Settings as SettingsIcon, Bell, Moon, Database } from 'lucide-react'

export default function Settings() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-zinc-500">System</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Manage dashboard preferences and data settings.
        </p>
      </div>

      <div className="max-w-3xl space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <SettingsIcon size={20} />
            <div>
              <h2 className="font-medium">General</h2>
              <p className="text-sm text-zinc-500">
                Basic dashboard preferences
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark mode</p>
                <p className="text-xs text-zinc-500">
                  Use a darker dashboard appearance
                </p>
              </div>
              <Moon size={18} className="text-zinc-500" />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-xs text-zinc-500">
                  Receive important system updates
                </p>
              </div>
              <Bell size={18} className="text-zinc-500" />
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <Database size={20} />
            <div>
              <h2 className="font-medium">Data Collection</h2>
              <p className="text-sm text-zinc-500">
                Configure airfare data collection
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-zinc-500">Collection status</p>
            <p className="mt-1 text-sm font-medium text-emerald-600">
              ● Active
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}