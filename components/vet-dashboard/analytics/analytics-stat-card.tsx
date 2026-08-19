import { Card } from '@/components/dashboard/ui'
import type { AnalyticsStat } from './data'

export function AnalyticsStatCard({ stat }: { stat: AnalyticsStat }) {
  return (
    <Card className="p-5">
      <p className="dashboard-font text-[14px] font-normal text-muted-foreground">
        {stat.label}
      </p>
      <p className="dashboard-outfit mt-3 text-2xl font-semibold text-black">
        {stat.value}
      </p>
    </Card>
  )
}

