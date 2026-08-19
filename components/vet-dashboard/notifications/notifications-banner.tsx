import { CheckCheck } from 'lucide-react'

export function NotificationsBanner({ onMarkAllRead }: { onMarkAllRead: () => void }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-black/10 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="dashboard-heading text-[48px] font-semibold leading-tight text-black">
          Notifications
        </h1>
        <p className="dashboard-font mt-1 max-w-2xl text-sm text-muted-foreground">
          Appointment updates, owner enquiries, review activity and practice reminders.
        </p>
      </div>

      <button
        type="button"
        onClick={onMarkAllRead}
        className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-semibold text-black hover:bg-slate-50"
      >
        <CheckCheck className="size-4 text-[#01AEAD]" />
        Mark all as read
      </button>
    </section>
  )
}
