import type { VetStat } from './data'

export function VetStatCard({ stat }: { stat: VetStat }) {
  const Icon = stat.icon

  return (
    <div className="rounded-2xl border border-white bg-white p-4 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="dashboard-font text-[13px] font-medium text-muted-foreground">
            {stat.label}
          </p>
          <p className="dashboard-outfit mt-3 text-[24px] font-semibold text-black">
            {stat.value}
          </p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF7F5] text-[#01AEAD]">
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  )
}
