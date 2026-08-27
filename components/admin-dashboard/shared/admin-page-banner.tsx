import { Download, Plus, type LucideIcon } from 'lucide-react'

type AdminPageBannerProps = {
  title: string
  description: string
  action?: {
    label: string
    icon?: 'download' | 'plus'
    tone?: 'outline' | 'teal' | 'blue'
    onClick?: () => void
  }
}

const icons: Record<'download' | 'plus', LucideIcon> = {
  download: Download,
  plus: Plus,
}

export function AdminPageBanner({
  title,
  description,
  action,
}: AdminPageBannerProps) {
  const Icon = action?.icon ? icons[action.icon] : null
  const actionClassName =
    action?.tone === 'blue'
      ? 'border-[#064071] bg-[#064071] text-white hover:bg-[#052f52]'
      : action?.tone === 'teal'
        ? 'border-[#01AEAD] bg-[#01AEAD] text-white hover:bg-[#019594]'
        : 'border-[#064071] bg-transparent text-[#064071] hover:bg-[#064071] hover:text-white'

  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-2xl bg-white p-4 shadow-lg shadow-black/10 sm:p-5 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <h1 className="dashboard-heading text-[34px] font-semibold leading-tight text-black sm:text-[48px]">
          {title}
        </h1>
        <p className="dashboard-font mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors md:w-auto ${actionClassName}`}
        >
          {Icon && <Icon className="size-4" />}
          {action.label}
        </button>
      )}
    </section>
  )
}
