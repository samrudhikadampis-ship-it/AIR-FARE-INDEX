import { Bell, Database, TrendingUp, CheckCircle } from 'lucide-react'

const notifications = [
  {
    icon: Database,
    title: 'Data collection completed',
    description: '12,482 airfare quotes were collected successfully.',
    time: '2 minutes ago',
  },
  {
    icon: TrendingUp,
    title: 'National index updated',
    description: 'The National Airfare Price Index increased by 6.8%.',
    time: '15 minutes ago',
  },
  {
    icon: CheckCircle,
    title: 'All routes operational',
    description: 'All 24 monitored routes are currently operational.',
    time: '1 hour ago',
  },
]

export default function Notifications() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-zinc-500">System</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Notifications
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Recent updates from the Airfare Index system.
        </p>
      </div>

      <div className="max-w-3xl overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {notifications.map((notification, index) => {
          const Icon = notification.icon

          return (
            <div
              key={notification.title}
              className={`flex gap-4 p-5 ${
                index !== notifications.length - 1
                  ? 'border-b border-zinc-200 dark:border-zinc-800'
                  : ''
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <Icon size={18} className="text-zinc-700 dark:text-zinc-300" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Bell size={13} className="text-zinc-400" />
                  <h2 className="text-sm font-medium">
                    {notification.title}
                  </h2>
                </div>

                <p className="mt-1 text-sm text-zinc-500">
                  {notification.description}
                </p>

                <p className="mt-2 text-xs text-zinc-400">
                  {notification.time}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}