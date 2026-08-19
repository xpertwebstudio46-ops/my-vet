import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { quickActions } from './data'

export function QuickActionsCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-gray-200/80 p-5">
        <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
          Quick actions
        </h2>
      </div>
      <div>
        {quickActions.map((action) => {
          const Icon = action.icon

          return (
            <button
              key={action.label}
              type="button"
              className="flex w-full items-center gap-3 border-b border-gray-200/80 px-5 py-4 text-left last:border-b-0 hover:bg-slate-50"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF7F5] text-[#01AEAD]">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1 text-sm font-semibold text-black">
                {action.label}
              </span>
              <ArrowRight className="size-4 shrink-0 text-black" />
            </button>
          )
        })}
      </div>
    </Card>
  )
}
